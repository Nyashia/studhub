import React, { useEffect, useState } from "react";
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
    resetForm
  } = useAssessments();

  const [isOpen, setIsOpen] = useState(false);

  // Open the form automatically when editing
  useEffect(() => {
    if (editingAssessment) {
      setIsOpen(true);
    }
  }, [editingAssessment]);

  // Handle creating or updating an assessment
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingAssessment) {
      await updateAssessment(e);
    } else {
      await createAssessment(e);
    }

    setIsOpen(false);
  };

  // Cancel editing and close the form
  const handleCancel = () => {
    resetForm();
    setIsOpen(false);
  };

  // Open/close the form
  const handleToggleForm = () => {
    if (isOpen) {
      resetForm();
    }

    setIsOpen(!isOpen);
  };

  return (
    <div className={styles.formWrapper}>

      {/* ==================== TOGGLE BUTTON ==================== */}

      <button
        className={styles.toggleFormBtn}
        onClick={handleToggleForm}
      >
        {isOpen ? "− Close" : "+ Add New Assessment"}
      </button>

      {/* ==================== ASSESSMENT FORM ==================== */}

      {isOpen && (
        <form onSubmit={handleSubmit} className={styles.form}>

          <h3>
            {editingAssessment
              ? "Edit Assessment"
              : "Add New Assessment"}
          </h3>

          {/* Name + Subject */}
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

          {/* Due Date */}
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          {/* Assessment Type */}
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="exam">Exam</option>
            <option value="assignment">Assignment</option>
            <option value="test">Test</option>
            <option value="lab">Lab</option>
          </select>

          {/* Notes */}
          <textarea
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows="3"
          />

          {/* ==================== ACTIONS ==================== */}

          <div className={styles.formActions}>
            <button type="submit">
              {editingAssessment ? "Update" : "Add"} Assessment
            </button>

            {editingAssessment && (
              <button
                type="button"
                className={styles.cancel}
                onClick={handleCancel}
              >
                Cancel
              </button>
            )}
          </div>

        </form>
      )}

    </div>
  );
};

export default AssessmentForm;