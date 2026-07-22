import React, { useState } from "react";
import { useAssessments } from "../context/AssessmentContext";

const AssessmentList = () => {
  const { assessments, loading, deleteAssessment, startEdit } = useAssessments();
  const [filter, setFilter] = useState("all");

  const getPriorityColor = (date, completed) => {
    if (completed) return "#ccc";
    const today = new Date();
    const dueDate = new Date(date);
    const daysUntil = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 0) return "#ff4444";
    if (daysUntil <= 3) return "#ffa500";
    return "#4CAF50";
  };

  const getTypeIcon = (type) => {
    const icons = {
      exam: "",
      assignment: "",
      test: "",
      lab: ""
    };
    return icons[type] ;
  };

  const filteredAssessments = assessments.filter(assessment => {
    if (filter === "upcoming") {
      return !assessment.completed && new Date(assessment.date) >= new Date();
    }
    if (filter === "completed") return assessment.completed;
    return true;
  });

  const sortedAssessments = [...filteredAssessments].sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );

  if (loading) {
    return <p>Loading assessments...</p>;
  }

  return (
    <div>
      <div style={{
        display: "flex",
        gap: "10px",
        marginBottom: "20px",
        padding: "10px",
        background: "#f5f5f5",
        borderRadius: "8px"
      }}>
        <button
          onClick={() => setFilter("all")}
          style={{
            padding: "6px 12px",
            background: filter === "all" ? "#2196F3" : "#ddd",
            color: filter === "all" ? "white" : "#333",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          All
        </button>
        <button
          onClick={() => setFilter("upcoming")}
          style={{
            padding: "6px 12px",
            background: filter === "upcoming" ? "#2196F3" : "#ddd",
            color: filter === "upcoming" ? "white" : "#333",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Upcoming
        </button>
        <button
          onClick={() => setFilter("completed")}
          style={{
            padding: "6px 12px",
            background: filter === "completed" ? "#2196F3" : "#ddd",
            color: filter === "completed" ? "white" : "#333",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Completed
        </button>
      </div>

      {sortedAssessments.length === 0 ? (
        <p style={{ textAlign: "center", color: "#666", padding: "40px" }}>
          No assessments found. Add one above!
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {sortedAssessments.map((assessment) => {
            const dueDate = new Date(assessment.date);
            const today = new Date();
            const isOverdue = !assessment.completed && dueDate < today;
            
            return (
              <div
                key={assessment._id}
                style={{
                  padding: "15px",
                  background: assessment.completed ? "#f5f5f5" : "white",
                  borderRadius: "8px",
                  borderLeft: `4px solid ${getPriorityColor(assessment.date, assessment.completed)}`,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  opacity: assessment.completed ? 0.7 : 1
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: "0 0 8px 0" }}>
                      {getTypeIcon(assessment.type)} {assessment.name}
                      {assessment.completed && " ✓"}
                    </h4>
                    
                    <p style={{ margin: "4px 0", color: "#666", fontSize: "14px" }}>
                      {assessment.subject}
                    </p>
                    
                    <p style={{ margin: "4px 0", fontSize: "14px" }}>
                      Due: {dueDate.toLocaleDateString()}
                      {isOverdue && (
                        <span style={{ color: "#ff4444", marginLeft: "10px" }}>
                           Overdue!
                        </span>
                      )}
                    </p>
                    
                    {assessment.notes && (
                      <p style={{ margin: "8px 0 0 0", fontSize: "13px", color: "#888" }}>
                        {assessment.notes}
                      </p>
                    )}
                  </div>
                  
                  <div style={{ display: "flex", gap: "8px", marginLeft: "15px" }}>
                    {!assessment.completed && (
                      <button
                        onClick={() => startEdit(assessment)}
                        style={{
                          padding: "6px 12px",
                          background: "#2196F3",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px"
                        }}
                      >
                        Edit
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete "${assessment.name}"?`)) {
                          deleteAssessment(assessment._id);
                        }
                      }}
                      style={{
                        padding: "6px 12px",
                        background: "#ff4444",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px"
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AssessmentList;