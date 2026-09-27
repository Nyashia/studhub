import React, { useState } from 'react';
import styles from '../../styles/calendar.module.css';

const initialFormData = {
  subject: '',
  code: '',
  day: 'Monday',
  startTime: '09:00',
  endTime: '10:30',
  location: '',
  color: '#e07a5f'
};

const AddClassModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState(initialFormData);

  const days = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    onSave(formData);

    setFormData(initialFormData);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className={styles.modalTitle}>Add Class</h3>

        <form onSubmit={handleSubmit}>

          {/* Subject */}
          <div className={styles.modalFormGroup}>
            <label className={styles.modalLabel}>
              Subject *
            </label>

            <input
              type="text"
              value={formData.subject}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  subject: e.target.value
                })
              }
              required
              className={styles.modalInput}
              placeholder="e.g., Mathematics"
            />
          </div>

          {/* Class Code */}
          <div className={styles.modalFormGroup}>
            <label className={styles.modalLabel}>
              Class Code
            </label>

            <input
              type="text"
              value={formData.code}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  code: e.target.value
                })
              }
              className={styles.modalInput}
              placeholder="e.g., MATH101"
            />
          </div>

          {/* Day */}
          <div className={styles.modalFormGroup}>
            <label className={styles.modalLabel}>
              Day *
            </label>

            <select
              value={formData.day}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  day: e.target.value
                })
              }
              className={styles.modalSelect}
            >
              {days.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>

          {/* Start Time */}
          <div className={styles.modalFormGroup}>
            <label className={styles.modalLabel}>
              Start Time
            </label>

            <input
              type="time"
              value={formData.startTime}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  startTime: e.target.value
                })
              }
              className={styles.modalInput}
            />
          </div>

          {/* End Time */}
          <div className={styles.modalFormGroup}>
            <label className={styles.modalLabel}>
              End Time
            </label>

            <input
              type="time"
              value={formData.endTime}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  endTime: e.target.value
                })
              }
              className={styles.modalInput}
            />
          </div>

          {/* Location */}
          <div className={styles.modalFormGroup}>
            <label className={styles.modalLabel}>
              Location
            </label>

            <input
              type="text"
              value={formData.location}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  location: e.target.value
                })
              }
              className={styles.modalInput}
              placeholder="e.g., Room 101"
            />
          </div>

          {/* Class Color */}
          <div className={styles.modalFormGroup}>
            <label className={styles.modalLabel}>
              Class Color
            </label>

            <input
              type="color"
              value={formData.color}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  color: e.target.value
                })
              }
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

          {/* Buttons */}
          <div className={styles.modalActions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.modalCancelBtn}
            >
              Cancel
            </button>

            <button
              type="submit"
              className={styles.modalSaveBtn}
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