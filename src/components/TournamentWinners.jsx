import PropTypes from 'prop-types';

const PLACE_LABEL = { 1: '1st', 2: '2nd', 3: '3rd' };

// Simple ranked list of a completed tournament's top 3. `podium` is the
// [{ place, entrants }] shape returned by the API (entrants already resolved
// to {id, displayName}; empty until the tournament is complete). `entrants`
// has 2 names only for a tied 3rd in an elimination bracket (no bronze match
// is ever played, so both semifinal losers share 3rd).
function TournamentWinners({ podium, compact }) {
    if (!podium || podium.length === 0) return null;

    return (
        <div className={`tournamentWinners${compact ? ' tournamentWinnersCompact' : ''}`}>
            {podium.map(({ place, entrants }) => (
                entrants.length > 0 && (
                    <div key={place} className={`tournamentWinnersRow tournamentWinnersRow-${place}`}>
                        <span className={`tournamentWinnersMedal tournamentWinnersMedal-${place}`}>{place}</span>
                        <span className="tournamentWinnersPlace">{PLACE_LABEL[place]}</span>
                        <span className="tournamentWinnersNames">
                            {entrants.map((e) => e.displayName).join(' & ')}
                        </span>
                    </div>
                )
            ))}
        </div>
    );
}

TournamentWinners.propTypes = {
    podium: PropTypes.arrayOf(PropTypes.shape({
        place: PropTypes.oneOf([1, 2, 3]).isRequired,
        entrants: PropTypes.array.isRequired,
    })),
    compact: PropTypes.bool,
};

TournamentWinners.defaultProps = {
    podium: [],
    compact: false,
};

export default TournamentWinners;
