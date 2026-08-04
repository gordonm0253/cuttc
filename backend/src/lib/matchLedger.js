import { updateElo, replayMatches, STARTING_ELO } from './elo.js';

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
// already-open transaction. Used for matches that should affect ratings the
// moment they're recorded: manual match logging, and tournament results once
// their tournament has already finished (see writeTournamentMatch below for
// results reported *during* a tournament, which must NOT do this yet).
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

// Writes a single Match row for a tournament result WITHOUT touching Elo —
// ratings for a tournament's matches are only supposed to count once the
// whole tournament is over (so a mid-tournament result can't briefly nudge a
// player's rating that then un-nudges if the result gets corrected, and so
// players who haven't finished yet don't get judged on a partial run). The
// row's Elo snapshot columns are set to a same-as-before placeholder; they get
// their real values once replayLedger recomputes them the moment the
// tournament completes (see finalizeTournamentElo in tournaments.service.js).
// Until then, replayLedger's own query excludes this row entirely, so it has
// no effect on any player's live rating.
export async function writeTournamentMatch(tx, { playedAt, playerAId, playerBId, winnerSide, playerAElo, playerBElo, sets }) {
  const winnerId = winnerSide === 'A' ? playerAId : playerBId;

  return tx.match.create({
    data: {
      playedAt: new Date(playedAt),
      playerAId,
      playerBId,
      winnerId,
      playerAElo,
      playerBElo,
      playerAEloAfter: playerAElo,
      playerBEloAfter: playerBElo,
      sets,
    },
    include: {
      playerA: { select: { id: true, displayName: true } },
      playerB: { select: { id: true, displayName: true } },
      winner: { select: { id: true, displayName: true } },
    },
  });
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
  await replayLedger(tx, [match.playerAId, match.playerBId]);
  return match;
}

// Deletes several Match rows in one go and replays the ledger exactly once
// afterward, rather than once per deletion — used for bulk operations like
// deleting a whole tournament, where a per-match replay would be wasted work.
export async function deleteMatchesAndReplay(tx, matchIds) {
  if (matchIds.length === 0) return;
  const matches = await tx.match.findMany({ where: { id: { in: matchIds } }, select: { playerAId: true, playerBId: true } });
  await tx.match.deleteMany({ where: { id: { in: matchIds } } });
  await replayLedger(tx, matches.flatMap((m) => [m.playerAId, m.playerBId]));
}

// The club Elo ledger only ever consists of matches that are either not part
// of a tournament at all, or belong to a tournament that has finished — a
// tournament's matches stay invisible to the ledger (and thus to everyone's
// live rating) for its whole duration, in playedAt order once they do count.
// See writeTournamentMatch's comment for why.
const LEDGER_VISIBLE_MATCH_WHERE = {
  OR: [{ tournamentMatch: null }, { tournamentMatch: { tournament: { status: 'completed' } } }],
};

// `extraPlayerIds` covers players whose rating might need resetting to
// STARTING_ELO even though they no longer show up in any query this function
// runs — e.g. the two players on a match that was just deleted (it's gone
// from the table by the time this runs, so scanning remaining rows can't
// find them), or a tournament's entrants right after its matches just became
// ledger-invisible again. Without this, such a player's Player.elo is simply
// never touched again and goes stale at its last-replayed value forever.
async function replayLedger(tx, extraPlayerIds = []) {
  const visiblePlayerRows = await tx.match.findMany({
    where: LEDGER_VISIBLE_MATCH_WHERE,
    select: { playerAId: true, playerBId: true },
  });
  const allPlayerIds = new Set(extraPlayerIds);
  for (const m of visiblePlayerRows) {
    allPlayerIds.add(m.playerAId);
    allPlayerIds.add(m.playerBId);
  }

  const remainingMatches = await tx.match.findMany({
    where: LEDGER_VISIBLE_MATCH_WHERE,
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
    Array.from(allPlayerIds).map((playerId) =>
      tx.player.update({ where: { id: playerId }, data: { elo: finalRatings.get(playerId) ?? STARTING_ELO } })
    )
  );
}

// Called whenever a tournament's status transitions into or out of
// 'completed': its matches just became visible to the ledger for the first
// time (entering) or dropped out of visibility again (leaving, e.g. a result
// got deleted and reopened it) — either way a full replay is needed so every
// affected player's live rating reflects exactly what currently counts, in
// playedAt order. `entrantPlayerIds` covers the tournament's players in case
// this is a "leaving completed" transition (their matches are no longer
// ledger-visible, so replayLedger's own scan can't find them to reset).
export async function applyLedgerForTournamentStatusChange(tx, entrantPlayerIds = []) {
  await replayLedger(tx, entrantPlayerIds);
}
