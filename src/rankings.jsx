import { useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form';
import { useAuth } from './auth/AuthUserProvider';
import { useIsAdmin } from './hooks/useIsAdmin';
import { getRankings } from './api/rankings';
import RankingsTable from './components/RankingsTable';
import RankingsViewersPanel from './components/RankingsViewersPanel';

function Rankings() {
    const { user } = useAuth();
    const {
        isAdmin,
        rankingsOptIn,
        hasRankingsAccess,
        toggleRankingsOptIn,
        loading: optInLoading,
    } = useIsAdmin();
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [optInError, setOptInError] = useState('');
    const [togglingOptIn, setTogglingOptIn] = useState(false);

    const loadRankings = () => {
        setLoading(true);
        getRankings()
            .then(setPlayers)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (!optInLoading && hasRankingsAccess) {
            loadRankings();
        } else if (!optInLoading) {
            setLoading(false);
        }
    }, [optInLoading, hasRankingsAccess]);

    const handleToggleOptIn = async (e) => {
        const nextValue = e.target.checked;
        setOptInError('');
        setTogglingOptIn(true);
        try {
            await toggleRankingsOptIn(nextValue);
            loadRankings();
        } catch (err) {
            setOptInError(err.message);
        } finally {
            setTogglingOptIn(false);
        }
    };

    if (!user) {
        return (
            <div className="profilePageDiv">
                <div className="nameDiv">
                    <h2 className="profileH1">Please sign in to view club rankings!</h2>
                </div>
            </div>
        );
    }

    if (!optInLoading && !hasRankingsAccess) {
        return (
            <div className="profilePageDiv">
                <div className="nameDiv">
                    <h2 className="profileH1">Club rankings are members-only.</h2>
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
                        Club Rankings
                    </h1>
                    <div style={{ width: '10rem', height: '4px', background: 'linear-gradient(to right, #D02F2F, #a00)', margin: '1rem auto', borderRadius: '2px' }} />
                    <p style={{ fontSize: '1.1rem', color: '#666' }}>Live Elo ratings, updated after every logged match.</p>
                </div>

                <div className="rankingsOptInBox">
                    <Form.Check
                        type="switch"
                        id="rankings-opt-in-switch"
                        label="Show me on the club rankings"
                        checked={rankingsOptIn}
                        disabled={optInLoading || togglingOptIn}
                        onChange={handleToggleOptIn}
                    />
                    <p className="eventText rankingsOptInHint">
                        You&apos;re opted out by default. Turn this on if you want your name and Elo visible to other members here.
                    </p>
                    {optInError && <p className="eventFormError">{optInError}</p>}
                </div>

                {loading && <p className="eventText">Loading rankings...</p>}
                {error && <p className="eventFormError">{error}</p>}
                {!loading && !error && <RankingsTable players={players} />}

                {isAdmin && <RankingsViewersPanel />}
            </div>
        </div>
    );
}

export default Rankings;
