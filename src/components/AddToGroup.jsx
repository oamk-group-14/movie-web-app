import { useState } from 'react';

export default function AddToGroup({ groups, movieId, mediaType, title, posterPath }) {
  const [groupId, setGroupId] = useState('');
  const [message, setMessage] = useState('');

  // Hidden when the user is not logged in or is not a member of any group
  if (!groups || groups.length === 0) return null;

  async function handleAdd() {
    if (!groupId) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/groups/${groupId}/movies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ movieId, mediaType, title, posterPath })
      });

      if (res.status === 201) setMessage('Added to group');
      else if (res.status === 409) setMessage('Already in this group');
      else setMessage('Could not add to group');
    } catch {
      setMessage('Could not add to group');
    }
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