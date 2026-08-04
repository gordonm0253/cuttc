import prisma from '../lib/prisma.js';
import { determineWinnerAndValidate, STARTING_ELO } from '../lib/elo.js';
import { resolvePlayer, writeMatchAndUpdateElo, deleteMatchAndReplay } from '../lib/matchLedger.js';

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
    const resolvedA = await resolvePlayer(tx, playerA, { startingElo: STARTING_ELO });
    const resolvedB = await resolvePlayer(tx, playerB, { startingElo: STARTING_ELO });

    if (resolvedA.id === resolvedB.id) {
      const err = new Error('A match must be between two different players');
      err.status = 400;
      throw err;
    }

    return writeMatchAndUpdateElo(tx, {
      playedAt,
      playerAId: resolvedA.id,
      playerBId: resolvedB.id,
      winnerSide,
      playerAElo: resolvedA.elo,
      playerBElo: resolvedB.elo,
      sets,
    });
  });
}

export async function deleteMatch(id) {
  await prisma.$transaction((tx) => deleteMatchAndReplay(tx, id));
}
