import React from "react";
import { useTasks } from "../context/TaskContext";

function SearchFilter() {
  const { search, setSearch, filter, setFilter } = useTasks();

  return (
    <div>
      <input
        type="text"
        placeholder="Search tasks..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
      />
      <div style={{ display: "flex", gap: "10px" }}>
        <button onClick={() => setFilter("all")} style={{ background: filter === "all" ? "#007bff" : "#ccc" }}>
          All
        </button>
        <button onClick={() => setFilter("pending")} style={{ background: filter === "pending" ? "#007bff" : "#ccc" }}>
          Pending
        </button>
        <button onClick={() => setFilter("completed")} style={{ background: filter === "completed" ? "#007bff" : "#ccc" }}>
          Completed
        </button>
      </div>
    </div>
  );
}

export default SearchFilter;