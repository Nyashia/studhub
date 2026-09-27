import React, {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

// =====================================================
// CONTEXT
// =====================================================

const StudyBuddyContext = createContext();

export const useStudyBuddy = () => {
  const context = useContext(StudyBuddyContext);

  if (!context) {
    throw new Error(
      "useStudyBuddy must be used within a StudyBuddyProvider"
    );
  }

  return context;
};

// =====================================================
// PROVIDER
// =====================================================

export const StudyBuddyProvider = ({ children }) => {
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL =
    `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/friends`;

  // ===================================================
  // AUTHENTICATION
  // ===================================================

  const getToken = () => {
    return localStorage.getItem("token");
  };

  // ===================================================
  // FETCH FRIENDS
  // ===================================================

  const fetchFriends = async () => {
    try {
      const token = getToken();

      if (!token) {
        return;
      }

      const res = await fetch(`${API_URL}/friends`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();

      setFriends(data.friends || []);
    } catch (err) {
      console.error("Error fetching friends:", err);
      setError(err.message);
    }
  };

  // ===================================================
  // FETCH PENDING REQUESTS
  // ===================================================

  const fetchPendingRequests = async () => {
    try {
      const token = getToken();

      if (!token) {
        return;
      }

      const res = await fetch(`${API_URL}/requests/pending`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();

      setPendingRequests(data || []);
    } catch (err) {
      console.error(
        "Error fetching pending requests:",
        err
      );

      setError(err.message);
    }
  };

  // ===================================================
  // FETCH FRIEND ACTIVITIES
  // ===================================================

  const fetchActivities = async () => {
    try {
      const token = getToken();

      if (!token) {
        return;
      }

      const res = await fetch(`${API_URL}/activities`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();

      setActivities(data || []);
    } catch (err) {
      console.error("Error fetching activities:", err);
      setError(err.message);
    }
  };

  // ===================================================
  // SEND FRIEND REQUEST
  // ===================================================

  const sendFriendRequest = async (identifier) => {
    try {
      const token = getToken();

      if (!token) {
        return {
          success: false,
          message: "You must be logged in"
        };
      }

      // For now, users can be found using either
      // their email or username.
      const isEmail =
        identifier.includes("@") &&
        identifier.includes(".");

      const body = isEmail
        ? { email: identifier }
        : { username: identifier };

      const res = await fetch(`${API_URL}/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to send friend request"
        );
      }

      return {
        success: true,
        message: data.message
      };
    } catch (err) {
      console.error(
        "Error sending friend request:",
        err
      );

      return {
        success: false,
        message: err.message
      };
    }
  };

  // ===================================================
  // ACCEPT FRIEND REQUEST
  // ===================================================

  const acceptRequest = async (requestId) => {
    try {
      const token = getToken();

      if (!token) {
        return {
          success: false,
          message: "Not logged in"
        };
      }

      const res = await fetch(
        `${API_URL}/request/${requestId}/accept`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!res.ok) {
        throw new Error("Failed to accept friend request");
      }

      // Refresh all affected data.
      await fetchPendingRequests();
      await fetchFriends();
      await fetchActivities();

      return {
        success: true
      };
    } catch (err) {
      console.error(
        "Error accepting friend request:",
        err
      );

      return {
        success: false,
        message: err.message
      };
    }
  };

  // ===================================================
  // DECLINE FRIEND REQUEST
  // ===================================================

  const declineRequest = async (requestId) => {
    try {
      const token = getToken();

      if (!token) {
        return {
          success: false,
          message: "Not logged in"
        };
      }

      const res = await fetch(
        `${API_URL}/request/${requestId}/decline`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!res.ok) {
        throw new Error("Failed to decline friend request");
      }

      await fetchPendingRequests();

      return {
        success: true
      };
    } catch (err) {
      console.error(
        "Error declining friend request:",
        err
      );

      return {
        success: false,
        message: err.message
      };
    }
  };

  // ===================================================
  // CHEER FRIEND
  // ===================================================

  const cheerFriend = async (friendId, message = "") => {
    try {
      const token = getToken();

      if (!token) {
        return {
          success: false,
          message: "Not logged in"
        };
      }

      const res = await fetch(
        `${API_URL}/cheer/${friendId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ message })
        }
      );

      if (!res.ok) {
        throw new Error("Failed to cheer friend");
      }

      await fetchActivities();

      return {
        success: true
      };
    } catch (err) {
      console.error("Error cheering friend:", err);

      return {
        success: false,
        message: err.message
      };
    }
  };

  // ===================================================
  // LOAD ALL DATA
  // ===================================================

  const loadAllData = async () => {
    const token = getToken();

    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    await Promise.all([
      fetchFriends(),
      fetchPendingRequests(),
      fetchActivities()
    ]);

    setLoading(false);
  };

  // ===================================================
  // INITIAL LOAD
  // ===================================================

  useEffect(() => {
    loadAllData();
  }, []);

  // ===================================================
  // PROVIDER VALUE
  // ===================================================

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