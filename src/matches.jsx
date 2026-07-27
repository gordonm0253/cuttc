import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';
import { useAuth } from './auth/AuthUserProvider';
import { useIsAdmin } from './hooks/useIsAdmin';
import { getMatches, createMatch, deleteMatch } from './api/matches';
import MatchLogForm from './components/MatchLogForm';

function initials(name) {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

function RatingDelta({ before, after }) {
    const delta = after - before;
    const sign = delta > 0 ? '+' : '';
    const className = delta > 0 ? 'ratingDeltaUp' : delta < 0 ? 'ratingDeltaDown' : 'ratingDeltaEven';
    return (
        <span className="scorecardEloRow">
            <span className="scorecardEloBefore">{before}&nbsp;&rarr;</span>
            <span className="scorecardEloAfter">{after}</span>
            <span className={`scorecardEloDelta ${className}`}>{sign}{delta}</span>
        </span>
    );
}

RatingDelta.propTypes = {
    before: PropTypes.number.isRequired,
    after: PropTypes.number.isRequired,
};

function ScorecardPlayer({ player, before, after, isWinner, isCurrentUser, align, setsWon }) {
    return (
        <div className={`scorecardPlayer scorecardPlayer-${align}`}>
            <div className={`scorecardAvatar${isWinner ? ' scorecardAvatarWinner' : ''}`}>{initials(player.displayName)}</div>
            <div className="scorecardPlayerInfo">
                <span className={`scorecardPlayerLabel${isWinner ? ' scorecardPlayerLabelWinner' : ''}`}>
                    {isWinner ? 'WINNER' : 'RUNNER-UP'}
                </span>
                <span className={`scorecardPlayerName${isCurrentUser ? ' scorecardPlayerNameMe' : ''}`}>
                    {player.displayName}
                </span>
                <RatingDelta before={before} after={after} />
            </div>
            <span className={`scorecardSetTotalMobile${isWinner ? ' scorecardSetTotalWinner' : ''}`}>{setsWon}</span>
        </div>
    );
}

ScorecardPlayer.propTypes = {
    player: PropTypes.object.isRequired,
    before: PropTypes.number.isRequired,
    after: PropTypes.number.isRequired,
    isWinner: PropTypes.bool.isRequired,
    isCurrentUser: PropTypes.bool.isRequired,
    align: PropTypes.oneOf(['left', 'right']).isRequired,
    setsWon: PropTypes.number.isRequired,
};

function MatchCard({ match, currentPlayerId, isAdmin, onDelete }) {
    const setsWonA = match.sets.filter((set) => set.a > set.b).length;
    const setsWonB = match.sets.filter((set) => set.b > set.a).length;
    const aIsWinner = match.winner.id === match.playerA.id;

    return (
        <div className="matchCard">
            <div className="matchCardTop">
                <span>
                    <span>
                        {new Date(match.playedAt).toLocaleDateString('en-US', {
                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
                        })}
                    </span>
                    {' '}
                    <span className="matchCardTopMeta">CLUB LADDER</span>
                </span>
                {isAdmin && (
                    <Button
                        variant="light"
                        size="sm"
                        className="matchCardDeleteBtn"
                        onClick={() => onDelete(match.id)}
                    >
                        Delete
                    </Button>
                )}
            </div>

            <div className="scorecardHeader">
                <ScorecardPlayer
                    player={match.playerA}
                    before={match.playerAElo}
                    after={match.playerAEloAfter}
                    isWinner={aIsWinner}
                    isCurrentUser={!!currentPlayerId && match.playerA.id === currentPlayerId}
                    align="left"
                    setsWon={setsWonA}
                />

                <div className="scorecardSetTotals">
                    <span className={`scorecardSetTotal${aIsWinner ? ' scorecardSetTotalWinner' : ''}`}>{setsWonA}</span>
                    <span className="scorecardSetTotalDash">&ndash;</span>
                    <span className={`scorecardSetTotal${!aIsWinner ? ' scorecardSetTotalWinner' : ''}`}>{setsWonB}</span>
                </div>

                <ScorecardPlayer
                    player={match.playerB}
                    before={match.playerBElo}
                    after={match.playerBEloAfter}
                    isWinner={!aIsWinner}
                    isCurrentUser={!!currentPlayerId && match.playerB.id === currentPlayerId}
                    align="right"
                    setsWon={setsWonB}
                />
            </div>

            <div className="scorecardSetGrid">
                {match.sets.map((set, i) => {
                    const isDeuce = set.a >= 10 && set.b >= 10;
                    return (
                        <div key={i} className="scorecardSetCell">
                            <span className={`scorecardSetLabel${isDeuce ? ' scorecardSetLabelDeuce' : ''}`}>
                                SET {i + 1}
                            </span>
                            <span className="scorecardSetScoreLine">
                                <span className={set.a > set.b ? 'scorecardSetScoreWon' : 'scorecardSetScoreLost'}>{set.a}</span>
                                <span className="scorecardSetScoreDash">-</span>
                                <span className={set.b > set.a ? 'scorecardSetScoreWon' : 'scorecardSetScoreLost'}>{set.b}</span>
                            </span>
                            {isDeuce && <span className="scorecardSetDeuceTag">DEUCE</span>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

MatchCard.propTypes = {
    match: PropTypes.object.isRequired,
    currentPlayerId: PropTypes.string,
    isAdmin: PropTypes.bool.isRequired,
    onDelete: PropTypes.func.isRequired,
};

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
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Matches;
