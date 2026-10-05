import { useEffect, useState } from 'react';
import { useLogin } from '../context/LoginContext';

// Gets the groups where the logged-in user is an accepted member
export default function useMyGroups() {
  const { user } = useLogin();
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    if (!user) {
      setGroups([]);
      return;
    }

    const token = localStorage.getItem('token');
    fetch('http://localhost:3000/groups/mine', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => (res.ok ? res.json() : []))
      .then(setGroups)
      .catch(() => setGroups([]));
  }, [user]);

  return groups;
}