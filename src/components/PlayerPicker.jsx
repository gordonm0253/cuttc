import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

function PlayerPicker({ label, players, value, onChange }) {
    const [query, setQuery] = useState('');
    const [creatingNew, setCreatingNew] = useState(false);

    const matches = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return players;
        return players.filter((p) => `${p.displayName} ${p.email}`.toLowerCase().includes(q));
    }, [players, query]);

    const selectedPlayer = value.id ? players.find((p) => p.id === value.id) : null;

    if (creatingNew) {
        return (
            <Form.Group className="mb-3">
                <Form.Label>{label} (new player)</Form.Label>
                <div className="d-flex gap-2 mb-2">
                    <Form.Control
                        placeholder="Display name"
                        value={value.displayName}
                        onChange={(e) => onChange({ displayName: e.target.value, email: value.email })}
                        required
                    />
                    <Form.Control
                        placeholder="Email"
                        type="email"
                        value={value.email}
                        onChange={(e) => onChange({ displayName: value.displayName, email: e.target.value })}
                        required
                    />
                </div>
                <Button variant="link" size="sm" className="p-0" onClick={() => { setCreatingNew(false); onChange({ id: null, displayName: '', email: '' }); }}>
                    Search existing players instead
                </Button>
            </Form.Group>
        );
    }

    return (
        <Form.Group className="mb-3">
            <Form.Label>{label}</Form.Label>
            {selectedPlayer ? (
                <div className="playerPickerSelected">
                    <span>{selectedPlayer.displayName} ({selectedPlayer.email}) &mdash; Elo {selectedPlayer.elo}</span>
                    <Button variant="link" size="sm" onClick={() => onChange({ id: null, displayName: '', email: '' })}>
                        Change
                    </Button>
                </div>
            ) : (
                <>
                    <Form.Control
                        placeholder="Search by name or email..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <div className="playerPickerResults">
                        {matches.slice(0, 8).map((p) => (
                            <button
                                type="button"
                                key={p.id}
                                className="playerPickerResult"
                                onClick={() => { onChange({ id: p.id, displayName: p.displayName, email: p.email }); setQuery(''); }}
                            >
                                {p.displayName} <span className="playerPickerEmail">({p.email})</span>
                            </button>
                        ))}
                        {matches.length === 0 && (
                            <p className="eventText">No matching players.</p>
                        )}
                    </div>
                    <Button variant="link" size="sm" className="p-0" onClick={() => setCreatingNew(true)}>
                        Player not listed? Add a new one
                    </Button>
                </>
            )}
        </Form.Group>
    );
}

PlayerPicker.propTypes = {
    label: PropTypes.string.isRequired,
    players: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        displayName: PropTypes.string,
        email: PropTypes.string,
        elo: PropTypes.number,
    })).isRequired,
    value: PropTypes.shape({
        id: PropTypes.string,
        displayName: PropTypes.string,
        email: PropTypes.string,
    }).isRequired,
    onChange: PropTypes.func.isRequired,
};

export default PlayerPicker;
