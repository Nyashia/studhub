import React from "react";
import { useAssessments } from "../context/AssessmentContext";

const AssessmentForm = () => {
  const {
    editingAssessment,
    name,
    setName,
    subject,
    setSubject,
    date,
    setDate,
    notes,
    setNotes,
    type,
    setType,
    createAssessment,
    updateAssessment,
    resetForm,
  } = useAssessments();

  const handleSubmit = async (e) => {
    if (editingAssessment) {
      await updateAssessment(e);
    } else {
      await createAssessment(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{
      background: "white",
      padding: "20px",
      borderRadius: "8px",
      marginBottom: "20px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
    }}>
      <h3>{editingAssessment ? "Edit Assessment" : "Add New Assessment"}</h3>
      
      <div style={{ marginBottom: "12px" }}>
        <input
          name="name"
          placeholder="Assessment name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
        />
      </div>
      
      <div style={{ marginBottom: "12px" }}>
        <input
          name="subject"
          placeholder="Subject *"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
        />
      </div>
      
      <div style={{ marginBottom: "12px" }}>
        <input
          name="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
        />
      </div>
      
      <div style={{ marginBottom: "12px" }}>
        <select
          name="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
        >
          <option value="exam">📝 Exam</option>
          <option value="assignment">📄 Assignment</option>
          <option value="test">✏️ Test</option>
          <option value="lab">🔬 Lab</option>
        </select>
      </div>
      
      <div style={{ marginBottom: "12px" }}>
        <textarea
          name="notes"
          placeholder="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows="3"
          style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
        />
      </div>
      
      <div style={{ display: "flex", gap: "10px" }}>
        <button 
          type="submit"
          style={{
            padding: "10px 20px",
            background: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          {editingAssessment ? "Update" : "Add"} Assessment
        </button>
        
        {editingAssessment && (
          <button
            type="button"
            onClick={resetForm}
            style={{
              padding: "10px 20px",
              background: "#666",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default AssessmentForm;