import React, { createContext, useContext, useState, useEffect } from "react";

const ScheduleContext = createContext();

export function ScheduleProvider({ children }) {
  const [schedule, setSchedule] = useState({
    classes: [],
    theme: "default"
  });
  const [loading, setLoading] = useState(true);

  const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

  const token = localStorage.getItem("token");

  // ====================
  // Fetch schedule
  // ====================

  const fetchSchedule = async () => {
    try {
      const res = await fetch(`${API_URL}/schedule`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error("Failed to fetch schedule");
      }

      const data = await res.json();
      setSchedule(data);
    } catch (error) {
      console.error("Error fetching schedule:", error);
    } finally {
      setLoading(false);
    }
  };

  // ====================
  // Add class
  // ====================

  const addClass = async (classData) => {
    try {
      const res = await fetch(`${API_URL}/schedule/classes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(classData)
      });

      if (!res.ok) {
        throw new Error("Failed to add class");
      }

      const data = await res.json();
      setSchedule(data);

      return { success: true };
    } catch (error) {
      console.error("Error adding class:", error);

      return {
        success: false,
        error: error.message
      };
    }
  };

  // ====================
  // Update class
  // ====================

  const updateClass = async (classId, classData) => {
    try {
      const res = await fetch(
        `${API_URL}/schedule/classes/${classId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(classData)
        }
      );

      if (!res.ok) {
        throw new Error("Failed to update class");
      }

      const data = await res.json();
      setSchedule(data);

      return { success: true };
    } catch (error) {
      console.error("Error updating class:", error);

      return {
        success: false,
        error: error.message
      };
    }
  };

  // ====================
  // Delete class
  // ====================

  const deleteClass = async (classId) => {
    try {
      const res = await fetch(
        `${API_URL}/schedule/classes/${classId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!res.ok) {
        throw new Error("Failed to delete class");
      }

      const data = await res.json();
      setSchedule(data);

      return { success: true };
    } catch (error) {
      console.error("Error deleting class:", error);

      return {
        success: false,
        error: error.message
      };
    }
  };

  // ====================
  // Update schedule theme
  // ====================

  const updateTheme = async (theme) => {
    try {
      const res = await fetch(`${API_URL}/schedule/theme`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ theme })
      });

      if (!res.ok) {
        throw new Error("Failed to update theme");
      }

      const data = await res.json();
      setSchedule(data);

      return { success: true };
    } catch (error) {
      console.error("Error updating theme:", error);

      return {
        success: false,
        error: error.message
      };
    }
  };

  // ====================
  // Load schedule on mount
  // ====================

  useEffect(() => {
    if (token) {
      fetchSchedule();
    } else {
      setLoading(false);
    }
  }, [token]);

  return (
    <ScheduleContext.Provider
      value={{
        schedule,
        loading,
        addClass,
        updateClass,
        deleteClass,
        updateTheme,
        fetchSchedule
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule() {
  return useContext(ScheduleContext);
}