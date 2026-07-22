import React from "react";
import { useAssessments } from "../context/AssessmentContext";
import styles from "../styles/assessments.module.css";  

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
    e.preventDefault();
    if (editingAssessment) {
      await updateAssessment(e);
    } else {
      await createAssessment(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h3>{editingAssessment ? "Edit Assessment" : "Add New Assessment"}</h3>
      
      <div className={styles.formRow}>
        <input
          type="text"
          placeholder="Assessment name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Subject *"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />
      </div>
      
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />
      
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
      >
        <option value="exam"> Exam</option>
        <option value="assignment"> Assignment</option>
        <option value="test"> Test</option>
        <option value="lab"> Lab</option>
      </select>
      
      <textarea
        placeholder="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows="3"
      />
      
      <div>
        <button type="submit">
          {editingAssessment ? "Update" : "Add"} Assessment
        </button>
        {editingAssessment && (
          <button type="button" className={styles.cancel} onClick={resetForm}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default AssessmentForm;