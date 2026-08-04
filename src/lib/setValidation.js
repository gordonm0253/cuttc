export const EMPTY_SETS = [
    { a: '', b: '' },
    { a: '', b: '' },
    { a: '', b: '' },
];

function validateSetScore(a, b, index) {
    if (a === '' || b === '') return `Set ${index + 1} is missing a score.`;
    const numA = Number(a);
    const numB = Number(b);
    if (!Number.isInteger(numA) || !Number.isInteger(numB) || numA < 0 || numB < 0) {
        return `Set ${index + 1}: scores must be non-negative whole numbers.`;
    }
    const max = Math.max(numA, numB);
    const min = Math.min(numA, numB);
    const diff = max - min;
    const isValid = (max === 11 && min <= 9) || (min >= 10 && diff === 2);
    if (!isValid) {
        return `Set ${index + 1} (${numA}-${numB}): a set is won at 11 points, or by 2 if tied at 10-10 or later.`;
    }
    return null;
}

// Parses sets in order, enforcing no gaps and stopping once a side has won 3 sets.
export function parseAndValidateSets(sets) {
    const parsed = [];
    let aWins = 0;
    let bWins = 0;

    for (let index = 0; index < sets.length; index++) {
        const { a, b } = sets[index];
        const isBlank = a === '' && b === '';

        if (isBlank) {
            const laterHasScore = sets.slice(index + 1).some((s) => s.a !== '' || s.b !== '');
            if (laterHasScore) {
                return { error: `Set ${index + 1} can't be left empty while a later set has scores. Enter sets in order.` };
            }
            break;
        }

        if (aWins >= 3 || bWins >= 3) {
            return { error: `The match was already won before set ${index + 1} — remove the extra set.` };
        }

        const scoreError = validateSetScore(a, b, index);
        if (scoreError) return { error: scoreError };

        const numA = Number(a);
        const numB = Number(b);
        if (numA > numB) aWins++; else bWins++;
        parsed.push({ a: numA, b: numB });
    }

    if (parsed.length < 3) {
        return { error: 'Enter scores for at least 3 sets.' };
    }
    if (aWins < 3 && bWins < 3) {
        return { error: 'Match is incomplete: one player must win 3 sets.' };
    }

    return { sets: parsed };
}
