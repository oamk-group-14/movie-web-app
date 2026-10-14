import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Groups() {
    const [groups, setGroups] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const response = await fetch('http://localhost:3000/groups');
                if (!response.ok) {
                    throw new Error('Failed to fetch groups');
                }
                const data = await response.json();
                setGroups(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchGroups();
    }, []);

    if (loading) return <p>Loading groups...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="groups-page">
            <div className="groups-header">
                <div>
                    <h1>Movie Groups</h1>
                    <p>Join groups, share your favorites and discover new movies and TV shows with your community.</p>
                </div>

                <Link to="/groups/new" className="group-button">
                    + Create group
                </Link>
            </div>

            <div className="groups-section-header">
                <h2>Your groups</h2>
                <span>
                    {groups.length} {groups.length === 1 ? 'group' : 'groups'}
                </span>
            </div>

            {groups.length === 0 ? (
                <div className="groups-empty">
                    <h3>No groups yet</h3>
                    <p>Create your first group and start collecting movies and TV shows together.</p>
                    <Link to="/groups/new" className="group-button">
                        Create your first group
                    </Link>
                </div>
            ) : (
                <div className="groups-grid">
                    {groups.map((group) => (
                        <Link
                            to={`/groups/${group.group_id}`}
                            className="group-card"
                            key={group.group_id}
                        >
                            <div className="group-card-top">
                                <div className="group-icon" aria-hidden="true">
                                    🎬
                                </div>
                            </div>

                            <h3>{group.group_name}</h3>

                            <p className="group-owner">Owned by</p>
                            <p className="group-owner-email">
                                {group.owner_email}
                            </p>

                            <div className="group-card-footer">
                                <span>View group</span>
                                <span aria-hidden="true">→</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Groups;