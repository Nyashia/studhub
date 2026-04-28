import React from "react";
import { useTasks } from "../context/TaskContext";

function TaskList() {
  const { tasks, loading, deleteTask, toggleComplete, startEdit } = useTasks();

  if (loading) return <p>Loading...</p>;
  if (tasks.length === 0) return <p>No tasks found.</p>;

  return (
    <div>
      {tasks.map((task) => (
        <div
          key={task._id}
          style={{
            border: "1px solid #ccc",
            margin: "10px 0",
            padding: "10px",
            borderRadius: "8px",
            backgroundColor: task.status === "completed" ? "#e8f5e9" : "white",
          }}
        >
          <h4>{task.title}</h4>
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
              {task.status === "completed" ? "Undo" : "Complete"}
            </button>
            <button onClick={() => startEdit(task)}>Edit</button>
            <button onClick={() => deleteTask(task._id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default TaskList;