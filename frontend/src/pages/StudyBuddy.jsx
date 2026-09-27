import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { StudyBuddyProvider, useStudyBuddy } from '../context/StudyBuddyContext';
import { useSocket } from '../context/SocketContext';
import { SessionProvider, useSession } from '../context/SessionContext';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/studybuddy.module.css';

function StudyBuddyContent() {
  const navigate = useNavigate();
  const {
    friends,
    pendingRequests,
    activities,
    loading,
    sendFriendRequest,
    acceptRequest,
    declineRequest,
    cheerFriend,
    refresh
  } = useStudyBuddy();

  const { sendNudge, isConnected, notifications, clearNotification, onlineFriends } = useSocket();
  const {
    sessions,
    activeSession,
    createSession,
    joinSessionById,
    leaveSession,
    endSession,
    fetchActiveSessions
  } = useSession();

  const [activeTab, setActiveTab] = useState('friends');
  const [friendIdentifier, setFriendIdentifier] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const [sessionTopic, setSessionTopic] = useState('');
  const [sessionTimer, setSessionTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        clearNotification(notifications[0]?.id);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notifications, clearNotification]);

  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setSessionTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const handleSendRequest = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    
    if (!friendIdentifier.trim()) {
      setErrorMsg('Please enter an email or username');
      return;
    }
    
    const result = await sendFriendRequest(friendIdentifier);
    if (result.success) {
      setSuccessMsg(result.message);
      setFriendIdentifier('');
      refresh();
    } else {
      setErrorMsg(result.message);
    }
    
    setTimeout(() => {
      setSuccessMsg('');
      setErrorMsg('');
    }, 3000);
  };

  const handleAccept = async (requestId) => {
    await acceptRequest(requestId);
  };

  const handleDecline = async (requestId) => {
    await declineRequest(requestId);
  };

  const handleCheer = async (friendId) => {
    const result = await cheerFriend(friendId);
    if (result.success) {
      setSuccessMsg('Cheer sent! 🎉');
      setTimeout(() => setSuccessMsg(''), 2000);
    }
  };

  const handleNudge = (friendId, friendName) => {
    sendNudge(friendId, `${friendName} sent you a nudge! Time to study`);
    setSuccessMsg(`Nudged ${friendName}!`);
    setTimeout(() => setSuccessMsg(''), 2000);
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!sessionTopic.trim()) {
      setErrorMsg('Please enter a topic');
      return;
    }
    const result = await createSession(sessionTopic);
    if (result.success) {
      setSuccessMsg(`Session created!`);
      setSessionTopic('');
      setSessionTimer(0);
      setIsTimerRunning(true);
      navigate(`/study-room/${result.data._id}`);
    } else {
      setErrorMsg(result.error);
    }
    setTimeout(() => {
      setSuccessMsg('');
      setErrorMsg('');
    }, 5000);
  };

  const handleJoinSession = async (sessionId, topic) => {
    const result = await joinSessionById(sessionId);
    if (result.success) {
      navigate(`/study-room/${sessionId}`);
    } else {
      setErrorMsg(result.error);
      setTimeout(() => setErrorMsg(''), 3000);
    }
  };

  const handleLeaveSession = async () => {
    if (activeSession) {
      await leaveSession(activeSession._id);
      setIsTimerRunning(false);
      setSessionTimer(0);
      setSuccessMsg('Left session');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const handleEndSession = async () => {
    if (activeSession && activeSession._id) {
      const result = await endSession(activeSession._id);
      if (result.success) {
        setIsTimerRunning(false);
        setSessionTimer(0);
        setSuccessMsg(`Session ended! Duration: ${result.data.duration} minutes`);
        setTimeout(() => setSuccessMsg(''), 5000);
      }
    } else {
      setErrorMsg('No active session to end');
      setTimeout(() => setErrorMsg(''), 3000);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className={styles.emptyState}>Loading your study buddies...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className={styles.container}>
        {notifications.map(notif => (
          <div key={notif.id} style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: '#3b82f6',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            zIndex: 1000
          }}>
            {notif.message}
            <button 
              onClick={() => clearNotification(notif.id)} 
              style={{ marginLeft: '10px', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
            >
              ×
            </button>
          </div>
        ))}

        <div className={styles.header}>
          <h1>Study Buddy</h1>
          <p>Connect with friends and stay accountable</p>
        </div>

        {successMsg && <div className={styles.successMessage}>{successMsg}</div>}
        {errorMsg && <div className={styles.errorMessage}>{errorMsg}</div>}

        <div className={styles.tabs}>
          <button onClick={() => setActiveTab('friends')} className={`${styles.tab} ${activeTab === 'friends' ? styles.tabActive : ''}`}>
            Friends ({friends.length})
          </button>
          <button onClick={() => setActiveTab('sessions')} className={`${styles.tab} ${activeTab === 'sessions' ? styles.tabActive : ''}`}>
            Sessions
          </button>
          <button onClick={() => setActiveTab('add')} className={`${styles.tab} ${activeTab === 'add' ? styles.tabActive : ''}`}>
            Add Friend
          </button>
          <button onClick={() => setActiveTab('activity')} className={`${styles.tab} ${activeTab === 'activity' ? styles.tabActive : ''}`}>
            Activity
          </button>
        </div>

        {activeTab === 'friends' && (
          <div className={styles.tabContent}>
            {pendingRequests.length > 0 && (
              <div className={styles.card}>
                <div className={styles.cardTitle}>Pending Requests ({pendingRequests.length})</div>
                <div className={styles.requestList}>
                  {pendingRequests.map(request => (
                    <div key={request._id} className={styles.requestItem}>
                      <div>
                        <div className={styles.requestName}>{request.from.name}</div>
                        <div className={styles.requestEmail}>{request.from.email}</div>
                      </div>
                      <div className={styles.requestActions}>
                        <button onClick={() => handleAccept(request._id)} className={styles.acceptBtn}>Accept</button>
                        <button onClick={() => handleDecline(request._id)} className={styles.declineBtn}>Decline</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.card}>
              <div className={styles.cardTitle}>Your Friends ({friends.length})</div>
              {friends.length === 0 ? (
                <div className={styles.emptyState}>No friends yet.</div>
              ) : (
                <div className={styles.friendsList}>
                  {friends.map(friend => {
                    const isOnline = onlineFriends.includes(friend._id);
                    return (
                      <div key={friend._id} className={styles.friendItem}>
                        <div className={styles.friendInfo}>
                          <div className={styles.friendName}>
                            {friend.profilePicture ? (
                              <img src={friend.profilePicture} alt={friend.name} className={styles.friendAvatar} />
                            ) : (
                              <span className={styles.friendInitial}>{friend.name?.[0]?.toUpperCase() || '?'}</span>
                            )}
                            {friend.name}
                            <span className={`${styles.onlineDot} ${isOnline ? styles.online : styles.offline}`} />
                          </div>
                          <div className={styles.friendEmail}>{friend.email}</div>
                        </div>
                        <div className={styles.friendActions}>
                          <button onClick={() => handleNudge(friend._id, friend.name)} className={styles.nudgeBtn}>Nudge</button>
                          <button onClick={() => handleCheer(friend._id)} className={styles.cheerBtn}>Cheer</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className={styles.tabContent}>
            <div className={styles.card}>
              <div className={styles.cardTitle}>Start a Session</div>
              <form onSubmit={handleCreateSession} style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="text"
                  placeholder="What are you studying?"
                  value={sessionTopic}
                  onChange={(e) => setSessionTopic(e.target.value)}
                  style={{ flex: 1, padding: '10px 14px', border: '1px solid #ede8e2', borderRadius: '10px', fontSize: '14px', background: '#faf8f5' }}
                />
                <button type="submit" style={{ padding: '10px 24px', background: '#e07a5f', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 500 }}>
                  Create
                </button>
              </form>
            </div>

            <div className={styles.card}>
              <div className={styles.cardTitle}>Active Sessions</div>
              {sessions.length === 0 ? (
                <div className={styles.emptyState}>No active sessions.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {sessions.map(session => {
                    const isCreator = session.createdBy?._id === userId || session.createdBy === userId;
                    return (
                      <div key={session._id} className={styles.sessionCard}>
                        <div>
                          <div className={styles.sessionTopic}>{session.topic}</div>
                          <div className={styles.sessionMeta}>
                            {session.createdBy?.name || 'Someone'} • {session.participants?.length || 1} studying
                          </div>
                        </div>
                        {!isCreator && (
                          <button onClick={() => handleJoinSession(session._id, session.topic)} className={styles.sessionJoinBtn}>
                            Join Session
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'add' && (
          <div className={styles.tabContent}>
            <div className={styles.card}>
              <div className={styles.cardTitle}>Add a Friend</div>
              <form onSubmit={handleSendRequest} className={styles.addFriendForm}>
                <input
                  type="text"
                  placeholder="Email or username"
                  value={friendIdentifier}
                  onChange={(e) => setFriendIdentifier(e.target.value)}
                  required
                  className={styles.addFriendInput}
                />
                <button type="submit" className={styles.addFriendBtn}>Send Request</button>
              </form>
              <p className={styles.hint}>Search by email or username</p>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className={styles.tabContent}>
            <div className={styles.card}>
              <div className={styles.cardTitle}> Friend Activity</div>
              {activities.length === 0 ? (
                <div className={styles.emptyState}>No activity yet.</div>
              ) : (
                <div className={styles.activityFeed}>
                  {activities.map(activity => (
                    <div key={activity._id} className={styles.activityItem}>
                      <div className={styles.activityIcon}>
                        {activity.type === 'completed_task' }
                        {activity.type === 'completed_assessment' }
                        {activity.type === 'cheered' }
                        {activity.type === 'joined_studhub' }
                        {activity.type === 'study_session'}
                      </div>
                      <div className={styles.activityContent}>
                        <div className={styles.activityMessage}>
                          {activity.message || `${activity.user?.name || 'Someone'} did something`}
                        </div>
                        <div className={styles.activityTime}>
                          {formatTime(activity.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function StudyBuddy() {
  return (
    <StudyBuddyProvider>
      <SessionProvider>
        <StudyBuddyContent />
      </SessionProvider>
    </StudyBuddyProvider>
  );
}

export default StudyBuddy;