import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLogin } from '../context/LoginContext.jsx';

function Group() {
  const { id } = useParams();
  const { user } = useLogin();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroup = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/groups/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch group');
        }

        setGroup(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [id, user]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this group? This can't be undone.")) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/groups/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete group');
      }

      navigate('/groups');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p>Loading group...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>{group.group_name}</h1>
      <p>Owner: {group.owner_email}</p>

      {group.isMember ? (
        <>
          <h2>Members</h2>
          <ul>
            {group.members.map((member) => (
              <li key={member.user_id}>
                {member.email}
                {member.user_id === group.owner_id && ' (owner)'}
              </li>
            ))}
          </ul>

          {group.isOwner && (
            <button onClick={handleDelete}>Delete group</button>
          )}
        </>
      ) : (
        <p>Join this group to see its content.</p>
      )}
    </div>
  );
}

export default Group;