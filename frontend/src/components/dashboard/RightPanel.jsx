import React, { useState } from "react";
import { useTodos } from "../../context/TodoContext";

function RightPanel({ tasks = [] }) {
  const [newTodo, setNewTodo] = useState("");
  const { todos, addTodo, toggleTodo, deleteTodo } = useTodos();

  // Add a new todo
  const handleAddTodo = () => {
    if (newTodo.trim()) {
      addTodo(newTodo);
      setNewTodo("");
    }
  };

  // Get upcoming tasks (next 7 days)
  const getUpcomingTasks = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    return tasks
      .filter(task => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return task.status !== "completed" && dueDate >= today && dueDate <= nextWeek;
      })
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5);
  };

  const upcomingTasks = getUpcomingTasks();

  return (
    <div style={{
      width: "300px",
      background: "white",
      padding: "20px",
      borderRadius: "8px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
    }}>
      
      {/*  Upcoming Tasks */}
      <div style={{ marginBottom: "30px" }}>
        <h4> Upcoming Tasks</h4>
        {upcomingTasks.length === 0 ? (
          <p style={{ color: "#999", fontSize: "14px" }}>No upcoming tasks</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {upcomingTasks.map(task => {
              const dueDate = new Date(task.dueDate);
              const today = new Date();
              const isToday = dueDate.toDateString() === today.toDateString();
              
              return (
                <li key={task._id} style={{ 
                  margin: "10px 0", 
                  padding: "8px", 
                  background: isToday ? "#e8f5e9" : "#f9f9f9", 
                  borderRadius: "4px" 
                }}>
                  <strong>{task.title}</strong>
                  <br />
                  <small style={{ color: isToday ? "#4CAF50" : "#666" }}>
                    {isToday ? "Today" : dueDate.toLocaleDateString()}
                  </small>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* To-Do List */}
      <div>
        <h4> To-Do List</h4>
        
        {/* Add todo input */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddTodo()}
            placeholder="Add a task..."
            style={{
              flex: 1,
              padding: "6px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "14px"
            }}
          />
          <button
            onClick={handleAddTodo}
            style={{
              padding: "6px 12px",
              background: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Add
          </button>
        </div>

        {/* Todo list */}
        {todos.length === 0 ? (
          <p style={{ color: "#999", fontSize: "14px" }}>No tasks. Add one above!</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {todos.map(todo => (
              <li key={todo._id} style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px",
                marginBottom: "6px",
                background: "#f9f9f9",
                borderRadius: "4px"
              }}>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo._id, todo.completed)}
                  style={{ cursor: "pointer" }}
                />
                <span style={{
                  flex: 1,
                  textDecoration: todo.completed ? "line-through" : "none",
                  color: todo.completed ? "#999" : "#333",
                  fontSize: "14px"
                }}>
                  {todo.text}
                </span>
                <button
                  onClick={() => deleteTodo(todo._id)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#ff4444",
                    cursor: "pointer",
                    fontSize: "18px"
                  }}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default RightPanel;