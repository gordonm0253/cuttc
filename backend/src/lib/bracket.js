// Pure bracket-structure generation: no I/O, no Prisma. All functions take plain
// data in and return plain data out, so they can be composed by tournaments.service.js
// and tested standalone.

export function nextPowerOfTwo(n) {
  return Math.pow(2, Math.ceil(Math.log2(Math.max(n, 2))));
}

// Standard recursive seed-pairing method: seedOrder(1) = [1], and each doubling
// interleaves the previous order with its mirror-complement (size+1-seed). Every
// adjacent pair in the result sums to size+1, so seed 1 and seed 2 can only meet
// in the final, seeds 1-4 only from the semifinal on, etc. Seeds beyond
// entrantCount don't exist and become byes; because the complement of a low seed
// is always the highest not-yet-placed seed, byes land on the top seeds'
// opponents automatically (no special-casing needed).
export function computeSeedSlots(entrantCount) {
  const size = nextPowerOfTwo(entrantCount);

  function seedOrder(n) {
    if (n === 1) return [1];
    const prev = seedOrder(n / 2);
    const result = [];
    for (const seed of prev) {
      result.push(seed);
      result.push(n + 1 - seed);
    }
    return result;
  }

  return seedOrder(size);
}

// Builds a single-elimination bracket from a seed-ordered list of entrant ids
// (index 0 = seed 1). Returns an array of "node" objects (round, position,
// bracketSide, entrantAId/entrantBId, isBye, nextRef) where nextRef is a
// {round, position, slot} pointer into this same array (resolved to real ids by
// the caller once rows are persisted, since ids don't exist yet at this stage).
export function generateSingleElimination(entrantIds, { bracketSide = null } = {}) {
  const entrantCount = entrantIds.length;
  const size = nextPowerOfTwo(entrantCount);
  const totalRounds = Math.log2(size);
  const slots = computeSeedSlots(entrantCount);

  const seedToEntrantId = (seed) => (seed <= entrantCount ? entrantIds[seed - 1] : null);

  const nodes = [];
  const nodesByRoundPos = new Map();
  const key = (round, position) => `${round}:${position}`;

  // Round 1, straight from the seed-slot pairing.
  const round1Count = size / 2;
  for (let p = 0; p < round1Count; p++) {
    const seedA = slots[2 * p];
    const seedB = slots[2 * p + 1];
    const entrantAId = seedToEntrantId(seedA);
    const entrantBId = seedToEntrantId(seedB);
    const isBye = entrantAId !== null && entrantBId === null;
    const node = {
      round: 1,
      position: p,
      bracketSide,
      entrantAId,
      entrantBId,
      isBye,
      nextRef: totalRounds > 1 ? { round: 2, position: Math.floor(p / 2), slot: p % 2 === 0 ? 'A' : 'B' } : null,
    };
    nodes.push(node);
    nodesByRoundPos.set(key(1, p), node);
  }

  // Later rounds: empty until fed by advancement.
  for (let r = 2; r <= totalRounds; r++) {
    const count = size / Math.pow(2, r);
    for (let p = 0; p < count; p++) {
      const node = {
        round: r,
        position: p,
        bracketSide,
        entrantAId: null,
        entrantBId: null,
        isBye: false,
        nextRef: r < totalRounds ? { round: r + 1, position: Math.floor(p / 2), slot: p % 2 === 0 ? 'A' : 'B' } : null,
      };
      nodes.push(node);
      nodesByRoundPos.set(key(r, p), node);
    }
  }

  // Propagate byes forward until no more auto-advances are possible (handles
  // chained byes in degenerate small brackets, e.g. entrantCount <= 2).
  let changed = true;
  while (changed) {
    changed = false;
    for (const node of nodes) {
      if (!node.isBye || node.winnerEntrantId || !node.nextRef) continue;
      const winnerId = node.entrantAId;
      node.winnerEntrantId = winnerId;
      const target = nodesByRoundPos.get(key(node.nextRef.round, node.nextRef.position));
      if (target) {
        if (node.nextRef.slot === 'A') target.entrantAId = winnerId;
        else target.entrantBId = winnerId;
        if (target.entrantAId && !target.entrantBId && target.round === 1) {
          // not reachable for round>1 targets in a well-formed bracket, kept for symmetry
        }
        if (target.entrantAId && target.entrantBId === null && target.isBye === false) {
          // Target might itself resolve to a bye-of-a-bye only if its other slot can
          // never be filled (only possible for entrantCount <= 1 within that subtree).
          const otherComesFromBye = nodes.some(
            (n) => n.nextRef && n.nextRef.round === target.round && n.nextRef.position === target.position &&
              n.nextRef.slot !== node.nextRef.slot && !n.isBye && n.entrantAId === null && n.entrantBId === null && n.round === node.round
          );
          if (!otherComesFromBye) {
            // Nothing else feeds this slot (bracket too small to have a real opponent) -> bye.
            const anyOtherFeeder = nodes.some(
              (n) => n.nextRef && n.nextRef.round === target.round && n.nextRef.position === target.position && n !== node
            );
            if (!anyOtherFeeder) {
              target.isBye = true;
            }
          }
        }
      }
      changed = true;
    }
  }

  return { nodes, totalRounds, size };
}

// Double elimination: winners bracket (standard single-elim generator) plus a
// losers bracket built round-by-round in lockstep with the winners bracket, and
// a grand final with a pre-created conditional bracket-reset match.
//
// LB round sizing is driven by the WB's fixed round *skeleton* (one LB drop-in
// slot per WB match that round, real or bye) rather than by how many of those
// WB matches happen to be real. That distinction matters for non-power-of-two
// entrant counts: round 1 byes shrink the number of *real* droppers well below
// later rounds' real-match counts, and sizing LB rounds off real-dropper counts
// (as an earlier version of this function did) leaves later rounds' droppers
// with no LB round waiting to receive them — those players get eliminated
// after a single loss instead of the second life double elimination promises.
// Building every round at full skeleton size and marking a slot a "bye" when
// only one of its two feeds is real (mirroring generateSingleElimination's own
// bye convention) keeps every real loser wired to a real second-life match.
//
// Slot convention (fixed at generation time, avoids any runtime inference later):
// grand final slot A is always the winners-bracket champion, slot B is always the
// losers-bracket champion. If slot B wins game 1, the reset match is needed.
export function generateDoubleElimination(entrantIds) {
  const entrantCount = entrantIds.length;
  const wb = generateSingleElimination(entrantIds, { bracketSide: 'winners' });
  const { totalRounds: wbRounds, size } = wb;

  const wbNodesByRound = (r) => wb.nodes.filter((n) => n.round === r).sort((a, b) => a.position - b.position);
  const wbHasRealDrop = (m) => !m.isBye;

  const lbNodes = [];
  let lbRoundCounter = 0;
  // Slots of the most-recently-built LB round, in position order. Each entry is
  // { isReal, node } — `node` is null when neither of its own two feeds was real
  // (a "phantom" slot: nothing to advance, consumed purely to keep the skeleton's
  // positions aligned with the WB round it will next pair against).
  let prevRoundSlots = null;

  // Creates one LB slot from up to two feeds. Each feed is either null (no real
  // input) or a callback that, given the created node and the slot ('A' or 'B')
  // it was assigned, records the winner-forward wiring for that upstream source.
  // A slot with zero real feeds doesn't get a node at all (phantom, kept only to
  // preserve position alignment); one real feed makes an auto-advancing bye
  // (always assigned slot A, matching generateSingleElimination's own bye
  // convention); two real feeds make a normal match.
  function buildSlot(round, position, feedA, feedB) {
    const realCount = (feedA ? 1 : 0) + (feedB ? 1 : 0);
    if (realCount === 0) return { isReal: false, node: null };
    const node = {
      round,
      position,
      bracketSide: 'losers',
      entrantAId: null,
      entrantBId: null,
      isBye: realCount === 1,
      nextRef: null,
    };
    lbNodes.push(node);
    if (feedA) feedA(node, 'A');
    if (feedB) feedB(node, realCount === 1 ? 'A' : 'B');
    return { isReal: true, node };
  }

  // A feed from a WB match's loser: records the drop link once the LB node exists.
  const dropFeed = (wbMatch) => (node, slot) => {
    wbMatch.loserNextRef = { round: node.round, position: node.position, slot, side: 'losers' };
  };
  // A feed from a previous LB round's survivor: records the advancement link.
  const survivorFeed = (lbSlot) => (node, slot) => {
    lbSlot.node.nextRef = { round: node.round, position: node.position, slot };
  };

  for (let wbRound = 1; wbRound <= wbRounds; wbRound++) {
    const wbMatches = wbNodesByRound(wbRound);

    if (wbRound === 1) {
      // First drop: this WB round's losers play each other, seed-adjacent
      // (mirrors WB pairing order — adjacent WB match losers meet).
      lbRoundCounter += 1;
      const round = lbRoundCounter;
      const count = Math.ceil(wbMatches.length / 2);
      const roundSlots = [];
      for (let p = 0; p < count; p++) {
        const dropA = wbMatches[2 * p];
        const dropB = wbMatches[2 * p + 1];
        roundSlots.push(buildSlot(
          round, p,
          dropA && wbHasRealDrop(dropA) ? dropFeed(dropA) : null,
          dropB && wbHasRealDrop(dropB) ? dropFeed(dropB) : null,
        ));
      }
      prevRoundSlots = roundSlots;
    } else {
      // "vs dropped" round: pair each waiting LB survivor slot against the
      // matching fresh WB-round dropper, mirrored (survivor i vs drop at
      // mirrored index) so the same two players who just met don't
      // immediately meet again. One slot per WB match this round, so the
      // survivor and dropper skeletons always stay the same size.
      lbRoundCounter += 1;
      const round = lbRoundCounter;
      const dropCount = wbMatches.length;
      const roundSlots = [];
      for (let p = 0; p < dropCount; p++) {
        const survivor = prevRoundSlots[p];
        const drop = wbMatches[dropCount - 1 - p];
        roundSlots.push(buildSlot(
          round, p,
          survivor.isReal ? survivorFeed(survivor) : null,
          drop && wbHasRealDrop(drop) ? dropFeed(drop) : null,
        ));
      }
      prevRoundSlots = roundSlots;

      // Consolidation round: if more than one real survivor slot remains and
      // this wasn't the terminal WB round, halve the field back down (playing
      // survivors against each other) before the next WB round's drop arrives.
      const realSlotCount = roundSlots.filter((s) => s.isReal).length;
      if (realSlotCount > 1 && wbRound < wbRounds) {
        lbRoundCounter += 1;
        const consRound = lbRoundCounter;
        const nextCount = Math.ceil(roundSlots.length / 2);
        const consolidationSlots = [];
        for (let p = 0; p < nextCount; p++) {
          const srcA = roundSlots[2 * p];
          const srcB = roundSlots[2 * p + 1];
          consolidationSlots.push(buildSlot(
            consRound, p,
            srcA && srcA.isReal ? survivorFeed(srcA) : null,
            srcB && srcB.isReal ? survivorFeed(srcB) : null,
          ));
        }
        prevRoundSlots = consolidationSlots;
      }
    }
  }

  const lbFinal = prevRoundSlots.find((s) => s.isReal).node;

  // Grand final: slot A = WB champion, slot B = LB champion (fixed convention).
  const wbFinal = wb.nodes.find((n) => n.round === wbRounds);
  wbFinal.nextRef = { round: 1, position: 0, slot: 'A', side: 'grand_final' };
  lbFinal.nextRef = { round: 1, position: 0, slot: 'B', side: 'grand_final' };

  const grandFinal = {
    round: 1,
    position: 0,
    bracketSide: 'grand_final',
    entrantAId: null,
    entrantBId: null,
    isBye: false,
    conditional: false,
    nextRef: null,
  };
  const grandFinalReset = {
    round: 2,
    position: 0,
    bracketSide: 'grand_final',
    entrantAId: null,
    entrantBId: null,
    isBye: false,
    conditional: true,
    skipped: true,
    nextRef: null,
  };

  return {
    winnersNodes: wb.nodes,
    losersNodes: lbNodes,
    grandFinalNodes: [grandFinal, grandFinalReset],
    entrantCount,
    size,
  };
}

// Circle method round-robin pairing. Returns a flat list of {round, position,
// entrantAId, entrantBId} — no bracketSide, no advancement graph. If the entrant
// count is odd, a synthetic bye slot is used to pad and simply produces one fewer
// match that round for whoever draws it (no TournamentMatch row is created for it).
export function generateRoundRobin(entrantIds) {
  const BYE = Symbol('bye');
  const arr = entrantIds.length % 2 === 0 ? [...entrantIds] : [...entrantIds, BYE];
  const n = arr.length;
  const rounds = n - 1;
  const matches = [];

  let rotating = arr.slice(1);
  for (let round = 0; round < rounds; round++) {
    const current = [arr[0], ...rotating];
    let position = 0;
    for (let i = 0; i < n / 2; i++) {
      const a = current[i];
      const b = current[n - 1 - i];
      if (a !== BYE && b !== BYE) {
        matches.push({ round: round + 1, position: position++, entrantAId: a, entrantBId: b });
      }
    }
    rotating = [rotating[rotating.length - 1], ...rotating.slice(0, rotating.length - 1)];
  }

  return matches;
}

// Ranks entrants by: win count desc, then head-to-head (only meaningful for a
// 2-way tie), then set differential desc, then point differential desc.
// `matches` is the list of played TournamentMatch rows (with resolved `match`
// relation exposing sets/winnerId), `entrants` is the tournament's entrant list.
export function computeRoundRobinStandings(matches, entrants) {
  const stats = new Map();
  for (const e of entrants) {
    stats.set(e.id, {
      entrantId: e.id,
      wins: 0,
      losses: 0,
      setsWon: 0,
      setsLost: 0,
      pointsWon: 0,
      pointsLost: 0,
      beat: new Set(),
    });
  }

  for (const m of matches) {
    if (!m.match || !m.entrantAId || !m.entrantBId) continue;
    const aStats = stats.get(m.entrantAId);
    const bStats = stats.get(m.entrantBId);
    if (!aStats || !bStats) continue;

    const sets = m.match.sets || [];
    let aSets = 0, bSets = 0, aPoints = 0, bPoints = 0;
    for (const s of sets) {
      if (s.a > s.b) aSets++; else bSets++;
      aPoints += s.a;
      bPoints += s.b;
    }
    aStats.setsWon += aSets; aStats.setsLost += bSets;
    bStats.setsWon += bSets; bStats.setsLost += aSets;
    aStats.pointsWon += aPoints; aStats.pointsLost += bPoints;
    bStats.pointsWon += bPoints; bStats.pointsLost += aPoints;

    const aWon = m.winnerEntrantId === m.entrantAId;
    if (aWon) {
      aStats.wins++; bStats.losses++; aStats.beat.add(bStats.entrantId);
    } else {
      bStats.wins++; aStats.losses++; bStats.beat.add(aStats.entrantId);
    }
  }

  const ranked = Array.from(stats.values());
  ranked.sort((x, y) => {
    if (y.wins !== x.wins) return y.wins - x.wins;
    if (x.wins === y.wins && x.beat.has(y.entrantId)) return -1;
    if (x.wins === y.wins && y.beat.has(x.entrantId)) return 1;
    const xSetDiff = x.setsWon - x.setsLost;
    const ySetDiff = y.setsWon - y.setsLost;
    if (ySetDiff !== xSetDiff) return ySetDiff - xSetDiff;
    const xPointDiff = x.pointsWon - x.pointsLost;
    const yPointDiff = y.pointsWon - y.pointsLost;
    return yPointDiff - xPointDiff;
  });

  return ranked.map(({ beat, ...rest }) => rest);
}
