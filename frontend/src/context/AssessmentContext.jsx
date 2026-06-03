import React, { createContext, useContext, useState, useEffect } from "react";

const AssessmentContext = createContext();

export function AssessmentProvider({ children }) {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Add error state
  const [editingAssessment, setEditingAssessment] = useState(null);
  
  // Form state
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [type, setType] = useState("assignment");

  const token = localStorage.getItem("token");

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("http://localhost:5000/assessments", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Failed to fetch');
      
      const data = await res.json();
      setAssessments(data);
    } catch (error) {
      console.error("Error fetching assessments:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAssessments();
    }
  }, [token]);

  const createAssessment = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/assessments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, subject, date, notes, type })
      });
      
      if (!res.ok) throw new Error('Failed to create');
      
      const newAssessment = await res.json();
      setAssessments((prev) => [...prev, newAssessment]);
      resetForm();
      return { success: true };
    } catch (error) {
      console.error("Error creating assessment:", error);
      return { success: false, error: error.message };
    }
  };

  const updateAssessment = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/assessments/${editingAssessment._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, subject, date, notes, type })
      });
      
      if (!res.ok) throw new Error('Failed to update');
      
      const updatedAssessment = await res.json();
      setAssessments((prev) =>
        prev.map((a) => (a._id === updatedAssessment._id ? updatedAssessment : a))
      );
      resetForm();
      return { success: true };
    } catch (error) {
      console.error("Error updating assessment:", error);
      return { success: false, error: error.message };
    }
  };

  const deleteAssessment = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/assessments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Failed to delete');
      
      setAssessments((prev) => prev.filter((a) => a._id !== id));
      return { success: true };
    } catch (error) {
      console.error("Error deleting assessment:", error);
      return { success: false, error: error.message };
    }
  };

  const startEdit = (assessment) => {
    setEditingAssessment(assessment);
    setName(assessment.name);
    setSubject(assessment.subject);
    setDate(assessment.date?.split("T")[0] || "");
    setNotes(assessment.notes || "");
    setType(assessment.type);
  };

  const resetForm = () => {
    setEditingAssessment(null);
    setName("");
    setSubject("");
    setDate("");
    setNotes("");
    setType("assignment");
  };

  // Get upcoming assessments (next 7 days)
  const getUpcomingAssessments = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    return assessments.filter((assessment) => {
      const assessmentDate = new Date(assessment.date);
      assessmentDate.setHours(0, 0, 0, 0);
      return !assessment.completed && assessmentDate >= today && assessmentDate <= nextWeek;
    });
  };

  // Get assessments by type
  const getByType = (typeFilter) => {
    return assessments.filter((a) => a.type === typeFilter);
  };

  return (
    <AssessmentContext.Provider
      value={{
        assessments,
        loading,
        error,
        editingAssessment,
        name,
        setName,
        subject,
        setSubject,
        date,
        setDate,
        notes,
        setNotes,
        type,
        setType,
        createAssessment,
        updateAssessment,
        deleteAssessment,
        startEdit,
        resetForm,
        getUpcomingAssessments,
        getByType
      }}
    >
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessments() {
  return useContext(AssessmentContext);
}