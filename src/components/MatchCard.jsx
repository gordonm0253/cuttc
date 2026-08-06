import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';
import { initials } from '../lib/playerDisplay';

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

// Shared match showcase used both on the club-wide Matches page and on a
// tournament's Results tab, so a tournament result renders identically to a
// regular logged match. `tournamentLabel` swaps the top-right tag from the
// default "CLUB LADDER" to the name of the tournament the match belongs to.
function MatchCard({ match, currentPlayerId, isAdmin, onDelete, tournamentLabel }) {
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
                    <span className="matchCardTopMeta">{tournamentLabel || 'CLUB LADDER'}</span>
                </span>
                {isAdmin && onDelete && (
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
    isAdmin: PropTypes.bool,
    onDelete: PropTypes.func,
    tournamentLabel: PropTypes.string,
};

MatchCard.defaultProps = {
    currentPlayerId: undefined,
    isAdmin: false,
    onDelete: undefined,
    tournamentLabel: 'CLUB LADDER',
};

export default MatchCard;
