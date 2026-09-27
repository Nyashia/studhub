import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { useSocket } from '../context/SocketContext';
import styles from '../styles/studyroom.module.css';

function StudyRoom() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const {
    fetchActiveSessionById,
    leaveSession,
    endSession
  } = useSession();

  const {
    socket,
    isConnected
  } = useSocket();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState('');
  const [participants, setParticipants] = useState([]);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerStartedAt, setTimerStartedAt] = useState(null);

  const [bgColor, setBgColor] = useState('#1a1a2e');

  // -------------------- FORMAT TIME --------------------

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  // -------------------- UPDATE BACKGROUND --------------------

  useEffect(() => {
    if (elapsedSeconds < 1500) {
      // 0–25 minutes
      setBgColor('#3e3e82');
    } else if (elapsedSeconds < 3000) {
      // 25–50 minutes
      setBgColor('#3b2f63');
    } else if (elapsedSeconds < 4500) {
      // 50–75 minutes
      setBgColor('#5a4785');
    } else if (elapsedSeconds < 6000) {
      // 75–100 minutes
      setBgColor('#403b78');
    } else {
      // 100+ minutes
      setBgColor('#7868a8');
    }
  }, [elapsedSeconds]);

  // -------------------- TIMER --------------------

  useEffect(() => {
    if (!isTimerRunning || !timerStartedAt) {
      return;
    }

    const updateTimer = () => {
      const startedAt = new Date(timerStartedAt).getTime();

      const additionalSeconds = Math.floor(
        (Date.now() - startedAt) / 1000
      );

      const baseElapsed = session?.timerElapsed || 0;

      setElapsedSeconds(
        baseElapsed + additionalSeconds
      );
    };

    updateTimer();

    const interval = setInterval(
      updateTimer,
      1000
    );

    return () => clearInterval(interval);
  }, [
    isTimerRunning,
    timerStartedAt,
    session?.timerElapsed
  ]);

  // -------------------- LOAD SESSION --------------------

  useEffect(() => {
    const loadSession = async () => {
      const data = await fetchActiveSessionById(sessionId);

      if (data) {
        setSession(data);

        setParticipants(
          data.participants || []
        );

        setElapsedSeconds(
          data.timerElapsed || 0
        );

        setIsTimerRunning(
          data.timerRunning || false
        );

        setTimerStartedAt(
          data.timerStartedAt || null
        );
      }

      setLoading(false);
    };

    loadSession();
  }, [sessionId]);

  // -------------------- JOIN SOCKET SESSION --------------------

  useEffect(() => {
    if (!socket || !isConnected) {
      return;
    }

    socket.emit(
      'join-session',
      sessionId
    );

    return () => {
      socket.emit('leave-session');
    };
  }, [
    socket,
    isConnected,
    sessionId
  ]);

  // -------------------- SOCKET LISTENERS --------------------

  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleParticipantJoined = async (data) => {
      console.log(
        ' Participant joined:',
        data
      );

      const updated =
        await fetchActiveSessionById(sessionId);

      if (updated) {
        setSession(updated);

        setParticipants(
          updated.participants || []
        );
      }
    };

    const handleParticipantLeft = async (data) => {
      console.log(
        ' Participant left:',
        data
      );

      const updated =
        await fetchActiveSessionById(sessionId);

      if (updated) {
        setSession(updated);

        setParticipants(
          updated.participants || []
        );
      }
    };

    const handleTaskUpdated = async (data) => {
      console.log(
        ' Task updated event received!',
        data
      );

      const updated =
        await fetchActiveSessionById(sessionId);

      if (updated) {
        setSession(updated);

        setParticipants(
          updated.participants || []
        );
      }
    };

    // -------------------- TIMER UPDATE --------------------

    const handleTimerUpdated = (data) => {
      console.log(
        ' Timer update received:',
        data
      );

      if (data.sessionId !== sessionId) {
        return;
      }

      setElapsedSeconds(
        data.timerElapsed || 0
      );

      setIsTimerRunning(
        data.timerRunning || false
      );

      setTimerStartedAt(
        data.timerStartedAt || null
      );

      setSession(prev => {
        if (!prev) {
          return prev;
        }

        return {
          ...prev,
          timerElapsed:
            data.timerElapsed || 0,
          timerRunning:
            data.timerRunning || false,
          timerStartedAt:
            data.timerStartedAt || null
        };
      });
    };

    socket.on(
      'participant-joined',
      handleParticipantJoined
    );

    socket.on(
      'participant-left',
      handleParticipantLeft
    );

    socket.on(
      'task-updated',
      handleTaskUpdated
    );

    socket.on(
      'timer-updated',
      handleTimerUpdated
    );

    return () => {
      socket.off(
        'participant-joined',
        handleParticipantJoined
      );

      socket.off(
        'participant-left',
        handleParticipantLeft
      );

      socket.off(
        'task-updated',
        handleTaskUpdated
      );

      socket.off(
        'timer-updated',
        handleTimerUpdated
      );
    };
  }, [
    socket,
    sessionId
  ]);

  // -------------------- START TIMER --------------------

  const handleStartTimer = async () => {
    try {
      const token =
        localStorage.getItem('token');

      const res = await fetch(
        `http://localhost:5000/api/sessions/${sessionId}/timer/start`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || 'Failed to start timer'
        );
      }

      setSession(data);

      setElapsedSeconds(
        data.timerElapsed || 0
      );

      setIsTimerRunning(
        data.timerRunning
      );

      setTimerStartedAt(
        data.timerStartedAt
      );

      if (socket && isConnected) {
        socket.emit(
          'timer-started',
          {
            sessionId,
            timerElapsed:
              data.timerElapsed,
            timerRunning:
              data.timerRunning,
            timerStartedAt:
              data.timerStartedAt
          }
        );
      }
    } catch (error) {
      console.error(
        'Error starting timer:',
        error
      );
    }
  };

  // -------------------- PAUSE TIMER --------------------

  const handlePauseTimer = async () => {
    try {
      const token =
        localStorage.getItem('token');

      const res = await fetch(
        `http://localhost:5000/api/sessions/${sessionId}/timer/pause`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || 'Failed to pause timer'
        );
      }

      setSession(data);

      setElapsedSeconds(
        data.timerElapsed || 0
      );

      setIsTimerRunning(false);
      setTimerStartedAt(null);

      if (socket && isConnected) {
        socket.emit(
          'timer-paused',
          {
            sessionId,
            timerElapsed:
              data.timerElapsed,
            timerRunning:
              data.timerRunning,
            timerStartedAt:
              data.timerStartedAt
          }
        );
      }
    } catch (error) {
      console.error(
        'Error pausing timer:',
        error
      );
    }
  };

  // -------------------- ADD TASK --------------------

  const handleAddTask = async (e) => {
    e.preventDefault();

    if (!newTask.trim()) {
      return;
    }

    try {
      const token =
        localStorage.getItem('token');

      const res = await fetch(
        `http://localhost:5000/api/sessions/${sessionId}/tasks`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            text: newTask
          })
        }
      );

      const data = await res.json();

      setSession(data);
      setNewTask('');

      if (socket && isConnected) {
        socket.emit(
          'task-updated',
          {
            sessionId
          }
        );
      }
    } catch (error) {
      console.error(
        'Error adding task:',
        error
      );
    }
  };

  // -------------------- TOGGLE TASK --------------------

  const handleToggleTask = async (taskId) => {
    try {
      const token =
        localStorage.getItem('token');

      const res = await fetch(
        `http://localhost:5000/api/sessions/${sessionId}/tasks/${taskId}/toggle`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = await res.json();

      setSession(data);

      if (socket && isConnected) {
        socket.emit(
          'task-updated',
          {
            sessionId
          }
        );
      }
    } catch (error) {
      console.error(
        'Error toggling task:',
        error
      );
    }
  };

  // -------------------- DELETE TASK --------------------

  const handleDeleteTask = async (taskId) => {
    try {
      const token =
        localStorage.getItem('token');

      const res = await fetch(
        `http://localhost:5000/api/sessions/${sessionId}/tasks/${taskId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = await res.json();

      setSession(data);

      if (socket && isConnected) {
        socket.emit(
          'task-updated',
          {
            sessionId
          }
        );
      }
    } catch (error) {
      console.error(
        'Error deleting task:',
        error
      );
    }
  };

  // -------------------- LEAVE SESSION --------------------

  const handleLeave = async () => {
    await leaveSession(sessionId);

    navigate('/study-buddy');
  };

  // -------------------- END SESSION --------------------

  const handleEnd = async () => {
    await endSession(sessionId);

    navigate('/study-buddy');
  };

  // -------------------- LOADING --------------------

  if (loading) {
    return (
      <div className={styles.loading}>
        Loading study room...
      </div>
    );
  }

  if (!session) {
    return (
      <div className={styles.loading}>
        Session not found
      </div>
    );
  }

  // -------------------- SESSION INFO --------------------

  const isCreator =
    session.createdBy?._id ===
    localStorage.getItem('userId');

  // -------------------- UI --------------------

  return (
    <div
      className={styles.studyRoom}
      style={{
        backgroundColor: bgColor
      }}
    >

      {/* -------------------- HEADER -------------------- */}

      <div className={styles.header}>

        <div>
          <h1 className={styles.topic}>
            📚 {session.topic}
          </h1>

          <p className={styles.participants}>
            👥 {participants.length} studying
          </p>
        </div>

        <div className={styles.headerRight}>

          <div className={styles.headerActions}>

            <button
              onClick={handleLeave}
              className={styles.leaveBtn}
            >
              Leave
            </button>

            {isCreator && (
              <button
                onClick={handleEnd}
                className={styles.endBtn}
              >
                End Session
              </button>
            )}

          </div>

        </div>

      </div>

      {/* -------------------- TIMER -------------------- */}

      <div className={styles.timerSection}>

        <div className={styles.timerDisplay}>
          {formatTime(elapsedSeconds)}
        </div>

        <div className={styles.timerControls}>

          {!isTimerRunning ? (
            <button
              onClick={handleStartTimer}
              className={styles.timerBtn}
            >
              ▶ Start
            </button>
          ) : (
            <button
              onClick={handlePauseTimer}
              className={styles.timerBtn}
            >
              ⏸ Pause
            </button>
          )}

        </div>

      </div>

      {/* -------------------- PARTICIPANTS -------------------- */}

      <div className={styles.avatarSection}>

        <div className={styles.avatarBubbles}>

          {participants.map(p => (
            <div
              key={p._id}
              className={styles.avatarBubble}
            >

              {p.profilePicture ? (
                <img
                  src={p.profilePicture}
                  alt={p.name}
                  className={styles.avatarImg}
                />
              ) : (
                <span
                  className={styles.avatarInitial}
                >
                  {p.name?.[0]
                    ?.toUpperCase() || '?'}
                </span>
              )}

              <span className={styles.avatarName}>
                {p.name}
              </span>

            </div>
          ))}

        </div>

      </div>

      {/* -------------------- TASKS -------------------- */}

      <div className={styles.content}>

        <div className={styles.taskSection}>

          <h3 className={styles.taskTitle}>
            📋 Session Tasks
          </h3>

          <form
            onSubmit={handleAddTask}
            className={styles.taskForm}
          >

            <input
              type="text"
              placeholder="Add a task..."
              value={newTask}
              onChange={(e) =>
                setNewTask(e.target.value)
              }
              className={styles.taskInput}
            />

            <button
              type="submit"
              className={styles.addTaskBtn}
            >
              Add
            </button>

          </form>

          <div className={styles.taskList}>

            {session.tasks &&
            session.tasks.length > 0 ? (

              session.tasks.map(task => (
                <div
                  key={task._id}
                  className={styles.taskItem}
                >

                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() =>
                      handleToggleTask(task._id)
                    }
                    className={styles.taskCheckbox}
                  />

                  <span
                    className={
                      task.completed
                        ? styles.taskCompleted
                        : ''
                    }
                  >
                    {task.text}
                  </span>

                  <button
                    onClick={() =>
                      handleDeleteTask(task._id)
                    }
                    className={
                      styles.deleteTaskBtn
                    }
                  >
                    ×
                  </button>

                </div>
              ))

            ) : (
              <p className={styles.emptyState}>
                No tasks yet. Add one above!
              </p>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}

export default StudyRoom;