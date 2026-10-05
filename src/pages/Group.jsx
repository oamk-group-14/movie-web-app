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
  const [refresh, setRefresh] = useState(0);
  const [movies, setMovies] = useState([]);

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

        // Only members can see the group's movies
        if (data.isMember) {
          const moviesResponse = await fetch(`http://localhost:3000/groups/${id}/movies`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const moviesData = await moviesResponse.json();

          if (!moviesResponse.ok) {
            throw new Error(moviesData.error || 'Failed to fetch group movies');
          }

          setMovies(moviesData);
        } else {
          setMovies([]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [id, user, refresh]);

  const handleJoin = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/groups/${id}/requests`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send request');

      setGroup({ ...group, membershipStatus: 'pending' });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRequest = async (targetUserId, action) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:3000/groups/${id}/requests/${targetUserId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ action })
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to handle request');
      }

      setRefresh((r) => r + 1);
    } catch (err) {
      setError(err.message);
    }
  };

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

  const handleRemoveMember = async (targetUserId) => {
    const leaving = targetUserId === user.id;
    const message = leaving
      ? 'Leave this group?'
      : 'Remove this member from the group?';

    if (!window.confirm(message)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:3000/groups/${id}/members/${targetUserId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to remove member');
      }

      setRefresh((r) => r + 1);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemoveMovie = async (movieId) => {
    if (!window.confirm('Remove this movie from the group?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:3000/groups/${id}/movies/${movieId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to remove movie');
      }

      setMovies((prev) =>
        prev.filter((m) => !(m.media_type === mediaType && m.movie_id === movieId))
      );
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

      {group.isOwner && group.pendingRequests?.length > 0 && (
        <>
          <h2>Pending requests</h2>
          <ul>
            {group.pendingRequests.map((request) => (
              <li key={request.user_id}>
                {request.email}
                <button onClick={() => handleRequest(request.user_id, 'accept')}>Accept</button>
                <button onClick={() => handleRequest(request.user_id, 'reject')}>Reject</button>
              </li>
            ))}
          </ul>
        </>
      )}

      {group.isMember ? (
        <>
          <h2>Members</h2>
          <ul>
            {group.members.map((member) => (
              <li key={member.user_id}>
                {member.email}
                {member.user_id === group.owner_id && ' (owner)'}

                {member.user_id !== group.owner_id && (group.isOwner || member.user_id === user.id) && (
                  <button onClick={() => handleRemoveMember(member.user_id)}>
                    {member.user_id === user.id ? 'Leave' : 'Remove'}
                  </button>
                )}
              </li>
            ))}
          </ul>

          <h2>Movies & TV shows</h2>
          {movies.length === 0 ? (
            <p>No movies yet. Add one from the search page.</p>
          ) : (
            <div className="media-grid">
              {movies.map((movie) => (
                <div className="media-card" key={`${movie.media_type}-${movie.movie_id}`}>
                  <div className="media-card-poster">
                    {movie.poster_path && (
                      <img
                        src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                        alt={movie.title}
                      />
                    )}
                    <h2>{movie.title}</h2>
                    <p className="group-movie-meta">
                      Added by {movie.added_by_email ?? 'deleted user'}
                    </p>

                    {(group.isOwner || movie.added_by === user.id) && (
                      <button
                        className="group-movie-remove"
                        onClick={() => handleRemoveMovie(movie.media_type, movie.movie_id)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {group.isOwner && (
            <button onClick={handleDelete}>Delete group</button>
          )}
        </>
      ) : (
        <>
          {group.membershipStatus === 'pending' ? (
            <p>Your join request is waiting for approval.</p>
          ) : user ? (
            <button onClick={handleJoin}>Request to join</button>
          ) : (
            <p>Log in to join this group.</p>
          )}
        </>
      )}
    </div>
  );
}

export default Group;