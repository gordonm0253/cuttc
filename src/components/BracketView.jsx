import { useMemo } from 'react';
import PropTypes from 'prop-types';

const SIDE_PREFIX = { winners: 'A', losers: 'B', grand_final: 'C' };

// Assigns a stable, human-readable code to every match so admins can cross-
// reference "who feeds into what" while checking a bracket for correctness
// (e.g. double elimination's losers-bracket wiring). Numbered sequentially
// within each bracket side, ordered by (round, position); single elimination
// has only one side so it gets bare "M1, M2, ..." codes with no letter.
function buildMatchCodes(matches) {
    const bySide = new Map();
    for (const m of matches) {
        const side = m.bracketSide || '_single';
        if (!bySide.has(side)) bySide.set(side, []);
        bySide.get(side).push(m);
    }
    const codeById = new Map();
    for (const [side, sideMatches] of bySide) {
        const sorted = [...sideMatches].sort((a, b) => (a.round - b.round) || (a.position - b.position));
        const prefix = SIDE_PREFIX[side] || (side === '_single' ? 'M' : '');
        sorted.forEach((m, i) => codeById.set(m.id, `${prefix}${i + 1}`));
    }
    return codeById;
}

// For every match, finds what feeds each of its two slots: either a fixed
// entrant (already known) or a predecessor match + whether that predecessor's
// winner or loser advances into this slot. Used to render "Winner of A3" /
// "Loser of A3" instead of a bare "TBD" for slots still waiting on a result.
function buildSlotSources(matches) {
    const sourceByMatchSlot = new Map();
    for (const m of matches) {
        if (m.nextMatchId) {
            sourceByMatchSlot.set(`${m.nextMatchId}:${m.nextMatchSlot}`, { matchId: m.id, via: 'winner' });
        }
        if (m.loserNextMatchId) {
            sourceByMatchSlot.set(`${m.loserNextMatchId}:${m.loserNextMatchSlot}`, { matchId: m.id, via: 'loser' });
        }
    }
    return sourceByMatchSlot;
}

function slotLabel(entrant, match, slot, codeById, sourceByMatchSlot) {
    if (entrant) return `#${entrant.seed} ${entrant.player.displayName} (${entrant.eloAtSeed})`;
    const source = sourceByMatchSlot.get(`${match.id}:${slot}`);
    if (!source) return 'TBD';
    const code = codeById.get(source.matchId) || '?';
    return source.via === 'winner' ? `Winner of ${code}` : `Loser of ${code}`;
}

// Sets won by each side, or null if the match hasn't been played yet.
function setsWon(node) {
    if (!node.match) return null;
    const a = node.match.sets.filter((s) => s.a > s.b).length;
    const b = node.match.sets.filter((s) => s.b > s.a).length;
    return { a, b };
}

// Groups a flat list of match nodes (already filtered to one bracket side)
// into { label, matches }[] columns by round, in ascending round order.
function groupByRound(nodesBySide, roundLabel) {
    const rounds = [...new Set(nodesBySide.map((n) => n.round))].sort((a, b) => a - b);
    return rounds.map((round, i) => ({
        round,
        label: roundLabel(round, rounds.length),
        hasPrev: i > 0,
        hasNext: i < rounds.length - 1,
        matches: nodesBySide.filter((n) => n.round === round).sort((a, b) => a.position - b.position),
    }));
}

function singleElimRoundLabel(round, totalRounds) {
    const fromEnd = totalRounds - round;
    if (fromEnd === 0) return 'Final';
    if (fromEnd === 1) return 'Semifinals';
    if (fromEnd === 2) return 'Quarterfinals';
    return `Round ${round}`;
}

function MatchCard({ node, isAdmin, onReport, myEntrantId, code, codeById, sourceByMatchSlot }) {
    const aIsWinner = node.winnerEntrantId && node.winnerEntrantId === node.entrantAId;
    const bIsWinner = node.winnerEntrantId && node.winnerEntrantId === node.entrantBId;
    const canReport = isAdmin && !node.isBye && !node.skipped && node.entrantAId && node.entrantBId && !node.matchId;
    const onMyPath = myEntrantId && (node.entrantAId === myEntrantId || node.entrantBId === myEntrantId);
    const score = setsWon(node);

    let accent = '#f0f0f0';
    if (onMyPath) accent = '#D02F2F';

    return (
        <div className="bracketMatchCardWrapper">
            {node.hasPrev && <div className="bracketConnectorIn" />}
            <div
                className={`bracketMatchCard${onMyPath ? ' bracketMatchCardHighlighted' : ''}`}
                style={{ borderColor: onMyPath ? '#f3dcdc' : undefined }}
            >
                <div className="bracketMatchAccent" style={{ background: accent }} />
                <div className="bracketMatchCode">{code}</div>
                <div className={`bracketMatchRow${aIsWinner ? ' bracketMatchRowWinner' : ''}`}>
                    <span className="bracketMatchEntrant">
                        {slotLabel(node.entrantA, node, 'A', codeById, sourceByMatchSlot)}
                    </span>
                    {score && <span className="bracketMatchEntrantScore">{score.a}</span>}
                </div>
                <div className={`bracketMatchRow${bIsWinner ? ' bracketMatchRowWinner' : ''}`}>
                    <span className="bracketMatchEntrant">
                        {node.isBye ? 'BYE' : slotLabel(node.entrantB, node, 'B', codeById, sourceByMatchSlot)}
                    </span>
                    {score && <span className="bracketMatchEntrantScore">{score.b}</span>}
                </div>
                {canReport && (
                    <button type="button" className="bracketReportBtn" onClick={() => onReport(node)}>
                        Report
                    </button>
                )}
            </div>
            {node.connectDown && (
                <>
                    <div className="bracketConnectorOutDown" />
                    <div className="bracketConnectorOutDownVert" />
                </>
            )}
            {node.connectUp && (
                <>
                    <div className="bracketConnectorOutUp" />
                    <div className="bracketConnectorOutUpVert" />
                </>
            )}
        </div>
    );
}

MatchCard.propTypes = {
    node: PropTypes.object.isRequired,
    isAdmin: PropTypes.bool.isRequired,
    onReport: PropTypes.func.isRequired,
    myEntrantId: PropTypes.string,
    code: PropTypes.string.isRequired,
    codeById: PropTypes.object.isRequired,
    sourceByMatchSlot: PropTypes.object.isRequired,
};

function BracketColumns({ nodesBySide, isAdmin, onReport, roundLabel, myEntrantId, codeById, sourceByMatchSlot }) {
    const columns = groupByRound(nodesBySide, roundLabel);
    return (
        <div className="bracketGrid bracketTreeGrid">
            {columns.map((col) => (
                <div key={col.round} className="bracketRoundColumn">
                    <div className="bracketRoundLabel">{col.label}</div>
                    <div className="bracketRoundMatches">
                        {col.matches.map((node) => (
                            <MatchCard
                                key={node.id}
                                node={{
                                    ...node,
                                    hasPrev: col.hasPrev,
                                    connectDown: col.hasNext && node.position % 2 === 0,
                                    connectUp: col.hasNext && node.position % 2 === 1,
                                }}
                                isAdmin={isAdmin}
                                onReport={onReport}
                                myEntrantId={myEntrantId}
                                code={codeById.get(node.id) || '?'}
                                codeById={codeById}
                                sourceByMatchSlot={sourceByMatchSlot}
                            />
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
    myEntrantId: PropTypes.string,
    codeById: PropTypes.object.isRequired,
    sourceByMatchSlot: PropTypes.object.isRequired,
};

function BracketView({ tournament, isAdmin, onReport, myPlayerId }) {
    const matches = useMemo(() => tournament.matches || [], [tournament.matches]);

    const codeById = useMemo(() => buildMatchCodes(matches), [matches]);
    const sourceByMatchSlot = useMemo(() => buildSlotSources(matches), [matches]);

    const myEntrant = myPlayerId
        ? tournament.entrants?.find((e) => e.player?.id === myPlayerId)
        : null;

    if (tournament.format === 'single_elimination') {
        return (
            <BracketColumns
                nodesBySide={matches}
                isAdmin={isAdmin}
                onReport={onReport}
                roundLabel={singleElimRoundLabel}
                myEntrantId={myEntrant?.id}
                codeById={codeById}
                sourceByMatchSlot={sourceByMatchSlot}
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
            <div className="bracketSection">
                <div className="bracketSectionHeader">
                    <h3 className="bracketSectionTitle">Winners Bracket</h3>
                    <div className="bracketSectionRule" />
                </div>
                <BracketColumns
                    nodesBySide={winners}
                    isAdmin={isAdmin}
                    onReport={onReport}
                    roundLabel={(round) => `Round ${round}`}
                    myEntrantId={myEntrant?.id}
                    codeById={codeById}
                    sourceByMatchSlot={sourceByMatchSlot}
                />
            </div>
            <div className="bracketSection">
                <div className="bracketSectionHeader">
                    <h3 className="bracketSectionTitle">Losers Bracket</h3>
                    <div className="bracketSectionRule" />
                    <div className="bracketSectionNote">SECOND LIFE</div>
                </div>
                <BracketColumns
                    nodesBySide={losers}
                    isAdmin={isAdmin}
                    onReport={onReport}
                    roundLabel={(round) => `Round ${round}`}
                    myEntrantId={myEntrant?.id}
                    codeById={codeById}
                    sourceByMatchSlot={sourceByMatchSlot}
                />
            </div>
            <div className="bracketSection">
                <div className="bracketSectionHeader">
                    <h3 className="bracketSectionTitle">Grand Final</h3>
                    <div className="bracketSectionRule" />
                    <div className="bracketSectionNote">BEST OF 5 · RESET IF NEEDED</div>
                </div>
                <div className="bracketGrandFinalColumn">
                    {grandFinal.map((node) => (
                        <MatchCard
                            key={node.id}
                            node={node}
                            isAdmin={isAdmin}
                            onReport={onReport}
                            myEntrantId={myEntrant?.id}
                            code={codeById.get(node.id) || '?'}
                            codeById={codeById}
                            sourceByMatchSlot={sourceByMatchSlot}
                        />
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
    myPlayerId: PropTypes.string,
};

export default BracketView;
