import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout.jsx";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Protect route + Fetch tasks
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    const fetchTasks = async () => {
      try {
        const res = await fetch("http://localhost:5000/task", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch tasks");
        }

        setTasks(data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // Frontend search filter
  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      
      {/* Top Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Dashboard</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>

      {/* Search Bar */}
      <section className="search-bar">
        <input
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", padding: "8px", margin: "20px 0" }}
        />
      </section>

      {/* Greeting */}
      <section className="greeting">
        <h2>Hey Nyashia 👋</h2>
        <p>Welcome back — let’s get productive.</p>
      </section>

      {/* Task List */}
      <section>
        <h3>Your Tasks</h3>

        {loading ? (
          <p>Loading tasks...</p>
        ) : filteredTasks.length === 0 ? (
          <p>No tasks found.</p>
        ) : (
          <ul style={{ marginTop: "15px" }}>
            {filteredTasks.map((task) => (
              <li
                key={task._id}
                style={{
                  padding: "10px",
                  border: "1px solid #ccc",
                  marginBottom: "10px",
                  borderRadius: "6px",
                }}
              >
                <strong>{task.title}</strong>
                <p>{task.description}</p>
                <small>Status: {task.status}</small>
              </li>
            ))}
          </ul>
        )}
      </section>

    </DashboardLayout>
  );
}

export default Dashboard;