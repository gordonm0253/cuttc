import { useAuth } from "./auth/AuthUserProvider";
//import { Calendar, MapPin, Clock, Users, ChevronRight } from 'lucide-react';
import PropTypes from 'prop-types';


const events = [
    {
        id: 1,
        title: "Open Practice",
        date: "2026-01-24",
        time: "4:00 PM - 6:00 PM",
        location: "Appel Commons 303ABC",
        type: "practice"
    },
    {
        id: 2,
        title: "Cornell Table Tennis @ Clubfest",
        date: "2026-01-25",
        time: "12:00 PM - 1:30 PM",
        location: "Barton Hall",
        type: "social"
    },
    {
        id: 3,
        title: "Open Practice",
        date: "2026-01-31",
        time: "4:00 PM - 6:00 PM",
        location: "Appel Commons 303ABC",
        type: "practice"
    },
    {
        id: 4,
        title: "NCTTA Spring Divisionals",
        date: "2026-02-07",
        time: "1:00 PM - 9:00 PM",
        location: "Syracuse, NY",
        type: "tournament"
    },
    {
        id: 5,
        title: "NCTTA Regionals",
        date: "2026-03-07",
        time: "1:00 PM - 9:00 PM",
        location: "Syracuse, NY",
        type: "tournament"
    },
    {
        id: 6,
        title: "NCTTA Nationals",
        date: "2026-04-10,2026-04-12",
        location: "Rockford, IL",
        type: "tournament"
    }
];

const getColor = (eventType) => {
    const colors = {
        practice: "#4CAF50",
        tournament: "#d16464",
        social: "#2196F3"
    };
    return colors[eventType] || "#666";
}

const formatDate = (date) => {
    const dates = date.split(",");
    if (dates.length == 1) {
        return new Date(dates[0]).toLocaleDateString('en-US', { 
            weekday: 'long',
            month: 'long', 
            day: 'numeric',
            timeZone: 'UTC'
        });
    } else {
        return new Date(dates[0]).toLocaleDateString('en-US', { 
            weekday: 'long',
            month: 'long', 
            day: 'numeric',
            timeZone: 'UTC'
        }) + " - " + new Date(dates[1]).toLocaleDateString('en-US', { 
            weekday: 'long',
            month: 'long', 
            day: 'numeric',
            timeZone: 'UTC'
        });
    }
}

function EventCard({ event }) {
    return (
        <div className="eventCard">
            <div className="eventCardTop" style={{backgroundColor: getColor(event.type)}}>
                {event.type}
            </div>
            <div className="eventHeaderWrapper">
                <h3>{event.title}</h3>
                <div className = "eventText">
                    <span>{formatDate(event.date)}</span>
                </div>
                <div className = "eventText">
                    <span>{event.time}</span>
                </div>
                <div className = "eventText">
                    <span>{event.location}</span>
                </div>
            </div>
        </div>
    );
}

EventCard.propTypes = {
    event: PropTypes.object.isRequired
}

function EventDiv(props) {
    return (
    <div className = "contentDiv">
        <div style={{
          textAlign: 'center',
          marginBottom: '3rem'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#333',
            marginBottom: '0.5rem'
          }}>
            Upcoming Events
          </h1>
          <div style={{
            width: '10rem',
            height: '4px',
            background: 'linear-gradient(to right, #D02F2F, #a00)',
            margin: '1rem auto',
            borderRadius: '2px'
          }} />
          <p style={{
            fontSize: '1.1rem',
            color: '#666'
          }}>
            Join us for practices, tournaments, and more!
          </p>
        </div>
        <div className = "eventGrid">
            {props.currentEvents.map((currEvent) => <EventCard key = {currEvent.id} event={currEvent}/>)}
        </div>
        
    </div>
    );
}

EventDiv.propTypes = {
  currentEvents: PropTypes.arrayOf(PropTypes.object).isRequired
};

function Profile() {
    const { user } = useAuth();
    //const created = user.metadata.creationTime;
    return (
    <div className = "profilePageDiv">
        {user ? 
        (
        <>
            <div className = "nameDiv">
                <h1 className = "profileH1">Hello, {user.displayName}!</h1>
                <p>Member since: {new Date(user.metadata.creationTime).toLocaleDateString("en-US", {
                    year: 'numeric',
                    month: 'long',
                    day: "numeric",
                })}</p>
            </div>
            <EventDiv currentEvents = {events} />
        </>) 
        : 
        (<div className = "nameDiv">
            <h2 className = "profileH1">Please sign in to access the profile feature!</h2>
        </div>)}
    </div>);
}

export default Profile;