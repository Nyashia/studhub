import React, { useState } from "react";
import { useTodos } from "../../context/TodoContext";
import { useAssessments } from "../../context/AssessmentContext";
import styles from "../../styles/dashboard.module.css";

function RightPanel() {
  const [newTodo, setNewTodo] = useState("");
  const { todos, addTodo, toggleTodo, deleteTodo } = useTodos();
  const { assessments } = useAssessments();

  const handleAddTodo = () => {
    if (newTodo.trim()) {
      addTodo(newTodo);
      setNewTodo("");
    }
  };

  // Get today's date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  // Filter assessments due today
  const dueToday = assessments.filter(assessment => {
    if (!assessment.date || assessment.completed) return false;
    const dueDate = new Date(assessment.date);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() === today.getTime();
  });

  // Filter upcoming assessments
  const upcomingThisWeek = assessments.filter(assessment => {
    if (!assessment.date || assessment.completed) return false;
    const dueDate = new Date(assessment.date);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate > today && dueDate <= nextWeek;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className={styles.rightPanelCard}>
      {/* Due Today Section */}
      <div>
        <h4 className={styles.rightPanelTitle}>
          <span></span> Due Today
        </h4>
        {dueToday.length === 0 ? (
          <p className={styles.emptyState}>No assessments due today! 🎉</p>
        ) : (
          dueToday.map(assessment => (
            <div key={assessment._id} className={styles.dueTodayItem}>
              <div className={styles.dueTodayName}>{assessment.name}</div>
              <div className={styles.dueTodaySubject}>{assessment.subject}</div>
              <div className={styles.dueTodayBadge}>⚠️ Due today!</div>
            </div>
          ))
        )}
      </div>

      {/* Divider */}
      <div className={styles.divider}></div>

      {/* Upcoming Section */}
      <div>
        <h4 className={styles.rightPanelTitle}>
          <span></span> Upcoming This Week
        </h4>
        {upcomingThisWeek.length === 0 ? (
          <p className={styles.emptyState}>No upcoming assessments this week</p>
        ) : (
          upcomingThisWeek.map(assessment => (
            <div key={assessment._id} className={styles.upcomingItem}>
              <div className={styles.upcomingName}>{assessment.name}</div>
              <div className={styles.upcomingSubject}>{assessment.subject}</div>
              <div className={styles.upcomingDate}> {formatDate(assessment.date)}</div>
            </div>
          ))
        )}
      </div>

      {/* Divider */}
      <div className={styles.divider}></div>

      {/* Quick To-Do Section */}
      <div>
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
            className={styles.todoInputField}
          />
          <button onClick={handleAddTodo} className={styles.todoAddBtn}>
            Add
          </button>
        </div>

        {todos.length === 0 ? (
          <p className={styles.emptyState}>No tasks. Add one above!</p>
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
    </div>
  );
}

export default RightPanel;