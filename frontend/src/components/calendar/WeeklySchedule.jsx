import React, { useState } from 'react';
import { useSchedule } from '../../context/ScheduleContext';
import AddClassModal from './AddClassModal';

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
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading schedule...</div>;
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      overflowX: 'auto'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0 }}> Weekly Schedule</h3>
        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            padding: '8px 16px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          + Add Class
        </button>
      </div>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
        <thead>
          <tr>
            <th style={{ padding: '12px', border: '1px solid #eee', background: '#f5f5f5', width: '80px' }}>Time</th>
            {days.map(day => (
              <th key={day} style={{ padding: '12px', border: '1px solid #eee', background: '#f5f5f5' }}>
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map(time => (
            <tr key={time}>
              <td style={{ padding: '12px', border: '1px solid #eee', fontWeight: 'bold', background: '#fafafa' }}>
                {time}
              </td>
              {days.map(day => {
                const classInfo = getClassAtTime(day, time);
                return (
                  <td key={`${time}-${day}`} style={{ padding: '8px', border: '1px solid #eee', verticalAlign: 'top' }}>
                    {classInfo ? (
                      <div style={{
                        background: classInfo.color,
                        color: 'white',
                        padding: '8px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        position: 'relative'
                      }}>
                        <strong>{classInfo.subject}</strong>
                        <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.9 }}>
                          📍 {classInfo.location}
                        </div>
                        <button
                          onClick={() => deleteClass(classInfo._id)}
                          style={{
                            position: 'absolute',
                            top: '2px',
                            right: '4px',
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div style={{ height: '60px' }}></div>
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