import React from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { AssessmentProvider } from "../context/AssessmentContext";
import AssessmentForm from "../components/AssessmentForm";
import AssessmentList from "../components/AssessmentList";

function AssessmentsContent() {
  return (
    <DashboardLayout>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <h1>📚 Assessments</h1>
        <p style={{ color: "#666", marginBottom: "20px" }}>
          Track your exams, assignments, tests, and labs
        </p>
        
        <AssessmentForm />
        <AssessmentList />
      </div>
    </DashboardLayout>
  );
}

function Assessments() {
  return (
    <AssessmentProvider>
      <AssessmentsContent />
    </AssessmentProvider>
  );
}

export default Assessments;