import { useState } from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import PlayerPicker from './PlayerPicker';

const EMPTY_ENTRANT = { id: null, displayName: '', email: '', elo: null };

const FORMAT_LABELS = {
    single_elimination: 'Single Elimination',
    double_elimination: 'Double Elimination',
    round_robin: 'Round Robin',
};

function toEntrantRef(entrant) {
    return entrant.id ? { id: entrant.id } : { displayName: entrant.displayName, email: entrant.email };
}

function TournamentCreateForm({ show, onSubmit, onClose }) {
    const [name, setName] = useState('');
    const [format, setFormat] = useState('single_elimination');
    const [entrants, setEntrants] = useState([{ ...EMPTY_ENTRANT }, { ...EMPTY_ENTRANT }]);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const updateEntrant = (index, value) => {
        setEntrants((prev) => prev.map((e, i) => (i === index ? value : e)));
    };

    const addEntrant = () => setEntrants((prev) => [...prev, { ...EMPTY_ENTRANT }]);
    const removeEntrant = (index) => setEntrants((prev) => (prev.length > 2 ? prev.filter((_, i) => i !== index) : prev));

    const readyEntrants = entrants.filter((e) => e.id || (e.displayName && e.email));
    const seedPreview = [...readyEntrants].sort((a, b) => (b.elo ?? 1200) - (a.elo ?? 1200));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!name.trim()) {
            setError('Enter a tournament name.');
            return;
        }
        if (readyEntrants.length < 2) {
            setError('Add at least 2 entrants.');
            return;
        }
        const ids = readyEntrants.filter((en) => en.id).map((en) => en.id);
        if (new Set(ids).size !== ids.length) {
            setError('Each player can only be entered once.');
            return;
        }

        setSubmitting(true);
        try {
            await onSubmit({
                name: name.trim(),
                format,
                entrants: readyEntrants.map(toEntrantRef),
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal show={show} onHide={onClose} centered scrollable>
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>Create Tournament</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && <div className="eventFormError">{error}</div>}

                    <Form.Group className="mb-3">
                        <Form.Label>Tournament name</Form.Label>
                        <Form.Control value={name} onChange={(e) => setName(e.target.value)} required />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Format</Form.Label>
                        <Form.Select value={format} onChange={(e) => setFormat(e.target.value)}>
                            {Object.entries(FORMAT_LABELS).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Label>Entrants</Form.Label>
                    {entrants.map((entrant, index) => (
                        <div key={index} className="d-flex align-items-start gap-2">
                            <div className="flex-grow-1">
                                <PlayerPicker
                                    label={`Entrant ${index + 1}`}
                                    value={entrant}
                                    onChange={(value) => updateEntrant(index, value)}
                                />
                            </div>
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                className="mt-4"
                                onClick={() => removeEntrant(index)}
                                disabled={entrants.length <= 2}
                            >
                                Remove
                            </Button>
                        </div>
                    ))}
                    <Button variant="outline-secondary" size="sm" className="mb-3" onClick={addEntrant}>
                        Add another entrant
                    </Button>

                    {seedPreview.length >= 2 && (
                        <div className="mb-3">
                            <Form.Label>Seed order preview</Form.Label>
                            <ol className="seedPreviewList">
                                {seedPreview.map((entrant) => (
                                    <li key={entrant.id || entrant.email}>
                                        {entrant.displayName || entrant.email}
                                        {typeof entrant.elo === 'number' ? ` (${entrant.elo})` : ' (new player, 1200)'}
                                    </li>
                                ))}
                            </ol>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onClose} disabled={submitting}>Cancel</Button>
                    <Button variant="danger" type="submit" disabled={submitting}>Create Tournament</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

TournamentCreateForm.propTypes = {
    show: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default TournamentCreateForm;
