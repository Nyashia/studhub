import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Assessments from "./pages/Assessments";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudyBuddy from "./pages/StudyBuddy";
import StudySpace from "./pages/StudySpace";
import StudyRoom from "./pages/StudyRoom";
import Settings from "./pages/Settings";
import { SessionProvider } from "./context/SessionContext";

// ========== LOADING SCREEN ==========

const LoadingScreen = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      fontSize: "18px",
      color: "#666"
    }}
  >
    Loading...
  </div>
);

// ========== PROTECTED ROUTE ==========

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const token = localStorage.getItem("token");

  // ========== VERIFY TOKEN ==========

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        // Try to fetch a protected endpoint to verify token
        const res = await fetch("http://localhost:5000/", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          // Token is invalid or expired
          localStorage.removeItem("token");
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth verification error:", error);
        localStorage.removeItem("token");
        setIsAuthenticated(false);
      }
    };

    verifyToken();
  }, [token]);

  // ========== AUTH CHECK ==========

  if (isAuthenticated === null) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// ========== APP ==========

function App() {
  return (
    <Router>
      <Routes>

        {/* Public Routes */}

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/assessments"
          element={
            <ProtectedRoute>
              <Assessments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/study-buddy"
          element={
            <ProtectedRoute>
              <StudyBuddy />
            </ProtectedRoute>
          }
        />

        <Route
          path="/study-space"
          element={
            <ProtectedRoute>
              <StudySpace />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/study-room/:sessionId"
          element={
            <ProtectedRoute>
              <SessionProvider>
                <StudyRoom />
              </SessionProvider>
            </ProtectedRoute>
          }
        />

        {/* Default Route */}

        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        {/* 404 Route */}

        <Route
          path="*"
          element={
            <div style={{ textAlign: "center", marginTop: "100px" }}>
              <h1>404</h1>
              <p>Page not found</p>
              <a href="/login">Go to Login</a>
            </div>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;