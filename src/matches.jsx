import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import { useAuth } from './auth/AuthUserProvider';
import { useIsAdmin } from './hooks/useIsAdmin';
import { getMatches, createMatch, deleteMatch } from './api/matches';
import MatchLogForm from './components/MatchLogForm';
import MatchCard from './components/MatchCard';

function Matches() {
    const { user } = useAuth();
    const { isAdmin, playerId, hasRankingsAccess, loading: accessLoading } = useIsAdmin();
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);

    const loadMatches = () => {
        setLoading(true);
        getMatches()
            .then((result) => setMatches(result.matches))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (!accessLoading && hasRankingsAccess) {
            loadMatches();
        } else if (!accessLoading) {
            setLoading(false);
        }
    }, [accessLoading, hasRankingsAccess]);

    const handleLogMatch = async (data) => {
        await createMatch(data);
        setShowForm(false);
        loadMatches();
    };

    const handleDeleteMatch = async (id) => {
        if (!window.confirm('Delete this match? Player ratings will be recalculated.')) return;
        await deleteMatch(id);
        loadMatches();
    };

    if (!user) {
        return (
            <div className="profilePageDiv">
                <div className="nameDiv">
                    <h2 className="profileH1">Please sign in to view match history!</h2>
                </div>
            </div>
        );
    }

    if (!accessLoading && !hasRankingsAccess) {
        return (
            <div className="profilePageDiv">
                <div className="nameDiv">
                    <h2 className="profileH1">Match history is members-only.</h2>
                    <p className="eventText">Ask an admin to add you to the rankings access list.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="profilePageDiv">
            <div className="contentDiv">
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#333', marginBottom: '0.5rem' }}>
                        Match History
                    </h1>
                    <div style={{ width: '10rem', height: '4px', background: 'linear-gradient(to right, #D02F2F, #a00)', margin: '1rem auto', borderRadius: '2px' }} />
                    {isAdmin && (
                        <Button variant="danger" onClick={() => setShowForm(true)}>
                            Log Match
                        </Button>
                    )}
                </div>

                {isAdmin && showForm && (
                    <MatchLogForm show={showForm} onSubmit={handleLogMatch} onClose={() => setShowForm(false)} />
                )}

                {loading && <p className="eventText">Loading matches...</p>}
                {error && <p className="eventFormError">{error}</p>}

                <div className="matchList">
                    {matches.map((match) => (
                        <MatchCard
                            key={match.id}
                            match={match}
                            currentPlayerId={playerId}
                            isAdmin={isAdmin}
                            onDelete={handleDeleteMatch}
                            tournamentLabel={match.tournamentMatch?.tournament?.name}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Matches;
