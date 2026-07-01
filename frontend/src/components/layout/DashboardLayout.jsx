import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "../../styles/dashboard.module.css";

const DashboardLayout = ({ children, rightPanel }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/assessments", label: "Assessments"},
    { path: "/study-buddy", label: "Study Buddy" },
    { path: "/study-space", label: "Study Space" },
  ];

  return (
    <div className={styles.dashboard}>
      <div className={styles.container}>
        
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.logo}>
            <h2>StudHub</h2>
            <p>study companion</p>
          </div>

          <nav className={styles.nav}>
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`${styles.navItem} ${
                  location.pathname === item.path ? styles.navItemActive : ""
                }`}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
            
            <button
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/login");
              }}
              className={`${styles.navItem} ${styles.logoutBtn}`}
            >
              <span>Logout</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className={styles.mainContent}>
          <div className={styles.contentCard}>
            {children}
          </div>
        </main>

        {/* Right Panel */}
        {rightPanel && (
          <aside className={styles.rightPanel}>
            <div className={styles.rightPanelSticky}>
              {rightPanel}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default DashboardLayout;