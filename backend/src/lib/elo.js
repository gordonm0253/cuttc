export const STARTING_ELO = 1200;
const K = 32;

export function expectedScore(ratingA, ratingB) {
  return 1 / (1 + 10 ** ((ratingB - ratingA) / 400));
}

// scoreA: 1 if player A won, 0 if player A lost
export function updateElo(ratingA, ratingB, scoreA) {
  const expectedA = expectedScore(ratingA, ratingB);
  const newRatingA = Math.round(ratingA + K * (scoreA - expectedA));
  const newRatingB = Math.round(ratingB + K * ((1 - scoreA) - (1 - expectedA)));
  return { newRatingA, newRatingB };
}

// Replays a full match history (ordered by playedAt ascending) from scratch, recomputing each
// match's before/after Elo snapshots and each player's final rating. Ratings are interdependent
// across the whole ledger (not just per-player), so this must run over every remaining match
// globally, not per-player in isolation.
// matches: array of { id, playerAId, playerBId, winnerId }, ordered by playedAt ascending.
// Returns { snapshots: Map<matchId, { playerAElo, playerBElo, playerAEloAfter, playerBEloAfter }>,
//           finalRatings: Map<playerId, number> }.
export function replayMatches(matches) {
  const ratings = new Map();
  const getRating = (playerId) => ratings.get(playerId) ?? STARTING_ELO;

  const snapshots = new Map();
  for (const match of matches) {
    const { id, playerAId, playerBId, winnerId } = match;
    const ratingA = getRating(playerAId);
    const ratingB = getRating(playerBId);
    const scoreA = winnerId === playerAId ? 1 : 0;
    const { newRatingA, newRatingB } = updateElo(ratingA, ratingB, scoreA);

    snapshots.set(id, {
      playerAElo: ratingA,
      playerBElo: ratingB,
      playerAEloAfter: newRatingA,
      playerBEloAfter: newRatingB,
    });

    ratings.set(playerAId, newRatingA);
    ratings.set(playerBId, newRatingB);
  }

  return { snapshots, finalRatings: ratings };
}

// Validates a best-of-5, first-to-11-win-by-2 match and returns the winning side.
export function determineWinnerAndValidate(sets) {
  if (!Array.isArray(sets) || sets.length < 3 || sets.length > 5) {
    throw new Error('A match must have between 3 and 5 sets');
  }

  let aWins = 0;
  let bWins = 0;

  sets.forEach((set, index) => {
    if (!set || typeof set.a !== 'number' || typeof set.b !== 'number') {
      throw new Error('Each set must have numeric scores for both players');
    }
    if (aWins >= 3 || bWins >= 3) {
      throw new Error(`Match was already decided before set ${index + 1}: no further sets should be played`);
    }
    const { a, b } = set;
    if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < 0) {
      throw new Error('Set scores must be non-negative integers');
    }
    const max = Math.max(a, b);
    const min = Math.min(a, b);
    const diff = max - min;
    const isValid = (max === 11 && min <= 9) || (min >= 10 && diff === 2);
    if (!isValid) {
      throw new Error(`Invalid set score ${a}-${b}: a set is won at 11 points, or by 2 points if tied at 10-10 or later`);
    }
    if (a > b) aWins++; else bWins++;
  });

  if (aWins < 3 && bWins < 3) {
    throw new Error('Match sets do not resolve to a best-of-5 winner (need 3 set wins)');
  }

  return aWins > bWins ? 'A' : 'B';
}
