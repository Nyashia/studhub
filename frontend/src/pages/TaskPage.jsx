import React, { useState, useEffect } from "react";
import TaskForm from "../components/TaskForm";

function TaskPage() {
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null); 

  // Fetch all tasks on page load
  useEffect(() => {
    fetch("http://localhost:5000/task")
      .then((res) => res.json())
      .then((data) => setTasks(data))
      .catch((err) => console.error("Error fetching tasks:", err));
  }, []);

  // Handle Add or Edit
  const handleFormSubmit = async (taskData) => {
    try {
      let res, savedTask;

      if (editingTask) {
        // Edit existing task
        
        res = await fetch(`http://localhost:5000/task/${editingTask._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskData),
        });
        savedTask = await res.json();

        // Update tasks list
        setTasks((prevTasks) =>
          prevTasks.map((t) => (t._id === savedTask._id ? savedTask : t))
        );
        setEditingTask(null); 
      } else {
        // Add new task
        res = await fetch("http://localhost:5000/task", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskData),
        });
        savedTask = await res.json();

        setTasks((prevTasks) => [...prevTasks, savedTask]);
      }
    } catch (err) {
      console.error("Error saving task:", err);
    }
  };

  // Click Edit button
  const handleEditClick = (task) => {
    setEditingTask(task);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingTask(null);
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "1rem" }}>
      <h1>{editingTask ? "Edit Task" : "Add Task"}</h1>

      <TaskForm
        initialData={editingTask || {}}
        onSubmit={handleFormSubmit}
      />

      {editingTask && (
        <button onClick={handleCancelEdit} style={{ marginTop: "0.5rem" }}>
          Cancel Edit
        </button>
      )}

      <h2 style={{ marginTop: "2rem" }}>All Tasks</h2>
      {tasks.length === 0 ? (
        <p>No tasks yet!</p>
      ) : (
        <ul>
          {tasks.map((task) => (
            <li key={task._id} style={{ marginBottom: "0.5rem" }}>
              <strong>{task.title}</strong> - {task.status} - {task.dueDate}
              <button
                onClick={() => handleEditClick(task)}
                style={{ marginLeft: "1rem" }}
              >
                Edit
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default TaskPage;