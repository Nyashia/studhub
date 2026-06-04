import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Get userId from token
    const token = localStorage.getItem('token');
    let userId = null;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = JSON.parse(atob(base64));
      userId = decoded.userId;
    } catch (e) {
      console.error('Failed to decode token', e);
    }

    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      // Register user with their ID
      if (userId) {
        newSocket.emit('register-user', userId);
      }
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    newSocket.on('receive-nudge', (data) => {
      console.log('Received nudge:', data);
      setNotifications(prev => [{
        id: Date.now(),
        ...data
      }, ...prev]);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const sendNudge = (toUserId, message) => {
    if (socket && isConnected) {
      socket.emit('nudge', { toUserId, message });
    }
  };

  const clearNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <SocketContext.Provider value={{
      isConnected,
      notifications,
      sendNudge,
      clearNotification
    }}>
      {children}
    </SocketContext.Provider>
  );
};