import React, { useState } from 'react';

const AddClassModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    subject: '',
    day: 'Monday',
    startTime: '09:00',
    endTime: '10:30',
    location: '',
    color: '#4CAF50'
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const colors = [
    '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', 
    '#F44336', '#009688', '#E91E63', '#3F51B5'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    setFormData({
      subject: '',
      day: 'Monday',
      startTime: '09:00',
      endTime: '10:30',
      location: '',
      color: '#4CAF50'
    });
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        width: '450px',
        maxWidth: '90%'
      }}>
        <h3 style={{ marginBottom: '20px' }}>➕ Add Class</h3>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Subject *</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
              required
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
              placeholder="e.g., Mathematics"
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Day *</label>
            <select
              value={formData.day}
              onChange={(e) => setFormData({...formData, day: e.target.value})}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
            >
              {days.map(day => <option key={day} value={day}>{day}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Start Time</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>End Time</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
              placeholder="e.g., Room 101"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Color</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {colors.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({...formData, color})}
                  style={{
                    width: '32px',
                    height: '32px',
                    background: color,
                    borderRadius: '8px',
                    border: formData.color === color ? '3px solid #333' : 'none',
                    cursor: 'pointer'
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                background: '#666',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '8px 16px',
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Add Class
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddClassModal;