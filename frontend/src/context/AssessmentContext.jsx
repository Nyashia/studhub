import React, { createContext, useContext, useState, useEffect } from "react";

const AssessmentContext = createContext();

export function AssessmentProvider({ children }) {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingAssessment, setEditingAssessment] = useState(null);

  // ====================
  // Form state
  // ====================

  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [type, setType] = useState("assignment");

  const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

  const token = localStorage.getItem("token");

  // ====================
  // Fetch assessments
  // ====================

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_URL}/assessments`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error("Failed to fetch assessments");
      }

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

  // ====================
  // Create assessment
  // ====================

  const createAssessment = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_URL}/assessments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          subject,
          date,
          notes,
          type
        })
      });

      if (!res.ok) {
        throw new Error("Failed to create assessment");
      }

      const newAssessment = await res.json();

      setAssessments((prev) => [...prev, newAssessment]);
      resetForm();

      return { success: true };
    } catch (error) {
      console.error("Error creating assessment:", error);

      return {
        success: false,
        error: error.message
      };
    }
  };

  // ====================
  // Update assessment
  // ====================

  const updateAssessment = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(
        `${API_URL}/assessments/${editingAssessment._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            name,
            subject,
            date,
            notes,
            type
          })
        }
      );

      if (!res.ok) {
        throw new Error("Failed to update assessment");
      }

      const updatedAssessment = await res.json();

      setAssessments((prev) =>
        prev.map((assessment) =>
          assessment._id === updatedAssessment._id
            ? updatedAssessment
            : assessment
        )
      );

      resetForm();

      return { success: true };
    } catch (error) {
      console.error("Error updating assessment:", error);

      return {
        success: false,
        error: error.message
      };
    }
  };

  // ====================
  // Complete assessment
  // ====================

  const completeAssessment = async (id) => {
    try {
      const res = await fetch(`${API_URL}/assessments/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          completed: true
        })
      });

      if (!res.ok) {
        throw new Error("Failed to complete assessment");
      }

      const updatedAssessment = await res.json();

      setAssessments((prev) =>
        prev.map((assessment) =>
          assessment._id === updatedAssessment._id
            ? updatedAssessment
            : assessment
        )
      );

      return { success: true };
    } catch (error) {
      console.error("Error completing assessment:", error);

      return {
        success: false,
        error: error.message
      };
    }
  };

  // ====================
  // Delete assessment
  // ====================

  const deleteAssessment = async (id) => {
    try {
      const res = await fetch(`${API_URL}/assessments/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error("Failed to delete assessment");
      }

      setAssessments((prev) =>
        prev.filter((assessment) => assessment._id !== id)
      );

      return { success: true };
    } catch (error) {
      console.error("Error deleting assessment:", error);

      return {
        success: false,
        error: error.message
      };
    }
  };

  // ====================
  // Start editing assessment
  // ====================

  const startEdit = (assessment) => {
    setEditingAssessment(assessment);

    setName(assessment.name);
    setSubject(assessment.subject);
    setDate(assessment.date?.split("T")[0] || "");
    setNotes(assessment.notes || "");
    setType(assessment.type);
  };

  // ====================
  // Reset form
  // ====================

  const resetForm = () => {
    setEditingAssessment(null);
    setName("");
    setSubject("");
    setDate("");
    setNotes("");
    setType("assignment");
  };

  // ====================
  // Get upcoming assessments
  // ====================

  const getUpcomingAssessments = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    return assessments.filter((assessment) => {
      const assessmentDate = new Date(assessment.date);
      assessmentDate.setHours(0, 0, 0, 0);

      return (
        !assessment.completed &&
        assessmentDate >= today &&
        assessmentDate <= nextWeek
      );
    });
  };

  // ====================
  // Get assessments by type
  // ====================

  const getByType = (typeFilter) => {
    return assessments.filter(
      (assessment) => assessment.type === typeFilter
    );
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
        completeAssessment,
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