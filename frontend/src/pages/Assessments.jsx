import React from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { AssessmentProvider } from "../context/AssessmentContext";
import AssessmentForm from "../components/AssessmentForm";
import AssessmentList from "../components/AssessmentList";
import styles from "../styles/assessments.module.css";

function AssessmentsContent() {
  // ========== UI ==========

  return (
    <DashboardLayout>
      <div className={styles.container}>

        {/* Header */}

        <div className={styles.header}>
          <h1>Assessments</h1>
          <p>Track your exams, assignments, tests, and labs</p>
        </div>

        {/* Assessment Form */}

        <AssessmentForm />

        {/* Assessment List */}

        <AssessmentList />

      </div>
    </DashboardLayout>
  );
}

function Assessments() {
  // ========== PROVIDERS ==========

  return (
    <AssessmentProvider>
      <AssessmentsContent />
    </AssessmentProvider>
  );
}

export default Assessments;