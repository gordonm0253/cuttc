import PropTypes from 'prop-types';

function initials(name) {
    return (name || '')
        .split(' ')
        .filter(Boolean)
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
}

function StandingsPanel({ tournament }) {
    const entrantById = new Map(tournament.entrants.map((e) => [e.id, e]));
    return (
        <div className="rrStandingsCard">
            <div className="rrStandingsHeader">
                <span>STANDINGS</span>
                <span className="rrStandingsHeaderMeta">W-L · SET DIFF · POINT DIFF</span>
            </div>
            <div className="rrStandingsColumnHeader">
                <div>#</div><div>PLAYER</div><div className="rrCenterCol">W</div><div className="rrCenterCol">L</div>
                <div className="rrCenterCol">SETS</div><div className="rrCenterCol">POINTS</div>
            </div>
            {tournament.standings.map((s, i) => {
                const entrant = entrantById.get(s.entrantId);
                const name = entrant?.player?.displayName || 'Unknown';
                const setDiff = s.setsWon - s.setsLost;
                const pointDiff = s.pointsWon - s.pointsLost;
                return (
                    <div key={s.entrantId} className={`rrStandingsRow${i === 0 ? ' rrStandingsRowTop' : ''}`}>
                        <div className={`rrRank${i < 2 ? ' rrRankTop' : ''}`}>{i + 1}</div>
                        <div className="rrPlayerCell">
                            <span className={`rrAvatar${i === 0 ? ' rrAvatarTop' : ''}`}>{initials(name)}</span>
                            <span className="rrPlayerName">{name}</span>
                        </div>
                        <div className="rrCenterCol rrWins">{s.wins}</div>
                        <div className="rrCenterCol rrLosses">{s.losses}</div>
                        <div className="rrCenterCol">{setDiff > 0 ? `+${setDiff}` : setDiff}</div>
                        <div className="rrCenterCol">{pointDiff > 0 ? `+${pointDiff}` : pointDiff}</div>
                    </div>
                );
            })}
            <div className="rrStandingsFootnote">Ties broken by set difference, then point difference.</div>
        </div>
    );
}

StandingsPanel.propTypes = {
    tournament: PropTypes.object.isRequired,
};

function ScheduleColumn({ tournament, isAdmin, onReport }) {
    const rounds = [...new Set(tournament.matches.map((m) => m.round))].sort((a, b) => a - b);
    return (
        <div className="rrScheduleColumn">
            {rounds.map((round) => {
                const roundMatches = tournament.matches.filter((m) => m.round === round);
                const complete = roundMatches.every((m) => m.match);
                return (
                    <div key={round} className="rrRoundCard">
                        <div className="rrRoundCardHeader">
                            <div className="rrRoundCardTitle">Round {round}</div>
                            <div className={`rrRoundBadge${complete ? ' rrRoundBadgeComplete' : ' rrRoundBadgeProgress'}`}>
                                {complete ? 'COMPLETE' : 'IN PROGRESS'}
                            </div>
                            <div className="rrRoundCardRule" />
                        </div>
                        <div className="rrRoundMatchList">
                            {roundMatches.map((m) => {
                                const aName = m.entrantA?.player?.displayName || 'TBD';
                                const bName = m.entrantB?.player?.displayName || 'TBD';
                                const aWon = m.winnerEntrantId && m.winnerEntrantId === m.entrantAId;
                                const bWon = m.winnerEntrantId && m.winnerEntrantId === m.entrantBId;
                                return (
                                    <div key={m.id} className="rrMatchRow">
                                        <div className="rrMatchNames">
                                            <span className={`rrMatchName${aWon ? ' rrMatchNameWinner' : m.match ? ' rrMatchNameLoser' : ''}`}>{aName}</span>
                                            <span className="rrMatchVs">vs</span>
                                            <span className={`rrMatchName${bWon ? ' rrMatchNameWinner' : m.match ? ' rrMatchNameLoser' : ''}`}>{bName}</span>
                                        </div>
                                        {m.match ? (
                                            <div className="rrMatchScore">
                                                {m.match.sets.filter((s) => s.a > s.b).length} – {m.match.sets.filter((s) => s.b > s.a).length}
                                            </div>
                                        ) : isAdmin ? (
                                            <button type="button" className="bracketReportBtn rrReportBtn" onClick={() => onReport(m)}>Report</button>
                                        ) : (
                                            <div className="rrMatchScore rrMatchNotPlayed">Not played</div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

ScheduleColumn.propTypes = {
    tournament: PropTypes.object.isRequired,
    isAdmin: PropTypes.bool.isRequired,
    onReport: PropTypes.func.isRequired,
};

function RoundRobinView({ tournament, isAdmin, onReport }) {
    return (
        <div className="rrLayout">
            <StandingsPanel tournament={tournament} />
            <ScheduleColumn tournament={tournament} isAdmin={isAdmin} onReport={onReport} />
        </div>
    );
}

RoundRobinView.propTypes = {
    tournament: PropTypes.object.isRequired,
    isAdmin: PropTypes.bool.isRequired,
    onReport: PropTypes.func.isRequired,
};

export default RoundRobinView;
