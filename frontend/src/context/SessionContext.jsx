import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from "react";
import { useSocket } from "./SocketContext";

const SessionContext = createContext();

export const useSession = () => useContext(SessionContext);

export const SessionProvider = ({ children }) => {
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(false);

  const { socket, isConnected } = useSocket();

  const token = localStorage.getItem("token");
  const API_URL = `${
    import.meta.env.VITE_API_URL || "http://localhost:5000"
  }/api/sessions`;

  const getHeaders = () => ({
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  });

  // =====================================================
  // FETCH ACTIVE SESSIONS
  // =====================================================

  const fetchActiveSessions = useCallback(async () => {
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/active`, {
        headers: getHeaders()
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch sessions (${res.status})`);
      }

      const data = await res.json();
      setSessions(data);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  }, [API_URL, token]);

  // =====================================================
  // FETCH ONE SESSION
  // =====================================================

  const fetchActiveSessionById = useCallback(
    async (sessionId) => {
      if (!token) return null;

      try {
        const res = await fetch(`${API_URL}/${sessionId}`, {
          headers: getHeaders()
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch session (${res.status})`);
        }

        return await res.json();
      } catch (error) {
        console.error("Error fetching session:", error);
        return null;
      }
    },
    [API_URL, token]
  );

  // =====================================================
  // FETCH MY SESSIONS
  // =====================================================

  const fetchMySessions = useCallback(async () => {
    if (!token) return [];

    try {
      const res = await fetch(`${API_URL}/my-sessions`, {
        headers: getHeaders()
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch your sessions (${res.status})`);
      }

      return await res.json();
    } catch (error) {
      console.error("Error fetching my sessions:", error);
      return [];
    }
  }, [API_URL, token]);

  // =====================================================
  // REFRESH ACTIVE SESSION
  // =====================================================

  const refreshActiveSession = useCallback(
    async (sessionId) => {
      const updated = await fetchActiveSessionById(sessionId);

      if (updated) {
        setActiveSession((previous) => ({
          ...updated,

          // Preserve local timer state.
          timer: previous?.timer || 0,
          isTimerRunning: previous?.isTimerRunning || false
        }));
      }
    },
    [fetchActiveSessionById]
  );

  // =====================================================
  // CREATE SESSION
  // =====================================================

  const createSession = async (topic) => {
    if (!token) {
      return {
        success: false,
        error: "You must be logged in"
      };
    }

    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ topic })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create session");
      }

      if (socket && isConnected) {
        socket.emit("join-session", data._id);
      }

      setActiveSession(data);
      await fetchActiveSessions();

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error("Error creating session:", error);

      return {
        success: false,
        error: error.message
      };
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // JOIN SESSION
  // =====================================================

  const joinSessionById = async (sessionId) => {
    if (!token) {
      return {
        success: false,
        error: "You must be logged in"
      };
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/${sessionId}/join`, {
        method: "POST",
        headers: getHeaders()
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to join session");
      }

      if (socket && isConnected) {
        socket.emit("join-session", data._id);
      }

      setActiveSession(data);
      await fetchActiveSessions();

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error("Error joining session:", error);

      return {
        success: false,
        error: error.message
      };
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LEAVE SESSION
  // =====================================================

  const leaveSession = async (sessionId) => {
    if (!token) {
      return {
        success: false,
        error: "You must be logged in"
      };
    }

    try {
      const res = await fetch(`${API_URL}/${sessionId}/leave`, {
        method: "PUT",
        headers: getHeaders()
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to leave session");
      }

      if (socket && isConnected) {
        socket.emit("leave-session");
      }

      setActiveSession(null);
      await fetchActiveSessions();

      return {
        success: true
      };
    } catch (error) {
      console.error("Error leaving session:", error);

      return {
        success: false,
        error: error.message
      };
    }
  };

  // =====================================================
  // END SESSION
  // =====================================================

  const endSession = async (sessionId) => {
    if (!token) {
      return {
        success: false,
        error: "You must be logged in"
      };
    }

    try {
      const res = await fetch(`${API_URL}/${sessionId}/end`, {
        method: "PUT",
        headers: getHeaders()
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to end session");
      }

      if (socket && isConnected) {
        socket.emit("leave-session");

        socket.emit("session-ended", {
          sessionId,
          duration: data.duration
        });
      }

      setActiveSession(null);
      await fetchActiveSessions();

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error("Error ending session:", error);

      return {
        success: false,
        error: error.message
      };
    }
  };

  // =====================================================
  // REAL-TIME SOCKET EVENTS
  // =====================================================

  useEffect(() => {
    if (!socket) return;

    const handleParticipantJoined = async (data) => {
      console.log("Participant joined:", data);

      await fetchActiveSessions();

      if (activeSession && data.sessionId === activeSession._id) {
        await refreshActiveSession(activeSession._id);
      }
    };

    const handleParticipantLeft = async (data) => {
      console.log("Participant left:", data);

      await fetchActiveSessions();

      if (activeSession && data.sessionId === activeSession._id) {
        await refreshActiveSession(activeSession._id);
      }
    };

    const handleTaskUpdated = async (data) => {
      console.log(" Task updated:", data);

      if (activeSession) {
        await refreshActiveSession(activeSession._id);
      }

      await fetchActiveSessions();
    };

    const handleSessionUpdated = async (data) => {
      console.log(" Session updated:", data);

      await fetchActiveSessions();

      if (activeSession && data.sessionId === activeSession._id) {
        await refreshActiveSession(activeSession._id);
      }
    };

    const handleTimerSync = (data) => {
      console.log(" Timer sync:", data);
    };

    const handleSessionEnded = (data) => {
      console.log(" Session ended:", data);

      setActiveSession(null);
      fetchActiveSessions();
    };

    socket.on("participant-joined", handleParticipantJoined);
    socket.on("participant-left", handleParticipantLeft);
    socket.on("task-updated", handleTaskUpdated);
    socket.on("timer-sync", handleTimerSync);
    socket.on("session-ended", handleSessionEnded);
    socket.on("session-updated", handleSessionUpdated);

    return () => {
      socket.off("participant-joined", handleParticipantJoined);
      socket.off("participant-left", handleParticipantLeft);
      socket.off("task-updated", handleTaskUpdated);
      socket.off("timer-sync", handleTimerSync);
      socket.off("session-ended", handleSessionEnded);
      socket.off("session-updated", handleSessionUpdated);
    };
  }, [
    socket,
    activeSession,
    fetchActiveSessions,
    refreshActiveSession
  ]);

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    const loadSessions = async () => {
      setLoading(true);

      await fetchActiveSessions();

      setLoading(false);
    };

    if (token) {
      loadSessions();
    } else {
      setLoading(false);
    }
  }, [token, fetchActiveSessions]);

  return (
    <SessionContext.Provider
      value={{
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
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export default SessionContext;