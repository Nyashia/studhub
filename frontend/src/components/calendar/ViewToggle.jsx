import React from 'react';
import styles from "../../styles/dashboard.module.css"; 

const ViewToggle = ({ activeView, setActiveView }) => {
  return (
    <div className={styles.toggleContainer}>
      <button
        onClick={() => setActiveView('calendar')}
        className={`${styles.toggleBtn} ${activeView === 'calendar' ? styles.toggleBtnActive : ''}`}
      >
        Calendar
      </button>
      <button
        onClick={() => setActiveView('schedule')}
        className={`${styles.toggleBtn} ${activeView === 'schedule' ? styles.toggleBtnActive : ''}`}
      >
        Schedule
      </button>
    </div>
  );
};

export default ViewToggle;