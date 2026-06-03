import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Assessments from "./pages/Assessments";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Loading component while checking auth
const LoadingScreen = () => (
  <div style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    fontSize: "18px",
    color: "#666"
  }}>
    Loading...
  </div>
);

// Protected Route component with token validation
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const token = localStorage.getItem("token");

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

  // Show loading while checking auth
  if (isAuthenticated === null) {
    return <LoadingScreen />;
  }

  // Not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated, show the protected page
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected routes */}
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
        
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Catch all - 404 page */}
        <Route path="*" element={
          <div style={{ textAlign: "center", marginTop: "100px" }}>
            <h1>404</h1>
            <p>Page not found</p>
            <a href="/login">Go to Login</a>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;