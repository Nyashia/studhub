import React, { createContext, useState, useContext, useEffect } from 'react';

const StudyBuddyContext = createContext();

export const useStudyBuddy = () => {
  const context = useContext(StudyBuddyContext);
  if (!context) {
    throw new Error('useStudyBuddy must be used within a StudyBuddyProvider');
  }
  return context;
};

export const StudyBuddyProvider = ({ children }) => {
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = 'http://localhost:5000/api/friends';

  const getToken = () => {
    return localStorage.getItem('token');
  };

  const fetchFriends = async () => {
    try {
      const token = getToken();
      if (!token) return;
      
      const res = await fetch(`${API_URL}/friends`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setFriends(data.friends || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const token = getToken();
      if (!token) return;
      
      const res = await fetch(`${API_URL}/requests/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setPendingRequests(data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchActivities = async () => {
    try {
      const token = getToken();
      if (!token) return;
      
      const res = await fetch(`${API_URL}/activities`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setActivities(data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const sendFriendRequest = async (identifier) => {
    try {
      const token = getToken();
      if (!token) {
        return { success: false, message: 'You must be logged in' };
      }

      const isEmail = identifier.includes('@') && identifier.includes('.');
      const body = isEmail ? { email: identifier } : { username: identifier };

      const res = await fetch(`${API_URL}/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const acceptRequest = async (requestId) => {
    try {
      const token = getToken();
      if (!token) return { success: false, message: 'Not logged in' };

      const res = await fetch(`${API_URL}/request/${requestId}/accept`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to accept');

      await fetchPendingRequests();
      await fetchFriends();
      await fetchActivities();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const declineRequest = async (requestId) => {
    try {
      const token = getToken();
      if (!token) return { success: false, message: 'Not logged in' };

      const res = await fetch(`${API_URL}/request/${requestId}/decline`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to decline');

      await fetchPendingRequests();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const cheerFriend = async (friendId, message = '') => {
    try {
      const token = getToken();
      if (!token) return { success: false, message: 'Not logged in' };

      const res = await fetch(`${API_URL}/cheer/${friendId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message })
      });

      if (!res.ok) throw new Error('Failed to cheer');

      await fetchActivities();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchFriends(),
      fetchPendingRequests(),
      fetchActivities()
    ]);
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const value = {
    friends,
    pendingRequests,
    activities,
    loading,
    error,
    sendFriendRequest,
    acceptRequest,
    declineRequest,
    cheerFriend,
    refresh: loadAllData
  };

  return (
    <StudyBuddyContext.Provider value={value}>
      {children}
    </StudyBuddyContext.Provider>
  );
};