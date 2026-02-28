import React from "react";
import DashboardLayout from "../components/layout/DashboardLayout.jsx";

function Dashboard() {
  return (
    <DashboardLayout>
      {/* Search bar */}
      <section className="search-bar">
        <input type="text" placeholder="Search tasks, topics..." />
      </section>

      <section className="greeting">
        <h2>Hey Nyashia!</h2>
        <p>Welcome back </p>
      </section>

      


    </DashboardLayout>
  );
}

export default Dashboard;