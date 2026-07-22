import React, { useState, useEffect, useCallback, useMemo } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { StudyBuddyProvider, useStudyBuddy } from '../context/StudyBuddyContext';
import { useSocket } from '../context/SocketContext';
import { SessionProvider, useSession } from '../context/SessionContext';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/studybuddy.module.css';

// ============= SUB-COMPONENT FOR NOTIFICATIONS =============
const Notification = ({ notification, onClear }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClear(notification.id), 5000);
    return () => clearTimeout(timer);
  }, [notification.id, onClear]);

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: '#3b82f6',
      color: 'white',
      padding: '12px 20px',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      zIndex: 1000,
      animation: 'slideIn 0.3s ease'
    }}>
      <span>🔔 {notification.message}</span>
      <button 
        onClick={() => onClear(notification.id)} 
        style={{ 
          marginLeft: '10px', 
          background: 'none', 
          border: 'none', 
          color: 'white', 
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        ×
      </button>
    </div>
  );
};

// ============= MAIN CONTENT COMPONENT =============
function StudyBuddyContent() {
  const navigate = useNavigate();
  
  // Context hooks
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

  const { 
    sendNudge, 
    isConnected, 
    notifications, 
    clearNotification 
  } = useSocket();
  
  const {
    sessions,
    activeSession,
    createSession,
    joinSessionById,
    leaveSession,
    endSession,
    fetchActiveSessions
  } = useSession();

  // Local state
  const [activeTab, setActiveTab] = useState('friends');
  const [friendIdentifier, setFriendIdentifier] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [sessionTopic, setSessionTopic] = useState('');
  const [sessionTimer, setSessionTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // ============= MEMOIZED VALUES =============
  const friendCount = useMemo(() => friends.length, [friends]);
  const pendingCount = useMemo(() => pendingRequests.length, [pendingRequests]);
  const sessionCount = useMemo(() => sessions.length, [sessions]);
  const activityCount = useMemo(() => activities.length, [activities]);

  // ============= TIMER LOGIC =============
  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setSessionTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // ============= MESSAGE CLEARING =============
  const clearMessages = useCallback(() => {
    setSuccessMsg('');
    setErrorMsg('');
  }, []);

  const showSuccess = useCallback((message) => {
    setSuccessMsg(message);
    setTimeout(clearMessages, 3000);
  }, [clearMessages]);

  const showError = useCallback((message) => {
    setErrorMsg(message);
    setTimeout(clearMessages, 3000);
  }, [clearMessages]);

  // ============= FRIEND HANDLERS =============
  const handleSendRequest = useCallback(async (e) => {
    e.preventDefault();
    clearMessages();
    
    if (!friendIdentifier.trim()) {
      showError('Please enter an email or username');
      return;
    }
    
    const result = await sendFriendRequest(friendIdentifier);
    if (result.success) {
      showSuccess(result.message);
      setFriendIdentifier('');
      refresh();
    } else {
      showError(result.message);
    }
  }, [friendIdentifier, sendFriendRequest, refresh, showSuccess, showError, clearMessages]);

  const handleAccept = useCallback(async (requestId) => {
    await acceptRequest(requestId);
  }, [acceptRequest]);

  const handleDecline = useCallback(async (requestId) => {
    await declineRequest(requestId);
  }, [declineRequest]);

  const handleCheer = useCallback(async (friendId) => {
    const result = await cheerFriend(friendId);
    if (result.success) {
      showSuccess('Cheer sent!');
    }
  }, [cheerFriend, showSuccess]);

  const handleNudge = useCallback((friendId, friendName) => {
    sendNudge(friendId, `${friendName} sent you a nudge! Time to study`);
    showSuccess(`Nudged ${friendName}!`);
  }, [sendNudge, showSuccess]);

  // ============= SESSION HANDLERS =============
  const handleCreateSession = useCallback(async (e) => {
    e.preventDefault();
    clearMessages();
    
    if (!sessionTopic.trim()) {
      showError('Please enter a topic');
      return;
    }
    
    const result = await createSession(sessionTopic);
    if (result.success) {
      showSuccess('Session created! Share with friends.');
      setSessionTopic('');
      setSessionTimer(0);
      setIsTimerRunning(true);
    } else {
      showError(result.error);
    }
  }, [sessionTopic, createSession, showSuccess, showError, clearMessages]);

  const handleJoinSession = useCallback(async (sessionId) => {
    const result = await joinSessionById(sessionId);
    if (result.success) {
      navigate(`/study-room/${sessionId}`);
    } else {
      showError(result.error);
    }
  }, [joinSessionById, navigate, showError]);

  const handleLeaveSession = useCallback(async () => {
    if (activeSession) {
      await leaveSession(activeSession._id);
      setIsTimerRunning(false);
      setSessionTimer(0);
      showSuccess('Left session');
    }
  }, [activeSession, leaveSession, showSuccess]);

  const handleEndSession = useCallback(async () => {
    if (activeSession?._id) {
      const result = await endSession(activeSession._id);
      if (result.success) {
        setIsTimerRunning(false);
        setSessionTimer(0);
        showSuccess(`Session ended! Duration: ${result.data.duration} minutes`);
      }
    } else {
      showError('No active session to end');
    }
  }, [activeSession, endSession, showSuccess, showError]);

  // ============= UTILITY FUNCTIONS =============
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const formatDate = useCallback((date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  // ============= LOADING STATE =============
  if (loading) {
    return (
      <DashboardLayout>
        <div className={styles.loading}>Loading your study buddies...</div>
      </DashboardLayout>
    );
  }

  // ============= RENDER =============
  return (
    <DashboardLayout>
      <div className={styles.container}>
        {/* Notifications */}
        {notifications.map(notif => (
          <Notification 
            key={notif.id} 
            notification={notif} 
            onClear={clearNotification} 
          />
        ))}

        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Study Buddy</h1>
          <p className={styles.subtitle}>Connect with friends and stay accountable</p>
          {isConnected && (
            <span style={{ fontSize: '12px', color: 'green' }}>
              ● Connected
            </span>
          )}
        </div>

        {/* Messages */}
        {successMsg && <div className={styles.successMessage}>{successMsg}</div>}
        {errorMsg && <div className={styles.errorMessage}>{errorMsg}</div>}

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            onClick={() => setActiveTab('friends')}
            className={`${styles.tab} ${activeTab === 'friends' ? styles.tabActive : ''}`}
          >
            Friends ({friendCount})
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`${styles.tab} ${activeTab === 'sessions' ? styles.tabActive : ''}`}
          >
            Sessions
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`${styles.tab} ${activeTab === 'add' ? styles.tabActive : ''}`}
          >
            Add Friend
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`${styles.tab} ${activeTab === 'activity' ? styles.tabActive : ''}`}
          >
            Activity
          </button>
        </div>

        {/* Friends Tab */}
        {activeTab === 'friends' && (
          <div className={styles.tabContent}>
            {pendingRequests.length > 0 && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  Pending Requests ({pendingCount})
                </h3>
                <div className={styles.requestList}>
                  {pendingRequests.map(request => (
                    <div key={request._id} className={styles.requestItem}>
                      <div>
                        <div className={styles.requestName}>{request.from.name}</div>
                        <div className={styles.requestEmail}>{request.from.email}</div>
                      </div>
                      <div className={styles.requestActions}>
                        <button 
                          onClick={() => handleAccept(request._id)} 
                          className={styles.acceptBtn}
                        >
                          Accept
                        </button>
                        <button 
                          onClick={() => handleDecline(request._id)} 
                          className={styles.declineBtn}
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Your Friends ({friendCount})</h3>
              {friends.length === 0 ? (
                <div className={styles.emptyState}>
                  No friends yet. Go to "Add Friend" to connect!
                </div>
              ) : (
                <div className={styles.friendsList}>
                  {friends.map(friend => (
                    <div key={friend._id} className={styles.friendItem}>
                      <div className={styles.friendInfo}>
                        <div className={styles.friendName}>{friend.name}</div>
                        <div className={styles.friendEmail}>{friend.email}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => handleNudge(friend._id, friend.name)}
                          className={styles.nudgeBtn}
                        >
                          Nudge
                        </button>
                        <button 
                          onClick={() => handleCheer(friend._id)}
                          className={styles.cheerBtn}
                        >
                          Cheer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className={styles.tabContent}>
            {/* Active Session */}
            {activeSession && (
              <div className={styles.activeSession}>
                <div className={styles.activeSessionHeader}>
                  <div>
                    <div className={styles.activeSessionTitle}>
                      {activeSession.topic}
                    </div>
                    <div className={styles.activeSessionParticipants}>
                      Participants: {activeSession.participants?.length || 1}
                    </div>
                  </div>
                  <div>
                    <button
                      onClick={handleLeaveSession}
                      className={styles.leaveSessionBtn}
                    >
                      Leave
                    </button>
                    <button
                      onClick={handleEndSession}
                      className={styles.endSessionBtn}
                    >
                      End Session
                    </button>
                  </div>
                </div>
                <div className={styles.activeSessionTimer}>
                  Timer: {formatTime(sessionTimer)}
                </div>
                <div style={{ fontSize: '13px', color: '#666' }}>
                  {isTimerRunning ? 'Session in progress' : 'Paused'}
                </div>
              </div>
            )}

            {/* Create Session */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Start a Study Session</h3>
              <form onSubmit={handleCreateSession} className={styles.createForm}>
                <input
                  type="text"
                  placeholder="What are you studying?"
                  value={sessionTopic}
                  onChange={(e) => setSessionTopic(e.target.value)}
                  className={styles.createInput}
                />
                <button type="submit" className={styles.createBtn}>
                  Create Session
                </button>
              </form>
            </div>

            {/* Active Sessions List */}
            <div className={styles.sessionContainer}>
              <div className={styles.sessionHeader}>
                <h3 className={styles.sessionTitle}>Active Sessions</h3>
                <button
                  onClick={fetchActiveSessions}
                  className={styles.refreshBtn}
                >
                  Refresh
                </button>
              </div>
              {sessions.length === 0 ? (
                <div className={styles.emptyState}>
                  No active sessions. Start one above!
                </div>
              ) : (
                <div className={styles.sessionGrid}>
                  {sessions.map(session => (
                    <div key={session._id} className={styles.sessionCard}>
                      <h4>{session.topic}</h4>
                      <div className={styles.meta}>
                        Created by: {session.createdBy?.name || 'Someone'}
                      </div>
                      <div className={styles.participants}>
                        Participants: {session.participants?.length || 1}
                      </div>
                      <div className={styles.meta}>
                        Started: {formatDate(session.startTime)}
                      </div>
                      <div className={styles.badge}>Active</div>
                      <div className={styles.sessionActions}>
                        <button
                          onClick={() => handleJoinSession(session._id)}
                          className={styles.joinBtn}
                        >
                          Join Session
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add Friend Tab */}
        {activeTab === 'add' && (
          <div className={styles.tabContent}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Add New Friend</h3>
              <form onSubmit={handleSendRequest} className={styles.addFriendForm}>
                <input
                  type="text"
                  placeholder="Enter friend's email or username"
                  value={friendIdentifier}
                  onChange={(e) => setFriendIdentifier(e.target.value)}
                  required
                  className={styles.addFriendInput}
                />
                <button type="submit" className={styles.addFriendBtn}>
                  Send Request
                </button>
              </form>
              <p style={{ fontSize: '12px', color: '#666', marginTop: '12px' }}>
                Tip: You can search by email (name@example.com) or username
              </p>
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className={styles.tabContent}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Friend Activity</h3>
              {activities.length === 0 ? (
                <div className={styles.emptyState}>
                  No activity yet. Friends will show up here!
                </div>
              ) : (
                <div className={styles.activityFeed}>
                  {activities.map(activity => (
                    <div key={activity._id} className={styles.activityItem}>
                      <div className={styles.activityContent}>
                        <div className={styles.activityMessage}>
                          {activity.message || 
                            `${activity.user?.name || 'Someone'} ${activity.type.replace('_', ' ')}`}
                        </div>
                        <div className={styles.activityTime}>
                          {formatDate(activity.createdAt)}
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

// ============= WRAPPED EXPORT =============
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