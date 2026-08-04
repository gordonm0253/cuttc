import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router';
import { useIsAdmin } from './hooks/useIsAdmin';
import { getTournaments, createTournament } from './api/tournaments';
import TournamentCreateForm from './components/TournamentCreateForm';

const FORMAT_LABELS = {
    single_elimination: 'Single Elimination',
    double_elimination: 'Double Elimination',
    round_robin: 'Round Robin',
};

const STATUS_LABELS = {
    draft: 'Draft',
    seeded: 'Seeded',
    in_progress: 'In Progress',
    completed: 'Completed',
};

function TournamentCard({ tournament }) {
    return (
        <Link to={`/profile/tournaments/${tournament.id}`} className="tournamentCardLink">
            <div className="tournamentCard">
                <div className="eventCardTop" style={{ backgroundColor: '#d16464' }}>
                    {FORMAT_LABELS[tournament.format] || tournament.format}
                </div>
                <div className="eventHeaderWrapper">
                    <h3>{tournament.name}</h3>
                    <div className="eventText">
                        <span>{STATUS_LABELS[tournament.status] || tournament.status}</span>
                    </div>
                    <div className="eventText">
                        <span>{tournament._count?.entrants ?? 0} entrants</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

TournamentCard.propTypes = {
    tournament: PropTypes.object.isRequired,
};

function Tournaments() {
    const { isAdmin } = useIsAdmin();
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);

    const loadTournaments = () => {
        setLoading(true);
        getTournaments()
            .then(setTournaments)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadTournaments();
    }, []);

    const handleCreate = async (data) => {
        await createTournament(data);
        setShowForm(false);
        loadTournaments();
    };

    return (
        <div className="profilePageDiv">
            <div className="contentDiv">
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#333', marginBottom: '0.5rem' }}>
                        Tournaments
                    </h1>
                    <div style={{ width: '10rem', height: '4px', background: 'linear-gradient(to right, #D02F2F, #a00)', margin: '1rem auto', borderRadius: '2px' }} />
                    {isAdmin && (
                        <Button variant="danger" onClick={() => setShowForm(true)}>
                            Create Tournament
                        </Button>
                    )}
                </div>

                {isAdmin && showForm && (
                    <TournamentCreateForm show={showForm} onSubmit={handleCreate} onClose={() => setShowForm(false)} />
                )}

                {loading && <p className="eventText">Loading tournaments...</p>}
                {error && <p className="eventFormError">{error}</p>}
                {!loading && tournaments.length === 0 && <p className="eventText">No tournaments yet.</p>}

                <div className="eventGrid">
                    {tournaments.map((tournament) => (
                        <TournamentCard key={tournament.id} tournament={tournament} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Tournaments;
