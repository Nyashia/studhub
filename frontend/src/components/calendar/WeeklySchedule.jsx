import React, { useState } from 'react';
import { useSchedule } from '../../context/ScheduleContext';
import AddClassModal from './AddClassModal';
import styles from '../../styles/calendar.module.css';

const WeeklySchedule = () => {
  const { schedule, addClass, deleteClass, loading } = useSchedule();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const timeSlots = ['9:00', '10:30', '12:00', '13:30', '15:00', '16:30'];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const handleAddClass = async (classData) => {
    const result = await addClass(classData);
    if (result.success) {
      setIsModalOpen(false);
    }
  };

  const getClassAtTime = (day, time) => {
    return schedule?.classes?.find(c => {
      const classStartHour = parseInt(c.startTime.split(':')[0]);
      const slotHour = parseInt(time.split(':')[0]);
      return c.day === day && classStartHour === slotHour;
    });
  };

  if (loading) {
    return <div className={styles.loadingState}>Loading schedule...</div>;
  }

  return (
    <div className={styles.scheduleContainer}>
      <div className={styles.scheduleHeader}>
        <h3 className={styles.scheduleTitle}>📋 Weekly Schedule</h3>
        <button onClick={() => setIsModalOpen(true)} className={styles.addClassBtn}>
          + Add Class
        </button>
      </div>
      
      <table className={styles.scheduleTable}>
        <thead>
          <tr>
            <th>Time</th>
            {days.map(day => <th key={day}>{day}</th>)}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map(time => (
            <tr key={time}>
              <td>{time}</td>
              {days.map(day => {
                const classInfo = getClassAtTime(day, time);
                return (
                  <td key={`${time}-${day}`}>
                    {classInfo ? (
                      <div className={styles.classBlock}>
                        <div className={styles.classSubject}>{classInfo.subject}</div>
                        <div className={styles.classLocation}>📍 {classInfo.location}</div>
                        <button 
                          onClick={() => deleteClass(classInfo._id)}
                          className={styles.deleteClassBtn}
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className={styles.emptyCell}></div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <AddClassModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddClass}
      />
    </div>
  );
};

export default WeeklySchedule;