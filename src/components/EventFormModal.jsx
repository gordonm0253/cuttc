import { useState } from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

const EVENT_TYPES = ['practice', 'tournament', 'social'];

const HOUR_OPTIONS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTE_OPTIONS = ['00', '15', '30', '45'];
const PERIOD_OPTIONS = ['AM', 'PM'];

function toDateInputValue(date) {
    if (!date) return '';
    return new Date(date).toISOString().slice(0, 10);
}

function parseTimePart(value) {
    const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec((value || '').trim());
    if (!match) return { hour: '', minute: '', period: '' };
    const [, hour, minute, period] = match;
    return {
        hour: HOUR_OPTIONS.includes(hour) ? hour : '',
        minute: MINUTE_OPTIONS.includes(minute) ? minute : '',
        period: period.toUpperCase(),
    };
}

function parseTimeRange(time) {
    if (!time) return { start: parseTimePart(''), end: parseTimePart('') };
    const [start, end] = time.split(' - ').map((s) => s.trim());
    return { start: parseTimePart(start), end: parseTimePart(end) };
}

function formatTimePart({ hour, minute, period }) {
    return `${hour}:${minute} ${period}`;
}

function timeToMinutes({ hour, minute, period }) {
    let hour24 = parseInt(hour, 10) % 12;
    if (period === 'PM') hour24 += 12;
    return hour24 * 60 + parseInt(minute, 10);
}

function todayDateInputValue() {
    return toDateInputValue(new Date());
}

function EventFormModal({ show, initialEvent, onSubmit, onClose }) {
    const [title, setTitle] = useState(initialEvent?.title || '');
    const [description, setDescription] = useState(initialEvent?.description || '');
    const [startDate, setStartDate] = useState(toDateInputValue(initialEvent?.startDate));
    const [endDate, setEndDate] = useState(toDateInputValue(initialEvent?.endDate));
    const initialTimeRange = parseTimeRange(initialEvent?.time);
    const [startHour, setStartHour] = useState(initialTimeRange.start.hour || '4');
    const [startMinute, setStartMinute] = useState(initialTimeRange.start.minute || '00');
    const [startPeriod, setStartPeriod] = useState(initialTimeRange.start.period || 'PM');
    const [endHour, setEndHour] = useState(initialTimeRange.end.hour || '6');
    const [endMinute, setEndMinute] = useState(initialTimeRange.end.minute || '00');
    const [endPeriod, setEndPeriod] = useState(initialTimeRange.end.period || 'PM');
    const [location, setLocation] = useState(initialEvent?.location || '');
    const [type, setType] = useState(initialEvent?.type || 'practice');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!initialEvent) {
            const today = todayDateInputValue();
            if (startDate < today) {
                setError('Start date cannot be in the past.');
                return;
            }
            if (endDate && endDate < today) {
                setError('End date cannot be in the past.');
                return;
            }
        }

        if (endDate && endDate < startDate) {
            setError('End date cannot be before the start date.');
            return;
        }

        const isSingleDayEvent = !endDate || endDate === startDate;
        if (isSingleDayEvent) {
            const startMinutes = timeToMinutes({ hour: startHour, minute: startMinute, period: startPeriod });
            const endMinutes = timeToMinutes({ hour: endHour, minute: endMinute, period: endPeriod });
            if (endMinutes <= startMinutes) {
                setError('End time cannot be earlier than the start time.');
                return;
            }
        }

        setSubmitting(true);
        try {
            const startTime = formatTimePart({ hour: startHour, minute: startMinute, period: startPeriod });
            const endTime = formatTimePart({ hour: endHour, minute: endMinute, period: endPeriod });
            const time = `${startTime} - ${endTime}`;
            await onSubmit({
                title,
                description: description || null,
                startDate,
                endDate: endDate || null,
                time,
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
                        <Form.Label>Start time</Form.Label>
                        <div className="eventTimeRow">
                            <Form.Select value={startHour} onChange={(e) => setStartHour(e.target.value)}>
                                {HOUR_OPTIONS.map((h) => <option key={h} value={h}>{h}</option>)}
                            </Form.Select>
                            <Form.Select value={startMinute} onChange={(e) => setStartMinute(e.target.value)}>
                                {MINUTE_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
                            </Form.Select>
                            <Form.Select value={startPeriod} onChange={(e) => setStartPeriod(e.target.value)}>
                                {PERIOD_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                            </Form.Select>
                        </div>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>End time</Form.Label>
                        <div className="eventTimeRow">
                            <Form.Select value={endHour} onChange={(e) => setEndHour(e.target.value)}>
                                {HOUR_OPTIONS.map((h) => <option key={h} value={h}>{h}</option>)}
                            </Form.Select>
                            <Form.Select value={endMinute} onChange={(e) => setEndMinute(e.target.value)}>
                                {MINUTE_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
                            </Form.Select>
                            <Form.Select value={endPeriod} onChange={(e) => setEndPeriod(e.target.value)}>
                                {PERIOD_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                            </Form.Select>
                        </div>
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
