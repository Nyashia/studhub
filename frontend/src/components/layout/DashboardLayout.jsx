import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/global.css";
import "../../styles/dashboard.css";


const DashboardLayout = ({ children, rightPanel }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const iconStyle = { color: "rgb(18, 63, 95)", marginRight: "0.5em" };
  
  // Navigation items configuration
  const navItems = [
    { path: "/dashboard", label: "home", icon: "fa-house" },
    { path: "/assessments", label: "assessments", icon: "fa-graduation-cap" },
    { path: "/topics", label: "topics", icon: "fa-list" },
    { path: "/study", label: "study", icon: "fa-book" },
    { path: "/accountability", label: "accountability buddy", icon: "fa-children" },
    { path: "/settings", label: "settings", icon: "fa-gear" }
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="dashboard">
      {/* LEFT SIDEBAR */}
      <aside className="sidebar">
        <h2>StudHub</h2>
        <ul>
          {navItems.map((item) => (
            <li 
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={location.pathname === item.path ? "active" : ""}
              style={{ 
                cursor: "pointer",
                backgroundColor: location.pathname === item.path ? "#e8f0fe" : "transparent",
                padding: "8px",
                borderRadius: "6px"
              }}
            >
              <i className={`fa-solid ${item.icon}`} style={iconStyle}></i>
              {item.label}
            </li>
          ))}
        </ul>
      </aside>

      {/* MAIN CONTENT + RIGHT PANEL*/}
      <div className="main-area">
        <main className="content">
          {children}
        </main>
        {rightPanel && (
          <aside className="right-panel">
            {rightPanel}
          </aside>
        )}
      </div>
    </div>
  );
};

export default DashboardLayout;