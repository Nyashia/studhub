import React, { useState } from "react";
import { useTodos } from "../../context/TodoContext";
import styles from "../../styles/dashboard.module.css"; 

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
    <div className={styles.todoCard}>
      <h4 className={styles.todoTitle}>
        <span></span> Quick To-Do
      </h4>
      
      <div className={styles.todoInput}>
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAddTodo()}
          placeholder="Add a task..."
        />
        <button onClick={handleAddTodo} className={styles.todoAddBtn}>
          Add
        </button>
      </div>

      {todos.length === 0 ? (
        <div className={styles.emptyState}>
          No tasks. Add one above!
        </div>
      ) : (
        <div className={styles.todoList}>
          {todos.map(todo => (
            <div key={todo._id} className={styles.todoItem}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo._id, todo.completed)}
                className={styles.todoCheckbox}
              />
              <span className={`${styles.todoText} ${todo.completed ? styles.todoTextCompleted : ""}`}>
                {todo.text}
              </span>
              <button
                onClick={() => deleteTodo(todo._id)}
                className={styles.todoDelete}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RightPanel;