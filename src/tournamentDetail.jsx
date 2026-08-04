import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import { useIsAdmin } from './hooks/useIsAdmin';
import { getTournament, deleteTournament, reportTournamentMatchResult } from './api/tournaments';
import BracketView from './components/BracketView';
import TournamentMatchModal from './components/TournamentMatchModal';

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

function StandingsTable({ tournament }) {
    const entrantById = new Map(tournament.entrants.map((e) => [e.id, e]));
    return (
        <Table striped bordered hover responsive className="standingsTable">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Player</th>
                    <th>W</th>
                    <th>L</th>
                    <th>Set diff</th>
                    <th>Point diff</th>
                </tr>
            </thead>
            <tbody>
                {tournament.standings.map((s, i) => {
                    const entrant = entrantById.get(s.entrantId);
                    return (
                        <tr key={s.entrantId}>
                            <td>{i + 1}</td>
                            <td>{entrant?.player?.displayName || 'Unknown'}</td>
                            <td>{s.wins}</td>
                            <td>{s.losses}</td>
                            <td>{s.setsWon - s.setsLost}</td>
                            <td>{s.pointsWon - s.pointsLost}</td>
                        </tr>
                    );
                })}
            </tbody>
        </Table>
    );
}

StandingsTable.propTypes = {
    tournament: PropTypes.object.isRequired,
};

function RoundRobinMatchList({ tournament, isAdmin, onReport }) {
    const rounds = [...new Set(tournament.matches.map((m) => m.round))].sort((a, b) => a - b);
    return (
        <div>
            {rounds.map((round) => (
                <div key={round} className="roundRobinRound">
                    <h4>Round {round}</h4>
                    {tournament.matches
                        .filter((m) => m.round === round)
                        .map((m) => (
                            <div key={m.id} className="roundRobinMatchRow">
                                <span>
                                    {m.entrantA?.player?.displayName} vs {m.entrantB?.player?.displayName}
                                </span>
                                {m.match ? (
                                    <span className="roundRobinScore">
                                        {m.match.sets.filter((s) => s.a > s.b).length} – {m.match.sets.filter((s) => s.b > s.a).length}
                                    </span>
                                ) : isAdmin ? (
                                    <Button size="sm" variant="outline-danger" onClick={() => onReport(m)}>Report</Button>
                                ) : (
                                    <span className="eventText">Not played</span>
                                )}
                            </div>
                        ))}
                </div>
            ))}
        </div>
    );
}

RoundRobinMatchList.propTypes = {
    tournament: PropTypes.object.isRequired,
    isAdmin: PropTypes.bool.isRequired,
    onReport: PropTypes.func.isRequired,
};

function TournamentDetail() {
    const { id } = useParams();
    const { isAdmin } = useIsAdmin();
    const [tournament, setTournament] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [reportingNode, setReportingNode] = useState(null);

    const load = () => {
        setLoading(true);
        getTournament(id)
            .then(setTournament)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleDelete = async () => {
        if (!window.confirm('Delete this tournament? All associated match results and Elo changes will be reverted.')) return;
        await deleteTournament(id);
        window.location.href = '/profile/tournaments';
    };

    const handleReport = async ({ playedAt, sets }) => {
        await reportTournamentMatchResult(reportingNode.id, { playedAt, sets });
        setReportingNode(null);
        load();
    };

    if (loading) return <div className="profilePageDiv"><div className="contentDiv"><p className="eventText">Loading...</p></div></div>;
    if (error) return <div className="profilePageDiv"><div className="contentDiv"><p className="eventFormError">{error}</p></div></div>;
    if (!tournament) return null;

    return (
        <div className="profilePageDiv">
            <div className="contentDiv">
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#333', marginBottom: '0.5rem' }}>
                        {tournament.name}
                    </h1>
                    <p className="eventText">
                        {FORMAT_LABELS[tournament.format]} &middot; {STATUS_LABELS[tournament.status]}
                    </p>
                    {isAdmin && (
                        <Button variant="outline-danger" size="sm" onClick={handleDelete}>
                            Delete Tournament
                        </Button>
                    )}
                </div>

                {tournament.format === 'round_robin' ? (
                    <>
                        <StandingsTable tournament={tournament} />
                        <RoundRobinMatchList tournament={tournament} isAdmin={isAdmin} onReport={setReportingNode} />
                    </>
                ) : (
                    <BracketView tournament={tournament} isAdmin={isAdmin} onReport={setReportingNode} />
                )}

                {reportingNode && (
                    <TournamentMatchModal
                        show={!!reportingNode}
                        entrantA={reportingNode.entrantA}
                        entrantB={reportingNode.entrantB}
                        onSubmit={handleReport}
                        onClose={() => setReportingNode(null)}
                    />
                )}
            </div>
        </div>
    );
}

export default TournamentDetail;
