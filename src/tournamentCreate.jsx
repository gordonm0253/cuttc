import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { getPlayers } from './api/players';
import { createTournament } from './api/tournaments';

const FORMATS = [
    { value: 'single_elimination', label: 'Single Elimination', blurb: 'Fastest to run. One loss and you\'re out.' },
    { value: 'double_elimination', label: 'Double Elimination', blurb: 'Everyone gets a second life. ~2× matches.' },
    { value: 'round_robin', label: 'Round Robin', blurb: 'Best for groups of 4–8. Full standings.' },
];

function initials(name) {
    return (name || '')
        .split(' ')
        .filter(Boolean)
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
}

function nextPowerOfTwo(n) {
    return Math.pow(2, Math.ceil(Math.log2(Math.max(n, 2))));
}

function shapeForCount(n) {
    if (n < 2) return { rounds: 0, matches: 0, byes: 0 };
    const size = nextPowerOfTwo(n);
    const rounds = Math.log2(size);
    return { rounds, matches: size - 1, byes: size - n };
}

function TournamentCreate() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [format, setFormat] = useState('single_elimination');
    const [members, setMembers] = useState([]);
    const [loadingMembers, setLoadingMembers] = useState(true);
    const [query, setQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [guests, setGuests] = useState([]);
    const [addingGuest, setAddingGuest] = useState(false);
    const [guestName, setGuestName] = useState('');
    const [guestEmail, setGuestEmail] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        getPlayers('')
            .then(setMembers)
            .catch(() => setMembers([]))
            .finally(() => setLoadingMembers(false));
    }, []);

    const filteredMembers = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return members;
        return members.filter((m) => m.displayName.toLowerCase().includes(q) || m.email.toLowerCase().includes(q));
    }, [members, query]);

    const toggleMember = (id) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const selectAllVisible = () => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            filteredMembers.forEach((m) => next.add(m.id));
            return next;
        });
    };

    const addGuest = () => {
        if (!guestName.trim() || !guestEmail.trim()) return;
        setGuests((prev) => [...prev, { displayName: guestName.trim(), email: guestEmail.trim(), elo: 1200 }]);
        setGuestName('');
        setGuestEmail('');
        setAddingGuest(false);
    };

    const removeGuest = (email) => setGuests((prev) => prev.filter((g) => g.email !== email));

    const selectedEntrants = useMemo(() => {
        const fromMembers = members
            .filter((m) => selectedIds.has(m.id))
            .map((m) => ({ id: m.id, displayName: m.displayName, email: m.email, elo: m.elo }));
        return [...fromMembers, ...guests];
    }, [members, selectedIds, guests]);

    const seedPreview = useMemo(
        () => [...selectedEntrants].sort((a, b) => (b.elo ?? 1200) - (a.elo ?? 1200)),
        [selectedEntrants]
    );

    const shape = useMemo(() => shapeForCount(selectedEntrants.length), [selectedEntrants.length]);

    const handleSubmit = async () => {
        setError('');
        if (!name.trim()) {
            setError('Enter a tournament name.');
            return;
        }
        if (selectedEntrants.length < 2) {
            setError('Select at least 2 entrants.');
            return;
        }

        setSubmitting(true);
        try {
            const tournament = await createTournament({
                name: name.trim(),
                format,
                entrants: selectedEntrants.map((e) => (
                    members.some((m) => m.id === e.id)
                        ? { id: e.id }
                        : { displayName: e.displayName, email: e.email }
                )),
            });
            navigate(`/profile/tournaments/${tournament.id}`);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="profilePageDiv">
            <div className="contentDiv">
                <Link to="/profile/tournaments" className="tournamentCreateBackLink">&larr; Back to tournaments</Link>
                <div className="tournamentsEyebrow">TOURNAMENTS / NEW</div>
                <h1 className="tournamentsTitle">Create a tournament</h1>
                <div className="tournamentsTitleRule" />

                {error && <p className="eventFormError tournamentCreateError">{error}</p>}

                <div className="tournamentCreateLayout">
                    <div className="tournamentCreateMain">
                        <div className="tournamentCreateCard">
                            <div className="tournamentCreateCardHeader">
                                <div className="tournamentCreateStepBadge">1</div>
                                <div className="tournamentCreateStepTitle">Basics</div>
                            </div>
                            <div className="tournamentCreateBasicsGrid">
                                <div>
                                    <div className="tournamentCreateLabel">NAME</div>
                                    <input
                                        className="tournamentCreateInput"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g. Fall Intraclub 2026"
                                    />
                                </div>
                            </div>
                            <div className="tournamentCreateLabel">FORMAT</div>
                            <div className="tournamentCreateFormatGrid">
                                {FORMATS.map((f) => (
                                    <button
                                        type="button"
                                        key={f.value}
                                        className={`tournamentCreateFormatOption${format === f.value ? ' tournamentCreateFormatOptionActive' : ''}`}
                                        onClick={() => setFormat(f.value)}
                                    >
                                        <div className="tournamentCreateFormatLabel">{f.label}</div>
                                        <div className="tournamentCreateFormatBlurb">{f.blurb}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="tournamentCreateCard">
                            <div className="tournamentCreateCardHeader">
                                <div className="tournamentCreateStepBadge">2</div>
                                <div className="tournamentCreateStepTitle">Entrants</div>
                                <div className="tournamentCreateEntrantCount">{selectedEntrants.length} selected</div>
                                <div className="tournamentCreateSpacer" />
                                <button type="button" className="tournamentCreateGhostBtn" onClick={selectAllVisible}>
                                    Select all members
                                </button>
                                <button type="button" className="tournamentCreateGhostBtn" onClick={() => setAddingGuest(true)}>
                                    + Guest entrant
                                </button>
                            </div>
                            <div className="tournamentCreateHint">
                                Seeds are computed from club Elo when you create — no manual ordering needed.
                            </div>
                            <input
                                className="tournamentCreateInput tournamentCreateSearch"
                                placeholder="Search members by name or email…"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            {loadingMembers ? (
                                <p className="eventText">Loading members...</p>
                            ) : (
                                <div className="tournamentCreateMemberGrid">
                                    {filteredMembers.map((m) => {
                                        const checked = selectedIds.has(m.id);
                                        return (
                                            <button
                                                type="button"
                                                key={m.id}
                                                className={`tournamentCreateMemberRow${checked ? ' tournamentCreateMemberRowChecked' : ''}`}
                                                onClick={() => toggleMember(m.id)}
                                            >
                                                <span className={`tournamentCreateCheckbox${checked ? ' tournamentCreateCheckboxChecked' : ''}`}>
                                                    {checked ? '✓' : ''}
                                                </span>
                                                <span className="tournamentCreateAvatar">{initials(m.displayName)}</span>
                                                <span className="tournamentCreateMemberInfo">
                                                    <span className="tournamentCreateMemberName">{m.displayName}</span>
                                                    <span className="tournamentCreateMemberEmail">{m.email}</span>
                                                </span>
                                                <span className="tournamentCreateMemberElo">{m.elo}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {guests.length > 0 && (
                                <div className="tournamentCreateGuestList">
                                    {guests.map((g) => (
                                        <div key={g.email} className="tournamentCreateGuestRow">
                                            <span className="tournamentCreateAvatar">{initials(g.displayName)}</span>
                                            <span className="tournamentCreateMemberInfo">
                                                <span className="tournamentCreateMemberName">{g.displayName}</span>
                                                <span className="tournamentCreateMemberEmail">{g.email} · guest</span>
                                            </span>
                                            <button type="button" className="tournamentCreateGhostBtn" onClick={() => removeGuest(g.email)}>
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {addingGuest ? (
                                <div className="tournamentCreateGuestForm">
                                    <input
                                        className="tournamentCreateInput"
                                        placeholder="Name"
                                        value={guestName}
                                        onChange={(e) => setGuestName(e.target.value)}
                                    />
                                    <input
                                        className="tournamentCreateInput"
                                        placeholder="Email"
                                        type="email"
                                        value={guestEmail}
                                        onChange={(e) => setGuestEmail(e.target.value)}
                                    />
                                    <button type="button" className="tournamentCreateGhostBtn" onClick={addGuest}>Add</button>
                                    <button type="button" className="tournamentCreateGhostBtn" onClick={() => setAddingGuest(false)}>Cancel</button>
                                </div>
                            ) : (
                                <button type="button" className="tournamentCreateAddGuestPrompt" onClick={() => setAddingGuest(true)}>
                                    + Add a guest entrant (name + email, seeded at 1200)
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="tournamentCreateSidebar">
                        <div className="tournamentCreateSidebarCard">
                            <div className="tournamentCreateSidebarHeader">
                                <span>SEED PREVIEW</span><span className="tournamentCreateSidebarHeaderMeta">BY CLUB ELO</span>
                            </div>
                            <div className="tournamentCreateSeedList">
                                {seedPreview.length === 0 && (
                                    <div className="tournamentCreateSeedEmpty">Select entrants to preview seeding.</div>
                                )}
                                {seedPreview.map((e, i) => (
                                    <div key={e.id || e.email} className="tournamentCreateSeedRow">
                                        <span className={`tournamentCreateSeedNumber${i < 4 ? ' tournamentCreateSeedNumberTop' : ''}`}>{i + 1}</span>
                                        <span className="tournamentCreateSeedName">{e.displayName}</span>
                                        <span className="tournamentCreateSeedElo">{e.elo ?? 1200}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="tournamentCreateSidebarCard tournamentCreateShapeCard">
                            <div className="tournamentCreateLabel">SHAPE</div>
                            <div className="tournamentCreateShapeStats">
                                <div className="tournamentCreateShapeRow"><span>Rounds</span><span className="tournamentCreateShapeValue">{shape.rounds || '—'}</span></div>
                                <div className="tournamentCreateShapeRow"><span>Matches</span><span className="tournamentCreateShapeValue">{shape.matches || '—'}</span></div>
                                <div className="tournamentCreateShapeRow"><span>Byes</span><span className="tournamentCreateShapeValue">{shape.byes}</span></div>
                                <div className="tournamentCreateShapeRow"><span>Counts toward Elo</span><span className="tournamentCreateShapeValue">Yes</span></div>
                            </div>
                        </div>

                        <div className="tournamentCreateSidebarCard tournamentCreateSubmitCard">
                            <button
                                type="button"
                                className="tournamentCreateSubmitBtn"
                                onClick={handleSubmit}
                                disabled={submitting}
                            >
                                Create &amp; seed bracket
                            </button>
                            <Link to="/profile/tournaments" className="tournamentCreateCancelBtn">Cancel</Link>
                            <div className="tournamentCreateSubmitHint">Seeding is locked once the first result is reported.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TournamentCreate;
