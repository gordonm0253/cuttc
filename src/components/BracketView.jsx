import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';

function entrantLabel(entrant) {
    if (!entrant) return 'TBD';
    return `#${entrant.seed} ${entrant.player.displayName}`;
}

function matchScoreLine(node) {
    if (!node.match) return null;
    const setsWonA = node.match.sets.filter((s) => s.a > s.b).length;
    const setsWonB = node.match.sets.filter((s) => s.b > s.a).length;
    return `${setsWonA} – ${setsWonB}`;
}

function MatchCard({ node, isAdmin, onReport }) {
    const aIsWinner = node.winnerEntrantId && node.winnerEntrantId === node.entrantAId;
    const bIsWinner = node.winnerEntrantId && node.winnerEntrantId === node.entrantBId;
    const canReport = isAdmin && !node.isBye && !node.skipped && node.entrantAId && node.entrantBId && !node.matchId;

    return (
        <div className="bracketMatchCardWrapper">
            <div className="bracketMatchCard">
                <div className={`bracketMatchRow${aIsWinner ? ' bracketMatchRowWinner' : ''}`}>
                    <span className="bracketMatchEntrant">{entrantLabel(node.entrantA)}</span>
                </div>
                <div className={`bracketMatchRow${bIsWinner ? ' bracketMatchRowWinner' : ''}`}>
                    <span className="bracketMatchEntrant">{node.isBye ? 'BYE' : entrantLabel(node.entrantB)}</span>
                </div>
                {node.match && <div className="bracketMatchScore">{matchScoreLine(node)}</div>}
                {canReport && (
                    <Button size="sm" variant="outline-danger" className="bracketReportBtn" onClick={() => onReport(node)}>
                        Report
                    </Button>
                )}
            </div>
        </div>
    );
}

MatchCard.propTypes = {
    node: PropTypes.object.isRequired,
    isAdmin: PropTypes.bool.isRequired,
    onReport: PropTypes.func.isRequired,
};

function BracketColumns({ nodesBySide, isAdmin, onReport, roundLabel }) {
    const rounds = [...new Set(nodesBySide.map((n) => n.round))].sort((a, b) => a - b);
    return (
        <div className="bracketGrid">
            {rounds.map((round) => (
                <div key={round} className="bracketRoundColumn">
                    <div className="bracketRoundLabel">{roundLabel(round, rounds.length)}</div>
                    <div className="bracketRoundMatches">
                        {nodesBySide
                            .filter((n) => n.round === round)
                            .sort((a, b) => a.position - b.position)
                            .map((node) => (
                                <MatchCard key={node.id} node={node} isAdmin={isAdmin} onReport={onReport} />
                            ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

BracketColumns.propTypes = {
    nodesBySide: PropTypes.array.isRequired,
    isAdmin: PropTypes.bool.isRequired,
    onReport: PropTypes.func.isRequired,
    roundLabel: PropTypes.func.isRequired,
};

function singleElimRoundLabel(round, totalRounds) {
    const fromEnd = totalRounds - round;
    if (fromEnd === 0) return 'Final';
    if (fromEnd === 1) return 'Semifinals';
    if (fromEnd === 2) return 'Quarterfinals';
    return `Round ${round}`;
}

function BracketView({ tournament, isAdmin, onReport }) {
    const matches = tournament.matches || [];

    if (tournament.format === 'single_elimination') {
        return (
            <BracketColumns
                nodesBySide={matches}
                isAdmin={isAdmin}
                onReport={onReport}
                roundLabel={singleElimRoundLabel}
            />
        );
    }

    const winners = matches.filter((m) => m.bracketSide === 'winners');
    const losers = matches.filter((m) => m.bracketSide === 'losers');
    const grandFinal = matches
        .filter((m) => m.bracketSide === 'grand_final')
        .filter((m) => !(m.round === 2 && m.skipped && !m.matchId))
        .sort((a, b) => a.round - b.round);

    return (
        <div className="doubleElimLayout">
            <div>
                <h3 className="bracketSectionTitle">Winners Bracket</h3>
                <BracketColumns
                    nodesBySide={winners}
                    isAdmin={isAdmin}
                    onReport={onReport}
                    roundLabel={(round) => `Round ${round}`}
                />
            </div>
            <div>
                <h3 className="bracketSectionTitle">Losers Bracket</h3>
                <BracketColumns
                    nodesBySide={losers}
                    isAdmin={isAdmin}
                    onReport={onReport}
                    roundLabel={(round) => `Round ${round}`}
                />
            </div>
            <div>
                <h3 className="bracketSectionTitle">Grand Final</h3>
                <div className="bracketGrandFinalColumn">
                    {grandFinal.map((node) => (
                        <MatchCard key={node.id} node={node} isAdmin={isAdmin} onReport={onReport} />
                    ))}
                </div>
            </div>
        </div>
    );
}

BracketView.propTypes = {
    tournament: PropTypes.object.isRequired,
    isAdmin: PropTypes.bool.isRequired,
    onReport: PropTypes.func.isRequired,
};

export default BracketView;
