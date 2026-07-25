import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { getPlayers } from '../api/players';
import PlayerPicker from './PlayerPicker';

const EMPTY_SETS = [
    { a: '', b: '' },
    { a: '', b: '' },
    { a: '', b: '' },
];

const EMPTY_PLAYER = { id: null, displayName: '', email: '' };

function toPlayerRef(player) {
    return player.id ? { id: player.id } : { displayName: player.displayName, email: player.email };
}

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
function parseAndValidateSets(sets) {
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

function MatchLogForm({ onSubmit, onClose }) {
    const [playedAt, setPlayedAt] = useState(new Date().toISOString().slice(0, 10));
    const [players, setPlayers] = useState([]);
    const [playerA, setPlayerA] = useState(EMPTY_PLAYER);
    const [playerB, setPlayerB] = useState(EMPTY_PLAYER);
    const [sets, setSets] = useState(EMPTY_SETS);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        getPlayers().then(setPlayers).catch(() => setPlayers([]));
    }, []);

    const updateSet = (index, side, value) => {
        setSets((prev) => prev.map((s, i) => (i === index ? { ...s, [side]: value } : s)));
    };

    const addSet = () => setSets((prev) => (prev.length < 5 ? [...prev, { a: '', b: '' }] : prev));
    const removeSet = (index) => setSets((prev) => (prev.length > 3 ? prev.filter((_, i) => i !== index) : prev));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const { sets: parsedSets, error: setsError } = parseAndValidateSets(sets);
        if (setsError) {
            setError(setsError);
            return;
        }
        if (!playerA.id && !(playerA.displayName && playerA.email)) {
            setError('Select or enter Player A.');
            return;
        }
        if (!playerB.id && !(playerB.displayName && playerB.email)) {
            setError('Select or enter Player B.');
            return;
        }

        setSubmitting(true);
        try {
            await onSubmit({
                playedAt,
                playerA: toPlayerRef(playerA),
                playerB: toPlayerRef(playerB),
                sets: parsedSets,
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Form onSubmit={handleSubmit} className="matchLogForm">
            {error && <div className="eventFormError">{error}</div>}
            <Form.Group className="mb-3">
                <Form.Label>Date played</Form.Label>
                <Form.Control type="date" value={playedAt} onChange={(e) => setPlayedAt(e.target.value)} required />
            </Form.Group>

            <PlayerPicker label="Player A" players={players} value={playerA} onChange={setPlayerA} />
            <PlayerPicker label="Player B" players={players} value={playerB} onChange={setPlayerB} />

            <Form.Label>Set scores (first to 11, win by 2, best of 5)</Form.Label>
            {sets.map((set, index) => (
                <Row key={index} className="g-2 mb-2 align-items-center setScoreRow">
                    <Col xs="auto">Set {index + 1}</Col>
                    <Col>
                        <Form.Control
                            type="number"
                            min="0"
                            placeholder="A"
                            value={set.a}
                            onChange={(e) => updateSet(index, 'a', e.target.value)}
                        />
                    </Col>
                    <Col>
                        <Form.Control
                            type="number"
                            min="0"
                            placeholder="B"
                            value={set.b}
                            onChange={(e) => updateSet(index, 'b', e.target.value)}
                        />
                    </Col>
                    <Col xs="auto">
                        <Button variant="outline-secondary" size="sm" onClick={() => removeSet(index)} disabled={sets.length <= 3}>
                            Remove
                        </Button>
                    </Col>
                </Row>
            ))}
            {sets.length < 5 && (
                <Button variant="outline-secondary" size="sm" className="mb-3" onClick={addSet}>
                    Add set
                </Button>
            )}

            <div className="d-flex justify-content-end gap-2 mt-3">
                <Button variant="secondary" onClick={onClose} disabled={submitting}>Cancel</Button>
                <Button variant="danger" type="submit" disabled={submitting}>Log Match</Button>
            </div>
        </Form>
    );
}

MatchLogForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default MatchLogForm;
