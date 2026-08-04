import prisma from '../lib/prisma.js';
import { determineWinnerAndValidate, STARTING_ELO } from '../lib/elo.js';
import { resolvePlayer, writeMatchAndUpdateElo, deleteMatchAndReplay, deleteMatchesAndReplay } from '../lib/matchLedger.js';
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
// pointer keyed by {round, position, side}) as real TournamentMatch rows. Because
// nextMatchId/loserNextMatchId are self-referencing FKs that need the *target* row's
// real id, rows are created in reverse round order per side (final first, working
// back to round 1) so every forward reference already points at a persisted row.
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

  // Sort so higher rounds are created first within each side (nextRef always
  // points forward to a higher round or into grand_final, which is handled by
  // creating grand_final round 2 then round 1 then winners/losers descending).
  const sideOrder = { grand_final: 0, winners: 1, losers: 1 };
  allNodes.sort((a, b) => {
    const sideDiff = (sideOrder[a._side] ?? 1) - (sideOrder[b._side] ?? 1);
    if (sideDiff !== 0) return sideDiff;
    if (a._side === 'grand_final') return b.round - a.round; // round2 (reset) before round1
    return b.round - a.round; // descending rounds within winners/losers
  });

  for (const node of allNodes) {
    const nextMatchId = node.nextRef ? idByKey.get(key(node.nextRef.side ?? node._side, node.nextRef.round, node.nextRef.position)) : null;
    const loserNextMatchId = node.loserNextRef
      ? idByKey.get(key(node.loserNextRef.side, node.loserNextRef.round, node.loserNextRef.position))
      : null;

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
        nextMatchId: nextMatchId ?? null,
        nextMatchSlot: node.nextRef ? node.nextRef.slot : null,
        loserNextMatchId: loserNextMatchId ?? null,
        loserNextMatchSlot: node.loserNextRef ? node.loserNextRef.slot : null,
      },
    });

    idByKey.set(key(node._side, node.round, node.position), row.id);
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

export async function listTournaments() {
  return prisma.tournament.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { entrants: true } } },
  });
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

    const match = await writeMatchAndUpdateElo(tx, {
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

    await updateTournamentStatus(tx, node.tournamentId);

    return getTournamentTx(tx, node.tournamentId);
  });
}

async function updateTournamentStatus(tx, tournamentId) {
  const tournament = await tx.tournament.findUnique({ where: { id: tournamentId } });
  const matches = await tx.tournamentMatch.findMany({ where: { tournamentId } });

  const anyPlayed = matches.some((m) => m.matchId || (m.isBye && m.winnerEntrantId));
  if (!anyPlayed) {
    await tx.tournament.update({ where: { id: tournamentId }, data: { status: 'seeded' } });
    return;
  }

  const reportable = matches.filter((m) => !m.isBye && !m.skipped);
  const allReported = reportable.every((m) => !!m.matchId);
  const status = allReported ? 'completed' : 'in_progress';
  if (tournament.status !== status) {
    await tx.tournament.update({ where: { id: tournamentId }, data: { status } });
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
    if (node.nextMatch?.matchId || node.loserNextMatch?.matchId) {
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
