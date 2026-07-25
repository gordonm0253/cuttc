import { useState } from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

const EVENT_TYPES = ['practice', 'tournament', 'social'];

function toDateInputValue(date) {
    if (!date) return '';
    return new Date(date).toISOString().slice(0, 10);
}

function EventFormModal({ show, initialEvent, onSubmit, onClose }) {
    const [title, setTitle] = useState(initialEvent?.title || '');
    const [description, setDescription] = useState(initialEvent?.description || '');
    const [startDate, setStartDate] = useState(toDateInputValue(initialEvent?.startDate));
    const [endDate, setEndDate] = useState(toDateInputValue(initialEvent?.endDate));
    const [time, setTime] = useState(initialEvent?.time || '');
    const [location, setLocation] = useState(initialEvent?.location || '');
    const [type, setType] = useState(initialEvent?.type || 'practice');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await onSubmit({
                title,
                description: description || null,
                startDate,
                endDate: endDate || null,
                time: time || null,
                location,
                type,
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal show={show} onHide={onClose} centered>
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>{initialEvent ? 'Edit Event' : 'Create Event'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && <div className="eventFormError">{error}</div>}
                    <Form.Group className="mb-3">
                        <Form.Label>Title</Form.Label>
                        <Form.Control value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Type</Form.Label>
                        <Form.Select value={type} onChange={(e) => setType(e.target.value)}>
                            {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Start date</Form.Label>
                        <Form.Control type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>End date (optional, for multi-day events)</Form.Label>
                        <Form.Control type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Time</Form.Label>
                        <Form.Control placeholder="e.g. 4:00 PM - 6:00 PM" value={time} onChange={(e) => setTime(e.target.value)} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Location</Form.Label>
                        <Form.Control value={location} onChange={(e) => setLocation(e.target.value)} required />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Description (optional)</Form.Label>
                        <Form.Control as="textarea" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onClose} disabled={submitting}>Cancel</Button>
                    <Button variant="danger" type="submit" disabled={submitting}>
                        {initialEvent ? 'Save Changes' : 'Create Event'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

EventFormModal.propTypes = {
    show: PropTypes.bool.isRequired,
    initialEvent: PropTypes.object,
    onSubmit: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default EventFormModal;
