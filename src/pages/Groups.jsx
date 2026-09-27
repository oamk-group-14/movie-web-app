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
        <div>
            <h1>Groups</h1>
            <Link to="/groups/new">Create a new group</Link>

            {groups.length === 0 ? (
                <p>No groups yet.</p>
            ) : (
                <ul>
                    {groups.map((group) => (
                        <li key={group.group_id}>
                            <Link to={`/groups/${group.group_id}`}>{group.group_name}</Link>
                            {' — owner: '}{group.owner_email}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default Groups;