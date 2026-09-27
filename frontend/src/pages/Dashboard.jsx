import React, { useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { TodoProvider } from "../context/TodoContext.jsx";
import { AssessmentProvider, useAssessments } from "../context/AssessmentContext";
import RightPanel from "../components/dashboard/RightPanel";
import Greeting from "../components/dashboard/Greeting";
import { ScheduleProvider } from "../context/ScheduleContext";
import MonthlyCalendar from "../components/Calendar/MonthlyCalendar";
import WeeklySchedule from "../components/Calendar/WeeklySchedule";
import ViewToggle from "../components/Calendar/ViewToggle";
import StudyStreak from "../components/dashboard/StudyStreak";

function DashboardContent() {
  // ========== STATE ==========

  const [activeView, setActiveView] = useState("calendar");
  const { assessments } = useAssessments();

  // ========== USER DATA ==========

  const userName = localStorage.getItem("userName") || "Student";

  // ========== UI ==========

  return (
    <DashboardLayout rightPanel={<RightPanel />}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px"
        }}
      >

        {/* Header */}

        <h1
          style={{
            fontSize: "24px",
            fontWeight: "600",
            color: "#1e1a16"
          }}
        >
          Dashboard
        </h1>

        {/* Greeting */}

        <Greeting userName={userName} />

        {/* Study Streak */}

        <StudyStreak />

        {/* View Toggle */}

        <ViewToggle
          activeView={activeView}
          setActiveView={setActiveView}
        />

        {/* Calendar View */}

        {activeView === "calendar" && (
          <div style={{ marginTop: "8px" }}>
            <MonthlyCalendar assessments={assessments} />
          </div>
        )}

        {/* Schedule View */}

        {activeView === "schedule" && (
          <div style={{ marginTop: "8px" }}>
            <WeeklySchedule />
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}

function Dashboard() {
  // ========== PROVIDERS ==========

  return (
    <TodoProvider>
      <AssessmentProvider>
        <ScheduleProvider>
          <DashboardContent />
        </ScheduleProvider>
      </AssessmentProvider>
    </TodoProvider>
  );
}

export default Dashboard;
