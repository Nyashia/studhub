import React, { useState, useEffect } from 'react';
import { useSchedule } from '../../context/ScheduleContext';

const MiniTimer = () => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [subject, setSubject] = useState('');
  const [showPrompt, setShowPrompt] = useState(false);
  const [customSubject, setCustomSubject] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const { schedule } = useSchedule();

  // Extract unique subjects from schedule
  const scheduleSubjects = [...new Set(schedule?.classes?.map(c => c.subject) || [])];

  useEffect(() => {
    let interval;
    if (isActive && (minutes > 0 || seconds > 0)) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        }
      }, 1000);
    } else if (isActive && minutes === 0 && seconds === 0) {
      setIsActive(false);
      alert('Time is up! Great job studying! 🎉');
    }
    return () => clearInterval(interval);
  }, [isActive, minutes, seconds]);

  const startTimer = () => {
    const finalSubject = subject || customSubject;
    if (finalSubject.trim()) {
      setShowPrompt(false);
      setIsActive(true);
    }
  };

  const selectSubject = (selected) => {
    setSubject(selected);
    setCustomSubject('');
    setShowCustomInput(false);
  };

  const pauseTimer = () => setIsActive(false);
  
  const completeTimer = () => {
    setIsActive(false);
    setMinutes(25);
    setSeconds(0);
    setSubject('');
    setCustomSubject('');
    alert(`Great job studying ${subject || customSubject}! 🎉`);
  };

  const formatTime = () => {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // INACTIVE STATE - Show clock to start
  if (!isActive && !showPrompt) {
    return (
      <div 
        onClick={() => setShowPrompt(true)}
        style={{
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '30px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s',
          marginTop: '20px'
        }}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#1a1a2e'}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
      >
        <div style={{ fontSize: '48px', marginBottom: '8px' }}>🕐</div>
        <div style={{ fontSize: '16px', fontWeight: '500', color: '#1a1a2e' }}>Start Studying</div>
        <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Click to set up your study session</div>
      </div>
    );
  }

  // PROMPT STATE - Ask what they're studying
  if (showPrompt && !isActive) {
    return (
      <div style={{
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '24px',
        marginTop: '20px'
      }}>
        <h3 style={{ marginBottom: '16px' }}>What are you studying today?</h3>
        
        {scheduleSubjects.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>Your subjects:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {scheduleSubjects.map(sub => (
                <button
                  key={sub}
                  onClick={() => selectSubject(sub)}
                  style={{
                    padding: '8px 16px',
                    background: subject === sub ? '#1a1a2e' : '#f0f0f0',
                    color: subject === sub ? 'white' : '#333',
                    border: 'none',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>
        )}

        {!showCustomInput ? (
          <button
            onClick={() => setShowCustomInput(true)}
            style={{
              width: '100%',
              padding: '10px',
              background: 'none',
              border: '1px dashed #ccc',
              borderRadius: '8px',
              cursor: 'pointer',
              color: '#666',
              marginBottom: '16px'
            }}
          >
            + Add custom subject
          </button>
        ) : (
          <input
            type="text"
            placeholder="Enter subject name"
            value={customSubject}
            onChange={(e) => setCustomSubject(e.target.value)}
            autoFocus
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '14px'
            }}
          />
        )}

        {(subject || customSubject) && (
          <div style={{ marginBottom: '16px', padding: '8px', background: '#e8f5e9', borderRadius: '8px', fontSize: '14px' }}>
            📚 Studying: {subject || customSubject}
          </div>
        )}

        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>Duration:</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[15, 25, 30, 45, 60].map(dur => (
              <button
                key={dur}
                onClick={() => setMinutes(dur)}
                style={{
                  padding: '6px 12px',
                  background: minutes === dur ? '#1a1a2e' : '#f0f0f0',
                  color: minutes === dur ? 'white' : '#333',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                {dur} min
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={startTimer}
            disabled={!subject && !customSubject}
            style={{
              flex: 1,
              padding: '12px',
              background: (!subject && !customSubject) ? '#ccc' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: (!subject && !customSubject) ? 'not-allowed' : 'pointer',
              fontWeight: '500'
            }}
          >
            Start Session
          </button>
          <button
            onClick={() => {
              setShowPrompt(false);
              setSubject('');
              setCustomSubject('');
              setShowCustomInput(false);
            }}
            style={{
              padding: '12px 20px',
              background: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // ACTIVE STATE - Timer with fullscreen button
  const timerContent = (
    <div style={{
      background: isFullscreen ? '#1a1a2e' : 'white',
      borderRadius: isFullscreen ? '0' : '12px',
      border: '1px solid #e2e8f0',
      padding: isFullscreen ? '40px' : '20px',
      textAlign: 'center',
      minHeight: isFullscreen ? '100vh' : 'auto',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      position: isFullscreen ? 'fixed' : 'relative',
      top: isFullscreen ? 0 : 'auto',
      left: isFullscreen ? 0 : 'auto',
      right: isFullscreen ? 0 : 'auto',
      bottom: isFullscreen ? 0 : 'auto',
      zIndex: isFullscreen ? 1000 : 'auto'
    }}>
      {/* Header with fullscreen button */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        width: '100%',
        marginBottom: isFullscreen ? '40px' : '0'
      }}>
        <button
          onClick={toggleFullscreen}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            color: isFullscreen ? 'white' : '#666'
          }}
          title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen mode'}
        >
          {isFullscreen ? '✕ Exit' : '⛶ Fullscreen'}
        </button>
      </div>

      {/* Timer Display */}
      <div style={{
        fontSize: isFullscreen ? '120px' : '48px',
        fontWeight: 'bold',
        color: isFullscreen ? 'white' : '#1a1a2e',
        fontFamily: 'monospace',
        marginBottom: isFullscreen ? '30px' : '16px'
      }}>
        ⏱️ {formatTime()}
      </div>

      <div style={{
        fontSize: isFullscreen ? '20px' : '14px',
        color: isFullscreen ? 'rgba(255,255,255,0.7)' : '#666',
        marginBottom: isFullscreen ? '30px' : '20px'
      }}>
        Studying: {subject || customSubject}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '20px' }}>
        <button
          onClick={pauseTimer}
          style={{
            padding: isFullscreen ? '12px 30px' : '8px 20px',
            fontSize: isFullscreen ? '16px' : '14px',
            background: '#f59e0b',
            color: 'white',
            border: 'none',
            borderRadius: '30px',
            cursor: 'pointer'
          }}
        >
          Pause
        </button>
        <button
          onClick={completeTimer}
          style={{
            padding: isFullscreen ? '12px 30px' : '8px 20px',
            fontSize: isFullscreen ? '16px' : '14px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '30px',
            cursor: 'pointer'
          }}
        >
          Complete
        </button>
      </div>
    </div>
  );

  return timerContent;
};

export default MiniTimer;