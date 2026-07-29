import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from "./auth/AuthUserProvider";
import { getEvents } from './api/events';

const getColor = (eventType) => {
    const colors = {
        practice: "#4CAF50",
        tournament: "#d16464",
        social: "#2196F3"
    };
    return colors[eventType] || "#666";
};

const formatDate = (startDate) => new Date(startDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'
});

function UpcomingEventsPreview() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getEvents(true)
            .then((data) => setEvents(data.slice(0, 3)))
            .catch(() => setEvents([]))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p className="eventText">Loading upcoming events...</p>;
    if (events.length === 0) return <p className="eventText">No upcoming events right now.</p>;

    return (
        <div className="eventGrid">
            {events.map((event) => (
                <div key={event.id} className="eventCard">
                    <div className="eventCardTop" style={{ backgroundColor: getColor(event.type) }}>
                        {event.type}
                    </div>
                    <div className="eventHeaderWrapper">
                        <h3>{event.title}</h3>
                        <div className="eventText"><span>{formatDate(event.startDate)}</span></div>
                        <div className="eventText"><span>{event.location}</span></div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function Profile() {
    const { user } = useAuth();
    return (
        <div className="profilePageDiv">
            {user ? (
                <>
                    <div className="nameDiv">
                        <h1 className="profileH1">Hello, {user.displayName}!</h1>
                        <p>{user.email}</p>
                        <p>Member since: {new Date(user.metadata.creationTime).toLocaleDateString("en-US", {
                            year: 'numeric',
                            month: 'long',
                            day: "numeric",
                        })}</p>
                    </div>

                    <div className="profileNavCards">
                        <Link to="/profile/events" className="profileNavCard">Events</Link>
                        <Link to="/profile/matches" className="profileNavCard">Matches</Link>
                        <Link to="/profile/rankings" className="profileNavCard">Rankings</Link>
                    </div>

                    <div className="contentDiv">
                        <h2 className="profileH1" style={{ fontSize: '1.75rem', textAlign: 'center' }}>Upcoming Events</h2>
                        <UpcomingEventsPreview />
                    </div>
                </>
            ) : (
                <div className="nameDiv">
                    <h2 className="profileH1">Please sign in to access the profile feature!</h2>
                </div>
            )}
        </div>
    );
}

export default Profile;
