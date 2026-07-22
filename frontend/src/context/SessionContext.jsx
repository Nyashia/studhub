import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from './SocketContext';

const SessionContext = createContext();

export const useSession = () => useContext(SessionContext);

export const SessionProvider = ({ children }) => {
    const [sessions, setSessions] = useState([]);
    const [activeSession, setActiveSession] = useState(null);
    const [loading, setLoading] = useState(false);
    const { socket, isConnected } = useSocket();

    const token = localStorage.getItem('token');
    const API_URL = 'http://localhost:5000/api/sessions';

    const fetchActiveSessions = async () => {
        try {
            const res = await fetch(`${API_URL}/active`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setSessions(data);
        } catch (error) {
            console.error('Error fetching sessions:', error);
        }
    };

    const fetchActiveSessionById = async (sessionId) => {
        try {
            const res = await fetch(`${API_URL}/${sessionId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            return data;
        } catch (error) {
            console.error('Error fetching session:', error);
            return null;
        }
    };

    const fetchMySessions = async () => {
        try {
            const res = await fetch(`${API_URL}/my-sessions`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            return data;
        } catch (error) {
            console.error('Error fetching my sessions:', error);
        }
    };

    const createSession = async (topic) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ topic })
            });
            const data = await res.json();

            if (socket && isConnected) {
                socket.emit('join-session', data._id);
            }

            setActiveSession(data);
            await fetchActiveSessions();
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    // JOIN by session ID 
    const joinSessionById = async (sessionId) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/${sessionId}/join`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await res.json();

            if (socket && isConnected) {
                socket.emit('join-session', data._id);
            }

            setActiveSession(data);
            await fetchActiveSessions();
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    const leaveSession = async (sessionId) => {
        try {
            const res = await fetch(`${API_URL}/${sessionId}/leave`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();

            if (socket && isConnected) {
                socket.emit('leave-session');
            }

            setActiveSession(null);
            await fetchActiveSessions();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const endSession = async (sessionId) => {
        try {
            const res = await fetch(`${API_URL}/${sessionId}/end`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();

            if (socket && isConnected) {
                socket.emit('leave-session');
                socket.emit('session-ended', { sessionId, duration: data.duration });
            }

            setActiveSession(null);
            await fetchActiveSessions();
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    // Socket listeners
    useEffect(() => {
        if (!socket) return;

        const handleParticipantJoined = async (data) => {
            console.log('Participant joined:', data);
            await fetchActiveSessions();
            
            if (activeSession && data.sessionId === activeSession._id) {
                const updated = await fetchActiveSessionById(activeSession._id);
                if (updated) setActiveSession(updated);
            }
        };

        const handleParticipantLeft = async (data) => {
            console.log('Participant left:', data);
            await fetchActiveSessions();
            
            if (activeSession && data.sessionId === activeSession._id) {
                const updated = await fetchActiveSessionById(activeSession._id);
                if (updated) setActiveSession(updated);
            }
        };

        const handleTimerSync = (data) => {
            console.log('Timer sync:', data);
        };

        const handleSessionEnded = (data) => {
            console.log('Session ended:', data);
            setActiveSession(null);
            fetchActiveSessions();
        };

        socket.on('participant-joined', handleParticipantJoined);
        socket.on('participant-left', handleParticipantLeft);
        socket.on('timer-sync', handleTimerSync);
        socket.on('session-ended', handleSessionEnded);

        return () => {
            socket.off('participant-joined', handleParticipantJoined);
            socket.off('participant-left', handleParticipantLeft);
            socket.off('timer-sync', handleTimerSync);
            socket.off('session-ended', handleSessionEnded);
        };
    }, [socket, activeSession]);

    useEffect(() => {
        fetchActiveSessions();
    }, []);

    return (
        <SessionContext.Provider value={{
            sessions,
            activeSession,
            loading,
            createSession,
            joinSessionById,  
            leaveSession,
            endSession,
            fetchActiveSessions,
            fetchMySessions,
            setActiveSession,
            fetchActiveSessionById
        }}>
            {children}
        </SessionContext.Provider>
    );
};