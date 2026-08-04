import prisma from '../lib/prisma.js';
import { determineWinnerAndValidate, STARTING_ELO } from '../lib/elo.js';
import {
  resolvePlayer,
  writeTournamentMatch,
  deleteMatchAndReplay,
  deleteMatchesAndReplay,
  applyLedgerForTournamentStatusChange,
} from '../lib/matchLedger.js';
import {
  generateSingleElimination,
  generateDoubleElimination,
  generateRoundRobin,
  computeRoundRobinStandings,
} from '../lib/bracket.js';

const VALID_FORMATS = ['single_elimination', 'double_elimination', 'round_robin'];

const MATCH_INCLUDE = {
  entrantA: { include: { player: { select: { id: true, displayName: true, elo: true } } } },
  entrantB: { include: { player: { select: { id: true, displayName: true, elo: true } } } },
  winnerEntrant: true,
  match: true,
};

function validateCreateInput({ name, format, entrants }) {
  const errors = [];
  if (!name || typeof name !== 'string') errors.push('name is required');
  if (!VALID_FORMATS.includes(format)) errors.push(`format must be one of ${VALID_FORMATS.join(', ')}`);
  if (!Array.isArray(entrants) || entrants.length < 2) errors.push('at least 2 entrants are required');
  if (errors.length) {
    const err = new Error(errors.join('; '));
    err.status = 400;
    throw err;
  }
}

export async function createTournament({ name, format, entrants, createdByEmail }) {
  validateCreateInput({ name, format, entrants });

  return prisma.$transaction(async (tx) => {
    const resolved = [];
    for (const entrantRef of entrants) {
      const player = await resolvePlayer(tx, entrantRef, { startingElo: STARTING_ELO });
      resolved.push(player);
    }

    const uniqueIds = new Set(resolved.map((p) => p.id));
    if (uniqueIds.size !== resolved.length) {
      const err = new Error('Entrants must be distinct players');
      err.status = 400;
      throw err;
    }

    // Order by elo desc; tie-break by createdAt asc for a deterministic, stable seed order.
    const seeded = [...resolved].sort((a, b) => {
      if (b.elo !== a.elo) return b.elo - a.elo;
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

    const tournament = await tx.tournament.create({
      data: { name, format, status: 'seeded', createdByEmail },
    });

    const entrantRows = [];
    for (let i = 0; i < seeded.length; i++) {
      const row = await tx.tournamentEntrant.create({
        data: {
          tournamentId: tournament.id,
          playerId: seeded[i].id,
          seed: i + 1,
          eloAtSeed: seeded[i].elo,
        },
      });
      entrantRows.push(row);
    }

    const entrantIds = entrantRows.map((e) => e.id); // index 0 = seed 1

    if (format === 'round_robin') {
      const pairings = generateRoundRobin(entrantIds);
      await tx.tournamentMatch.createMany({
        data: pairings.map((p) => ({
          tournamentId: tournament.id,
          bracketSide: null,
          round: p.round,
          position: p.position,
          entrantAId: p.entrantAId,
          entrantBId: p.entrantBId,
        })),
      });
    } else {
      const graph =
        format === 'single_elimination'
          ? { nodeGroups: [{ side: null, nodes: generateSingleElimination(entrantIds).nodes }] }
          : buildDoubleEliminationNodeGroups(entrantIds);

      await persistBracketGraph(tx, tournament.id, graph.nodeGroups);
    }

    return getTournamentTx(tx, tournament.id);
  });
}

function buildDoubleEliminationNodeGroups(entrantIds) {
  const de = generateDoubleElimination(entrantIds);
  return {
    nodeGroups: [
      { side: 'winners', nodes: de.winnersNodes },
      { side: 'losers', nodes: de.losersNodes },
      { side: 'grand_final', nodes: de.grandFinalNodes },
    ],
  };
}

// Persists a set of in-memory bracket nodes (each carrying a `nextRef`/`loserNextRef`
// pointer keyed by {round, position, side}) as real TournamentMatch rows.
// nextMatchId/loserNextMatchId are self-referencing FKs that need the *target*
// row's real id, but a target can be on either side of the bracket and at any
// round — e.g. a winners-bracket round's loserNextRef can point at a
// losers-bracket round number higher than its own, since the losers bracket
// accumulates extra "consolidation" rounds the winners bracket doesn't have.
// No single creation order satisfies every edge, so this runs in two passes
// instead of trying to order around it: create every row first (FKs null),
// then update each row's FK columns once every row's real id is known.
async function persistBracketGraph(tx, tournamentId, nodeGroups) {
  // key: `${side}:${round}:${position}` -> persisted row id
  const idByKey = new Map();
  const key = (side, round, position) => `${side}:${round}:${position}`;

  // Flatten all nodes across sides, and resolve each node's own "side" (bracketSide
  // stored on the node itself, which is null for single-elim).
  const allNodes = [];
  for (const group of nodeGroups) {
    for (const n of group.nodes) {
      allNodes.push({ ...n, _side: n.bracketSide ?? group.side });
    }
  }

  for (const node of allNodes) {
    const row = await tx.tournamentMatch.create({
      data: {
        tournamentId,
        bracketSide: node._side,
        round: node.round,
        position: node.position,
        entrantAId: node.entrantAId ?? null,
        entrantBId: node.entrantBId ?? null,
        isBye: !!node.isBye,
        conditional: !!node.conditional,
        skipped: !!node.skipped,
        winnerEntrantId: node.winnerEntrantId ?? null,
      },
    });
    idByKey.set(key(node._side, node.round, node.position), row.id);
  }

  for (const node of allNodes) {
    if (!node.nextRef && !node.loserNextRef) continue;
    const nextMatchId = node.nextRef ? idByKey.get(key(node.nextRef.side ?? node._side, node.nextRef.round, node.nextRef.position)) : null;
    const loserNextMatchId = node.loserNextRef
      ? idByKey.get(key(node.loserNextRef.side, node.loserNextRef.round, node.loserNextRef.position))
      : null;

    await tx.tournamentMatch.update({
      where: { id: idByKey.get(key(node._side, node.round, node.position)) },
      data: {
        nextMatchId: nextMatchId ?? null,
        nextMatchSlot: node.nextRef ? node.nextRef.slot : null,
        loserNextMatchId: loserNextMatchId ?? null,
        loserNextMatchSlot: node.loserNextRef ? node.loserNextRef.slot : null,
      },
    });
  }
}

async function getTournamentTx(tx, id) {
  const tournament = await tx.tournament.findUnique({
    where: { id },
    include: {
      entrants: {
        include: { player: { select: { id: true, displayName: true, elo: true } } },
        orderBy: { seed: 'asc' },
      },
      matches: {
        include: MATCH_INCLUDE,
        orderBy: [{ bracketSide: 'asc' }, { round: 'asc' }, { position: 'asc' }],
      },
    },
  });

  if (!tournament) {
    const err = new Error('Tournament not found');
    err.status = 404;
    throw err;
  }

  if (tournament.format === 'round_robin') {
    tournament.standings = computeRoundRobinStandings(tournament.matches, tournament.entrants);
  }

  return tournament;
}

export async function getTournament(id) {
  return getTournamentTx(prisma, id);
}

// Human label for "where things are" in an in-progress bracket, based on how
// many rounds remain on the side with the most rounds left. Mirrors the
// Round of N / Quarterfinals / Semifinals / Final naming used in the bracket
// view itself, but computed from round counts alone (no node graph needed).
function currentRoundLabel(matches) {
  const reportable = matches.filter((m) => !m.isBye && !m.skipped);
  const unplayed = reportable.filter((m) => !m.matchId);
  if (unplayed.length === 0) return null;

  const rounds = unplayed.map((m) => m.round);
  const currentRound = Math.min(...rounds);
  const totalRounds = Math.max(...matches.map((m) => m.round));
  const fromEnd = totalRounds - currentRound;
  if (fromEnd === 0) return 'Final';
  if (fromEnd === 1) return 'Semifinals';
  if (fromEnd === 2) return 'Quarterfinals';
  return `Round ${currentRound}`;
}

export async function listTournaments() {
  const tournaments = await prisma.tournament.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { entrants: true } },
      matches: { select: { isBye: true, skipped: true, matchId: true, round: true, bracketSide: true } },
    },
  });

  return tournaments.map(({ matches, ...tournament }) => {
    const reportable = matches.filter((m) => !m.isBye && !m.skipped);
    const reportedCount = reportable.filter((m) => !!m.matchId).length;
    const reportableCount = reportable.length;
    return {
      ...tournament,
      progress: {
        reportedCount,
        reportableCount,
        pct: reportableCount ? Math.round((reportedCount / reportableCount) * 100) : 0,
        currentRoundLabel: currentRoundLabel(matches),
      },
    };
  });
}

// Resolves and forward-propagates any bye match that has become playable-by-
// default since the last write: a losers-bracket bye only gets its single real
// entrant once an earlier match's loser drops into it (generation-time bye
// resolution only covers byes visible from the start, e.g. round-1 byes for
// non-power-of-two entrant counts). Without this, a player who loses, drops
// into a bye second-life match, and has no opponent there gets stuck forever
// with an unplayable, unreportable match blocking the rest of their run.
// Idempotent and safe to call after any write that might have populated a
// bye's entrant slot; walks the whole cascade (a resolved bye can itself feed
// straight into another bye) until nothing changes.
async function resolveAutoAdvances(tx, tournamentId) {
  let changed = true;
  while (changed) {
    changed = false;
    const matches = await tx.tournamentMatch.findMany({ where: { tournamentId } });
    for (const m of matches) {
      if (!m.isBye || m.winnerEntrantId) continue;
      const winnerEntrantId = m.entrantAId || m.entrantBId;
      if (!winnerEntrantId) continue; // still waiting on both a real entrant AND its bye slot

      await tx.tournamentMatch.update({ where: { id: m.id }, data: { winnerEntrantId } });

      if (m.nextMatchId) {
        await tx.tournamentMatch.update({
          where: { id: m.nextMatchId },
          data: m.nextMatchSlot === 'A' ? { entrantAId: winnerEntrantId } : { entrantBId: winnerEntrantId },
        });
      }
      // A bye match has no real loser (its "opponent" was never a real entrant),
      // so unlike reportTournamentMatchResult there is no loserNextMatchId hop here.
      changed = true;
    }
  }
}

export async function reportTournamentMatchResult(tournamentMatchId, { playedAt, sets }) {
  if (!playedAt || Number.isNaN(Date.parse(playedAt))) {
    const err = new Error('playedAt is required and must be a valid date');
    err.status = 400;
    throw err;
  }

  const winnerSide = determineWinnerAndValidate(sets);

  return prisma.$transaction(async (tx) => {
    const node = await tx.tournamentMatch.findUnique({
      where: { id: tournamentMatchId },
      include: {
        entrantA: { include: { player: true } },
        entrantB: { include: { player: true } },
        tournament: true,
      },
    });

    if (!node) {
      const err = new Error('Tournament match not found');
      err.status = 404;
      throw err;
    }
    if (node.isBye || node.skipped) {
      const err = new Error('This match does not need a result');
      err.status = 400;
      throw err;
    }
    if (!node.entrantAId || !node.entrantBId) {
      const err = new Error('Both entrants must be determined before reporting a result (waiting on a previous round)');
      err.status = 400;
      throw err;
    }
    if (node.matchId) {
      const err = new Error('A result has already been reported for this match; delete it first to change it');
      err.status = 400;
      throw err;
    }

    const playerA = node.entrantA.player;
    const playerB = node.entrantB.player;

    // Doesn't touch Elo yet — tournament results only count toward ratings
    // once the whole tournament is complete (see resolveAutoAdvances' sibling
    // finalization step below and writeTournamentMatch's own comment).
    const match = await writeTournamentMatch(tx, {
      playedAt,
      playerAId: playerA.id,
      playerBId: playerB.id,
      winnerSide,
      playerAElo: playerA.elo,
      playerBElo: playerB.elo,
      sets,
    });

    const winnerEntrantId = winnerSide === 'A' ? node.entrantAId : node.entrantBId;
    const loserEntrantId = winnerSide === 'A' ? node.entrantBId : node.entrantAId;

    await tx.tournamentMatch.update({
      where: { id: node.id },
      data: { matchId: match.id, winnerEntrantId },
    });

    if (node.nextMatchId) {
      await tx.tournamentMatch.update({
        where: { id: node.nextMatchId },
        data: node.nextMatchSlot === 'A' ? { entrantAId: winnerEntrantId } : { entrantBId: winnerEntrantId },
      });
    }

    if (node.tournament.format === 'double_elimination' && node.loserNextMatchId) {
      await tx.tournamentMatch.update({
        where: { id: node.loserNextMatchId },
        data: node.loserNextMatchSlot === 'A' ? { entrantAId: loserEntrantId } : { entrantBId: loserEntrantId },
      });
    }

    // Grand-final bracket-reset trigger: slot A is always the winners-bracket
    // path, slot B always the losers-bracket path (fixed at generation time).
    // If slot B wins game 1, a second decisive match is needed.
    if (node.tournament.format === 'double_elimination' && node.bracketSide === 'grand_final' && node.round === 1) {
      const resetMatch = await tx.tournamentMatch.findFirst({
        where: { tournamentId: node.tournamentId, bracketSide: 'grand_final', round: 2 },
      });
      if (resetMatch) {
        if (winnerEntrantId === node.entrantBId) {
          await tx.tournamentMatch.update({
            where: { id: resetMatch.id },
            data: { skipped: false, entrantAId: node.entrantAId, entrantBId: node.entrantBId },
          });
        } else {
          await tx.tournamentMatch.update({ where: { id: resetMatch.id }, data: { skipped: true } });
        }
      }
    }

    if (node.tournament.format === 'double_elimination') {
      await resolveAutoAdvances(tx, node.tournamentId);
    }

    await updateTournamentStatus(tx, node.tournamentId);

    return getTournamentTx(tx, node.tournamentId);
  });
}

async function updateTournamentStatus(tx, tournamentId) {
  const tournament = await tx.tournament.findUnique({ where: { id: tournamentId } });
  const matches = await tx.tournamentMatch.findMany({ where: { tournamentId } });

  const anyPlayed = matches.some((m) => m.matchId || (m.isBye && m.winnerEntrantId));
  const status = !anyPlayed
    ? 'seeded'
    : matches.filter((m) => !m.isBye && !m.skipped).every((m) => !!m.matchId)
      ? 'completed'
      : 'in_progress';

  if (tournament.status === status) return;

  await tx.tournament.update({ where: { id: tournamentId }, data: { status } });

  // This tournament's matches just became visible to (status -> 'completed')
  // or just dropped out of (status was 'completed', e.g. a result got deleted
  // and reopened it) the club Elo ledger — see writeTournamentMatch's comment.
  // Either direction needs a replay so every player's live rating reflects
  // exactly the matches that currently count, in playedAt order.
  if (status === 'completed' || tournament.status === 'completed') {
    const entrants = await tx.tournamentEntrant.findMany({ where: { tournamentId }, select: { playerId: true } });
    await applyLedgerForTournamentStatusChange(tx, entrants.map((e) => e.playerId));
  }
}

// Walks forward from a match's winner-advancement slot through any chain of
// auto-resolved bye matches (a bye can itself feed straight into another bye)
// and returns the first real, non-bye match found along that chain — the one
// whose reported result (if any) actually blocks deleting the upstream
// result, since byes have no result of their own to worry about.
async function firstRealDownstream(tx, matchId, slotField) {
  let current = matchId ? await tx.tournamentMatch.findUnique({ where: { id: matchId } }) : null;
  while (current && current.isBye) {
    current = current[slotField] ? await tx.tournamentMatch.findUnique({ where: { id: current[slotField] } }) : null;
  }
  return current;
}

// Reverses resolveAutoAdvances after an upstream result was deleted: any bye
// match whose winnerEntrantId no longer matches one of its current entrant
// slots was only resolved because of the just-cleared result, so its own
// winner (and whatever it had advanced) needs clearing too. Repeats to a
// fixed point the same way resolution does, since clearing one bye can make
// the next one downstream stale in turn.
async function unresolveDownstreamByes(tx, tournamentId) {
  let changed = true;
  while (changed) {
    changed = false;
    const matches = await tx.tournamentMatch.findMany({ where: { tournamentId } });
    for (const m of matches) {
      if (!m.isBye || !m.winnerEntrantId) continue;
      if (m.winnerEntrantId === m.entrantAId || m.winnerEntrantId === m.entrantBId) continue;

      await tx.tournamentMatch.update({ where: { id: m.id }, data: { winnerEntrantId: null } });

      if (m.nextMatchId) {
        await tx.tournamentMatch.update({
          where: { id: m.nextMatchId },
          data: m.nextMatchSlot === 'A' ? { entrantAId: null } : { entrantBId: null },
        });
      }
      changed = true;
    }
  }
}

export async function deleteTournamentMatchResult(tournamentMatchId) {
  return prisma.$transaction(async (tx) => {
    const node = await tx.tournamentMatch.findUnique({
      where: { id: tournamentMatchId },
      include: { nextMatch: true, loserNextMatch: true },
    });
    if (!node) {
      const err = new Error('Tournament match not found');
      err.status = 404;
      throw err;
    }
    if (!node.matchId) {
      const err = new Error('This match has no reported result to delete');
      err.status = 400;
      throw err;
    }

    // A bye match auto-resolves with no result of its own, so a bye sitting
    // directly downstream isn't itself a blocker — what matters is whether a
    // real match further down that bye chain already has a reported result.
    const nextReal = node.nextMatch?.isBye
      ? await firstRealDownstream(tx, node.nextMatch.nextMatchId, 'nextMatchId')
      : node.nextMatch;
    const loserNextReal = node.loserNextMatch?.isBye
      ? await firstRealDownstream(tx, node.loserNextMatch.nextMatchId, 'nextMatchId')
      : node.loserNextMatch;
    if (nextReal?.matchId || loserNextReal?.matchId) {
      const err = new Error('Cannot edit this result — a later match already depends on it. Delete the later match result(s) first.');
      err.status = 400;
      throw err;
    }

    await deleteMatchAndReplay(tx, node.matchId);

    await tx.tournamentMatch.update({
      where: { id: node.id },
      data: { matchId: null, winnerEntrantId: null },
    });

    if (node.nextMatchId) {
      await tx.tournamentMatch.update({
        where: { id: node.nextMatchId },
        data: node.nextMatchSlot === 'A' ? { entrantAId: null } : { entrantBId: null },
      });
    }
    if (node.loserNextMatchId) {
      await tx.tournamentMatch.update({
        where: { id: node.loserNextMatchId },
        data: node.loserNextMatchSlot === 'A' ? { entrantAId: null } : { entrantBId: null },
      });
    }

    // Unwind any bye matches whose sole entrant came from this now-deleted
    // result, cascading forward the same way resolveAutoAdvances propagates
    // forward — a bye with its winner cleared must also clear whatever it had
    // advanced, and so on down the chain.
    await unresolveDownstreamByes(tx, node.tournamentId);

    // Unwind a bracket-reset trigger if this was the decisive grand-final game.
    if (node.bracketSide === 'grand_final' && node.round === 1) {
      const resetMatch = await tx.tournamentMatch.findFirst({
        where: { tournamentId: node.tournamentId, bracketSide: 'grand_final', round: 2 },
      });
      if (resetMatch && !resetMatch.matchId) {
        await tx.tournamentMatch.update({
          where: { id: resetMatch.id },
          data: { skipped: true, entrantAId: null, entrantBId: null },
        });
      }
    }

    await updateTournamentStatus(tx, node.tournamentId);
  });
}

export async function deleteTournament(id) {
  await prisma.$transaction(async (tx) => {
    const tournament = await tx.tournament.findUnique({ where: { id } });
    if (!tournament) {
      const err = new Error('Tournament not found');
      err.status = 404;
      throw err;
    }

    const playedMatches = await tx.tournamentMatch.findMany({
      where: { tournamentId: id, matchId: { not: null } },
      select: { matchId: true },
    });

    await deleteMatchesAndReplay(tx, playedMatches.map((m) => m.matchId));

    await tx.tournament.delete({ where: { id } });
  });
}
