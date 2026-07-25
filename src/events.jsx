import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';
import { useAuth } from './auth/AuthUserProvider';
import { useIsAdmin } from './hooks/useIsAdmin';
import { getEvents, createEvent, updateEvent, deleteEvent } from './api/events';
import EventFormModal from './components/EventFormModal';

const getColor = (eventType) => {
    const colors = {
        practice: "#4CAF50",
        tournament: "#d16464",
        social: "#2196F3"
    };
    return colors[eventType] || "#666";
};

const formatDate = (startDate, endDate) => {
    const start = new Date(startDate).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC'
    });
    if (!endDate) return start;
    const end = new Date(endDate).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC'
    });
    return `${start} - ${end}`;
};

function EventCard({ event, isAdmin, onEdit, onDelete }) {
    return (
        <div className="eventCard">
            <div className="eventCardTop" style={{ backgroundColor: getColor(event.type) }}>
                {event.type}
            </div>
            <div className="eventHeaderWrapper">
                <h3>{event.title}</h3>
                <div className="eventText">
                    <span>{formatDate(event.startDate, event.endDate)}</span>
                </div>
                {event.time && (
                    <div className="eventText">
                        <span>{event.time}</span>
                    </div>
                )}
                <div className="eventText">
                    <span>{event.location}</span>
                </div>
                {event.description && (
                    <div className="eventText">
                        <span>{event.description}</span>
                    </div>
                )}
                {isAdmin && (
                    <div className="eventAdminActions">
                        <Button size="sm" variant="outline-secondary" onClick={() => onEdit(event)}>Edit</Button>
                        <Button size="sm" variant="outline-danger" onClick={() => onDelete(event.id)}>Delete</Button>
                    </div>
                )}
            </div>
        </div>
    );
}

EventCard.propTypes = {
    event: PropTypes.object.isRequired,
    isAdmin: PropTypes.bool.isRequired,
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

function Events() {
    const { user } = useAuth();
    const { isAdmin } = useIsAdmin();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);

    const loadEvents = () => {
        setLoading(true);
        getEvents()
            .then(setEvents)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadEvents();
    }, []);

    const handleCreateOrUpdate = async (data) => {
        if (editingEvent) {
            await updateEvent(editingEvent.id, data);
        } else {
            await createEvent(data);
        }
        setShowForm(false);
        setEditingEvent(null);
        loadEvents();
    };

    const handleEdit = (event) => {
        setEditingEvent(event);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this event?')) return;
        await deleteEvent(id);
        loadEvents();
    };

    if (!user) {
        return (
            <div className="profilePageDiv">
                <div className="nameDiv">
                    <h2 className="profileH1">Please sign in to view events!</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="profilePageDiv">
            <div className="contentDiv">
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#333', marginBottom: '0.5rem' }}>
                        Upcoming Events
                    </h1>
                    <div style={{ width: '10rem', height: '4px', background: 'linear-gradient(to right, #D02F2F, #a00)', margin: '1rem auto', borderRadius: '2px' }} />
                    <p style={{ fontSize: '1.1rem', color: '#666' }}>Join us for practices, tournaments, and more!</p>
                    {isAdmin && (
                        <Button variant="danger" onClick={() => { setEditingEvent(null); setShowForm(true); }}>
                            Create Event
                        </Button>
                    )}
                </div>

                {loading && <p className="eventText">Loading events...</p>}
                {error && <p className="eventFormError">{error}</p>}

                <div className="eventGrid">
                    {events.map((event) => (
                        <EventCard key={event.id} event={event} isAdmin={isAdmin} onEdit={handleEdit} onDelete={handleDelete} />
                    ))}
                </div>
            </div>

            {showForm && (
                <EventFormModal
                    show={showForm}
                    initialEvent={editingEvent}
                    onSubmit={handleCreateOrUpdate}
                    onClose={() => { setShowForm(false); setEditingEvent(null); }}
                />
            )}
        </div>
    );
}

export default Events;
