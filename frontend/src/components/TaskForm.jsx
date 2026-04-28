import React from "react";
import { useTasks } from "../context/TaskContext";

function TaskForm() {
  const {
    editingTask,
    title,
    setTitle,
    description,
    setDescription,
    dueDate,
    setDueDate,
    createTask,
    updateTask,
    resetForm,
  } = useTasks();

  return (
    <section style={{ marginTop: "20px" }}>
      <h3>{editingTask ? "Edit Task" : "Create Task"}</h3>
      <form onSubmit={editingTask ? updateTask : createTask}>
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
        <button type="submit">{editingTask ? "Update Task" : "Add Task"}</button>
        {editingTask && <button onClick={resetForm}>Cancel</button>}
      </form>
    </section>
  );
}

export default TaskForm;