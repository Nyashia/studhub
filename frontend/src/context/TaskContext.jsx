import React, { createContext, useContext, useState, useEffect } from "react";

const TaskContext = createContext();

export function TaskProvider({ children }) {
  // Core state
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [editingTask, setEditingTask] = useState(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  const token = localStorage.getItem("token");

  // Fetch all tasks
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

  // Run once on load
  useEffect(() => {
    fetchTasks();
  }, []);

  // Create new task
  const createTask = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description, dueDate, status: "pending" }),
      });

      const newTask = await res.json();
      if (!res.ok) throw new Error(newTask.message);

      setTasks((prev) => [newTask, ...prev]); // add to top
      setTitle("");
      setDescription("");
      setDueDate("");
    } catch (error) {
      console.error(error);
    }
  };

  // Update existing task
  const updateTask = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `http://localhost:5000/task/${editingTask._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ title, description, dueDate }),
        }
      );

      const updatedTask = await res.json();
      setTasks((prev) =>
        prev.map((t) => (t._id === updatedTask._id ? updatedTask : t))
      );

      resetForm();
    } catch (error) {
      console.error(error);
    }
  };

  // Delete task
  const deleteTask = async (id) => {
    try {
      await fetch(`http://localhost:5000/task/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  // Toggle completed/pending
  const toggleComplete = async (task) => {
    const newStatus = task.status === "completed" ? "pending" : "completed";

    try {
      const res = await fetch(`http://localhost:5000/task/${task._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const updatedTask = await res.json();
      setTasks((prev) =>
        prev.map((t) => (t._id === updatedTask._id ? updatedTask : t))
      );
    } catch (error) {
      console.error(error);
    }
  };

  // Start editing (fill form)
  const startEdit = (task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setDueDate(task.dueDate?.split("T")[0] || "");
  };

  // Reset form
  const resetForm = () => {
    setEditingTask(null);
    setTitle("");
    setDescription("");
    setDueDate("");
  };

  // Apply search + filter
  const filteredTasks = tasks
    .filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
    .filter((t) => (filter === "all" ? true : t.status === filter));

  return (
    <TaskContext.Provider
      value={{
        tasks: filteredTasks,
        allTasks: tasks,
        loading,
        search,
        setSearch,
        filter,
        setFilter,
        editingTask,
        title,
        setTitle,
        description,
        setDescription,
        dueDate,
        setDueDate,
        createTask,
        updateTask,
        deleteTask,
        toggleComplete,
        startEdit,
        resetForm,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

// Custom hook for easier access
export function useTasks() {
  return useContext(TaskContext);
}