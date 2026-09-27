import React, {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

// =====================================================
// CONTEXT
// =====================================================

const StudyContext = createContext();

export const useStudy = () => useContext(StudyContext);

// =====================================================
// PROVIDER
// =====================================================

export const StudyProvider = ({ children }) => {
  const [topics, setTopics] = useState([]);
  const [dueTopics, setDueTopics] = useState([]);
  const [prioritizedTopics, setPrioritizedTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL =
    `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/study`;

  // ===================================================
  // FETCH TOPICS
  // ===================================================

  const fetchTopics = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/topics`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      setTopics(data);
    } catch (error) {
      console.error("Error fetching topics:", error);
    }
  };

  // ===================================================
  // FETCH DUE TOPICS
  // ===================================================

  const fetchDueTopics = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/due`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      setDueTopics(data);
    } catch (error) {
      console.error("Error fetching due topics:", error);
    }
  };

  // ===================================================
  // FETCH PRIORITIZED TOPICS
  // ===================================================

  const fetchPrioritizedTopics = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/priorities`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();

      setPrioritizedTopics(data.priorities || []);

      return data;
    } catch (error) {
      console.error(
        "Error fetching prioritized topics:",
        error
      );

      setPrioritizedTopics([]);

      throw error;
    }
  };

  // ===================================================
  // ADD TOPIC
  // ===================================================

  const addTopic = async (topicData) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/topics`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(topicData)
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();

      setTopics((currentTopics) => [
        ...currentTopics,
        data
      ]);

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error("Error adding topic:", error);

      return {
        success: false,
        error: error.message
      };
    }
  };

  // ===================================================
  // REVIEW TOPIC
  // ===================================================

  const reviewTopic = async (id) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/topics/${id}/review`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();

      // Refresh the lists because reviewing a topic
      // can change when it is due.
      await fetchTopics();
      await fetchDueTopics();

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error("Error reviewing topic:", error);

      return {
        success: false,
        error: error.message
      };
    }
  };

  // ===================================================
  // DELETE TOPIC
  // ===================================================

  const deleteTopic = async (id) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/topics/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      // Refresh the lists after deletion.
      await fetchTopics();
      await fetchDueTopics();

      return {
        success: true
      };
    } catch (error) {
      console.error("Error deleting topic:", error);

      return {
        success: false,
        error: error.message
      };
    }
  };

  // ===================================================
  // INITIAL LOAD
  // ===================================================

  useEffect(() => {
    const loadStudyData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      setLoading(true);

      await Promise.all([
        fetchTopics(),
        fetchDueTopics()
      ]);

      setLoading(false);
    };

    loadStudyData();
  }, []);

  // ===================================================
  // PROVIDER VALUE
  // ===================================================

  return (
    <StudyContext.Provider
      value={{
        topics,
        dueTopics,
        prioritizedTopics,
        loading,
        addTopic,
        reviewTopic,
        deleteTopic,
        fetchTopics,
        fetchDueTopics,
        fetchPrioritizedTopics,
        isAuthenticated: !!localStorage.getItem("token")
      }}
    >
      {children}
    </StudyContext.Provider>
  );
};