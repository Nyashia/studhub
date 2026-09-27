import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import styles from '../../styles/calendar.module.css';

const MonthlyCalendar = ({ assessments = [] }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const getEventsForDate = (date) => {
    const dateString = date.toDateString();

    return assessments.filter((assessment) => {
      if (!assessment.date) return false;

      return new Date(assessment.date).toDateString() === dateString;
    });
  };

  const hasEventOnDate = (date) => {
    return getEventsForDate(date).length > 0;
  };

  const assessmentsOnDate = getEventsForDate(selectedDate);

  return (
    <div className={styles.calendarContainer}>
      <h3 className={styles.calendarTitle}>
        Calendar
      </h3>

      <Calendar
        onChange={setSelectedDate}
        value={selectedDate}
        tileClassName={({ date }) =>
          hasEventOnDate(date) ? 'event-day' : null
        }
      />

      <div className={styles.selectedDateSection}>
        <div className={styles.selectedDateTitle}>
          {selectedDate.toDateString()}
        </div>

        {assessmentsOnDate.length === 0 ? (
          <div className={styles.eventEmpty}>
            No assessments scheduled
          </div>
        ) : (
          <div className={styles.eventList}>
            {assessmentsOnDate.map((assessment) => (
              <div
                key={assessment._id}
                className={styles.eventItem}
              >
                {assessment.name} ({assessment.subject})
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MonthlyCalendar;