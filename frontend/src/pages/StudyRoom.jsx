import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { useSocket } from '../context/SocketContext';
import styles from '../styles/studyroom.module.css';

// background image used for now
import studyBg from '../assets/study-bg.jpg';

function StudyRoom() {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const { fetchActiveSessionById, joinSessionById, leaveSession, endSession } = useSession();
    const { socket, isConnected } = useSocket();
    
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newTask, setNewTask] = useState('');
    const [participants, setParticipants] = useState([]);
    
    // Timer state
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);

    // Format time for display
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Timer logic
    useEffect(() => {
        let interval;
        if (isTimerRunning) {
            interval = setInterval(() => {
                setElapsedSeconds(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning]);

    // Fetch session data
    useEffect(() => {
        const loadSession = async () => {
            const data = await fetchActiveSessionById(sessionId);
            if (data) {
                setSession(data);
                setParticipants(data.participants || []);
                // Join the session via socket
                if (socket && isConnected) {
                    socket.emit('join-session', sessionId);
                }
            }
            setLoading(false);
        };
        loadSession();
    }, [sessionId]);

    // Socket listeners for real-time updates
    useEffect(() => {
        if (!socket) return;

        const handleParticipantJoined = async (data) => {
            console.log('Participant joined:', data);
            const updated = await fetchActiveSessionById(sessionId);
            if (updated) {
                setSession(updated);
                setParticipants(updated.participants || []);
            }
        };

        const handleParticipantLeft = async (data) => {
            console.log('Participant left:', data);
            const updated = await fetchActiveSessionById(sessionId);
            if (updated) {
                setSession(updated);
                setParticipants(updated.participants || []);
            }
        };

        const handleTaskUpdated = async (data) => {
            console.log('Task updated:', data);
            const updated = await fetchActiveSessionById(sessionId);
            if (updated) {
                setSession(updated);
            }
        };

        socket.on('participant-joined', handleParticipantJoined);
        socket.on('participant-left', handleParticipantLeft);
        socket.on('task-updated', handleTaskUpdated);

        return () => {
            socket.off('participant-joined', handleParticipantJoined);
            socket.off('participant-left', handleParticipantLeft);
            socket.off('task-updated', handleTaskUpdated);
        };
    }, [socket, sessionId]);

    // Add task
    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!newTask.trim()) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5000/api/sessions/${sessionId}/tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ text: newTask })
            });
            const data = await res.json();
            setSession(data);
            setNewTask('');
            
            if (socket && isConnected) {
                socket.emit('task-updated', { sessionId });
            }
        } catch (error) {
            console.error('Error adding task:', error);
        }
    };

    // Toggle task
    const handleToggleTask = async (taskId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5000/api/sessions/${sessionId}/tasks/${taskId}/toggle`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            setSession(data);
            
            if (socket && isConnected) {
                socket.emit('task-updated', { sessionId });
            }
        } catch (error) {
            console.error('Error toggling task:', error);
        }
    };

    // Delete task
    const handleDeleteTask = async (taskId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5000/api/sessions/${sessionId}/tasks/${taskId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            setSession(data);
            
            if (socket && isConnected) {
                socket.emit('task-updated', { sessionId });
            }
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    // Leave session
    const handleLeave = async () => {
        await leaveSession(sessionId);
        navigate('/study-buddy');
    };

    // End session (only creator)
    const handleEnd = async () => {
        await endSession(sessionId);
        navigate('/study-buddy');
    };

    if (loading) {
        return <div className={styles.loading}>Loading study room...</div>;
    }

    if (!session) {
        return <div className={styles.loading}>Session not found</div>;
    }

    const isCreator = session.createdBy?._id === localStorage.getItem('userId');

    return (
        <div 
            className={styles.studyRoom}
            style={{ backgroundImage: `url(${studyBg})` }}
        >
            <div className={styles.overlay}>
                {/* Header */}
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.topic}> {session.topic}</h1>
                        <p className={styles.participants}>
                            {participants.length} studying
                        </p>
                    </div>
                    <div className={styles.headerRight}>
                        {/* Timer */}
                        <div className={styles.timerSection}>
                            <div className={styles.timerDisplay}> {formatTime(elapsedSeconds)}</div>
                            <div className={styles.timerControls}>
                                {!isTimerRunning ? (
                                    <button 
                                        onClick={() => setIsTimerRunning(true)} 
                                        className={styles.timerBtn}
                                    >
                                        ▶
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => setIsTimerRunning(false)} 
                                        className={styles.timerBtn}
                                    >
                                        ⏸
                                    </button>
                                )}
                                <button 
                                    onClick={() => { 
                                        setIsTimerRunning(false); 
                                        setElapsedSeconds(0); 
                                    }} 
                                    className={styles.timerBtn}
                                >
                                    ↺
                                </button>
                            </div>
                        </div>
                        <div className={styles.headerActions}>
                            <button onClick={handleLeave} className={styles.leaveBtn}>
                                Leave
                            </button>
                            {isCreator && (
                                <button onClick={handleEnd} className={styles.endBtn}>
                                    End Session
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content - Task section at bottom right */}
                <div className={styles.content}>
                    <div className={styles.taskSection}>
                        <h3 className={styles.taskTitle}> Session Tasks</h3>
                        
                        <form onSubmit={handleAddTask} className={styles.taskForm}>
                            <input
                                type="text"
                                placeholder="Add a task..."
                                value={newTask}
                                onChange={(e) => setNewTask(e.target.value)}
                                className={styles.taskInput}
                            />
                            <button type="submit" className={styles.addTaskBtn}>
                                Add
                            </button>
                        </form>

                        <div className={styles.taskList}>
                            {session.tasks && session.tasks.length > 0 ? (
                                session.tasks.map(task => (
                                    <div key={task._id} className={styles.taskItem}>
                                        <input
                                            type="checkbox"
                                            checked={task.completed}
                                            onChange={() => handleToggleTask(task._id)}
                                            className={styles.taskCheckbox}
                                        />
                                        <span className={task.completed ? styles.taskCompleted : ''}>
                                            {task.text}
                                        </span>
                                        <button
                                            onClick={() => handleDeleteTask(task._id)}
                                            className={styles.deleteTaskBtn}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className={styles.emptyState}>No tasks yet. Add one above!</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StudyRoom;