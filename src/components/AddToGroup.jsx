import { useEffect, useState } from 'react';
import { useLogin } from '../context/LoginContext';

export default function AddToGroup({ movie }) {
  const { user } = useLogin();
  const [groups, setGroups] = useState([]);
  const [groupId, setGroupId] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) return;
    fetch('/api/groups/mine', {
      headers: { Authorization: `Bearer ${user.token}` }
    })
      .then(res => (res.ok ? res.json() : []))
      .then(setGroups)
      .catch(() => setGroups([]));
  }, [user]);

  if (!user || groups.length === 0) return null;

  async function handleAdd() {
    if (!groupId) return;
    const res = await fetch(`/api/groups/${groupId}/movies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`
      },
      body: JSON.stringify({
        movieId: movie.id,
        title: movie.title,
        posterPath: movie.poster_path
      })
    });
    if (res.status === 201) setMessage('Added to group');
    else if (res.status === 409) setMessage('Already in this group');
    else setMessage('Could not add movie');
  }

  return (
    <div className="add-to-group">
      <select value={groupId} onChange={e => { setGroupId(e.target.value); setMessage(''); }}>
        <option value="">Add to group…</option>
        {groups.map(g => (
          <option key={g.group_id} value={g.group_id}>{g.group_name}</option>
        ))}
      </select>
      <button onClick={handleAdd} disabled={!groupId}>Add</button>
      {message && <span className="add-to-group-message">{message}</span>}
    </div>
  );
}