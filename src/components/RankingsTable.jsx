import PropTypes from 'prop-types';
import Table from 'react-bootstrap/Table';

function RankingsTable({ players }) {
    if (players.length === 0) {
        return <p className="eventText">No ranked players yet — log a match to get things started!</p>;
    }

    return (
        <Table striped hover responsive className="rankingsTable">
            <thead>
                <tr>
                    <th>Rank</th>
                    <th>Player</th>
                    <th>Elo</th>
                    <th>Wins</th>
                    <th>Losses</th>
                </tr>
            </thead>
            <tbody>
                {players.map((player, index) => (
                    <tr key={player.id} className="rankingsRow">
                        <td>{index + 1}</td>
                        <td>{player.displayName}</td>
                        <td>{player.elo}</td>
                        <td>{player.wins}</td>
                        <td>{player.losses}</td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );
}

RankingsTable.propTypes = {
    players: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        displayName: PropTypes.string,
        elo: PropTypes.number,
        wins: PropTypes.number,
        losses: PropTypes.number,
    })).isRequired,
};

export default RankingsTable;
