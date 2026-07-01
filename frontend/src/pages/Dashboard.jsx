import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import { TodoProvider } from "../context/TodoContext.jsx";
import { AssessmentProvider, useAssessments } from "../context/AssessmentContext";
import RightPanel from "../components/dashboard/RightPanel";
import Greeting from "../components/dashboard/Greeting";
import { ScheduleProvider } from "../context/ScheduleContext";
import MonthlyCalendar from "../components/Calendar/MonthlyCalendar";
import WeeklySchedule from "../components/Calendar/WeeklySchedule";
import ViewToggle from "../components/Calendar/ViewToggle";
import MiniTimer from '../components/timer/MiniTimer';

function DashboardContent() {
  const [activeView, setActiveView] = useState("calendar");
  const navigate = useNavigate();
  const { assessments } = useAssessments();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <DashboardLayout rightPanel={<RightPanel />}>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1>Dashboard</h1>
        </div>

        <Greeting userName="Nyashia" />

        <ViewToggle activeView={activeView} setActiveView={setActiveView} />

        {/* Calendar View - Full width calendar, timer underneath */}
        {activeView === "calendar" && (
          <div style={{ marginTop: "20px" }}>
            {/* Calendar full width */}
            <MonthlyCalendar assessments={assessments} />
            
            {/* Timer underneath calendar */}
            <div style={{ marginTop: "24px" }}>
              <MiniTimer />
            </div>
          </div>
        )}

        {/* Schedule View - Full width */}
        {activeView === "schedule" && (
          <div style={{ marginTop: "20px" }}>
            <WeeklySchedule />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function Dashboard() {
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