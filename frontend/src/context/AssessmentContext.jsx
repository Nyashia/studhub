import React, { createContext, useContext, useState, useEffect } from "react";

const AssessmentContext = createContext();

export function AssessmentProvider({ children }) {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
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
      const res = await fetch("http://localhost:5000/api/assessments", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setAssessments(data);
    } catch (error) {
      console.error("Error fetching assessments:", error);
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
      const res = await fetch("http://localhost:5000/api/assessments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, subject, date, notes, type })
      });
      const newAssessment = await res.json();
      setAssessments((prev) => [...prev, newAssessment]);
      resetForm();
    } catch (error) {
      console.error("Error creating assessment:", error);
    }
  };

  const updateAssessment = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/assessments/${editingAssessment._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, subject, date, notes, type })
      });
      const updatedAssessment = await res.json();
      setAssessments((prev) =>
        prev.map((a) => (a._id === updatedAssessment._id ? updatedAssessment : a))
      );
      resetForm();
    } catch (error) {
      console.error("Error updating assessment:", error);
    }
  };

  const deleteAssessment = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/assessments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      setAssessments((prev) => prev.filter((a) => a._id !== id));
    } catch (error) {
      console.error("Error deleting assessment:", error);
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
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    return assessments.filter((assessment) => {
      const assessmentDate = new Date(assessment.date);
      return assessmentDate >= today && assessmentDate <= nextWeek;
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