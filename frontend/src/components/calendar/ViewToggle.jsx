import React from 'react';

const ViewToggle = ({ activeView, setActiveView }) => {
  return (
    <div style={{
      display: 'flex',
      gap: '10px',
      background: '#f0f0f0',
      padding: '4px',
      borderRadius: '30px',
      width: 'fit-content'
    }}>
      <button
        onClick={() => setActiveView('calendar')}
        style={{
          padding: '8px 20px',
          borderRadius: '25px',
          border: 'none',
          cursor: 'pointer',
          background: activeView === 'calendar' ? '#4CAF50' : 'transparent',
          color: activeView === 'calendar' ? 'white' : '#666',
          fontWeight: '500',
          transition: 'all 0.2s'
        }}
      >
         Calendar
      </button>
      <button
        onClick={() => setActiveView('schedule')}
        style={{
          padding: '8px 20px',
          borderRadius: '25px',
          border: 'none',
          cursor: 'pointer',
          background: activeView === 'schedule' ? '#4CAF50' : 'transparent',
          color: activeView === 'schedule' ? 'white' : '#666',
          fontWeight: '500',
          transition: 'all 0.2s'
        }}
      >
        📋 Schedule
      </button>
    </div>
  );
};

export default ViewToggle;