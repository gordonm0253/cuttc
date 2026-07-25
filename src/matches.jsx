import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';
import { useAuth } from './auth/AuthUserProvider';
import { useIsAdmin } from './hooks/useIsAdmin';
import { getMatches, createMatch } from './api/matches';
import MatchLogForm from './components/MatchLogForm';

function MatchCard({ match }) {
    return (
        <div className="matchCard">
            <div className="matchCardTop">
                {new Date(match.playedAt).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
                })}
            </div>
            <div className="eventHeaderWrapper">
                <h3>{match.playerA.displayName} vs {match.playerB.displayName}</h3>
                <div className="eventText">
                    <span>Winner: {match.winner.displayName}</span>
                </div>
                <div className="eventText setScores">
                    {match.sets.map((set, i) => (
                        <span key={i} className="setScoreBadge">{set.a}-{set.b}</span>
                    ))}
                </div>
                <div className="eventText">
                    <span>{match.playerA.displayName}: {match.playerAElo} &rarr; {match.playerAEloAfter}</span>
                </div>
                <div className="eventText">
                    <span>{match.playerB.displayName}: {match.playerBElo} &rarr; {match.playerBEloAfter}</span>
                </div>
            </div>
        </div>
    );
}

MatchCard.propTypes = {
    match: PropTypes.object.isRequired,
};

function Matches() {
    const { user } = useAuth();
    const { isAdmin, hasRankingsAccess, loading: accessLoading } = useIsAdmin();
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
                        <Button variant="danger" onClick={() => setShowForm((s) => !s)}>
                            {showForm ? 'Cancel' : 'Log Match'}
                        </Button>
                    )}
                </div>

                {isAdmin && showForm && (
                    <div className="matchLogFormWrapper">
                        <MatchLogForm onSubmit={handleLogMatch} onClose={() => setShowForm(false)} />
                    </div>
                )}

                {loading && <p className="eventText">Loading matches...</p>}
                {error && <p className="eventFormError">{error}</p>}

                <div className="eventGrid">
                    {matches.map((match) => (
                        <MatchCard key={match.id} match={match} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Matches;
