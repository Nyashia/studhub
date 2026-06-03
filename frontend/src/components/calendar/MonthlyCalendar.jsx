import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const MonthlyCalendar = ({ assessments = [] }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Function to check if a date has any assessments (for highlighting)
  const hasEventOnDate = (date) => {
    const dateStr = date.toDateString();
    
    // Check assessments only
    const hasAssessment = assessments.some(assessment => {
      if (!assessment.date) return false;
      return new Date(assessment.date).toDateString() === dateStr;
    });
    
    return hasAssessment;
  };

  // Function to get events for the selected date
  const getEventsForDate = (date) => {
    const dateStr = date.toDateString();
    
    const assessmentsOnDate = assessments.filter(assessment => 
      assessment.date && new Date(assessment.date).toDateString() === dateStr
    );
    
    return { assessmentsOnDate };
  };

  // Get events for the currently selected date
  const { assessmentsOnDate } = getEventsForDate(selectedDate);

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    }}>
      <h3 style={{ marginBottom: '16px' }}>📅 Calendar</h3>
      
      <Calendar
        onChange={setSelectedDate}
        value={selectedDate}
        tileClassName={({ date }) => {
          if (hasEventOnDate(date)) {
            return 'event-day';
          }
          return null;
        }}
      />
      
      {/* Selected Date Details */}
      <div style={{ marginTop: '16px', padding: '12px', background: '#f5f5f5', borderRadius: '8px' }}>
        <strong>📌 {selectedDate.toDateString()}</strong>
        
        {assessmentsOnDate.length === 0 && (
          <p style={{ marginTop: '8px', color: '#666' }}>No assessments scheduled</p>
        )}
        
        {assessmentsOnDate.map(assessment => (
          <div key={assessment._id} style={{ marginTop: '8px', padding: '8px', background: 'white', borderRadius: '4px' }}>
            📚 {assessment.name} ({assessment.subject})
          </div>
        ))}
      </div>
      
      <style>{`
        .event-day {
          background: #e3f2fd !important;
          border-radius: 50%;
        }
        .react-calendar {
          width: 100%;
          border: none;
          font-family: inherit;
        }
        .react-calendar__tile {
          padding: 12px 6px;
        }
      `}</style>
    </div>
  );
};

export default MonthlyCalendar;