import React from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import { TaskProvider, useTasks } from "../context/TaskContext";
import { TodoProvider } from "../context/TodoContext.jsx";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";
import SearchFilter from "../components/SearchFilter";
import RightPanel from "../components/dashboard/RightPanel";
import Greeting from "../components/dashboard/Greeting";

function DashboardContent() {
  const navigate = useNavigate();
  const { tasks } = useTasks();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <DashboardLayout rightPanel={<RightPanel tasks={tasks} />}>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1>Dashboard</h1>
          <button onClick={handleLogout}>Logout</button>
        </div>

        <Greeting userName="Nyashia" />

        <TaskForm />
        <SearchFilter />
        <TaskList />
      </div>
    </DashboardLayout>
  );
}

function Dashboard() {
  return (
    <TaskProvider>
      <TodoProvider>
        <DashboardContent />
      </TodoProvider>
    </TaskProvider>
  );
}

export default Dashboard;