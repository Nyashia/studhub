import React, { useState } from "react";
import { useTodos } from "../../context/TodoContext";

function RightPanel() {
  const [newTodo, setNewTodo] = useState("");
  const { todos, addTodo, toggleTodo, deleteTodo } = useTodos();

  const handleAddTodo = () => {
    if (newTodo.trim()) {
      addTodo(newTodo);
      setNewTodo("");
    }
  };

  return (
    <div style={{
      width: "300px",
      background: "white",
      padding: "20px",
      borderRadius: "8px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
    }}>
      
      <div>
        <h4>✅ Quick To-Do</h4>
        
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddTodo()}
            placeholder="Add a quick task..."
            style={{ flex: 1, padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
          />
          <button onClick={handleAddTodo} style={{ padding: "8px 12px", background: "#4CAF50", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
            Add
          </button>
        </div>

        {todos.length === 0 ? (
          <p style={{ color: "#999", fontSize: "14px" }}>No tasks. Add one above!</p>
        ) : (
          todos.map(todo => (
            <div key={todo._id} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px", marginBottom: "6px", background: "#f9f9f9", borderRadius: "4px" }}>
              <input type="checkbox" checked={todo.completed} onChange={() => toggleTodo(todo._id, todo.completed)} />
              <span style={{ flex: 1, textDecoration: todo.completed ? "line-through" : "none" }}>{todo.text}</span>
              <button onClick={() => deleteTodo(todo._id)} style={{ background: "none", border: "none", color: "#ff4444", cursor: "pointer", fontSize: "18px" }}>×</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default RightPanel;