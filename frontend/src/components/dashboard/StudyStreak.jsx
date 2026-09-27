import React, { useState, useEffect } from "react";

const StudyStreak = () => {
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/study/streak", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setStreak(data.streak || 0);
      } catch (error) {
        console.error("Error fetching streak:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStreak();
  }, []);

  if (loading) {
    return <div style={{ fontSize: "14px", color: "#6b6560" }}>Loading...</div>;
  }

  return (
    <div style={{
      background: "#fdf0ea",
      borderRadius: "12px",
      padding: "16px 20px",
      display: "flex",
      alignItems: "center",
      gap: "16px",
      marginBottom: "24px"
    }}>
      <span style={{ fontSize: "28px" }}></span>
      <div>
        <div style={{ fontSize: "20px", fontWeight: "600", color: "#1e1a16" }}>
          {streak} Day{streak !== 1 ? "s" : ""}
        </div>
        <div style={{ fontSize: "13px", color: "#6b6560" }}>
          {streak === 0 ? "Start your streak today!" : "Keep it going! "}
        </div>
      </div>
    </div>
  );
};

export default StudyStreak;