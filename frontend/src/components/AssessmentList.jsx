import React, { useState } from "react";
import { useAssessments } from "../context/AssessmentContext";
import styles from "../styles/assessments.module.css";

const AssessmentList = () => {
  const {
    assessments,
    loading,
    deleteAssessment,
    startEdit,
    completeAssessment
  } = useAssessments();

  const [filter, setFilter] = useState("all");

  // ==================== HELPERS ====================

  // Determine the priority color based on how soon
  // the assessment is due.
  const getPriorityColor = (date, completed) => {
    if (completed) {
      return "#ccc";
    }

    const today = new Date();
    const dueDate = new Date(date);

    const daysUntil = Math.ceil(
      (dueDate - today) / (1000 * 60 * 60 * 24)
    );

    if (daysUntil < 0) {
      return "#ff4444";
    }

    if (daysUntil <= 3) {
      return "#ffa500";
    }

    return "#4CAF50";
  };


  // ==================== ACTIONS ====================

  // Mark an assessment as completed.
  const handleComplete = async (assessment) => {
    const confirmed = window.confirm(
      `Mark "${assessment.name}" as completed?`
    );

    if (!confirmed) {
      return;
    }

    await completeAssessment(assessment._id);
  };

  // ==================== FILTERING ====================

  const filteredAssessments = assessments.filter((assessment) => {
    if (filter === "upcoming") {
      return (
        !assessment.completed &&
        new Date(assessment.date) >= new Date()
      );
    }

    if (filter === "completed") {
      return assessment.completed;
    }

    return true;
  });

  // Sort assessments by due date.
  const sortedAssessments = [...filteredAssessments].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  // ==================== LOADING ====================

  if (loading) {
    return (
      <div className={styles.empty}>
        Loading assessments...
      </div>
    );
  }

  // ==================== RENDER ====================

  return (
    <div>

      {/* ==================== FILTERS ==================== */}

      <div className={styles.filters}>
        <button
          onClick={() => setFilter("all")}
          className={filter === "all" ? styles.active : ""}
        >
          All
        </button>

        <button
          onClick={() => setFilter("upcoming")}
          className={filter === "upcoming" ? styles.active : ""}
        >
          Upcoming
        </button>

        <button
          onClick={() => setFilter("completed")}
          className={filter === "completed" ? styles.active : ""}
        >
          Completed
        </button>
      </div>

      {/* ==================== EMPTY STATE ==================== */}

      {sortedAssessments.length === 0 ? (
        <div className={styles.empty}>
          No assessments found. Add one above!
        </div>
      ) : (

        /* ==================== ASSESSMENT LIST ==================== */

        <div className={styles.list}>
          {sortedAssessments.map((assessment) => {
            const dueDate = new Date(assessment.date);
            const today = new Date();

            const isOverdue =
              !assessment.completed &&
              dueDate < today;

            return (
              <div
                key={assessment._id}
                className={styles.card}
                style={{
                  borderLeft: `4px solid ${getPriorityColor(
                    assessment.date,
                    assessment.completed
                  )}`,
                  opacity: assessment.completed ? 0.7 : 1
                }}
              >

                {/* ==================== INFORMATION ==================== */}

                <div className={styles.info}>
                  <h4>
                    {getTypeIcon(assessment.type)}{" "}
                    {assessment.name}

                    {assessment.completed && " ✓"}
                  </h4>

                  <div className={styles.subject}>
                    {assessment.subject}
                  </div>

                  <div className={styles.meta}>
                    Due: {dueDate.toLocaleDateString()}

                    {isOverdue && (
                      <span className={styles.overdue}>
                        {" "}Overdue!
                      </span>
                    )}
                  </div>

                  {assessment.notes && (
                    <div className={styles.meta}>
                      {assessment.notes}
                    </div>
                  )}
                </div>

                {/* ==================== ACTIONS ==================== */}

                <div className={styles.actions}>

                  {/* Edit */}
                  <button
                    className={styles.edit}
                    onClick={() => startEdit(assessment)}
                  >
                    Edit
                  </button>

                  {/* Complete */}
                  {!assessment.completed && (
                    <button
                      className={styles.complete}
                      onClick={() => handleComplete(assessment)}
                    >
                      ✓ Complete
                    </button>
                  )}

                  {/* Delete */}
                  <button
                    className={styles.delete}
                    onClick={() => {
                      const confirmed = window.confirm(
                        `Delete "${assessment.name}"?`
                      );

                      if (confirmed) {
                        deleteAssessment(assessment._id);
                      }
                    }}
                  >
                    Delete
                  </button>

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