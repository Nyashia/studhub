import React, { createContext, useContext, useState, useEffect } from "react";

const ScheduleContext = createContext();

export function ScheduleProvider({ children }) {
  const [schedule, setSchedule] = useState({ classes: [], theme: 'default' });
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  const fetchSchedule = async () => {
    try {
      const res = await fetch("http://localhost:5000/schedule", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setSchedule(data);
    } catch (error) {
      console.error("Error fetching schedule:", error);
    } finally {
      setLoading(false);
    }
  };

  const addClass = async (classData) => {
    try {
      const res = await fetch("http://localhost:5000/schedule/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(classData)
      });
      const data = await res.json();
      setSchedule(data);
      return { success: true };
    } catch (error) {
      console.error("Error adding class:", error);
      return { success: false, error: error.message };
    }
  };

  const updateClass = async (classId, classData) => {
    try {
      const res = await fetch(`http://localhost:5000/schedule/classes/${classId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(classData)
      });
      const data = await res.json();
      setSchedule(data);
      return { success: true };
    } catch (error) {
      console.error("Error updating class:", error);
      return { success: false, error: error.message };
    }
  };

  const deleteClass = async (classId) => {
    try {
      const res = await fetch(`http://localhost:5000/schedule/classes/${classId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setSchedule(data);
      return { success: true };
    } catch (error) {
      console.error("Error deleting class:", error);
      return { success: false, error: error.message };
    }
  };

  const updateTheme = async (theme) => {
    try {
      const res = await fetch("http://localhost:5000/schedule/theme", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ theme })
      });
      const data = await res.json();
      setSchedule(data);
      return { success: true };
    } catch (error) {
      console.error("Error updating theme:", error);
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    if (token) {
      fetchSchedule();
    }
  }, [token]);

  return (
    <ScheduleContext.Provider value={{
      schedule,
      loading,
      addClass,
      updateClass,
      deleteClass,
      updateTheme,
      fetchSchedule
    }}>
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule() {
  return useContext(ScheduleContext);
}