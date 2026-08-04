import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router';
import { useIsAdmin } from './hooks/useIsAdmin';
import { getTournament, deleteTournament, reportTournamentMatchResult } from './api/tournaments';
import BracketView from './components/BracketView';
import RoundRobinView from './components/RoundRobinView';
import TournamentMatchModal from './components/TournamentMatchModal';

const FORMAT_LABELS = {
    single_elimination: 'Single Elimination',
    double_elimination: 'Double Elimination',
    round_robin: 'Round Robin',
};

const STATUS_LABELS = {
    draft: 'DRAFT',
    seeded: 'UPCOMING',
    in_progress: 'IN PROGRESS',
    completed: 'COMPLETED',
};

const STATUS_BADGE = {
    draft: { bg: '#f2eded', fg: '#a89b9b' },
    seeded: { bg: '#faf0f0', fg: '#8f5a5a' },
    in_progress: { bg: '#fdecec', fg: '#a00' },
    completed: { bg: '#f2eded', fg: '#7d7373' },
};

const TABS = [
    { key: 'bracket', label: 'Bracket' },
    { key: 'entrants', label: 'Entrants' },
    { key: 'results', label: 'Results' },
    { key: 'elo', label: 'Elo impact' },
];

const formatDateTime = (isoDate) => new Date(isoDate).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
});

function EntrantsTab({ tournament }) {
    return (
        <div className="tournamentEntrantsList">
            {tournament.entrants.map((e) => (
                <div key={e.id} className="tournamentEntrantRow">
                    <span className="tournamentEntrantSeed">#{e.seed}</span>
                    <span className="tournamentEntrantName">{e.player.displayName}</span>
                    <span className="tournamentEntrantElo">Seeded at {e.eloAtSeed}</span>
                </div>
            ))}
        </div>
    );
}

EntrantsTab.propTypes = {
    tournament: PropTypes.object.isRequired,
};

function ResultsTab({ tournament }) {
    const played = tournament.matches
        .filter((m) => m.match)
        .sort((a, b) => new Date(b.match.playedAt) - new Date(a.match.playedAt));

    if (played.length === 0) {
        return <p className="eventText">No results reported yet.</p>;
    }

    return (
        <div className="tournamentResultsList">
            {played.map((m) => {
                const setsWonA = m.match.sets.filter((s) => s.a > s.b).length;
                const setsWonB = m.match.sets.filter((s) => s.b > s.a).length;
                const aWon = m.winnerEntrantId === m.entrantAId;
                return (
                    <div key={m.id} className="tournamentResultRow">
                        <div className="tournamentResultDate">{formatDateTime(m.match.playedAt)}</div>
                        <div className="tournamentResultNames">
                            <span className={aWon ? 'tournamentResultWinner' : ''}>{m.entrantA?.player?.displayName}</span>
                            <span className="tournamentResultVs">vs</span>
                            <span className={!aWon ? 'tournamentResultWinner' : ''}>{m.entrantB?.player?.displayName}</span>
                        </div>
                        <div className="tournamentResultScore">{setsWonA} – {setsWonB}</div>
                    </div>
                );
            })}
        </div>
    );
}

ResultsTab.propTypes = {
    tournament: PropTypes.object.isRequired,
};

function EloImpactTab({ tournament }) {
    const played = tournament.matches
        .filter((m) => m.match)
        .sort((a, b) => new Date(b.match.playedAt) - new Date(a.match.playedAt));

    if (played.length === 0) {
        return <p className="eventText">No Elo changes yet.</p>;
    }

    return (
        <div className="tournamentEloList">
            {tournament.status !== 'completed' && (
                <p className="eventText tournamentEloPendingNote">
                    Ratings for this tournament are applied once it&apos;s complete, in the order matches were played &mdash; deltas below will fill in then.
                </p>
            )}
            {played.map((m) => {
                const { match } = m;
                const deltaA = match.playerAEloAfter - match.playerAElo;
                const deltaB = match.playerBEloAfter - match.playerBElo;
                return (
                    <div key={m.id} className="tournamentEloRow">
                        <div className="tournamentEloDate">{formatDateTime(match.playedAt)}</div>
                        <div className="tournamentEloPlayer">
                            <span>{m.entrantA?.player?.displayName}</span>
                            <span className="tournamentEloValues">
                                {match.playerAElo} &rarr; {match.playerAEloAfter}
                                <span className={deltaA >= 0 ? 'tournamentEloDeltaUp' : 'tournamentEloDeltaDown'}>
                                    {deltaA >= 0 ? `+${deltaA}` : deltaA}
                                </span>
                            </span>
                        </div>
                        <div className="tournamentEloPlayer">
                            <span>{m.entrantB?.player?.displayName}</span>
                            <span className="tournamentEloValues">
                                {match.playerBElo} &rarr; {match.playerBEloAfter}
                                <span className={deltaB >= 0 ? 'tournamentEloDeltaUp' : 'tournamentEloDeltaDown'}>
                                    {deltaB >= 0 ? `+${deltaB}` : deltaB}
                                </span>
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

EloImpactTab.propTypes = {
    tournament: PropTypes.object.isRequired,
};

function TournamentDetail() {
    const { id } = useParams();
    const { isAdmin, playerId } = useIsAdmin();
    const [tournament, setTournament] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [reportingNode, setReportingNode] = useState(null);
    const [activeTab, setActiveTab] = useState('bracket');

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

    const reportable = tournament.matches.filter((m) => !m.isBye && !m.skipped);
    const reportedCount = reportable.filter((m) => !!m.matchId).length;
    const pct = reportable.length ? Math.round((reportedCount / reportable.length) * 100) : 0;
    const badge = STATUS_BADGE[tournament.status] || STATUS_BADGE.draft;

    return (
        <div className="profilePageDiv">
            <div className="contentDiv">
                <div className="tournamentDetailHeaderCard">
                    <div className="tournamentDetailTopBar">
                        <div className="tournamentDetailFormatLine">
                            {FORMAT_LABELS[tournament.format]?.toUpperCase()} · {tournament._count?.entrants ?? tournament.entrants.length} ENTRANTS
                        </div>
                        <div className="tournamentDetailDateLine">{formatDateTime(tournament.createdAt)}</div>
                    </div>
                    <div className="tournamentDetailMainRow">
                        <div className="tournamentDetailNameBlock">
                            <div className="tournamentDetailName">{tournament.name}</div>
                            <div className="tournamentDetailMetaRow">
                                <span className="tournamentDetailBadge" style={{ background: badge.bg, color: badge.fg }}>
                                    {STATUS_LABELS[tournament.status]}
                                </span>
                                {tournament.format !== 'round_robin' && (
                                    <>
                                        <span>{reportedCount} of {reportable.length} matches played</span>
                                    </>
                                )}
                            </div>
                        </div>
                        {tournament.format !== 'round_robin' && (
                            <div className="tournamentDetailProgressBlock">
                                <div className="tournamentDetailProgressTrack">
                                    <div className="tournamentDetailProgressFill" style={{ width: `${pct}%` }} />
                                </div>
                                <div className="tournamentDetailProgressLabel">{pct}% COMPLETE</div>
                            </div>
                        )}
                        {isAdmin && (
                            <button type="button" className="tournamentDetailDeleteBtn" onClick={handleDelete}>
                                Delete Tournament
                            </button>
                        )}
                    </div>
                    <div className="tournamentDetailTabBar">
                        {TABS.map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                className={`tournamentDetailTab${activeTab === tab.key ? ' tournamentDetailTabActive' : ''}`}
                                onClick={() => setActiveTab(tab.key)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="tournamentDetailBody">
                    {activeTab === 'bracket' && (
                        tournament.format === 'round_robin' ? (
                            <RoundRobinView tournament={tournament} isAdmin={isAdmin} onReport={setReportingNode} />
                        ) : (
                            <BracketView tournament={tournament} isAdmin={isAdmin} onReport={setReportingNode} myPlayerId={playerId} />
                        )
                    )}
                    {activeTab === 'entrants' && <EntrantsTab tournament={tournament} />}
                    {activeTab === 'results' && <ResultsTab tournament={tournament} />}
                    {activeTab === 'elo' && <EloImpactTab tournament={tournament} />}
                </div>

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
