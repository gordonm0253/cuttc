import { useAuth } from './auth/AuthUserProvider';
import { useIsAdmin } from './hooks/useIsAdmin';
import RankingsViewersPanel from './components/RankingsViewersPanel';

function AdminAccess() {
    const { user } = useAuth();
    const { isAdmin, loading } = useIsAdmin();

    if (!user) {
        return (
            <div className="profilePageDiv">
                <div className="nameDiv">
                    <h2 className="profileH1">Please sign in to view this page!</h2>
                </div>
            </div>
        );
    }

    if (!loading && !isAdmin) {
        return (
            <div className="profilePageDiv">
                <div className="nameDiv">
                    <h2 className="profileH1">This page is admin-only.</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="profilePageDiv">
            <div className="contentDiv">
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#333', marginBottom: '0.5rem' }}>
                        Admin Access
                    </h1>
                    <div style={{ width: '10rem', height: '4px', background: 'linear-gradient(to right, #D02F2F, #a00)', margin: '1rem auto', borderRadius: '2px' }} />
                    <p style={{ fontSize: '1.1rem', color: '#666' }}>Manage who can view club rankings and match history.</p>
                </div>

                {!loading && <RankingsViewersPanel />}
            </div>
        </div>
    );
}

export default AdminAccess;
