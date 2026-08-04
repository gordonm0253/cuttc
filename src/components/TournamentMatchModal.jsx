import { useState } from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { EMPTY_SETS, parseAndValidateSets } from '../lib/setValidation';

function TournamentMatchModal({ show, entrantA, entrantB, onSubmit, onClose }) {
    const [playedAt, setPlayedAt] = useState(new Date().toISOString().slice(0, 10));
    const [sets, setSets] = useState(EMPTY_SETS);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

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

        setSubmitting(true);
        try {
            await onSubmit({ playedAt, sets: parsedSets });
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal show={show} onHide={onClose} centered scrollable>
            <Form onSubmit={handleSubmit} className="matchLogForm">
                <Modal.Header closeButton>
                    <Modal.Title>Report Result</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && <div className="eventFormError">{error}</div>}

                    <p className="eventText">
                        {entrantA?.player?.displayName || 'TBD'} vs {entrantB?.player?.displayName || 'TBD'}
                    </p>

                    <Form.Group className="mb-3">
                        <Form.Label>Date played</Form.Label>
                        <Form.Control type="date" value={playedAt} onChange={(e) => setPlayedAt(e.target.value)} required />
                    </Form.Group>
                    <p className="eventText">
                        Elo is calculated in date-played order across all club matches, not the order results are entered.
                    </p>

                    <Form.Label>Set scores (first to 11, win by 2, best of 5)</Form.Label>
                    {sets.map((set, index) => (
                        <Row key={index} className="g-2 mb-2 align-items-center setScoreRow">
                            <Col xs="auto">Set {index + 1}</Col>
                            <Col>
                                <Form.Control
                                    type="number"
                                    min="0"
                                    placeholder={entrantA?.player?.displayName || 'A'}
                                    value={set.a}
                                    onChange={(e) => updateSet(index, 'a', e.target.value)}
                                />
                            </Col>
                            <Col>
                                <Form.Control
                                    type="number"
                                    min="0"
                                    placeholder={entrantB?.player?.displayName || 'B'}
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
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onClose} disabled={submitting}>Cancel</Button>
                    <Button variant="danger" type="submit" disabled={submitting}>Report Result</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

TournamentMatchModal.propTypes = {
    show: PropTypes.bool.isRequired,
    entrantA: PropTypes.object,
    entrantB: PropTypes.object,
    onSubmit: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default TournamentMatchModal;
