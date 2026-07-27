import prisma from '../lib/prisma.js';
import { determineWinnerAndValidate, updateElo, STARTING_ELO, replayMatches } from '../lib/elo.js';

function validatePlayerRef(player, label) {
  if (!player || typeof player !== 'object') {
    const err = new Error(`${label} is required`);
    err.status = 400;
    throw err;
  }
  if (!player.id && !(player.email && player.displayName)) {
    const err = new Error(`${label} must include either an id, or an email and displayName`);
    err.status = 400;
    throw err;
  }
}

async function resolvePlayer(tx, playerRef) {
  if (playerRef.id) {
    const existing = await tx.player.findUnique({ where: { id: playerRef.id } });
    if (!existing) {
      const err = new Error(`Player with id ${playerRef.id} not found`);
      err.status = 400;
      throw err;
    }
    return existing;
  }

  return tx.player.upsert({
    where: { email: playerRef.email },
    update: {},
    create: {
      email: playerRef.email,
      displayName: playerRef.displayName,
      elo: STARTING_ELO,
    },
  });
}

export async function listMatches({ page = 1, pageSize = 20 } = {}) {
  const skip = (page - 1) * pageSize;
  const [matches, total] = await Promise.all([
    prisma.match.findMany({
      orderBy: { playedAt: 'desc' },
      skip,
      take: pageSize,
      include: {
        playerA: { select: { id: true, displayName: true } },
        playerB: { select: { id: true, displayName: true } },
        winner: { select: { id: true, displayName: true } },
      },
    }),
    prisma.match.count(),
  ]);

  return { matches, total, page, pageSize };
}

export async function createMatch({ playedAt, playerA, playerB, sets }) {
  validatePlayerRef(playerA, 'playerA');
  validatePlayerRef(playerB, 'playerB');

  if (!playedAt || Number.isNaN(Date.parse(playedAt))) {
    const err = new Error('playedAt is required and must be a valid date');
    err.status = 400;
    throw err;
  }

  const winnerSide = determineWinnerAndValidate(sets);

  return prisma.$transaction(async (tx) => {
    const resolvedA = await resolvePlayer(tx, playerA);
    const resolvedB = await resolvePlayer(tx, playerB);

    if (resolvedA.id === resolvedB.id) {
      const err = new Error('A match must be between two different players');
      err.status = 400;
      throw err;
    }

    const scoreA = winnerSide === 'A' ? 1 : 0;
    const { newRatingA, newRatingB } = updateElo(resolvedA.elo, resolvedB.elo, scoreA);
    const winnerId = winnerSide === 'A' ? resolvedA.id : resolvedB.id;

    const match = await tx.match.create({
      data: {
        playedAt: new Date(playedAt),
        playerAId: resolvedA.id,
        playerBId: resolvedB.id,
        winnerId,
        playerAElo: resolvedA.elo,
        playerBElo: resolvedB.elo,
        playerAEloAfter: newRatingA,
        playerBEloAfter: newRatingB,
        sets,
      },
      include: {
        playerA: { select: { id: true, displayName: true } },
        playerB: { select: { id: true, displayName: true } },
        winner: { select: { id: true, displayName: true } },
      },
    });

    await tx.player.update({ where: { id: resolvedA.id }, data: { elo: newRatingA } });
    await tx.player.update({ where: { id: resolvedB.id }, data: { elo: newRatingB } });

    return match;
  });
}

export async function deleteMatch(id) {
  await prisma.$transaction(async (tx) => {
    const match = await tx.match.findUnique({ where: { id } });
    if (!match) {
      const err = new Error('Match not found');
      err.status = 404;
      throw err;
    }

    await tx.match.delete({ where: { id } });

    // Ratings are interdependent across the whole match ledger, so removing one match
    // requires replaying every remaining match in chronological order to get correct
    // before/after snapshots and current player ratings.
    const remainingMatches = await tx.match.findMany({
      orderBy: { playedAt: 'asc' },
      select: { id: true, playerAId: true, playerBId: true, winnerId: true },
    });

    const { snapshots, finalRatings } = replayMatches(remainingMatches);

    await Promise.all(
      remainingMatches.map((m) => {
        const snapshot = snapshots.get(m.id);
        return tx.match.update({ where: { id: m.id }, data: snapshot });
      })
    );

    await Promise.all(
      Array.from(finalRatings.entries()).map(([playerId, elo]) =>
        tx.player.update({ where: { id: playerId }, data: { elo } })
      )
    );
  });
}
