import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function NewGroup() {
  const [groupName, setGroupName] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ groupName })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create group');
      }

      navigate('/groups');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1>Create a new group</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="groupName">Group name</label>
        <input
          id="groupName"
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          maxLength={100}
          required
        />
        <button type="submit" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create group'}
        </button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
}

export default NewGroup;