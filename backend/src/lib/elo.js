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

// Validates a best-of-5, first-to-11-win-by-2 match and returns the winning side.
export function determineWinnerAndValidate(sets) {
  if (!Array.isArray(sets) || sets.length < 3 || sets.length > 5) {
    throw new Error('A match must have between 3 and 5 sets');
  }

  let aWins = 0;
  let bWins = 0;

  for (const set of sets) {
    if (!set || typeof set.a !== 'number' || typeof set.b !== 'number') {
      throw new Error('Each set must have numeric scores for both players');
    }
    const { a, b } = set;
    if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < 0) {
      throw new Error('Set scores must be non-negative integers');
    }
    const max = Math.max(a, b);
    const diff = Math.abs(a - b);
    if (max < 11 || diff < 2) {
      throw new Error(`Invalid set score ${a}-${b}: must reach at least 11 with a 2-point lead`);
    }
    if (a > b) aWins++; else bWins++;
  }

  if (aWins < 3 && bWins < 3) {
    throw new Error('Match sets do not resolve to a best-of-5 winner (need 3 set wins)');
  }
  if (aWins >= 3 && bWins >= 3) {
    throw new Error('Match sets are invalid: both players cannot win 3 or more sets');
  }

  return aWins > bWins ? 'A' : 'B';
}
