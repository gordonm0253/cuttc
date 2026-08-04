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
// Slot convention (fixed at generation time, avoids any runtime inference later):
// grand final slot A is always the winners-bracket champion, slot B is always the
// losers-bracket champion. If slot B wins game 1, the reset match is needed.
export function generateDoubleElimination(entrantIds) {
  const entrantCount = entrantIds.length;
  const wb = generateSingleElimination(entrantIds, { bracketSide: 'winners' });
  const { totalRounds: wbRounds, size } = wb;

  const lbNodes = [];
  let lbRoundCounter = 0;

  const wbNodesByRound = (r) => wb.nodes.filter((n) => n.round === r);

  // For each WB round 1..wbRounds-1, its losers drop into the LB (WB final's loser
  // goes straight to the grand final as the last LB contribution handled separately
  // below via the LB final).
  let previousLbFinalRound = null; // round number of the last LB round created, or null
  let previousLbSurvivorCount = 0;

  for (let wbRound = 1; wbRound <= wbRounds; wbRound++) {
    const wbMatches = wbNodesByRound(wbRound);
    // Byes never produce a loser to drop — only real (non-bye) matches contribute
    // a dropper. Indices below refer to positions within this filtered list, not
    // the raw WB round's match positions.
    const droppers = wbMatches.filter((m) => !m.isBye);
    if (droppers.length === 0) continue;

    if (previousLbFinalRound === null) {
      // First drop: nothing waiting yet, so this WB round's losers play each other,
      // seed-adjacent (mirrors WB pairing order — adjacent WB match losers meet).
      lbRoundCounter += 1;
      const count = Math.ceil(droppers.length / 2);
      for (let p = 0; p < count; p++) {
        const dropA = droppers[2 * p];
        const dropB = droppers[2 * p + 1];
        const node = {
          round: lbRoundCounter,
          position: p,
          bracketSide: 'losers',
          entrantAId: null, // filled from wbRound losers once known (via loserNextRef wiring)
          entrantBId: null,
          isBye: !dropB,
          nextRef: null, // wired below once the next LB round exists
          _dropSourceA: { round: dropA.round, position: dropA.position, side: 'winners' },
          _dropSourceB: dropB ? { round: dropB.round, position: dropB.position, side: 'winners' } : null,
        };
        lbNodes.push(node);
      }
      previousLbFinalRound = lbRoundCounter;
      previousLbSurvivorCount = count;
    } else {
      // "vs dropped" round: pair each waiting LB survivor against one freshly
      // dropped WB-round loser, mirrored (survivor i vs drop at mirrored index)
      // so the same two players who just met don't immediately meet again.
      lbRoundCounter += 1;
      const survivorCount = previousLbSurvivorCount;
      const dropCount = droppers.length;
      const pairCount = Math.min(survivorCount, dropCount);
      for (let p = 0; p < pairCount; p++) {
        const mirroredDropIndex = dropCount - 1 - p;
        const drop = droppers[mirroredDropIndex];
        const node = {
          round: lbRoundCounter,
          position: p,
          bracketSide: 'losers',
          entrantAId: null,
          entrantBId: null,
          isBye: false,
          nextRef: null,
          _survivorFromRound: previousLbFinalRound,
          _survivorFromPosition: p,
          _dropSourceB: { round: drop.round, position: drop.position, side: 'winners' },
        };
        lbNodes.push(node);
      }
      previousLbFinalRound = lbRoundCounter;
      previousLbSurvivorCount = pairCount;

      // If more than one pair remains and this wasn't the terminal WB round,
      // add a consolidation "vs each other" round to halve back down before the
      // next WB round's drop arrives.
      if (pairCount > 1 && wbRound < wbRounds) {
        lbRoundCounter += 1;
        const nextCount = Math.ceil(pairCount / 2);
        for (let p = 0; p < nextCount; p++) {
          const node = {
            round: lbRoundCounter,
            position: p,
            bracketSide: 'losers',
            entrantAId: null,
            entrantBId: null,
            isBye: pairCount % 2 === 1 && p === nextCount - 1,
            nextRef: null,
            _survivorFromRound: previousLbFinalRound,
            _survivorFromPositionA: 2 * p,
            _survivorFromPositionB: 2 * p + 1 < pairCount ? 2 * p + 1 : null,
          };
          lbNodes.push(node);
        }
        previousLbFinalRound = lbRoundCounter;
        previousLbSurvivorCount = nextCount;
      }
    }
  }

  // Wire nextRef forward for every LB node based on its round/position and the
  // following round's survivor-source annotations.
  const lbByRound = new Map();
  for (const n of lbNodes) {
    if (!lbByRound.has(n.round)) lbByRound.set(n.round, []);
    lbByRound.get(n.round).push(n);
  }
  const maxLbRound = lbRoundCounter;
  for (let r = 1; r < maxLbRound; r++) {
    const thisRound = lbByRound.get(r) || [];
    const nextRound = lbByRound.get(r + 1) || [];
    for (const target of nextRound) {
      if (target._survivorFromRound === r) {
        if (target._survivorFromPosition !== undefined) {
          const src = thisRound[target._survivorFromPosition];
          if (src) src.nextRef = { round: r + 1, position: target.position, slot: 'A' };
        }
        if (target._survivorFromPositionA !== undefined) {
          const srcA = thisRound[target._survivorFromPositionA];
          if (srcA) srcA.nextRef = { round: r + 1, position: target.position, slot: 'A' };
          if (target._survivorFromPositionB !== null && target._survivorFromPositionB !== undefined) {
            const srcB = thisRound[target._survivorFromPositionB];
            if (srcB) srcB.nextRef = { round: r + 1, position: target.position, slot: 'B' };
          }
        }
      }
    }
  }

  // Wire WB -> LB drop links (loserNextRef) using the _dropSourceA/_dropSourceB
  // annotations recorded above, and attach the correct slot on each LB node.
  for (const lbNode of lbNodes) {
    if (lbNode._dropSourceA) {
      const wbSrc = wb.nodes.find((n) => n.round === lbNode._dropSourceA.round && n.position === lbNode._dropSourceA.position);
      if (wbSrc) wbSrc.loserNextRef = { round: lbNode.round, position: lbNode.position, slot: 'A', side: 'losers' };
    }
    if (lbNode._dropSourceB) {
      const wbSrc = wb.nodes.find((n) => n.round === lbNode._dropSourceB.round && n.position === lbNode._dropSourceB.position);
      if (wbSrc) wbSrc.loserNextRef = { round: lbNode.round, position: lbNode.position, slot: 'B', side: 'losers' };
    }
  }

  const lbFinal = lbByRound.get(maxLbRound)[0];

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

  // Clean up internal bookkeeping fields before returning.
  for (const n of [...wb.nodes, ...lbNodes]) {
    delete n._dropSourceA;
    delete n._dropSourceB;
    delete n._survivorFromRound;
    delete n._survivorFromPosition;
    delete n._survivorFromPositionA;
    delete n._survivorFromPositionB;
  }

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
