import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout.jsx";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [editingTaskId, setEditingTaskId] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    const fetchTasks = async () => {
      try {
        const res = await fetch("http://localhost:5000/task", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setTasks(data);
      } catch (error) {
        console.error(error);
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

  const handleCreateTask = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:5000/task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          dueDate,
          status: "pending",
        }),
      });

      const newTask = await res.json();
      if (!res.ok) throw new Error(newTask.message);

      setTasks((prev) => [newTask, ...prev]);
      setTitle("");
      setDescription("");
      setDueDate("");
    } catch (error) {
      console.error(error);
    }
  };

  const deleteTask = async (id) => {
    const token = localStorage.getItem("token");

    try {
      await fetch(`http://localhost:5000/task/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      setTasks((prev) => prev.filter((task) => task._id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const toggleComplete = async (task) => {
    const token = localStorage.getItem("token");
    const newStatus =
      task.status === "completed" ? "pending" : "completed";

    try {
      const res = await fetch(
        `http://localhost:5000/task/${task._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const updatedTask = await res.json();

      setTasks((prev) =>
        prev.map((t) =>
          t._id === updatedTask._id ? updatedTask : t
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (task) => {
    setEditingTaskId(task._id);
    setTitle(task.title);
    setDescription(task.description);
    setDueDate(task.dueDate?.split("T")[0] || "");
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `http://localhost:5000/task/${editingTaskId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            description,
            dueDate,
          }),
        }
      );

      const updatedTask = await res.json();

      setTasks((prev) =>
        prev.map((t) =>
          t._id === updatedTask._id ? updatedTask : t
        )
      );

      setEditingTaskId(null);
      setTitle("");
      setDescription("");
      setDueDate("");
    } catch (error) {
      console.error(error);
    }
  };

  const filteredTasks = tasks
    .filter((task) =>
      task.title.toLowerCase().includes(search.toLowerCase())
    )
    .filter((task) =>
      filter === "all" ? true : task.status === filter
    );

  return (
    <DashboardLayout>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>Dashboard</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <h2>Hey Nyashia 👋</h2>

      {/* CREATE / EDIT FORM */}
      <section style={{ marginTop: "20px" }}>
        <h3>{editingTaskId ? "Edit Task" : "Create Task"}</h3>
        <form
          onSubmit={editingTaskId ? handleUpdateTask : handleCreateTask}
        >
          <input
            type="text"
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <br />
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <br />
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <br />
          <button type="submit">
            {editingTaskId ? "Update Task" : "Add Task"}
          </button>
        </form>
      </section>

      {/* SEARCH + FILTER */}
      <section style={{ marginTop: "30px" }}>
        <input
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div style={{ marginTop: "10px" }}>
          <button onClick={() => setFilter("all")}>All</button>
          <button onClick={() => setFilter("pending")}>
            Pending
          </button>
          <button onClick={() => setFilter("completed")}>
            Completed
          </button>
        </div>
      </section>

      {/* TASK LIST */}
      <section style={{ marginTop: "20px" }}>
        {loading ? (
          <p>Loading...</p>
        ) : filteredTasks.length === 0 ? (
          <p>No tasks found.</p>
        ) : (
          <div style={{ marginTop: "20px" }}>
            {filteredTasks.map((task) => (
              <div
                key={task._id}
                style={{
                  border: "1px solid #ccc",
                  padding: "15px",
                  marginBottom: "10px",
                  borderRadius: "8px",
                }}
              >
                <h4
                  style={{
                    textDecoration:
                      task.status === "completed"
                        ? "line-through"
                        : "none",
                  }}
                >
                  {task.title}
                </h4>

                <p>{task.description}</p>
                <small>
                  Due:{" "}
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString()
                    : "No date"}
                </small>
                <br />
                <small>Status: {task.status}</small>

                <div style={{ marginTop: "10px" }}>
                  <button onClick={() => toggleComplete(task)}>
                    {task.status === "completed"
                      ? "Undo"
                      : "Complete"}
                  </button>

                  <button
                    onClick={() => handleEdit(task)}
                    style={{ marginLeft: "10px" }}
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteTask(task._id)}
                    style={{ marginLeft: "10px" }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}

export default Dashboard;