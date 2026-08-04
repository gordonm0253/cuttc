import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { useIsAdmin } from './hooks/useIsAdmin';
import { getTournaments } from './api/tournaments';

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

const STATUS_STYLE = {
    draft: { stripe: '#e6dede', badgeBg: '#f2eded', badgeFg: '#a89b9b' },
    seeded: { stripe: '#d16464', badgeBg: '#faf0f0', badgeFg: '#8f5a5a' },
    in_progress: { stripe: 'linear-gradient(to right, #D02F2F, #a00)', badgeBg: '#fdecec', badgeFg: '#a00' },
    completed: { stripe: '#d9b3b3', badgeBg: '#f2eded', badgeFg: '#7d7373' },
};

const TABS = [
    { key: 'in_progress', label: 'In progress' },
    { key: 'seeded', label: 'Upcoming' },
    { key: 'completed', label: 'Completed' },
    { key: 'draft', label: 'Drafts' },
];

const formatDate = (isoDate) => new Date(isoDate).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
});

function footNote(tournament) {
    const { status } = tournament;
    const { reportableCount, reportedCount } = tournament.progress;
    if (status === 'draft') return 'Not started yet';
    if (status === 'seeded') return 'Seeded — waiting to start';
    if (status === 'completed') return 'Elo applied';
    const remaining = reportableCount - reportedCount;
    return remaining > 0 ? `${remaining} match${remaining === 1 ? '' : 'es'} left` : 'All matches played';
}

function actionLabel(status) {
    if (status === 'draft') return 'Finish setup';
    if (status === 'seeded') return 'Open';
    if (status === 'completed') return 'Results';
    return 'Run it';
}

function TournamentCard({ tournament }) {
    const style = STATUS_STYLE[tournament.status] || STATUS_STYLE.draft;
    const progressLabel = tournament.status === 'seeded'
        ? 'SEEDED'
        : (tournament.progress.currentRoundLabel || tournament.status).toString().toUpperCase();

    return (
        <Link to={`/profile/tournaments/${tournament.id}`} className="tournamentCardLink">
            <div className="tournamentCard">
                <div className="tournamentCardStripe" style={{ background: style.stripe }} />
                <div className="tournamentCardBody">
                    <div className="tournamentCardTopRow">
                        <div className="tournamentCardFormat">{FORMAT_LABELS[tournament.format] || tournament.format}</div>
                        <div className="tournamentCardBadge" style={{ background: style.badgeBg, color: style.badgeFg }}>
                            {STATUS_LABELS[tournament.status] || tournament.status}
                        </div>
                    </div>
                    <div className="tournamentCardName">{tournament.name}</div>
                    <div className="tournamentCardMeta">
                        <span>{formatDate(tournament.createdAt)}</span>
                        <span className="tournamentCardMetaDivider">|</span>
                        <span>{tournament._count?.entrants ?? 0} entrants</span>
                    </div>
                    <div className="tournamentCardSpacer" />
                    <div>
                        <div className="tournamentCardProgressRow">
                            <span>{progressLabel}</span>
                            <span>{tournament.progress.pct}%</span>
                        </div>
                        <div className="tournamentCardProgressTrack">
                            <div
                                className="tournamentCardProgressFill"
                                style={{ width: `${tournament.progress.pct}%`, background: style.stripe }}
                            />
                        </div>
                    </div>
                    <div className="tournamentCardFooter">
                        <span className="tournamentCardFootNote">{footNote(tournament)}</span>
                        <span className="tournamentCardAction">{actionLabel(tournament.status)} &rarr;</span>
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
    const [activeTab, setActiveTab] = useState('in_progress');
    const [search, setSearch] = useState('');

    useEffect(() => {
        setLoading(true);
        getTournaments()
            .then(setTournaments)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const counts = useMemo(() => {
        const c = { draft: 0, seeded: 0, in_progress: 0, completed: 0 };
        tournaments.forEach((t) => { c[t.status] = (c[t.status] || 0) + 1; });
        return c;
    }, [tournaments]);

    const visible = useMemo(() => {
        const q = search.trim().toLowerCase();
        return tournaments
            .filter((t) => t.status === activeTab)
            .filter((t) => !q || t.name.toLowerCase().includes(q));
    }, [tournaments, activeTab, search]);

    return (
        <div className="profilePageDiv">
            <div className="contentDiv">
                <div className="tournamentsHeaderRow">
                    <div>
                        <div className="tournamentsEyebrow">PROFILE / TOURNAMENTS</div>
                        <h1 className="tournamentsTitle">Tournaments</h1>
                        <div className="tournamentsTitleRule" />
                    </div>
                    {isAdmin && (
                        <div className="tournamentsHeaderActions">
                            <Link to="/profile/tournaments/new" className="tournamentsNewBtn">+ New tournament</Link>
                        </div>
                    )}
                </div>

                <div className="tournamentsTabBar">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            className={`tournamentsTab${activeTab === tab.key ? ' tournamentsTabActive' : ''}`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.label} <span className="tournamentsTabCount">{counts[tab.key] || 0}</span>
                        </button>
                    ))}
                    <div className="tournamentsTabSpacer" />
                    <input
                        className="tournamentsSearchInput"
                        placeholder="Search tournaments…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {loading && <p className="eventText">Loading tournaments...</p>}
                {error && <p className="eventFormError">{error}</p>}
                {!loading && !error && visible.length === 0 && (
                    <p className="eventText">No tournaments in this category.</p>
                )}

                <div className="tournamentsCardGrid">
                    {visible.map((tournament) => (
                        <TournamentCard key={tournament.id} tournament={tournament} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Tournaments;
