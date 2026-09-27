import React, { useState } from 'react';
import { useSchedule } from '../../context/ScheduleContext';
import AddClassModal from './AddClassModal';
import styles from '../../styles/calendar.module.css';

const WeeklySchedule = () => {
  const { schedule, addClass, deleteClass, updateClass, loading } = useSchedule();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    subject: '',
    code: '',
    location: '',
    color: '#e07a5f',
    startTime: '',
    endTime: ''
  });

  const timeSlots = ['9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const handleAddClass = async (classData) => {
    const result = await addClass(classData);
    if (result.success) {
      setIsModalOpen(false);
    }
  };

  const getClassAtTime = (day, time) => {
    return schedule?.classes?.find(c => {
      if (c.day !== day) return false;
      const classStart = parseInt(c.startTime.split(':')[0]);
      const classEnd = parseInt(c.endTime.split(':')[0]);
      const slotHour = parseInt(time.split(':')[0]);
      return slotHour >= classStart && slotHour < classEnd;
    });
  };

  const getClassDuration = (classInfo) => {
    const start = parseInt(classInfo.startTime.split(':')[0]);
    const end = parseInt(classInfo.endTime.split(':')[0]);
    return end - start;
  };

  const handleClassClick = (classInfo) => {
    setSelectedClass(classInfo);
    setEditForm({
      subject: classInfo.subject || '',
      code: classInfo.code || '',
      location: classInfo.location || '',
      color: classInfo.color || '#e07a5f',
      startTime: classInfo.startTime || '',
      endTime: classInfo.endTime || ''
    });
    setIsEditing(false);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSaveEdit = async () => {
    if (!editForm.subject.trim()) {
      alert('Subject is required');
      return;
    }
    const result = await updateClass(selectedClass._id, editForm);
    if (result.success) {
      setSelectedClass(null);
      setIsEditing(false);
    } else {
      alert('Failed to update class');
    }
  };

  if (loading) {
    return <div className={styles.loadingState}>Loading schedule...</div>;
  }

  return (
    <div className={styles.scheduleContainer}>
      <div className={styles.scheduleHeader}>
        <h3 className={styles.scheduleTitle}>Weekly Schedule</h3>
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
                const isStartTime = classInfo && parseInt(time.split(':')[0]) === parseInt(classInfo.startTime.split(':')[0]);
                
                return (
                  <td key={`${time}-${day}`}>
                    {isStartTime ? (
                      <div
                        className={styles.classBlock}
                        style={{
                          backgroundColor: classInfo.color || '#e07a5f',
                          borderRadius: '8px',
                          padding: '6px 8px',
                          color: '#ffffff',
                          fontSize: '12px',
                          fontWeight: '500',
                          position: 'relative',
                          cursor: 'pointer',
                          height: `${getClassDuration(classInfo) * 36}px`,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center'
                        }}
                        onClick={() => handleClassClick(classInfo)}
                      >
                        <div className={styles.classSubject}>{classInfo.subject}</div>
                        {classInfo.location && (
                          <div style={{ fontSize: '10px', opacity: 0.85, marginTop: '1px' }}>
                            {classInfo.location}
                          </div>
                        )}
                        {classInfo.code && (
                          <div style={{ fontSize: '9px', opacity: 0.7, marginTop: '1px' }}>
                            {classInfo.code}
                          </div>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Delete "${classInfo.subject}"?`)) {
                              deleteClass(classInfo._id);
                            }
                          }}
                          style={{
                            position: 'absolute',
                            top: '2px',
                            right: '4px',
                            background: 'rgba(0,0,0,0.2)',
                            border: 'none',
                            color: 'white',
                            borderRadius: '50%',
                            width: '18px',
                            height: '18px',
                            cursor: 'pointer',
                            fontSize: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
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

      {selectedClass && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setSelectedClass(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '24px 28px',
              width: '380px',
              maxWidth: '92%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {!isEditing ? (
              // View Mode
              <>
                <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1e1a16', marginBottom: '14px' }}>
                  {selectedClass.subject}
                </h3>

                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '12px', color: '#6b6560' }}>Day</div>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#1e1a16' }}>{selectedClass.day}</div>
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '12px', color: '#6b6560' }}>Time</div>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#1e1a16' }}>
                    {selectedClass.startTime} – {selectedClass.endTime}
                  </div>
                </div>

                {selectedClass.location && (
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ fontSize: '12px', color: '#6b6560' }}>Location</div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#1e1a16' }}>{selectedClass.location}</div>
                  </div>
                )}

                {selectedClass.code && (
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ fontSize: '12px', color: '#6b6560' }}>Class Code</div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#1e1a16' }}>{selectedClass.code}</div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', color: '#6b6560' }}>Color</div>
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: selectedClass.color || '#e07a5f'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={handleEditClick}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: '#e07a5f',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    Edit Class
                  </button>
                  <button
                    onClick={() => setSelectedClass(null)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: '#f5f0eb',
                      color: '#1e1a16',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    Close
                  </button>
                </div>
              </>
            ) : (
              // Edit Mode
              <>
                <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1e1a16', marginBottom: '16px' }}>
                  Edit Class
                </h3>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '12px', color: '#6b6560', display: 'block', marginBottom: '4px' }}>Subject *</label>
                  <input
                    type="text"
                    name="subject"
                    value={editForm.subject}
                    onChange={handleEditChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ede8e2',
                      borderRadius: '8px',
                      fontSize: '14px',
                      background: '#faf8f5'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '12px', color: '#6b6560', display: 'block', marginBottom: '4px' }}>Class Code</label>
                  <input
                    type="text"
                    name="code"
                    value={editForm.code}
                    onChange={handleEditChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ede8e2',
                      borderRadius: '8px',
                      fontSize: '14px',
                      background: '#faf8f5'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '12px', color: '#6b6560', display: 'block', marginBottom: '4px' }}>Location</label>
                  <input
                    type="text"
                    name="location"
                    value={editForm.location}
                    onChange={handleEditChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ede8e2',
                      borderRadius: '8px',
                      fontSize: '14px',
                      background: '#faf8f5'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '12px', color: '#6b6560', display: 'block', marginBottom: '4px' }}>Color</label>
                  <input
                    type="color"
                    name="color"
                    value={editForm.color}
                    onChange={handleEditChange}
                    style={{
                      width: '100%',
                      height: '40px',
                      padding: '4px',
                      border: '1px solid #ede8e2',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      background: 'transparent'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                  <button
                    onClick={handleSaveEdit}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: '#e07a5f',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditForm({
                        subject: selectedClass.subject || '',
                        code: selectedClass.code || '',
                        location: selectedClass.location || '',
                        color: selectedClass.color || '#e07a5f',
                        startTime: selectedClass.startTime || '',
                        endTime: selectedClass.endTime || ''
                      });
                    }}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: '#f5f0eb',
                      color: '#1e1a16',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklySchedule;