import { useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import { getRankingsViewers, addRankingsViewer, removeRankingsViewer } from '../api/rankings';

function RankingsViewersPanel() {
    const [viewers, setViewers] = useState([]);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const loadViewers = () => {
        setLoading(true);
        getRankingsViewers()
            .then(setViewers)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadViewers();
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await addRankingsViewer(email.trim());
            setEmail('');
            loadViewers();
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleRemove = async (id) => {
        setError('');
        try {
            await removeRankingsViewer(id);
            loadViewers();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="rankingsViewersPanel">
            <h4>Rankings access list</h4>
            <p className="eventText rankingsOptInHint">
                Only people on this list (plus admins) can view club rankings and match history.
            </p>
            <Form className="rankingsViewerForm" onSubmit={handleAdd}>
                <Form.Control
                    type="email"
                    placeholder="member@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <Button variant="danger" type="submit" disabled={submitting}>Add</Button>
            </Form>
            {error && <p className="eventFormError">{error}</p>}
            {loading ? (
                <p className="eventText">Loading access list...</p>
            ) : (
                <ListGroup className="rankingsViewerList">
                    {viewers.map((viewer) => (
                        <ListGroup.Item key={viewer.id} className="rankingsViewerItem">
                            <span>{viewer.email}</span>
                            <Button variant="outline-secondary" size="sm" onClick={() => handleRemove(viewer.id)}>
                                Remove
                            </Button>
                        </ListGroup.Item>
                    ))}
                    {viewers.length === 0 && (
                        <ListGroup.Item className="rankingsViewerItem">No one added yet.</ListGroup.Item>
                    )}
                </ListGroup>
            )}
        </div>
    );
}

export default RankingsViewersPanel;
