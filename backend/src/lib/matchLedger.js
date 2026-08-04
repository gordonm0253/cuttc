import { updateElo, replayMatches } from './elo.js';

// Resolves a player reference ({id} or {displayName, email}) to a real Player
// row within a transaction, upserting by email if no id was given. Shared by
// manual match logging and tournament entrant resolution.
export async function resolvePlayer(tx, playerRef, { startingElo } = {}) {
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
      elo: startingElo,
    },
  });
}

// Writes a single Match row plus the Elo update for both players, inside an
// already-open transaction. Shared by manual match logging and tournament match
// result reporting so both paths update the club ledger identically.
export async function writeMatchAndUpdateElo(tx, { playedAt, playerAId, playerBId, winnerSide, playerAElo, playerBElo, sets }) {
  const scoreA = winnerSide === 'A' ? 1 : 0;
  const { newRatingA, newRatingB } = updateElo(playerAElo, playerBElo, scoreA);
  const winnerId = winnerSide === 'A' ? playerAId : playerBId;

  const match = await tx.match.create({
    data: {
      playedAt: new Date(playedAt),
      playerAId,
      playerBId,
      winnerId,
      playerAElo,
      playerBElo,
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

  await tx.player.update({ where: { id: playerAId }, data: { elo: newRatingA } });
  await tx.player.update({ where: { id: playerBId }, data: { elo: newRatingB } });

  return match;
}

// Deletes a single Match row and replays the entire remaining club ledger to
// keep every player's Elo and every match's before/after snapshot correct.
// Ratings are globally interdependent (not per-player), so this must run over
// every remaining match, not just ones involving the deleted match's players.
export async function deleteMatchAndReplay(tx, matchId) {
  const match = await tx.match.findUnique({ where: { id: matchId } });
  if (!match) {
    const err = new Error('Match not found');
    err.status = 404;
    throw err;
  }

  await tx.match.delete({ where: { id: matchId } });
  await replayLedger(tx);
  return match;
}

// Deletes several Match rows in one go and replays the ledger exactly once
// afterward, rather than once per deletion — used for bulk operations like
// deleting a whole tournament, where a per-match replay would be wasted work.
export async function deleteMatchesAndReplay(tx, matchIds) {
  if (matchIds.length === 0) return;
  await tx.match.deleteMany({ where: { id: { in: matchIds } } });
  await replayLedger(tx);
}

async function replayLedger(tx) {
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
}
