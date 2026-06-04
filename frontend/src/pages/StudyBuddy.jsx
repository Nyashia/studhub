import React, { useState, useEffect } from 'react';  // ✅ ADD useEffect here
import DashboardLayout from '../components/layout/DashboardLayout';
import { StudyBuddyProvider, useStudyBuddy } from '../context/StudyBuddyContext';
import { useSocket } from '../context/SocketContext';
import styles from '../styles/studybuddy.module.css';

function StudyBuddyContent() {
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


  const { sendNudge, isConnected, notifications, clearNotification } = useSocket();

 
  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        clearNotification(notifications[0]?.id);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notifications, clearNotification]);

  const [activeTab, setActiveTab] = useState('friends');
  const [friendIdentifier, setFriendIdentifier] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleNudge = (friendId, friendName) => {
    sendNudge(friendId, `${friendName} sent you a nudge! Time to study `);
    setSuccessMsg(`Nudged ${friendName}!`);
    setTimeout(() => setSuccessMsg(''), 2000);
  };

  

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
      setSuccessMsg('Cheer sent! ');
      setTimeout(() => setSuccessMsg(''), 2000);
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffHours = Math.floor((now - activityDate) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    return activityDate.toLocaleDateString();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className={styles.loading}>Loading your study buddies...</div>
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
            zIndex: 1000,
            animation: 'slideIn 0.3s ease'
          }}>
            {notif.message}
            <button 
              onClick={() => clearNotification(notif.id)} 
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
        ))}

        <div className={styles.header}>
          <h1 className={styles.title}>Study Buddy</h1>
          <p className={styles.subtitle}>Connect with friends and stay accountable</p>
          {isConnected && <span style={{ fontSize: '12px', color: 'green' }}>● Connected</span>}
        </div>

        {successMsg && <div className={styles.successMessage}>{successMsg}</div>}
        {errorMsg && <div className={styles.errorMessage}>{errorMsg}</div>}

        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
          <button
            onClick={() => setActiveTab('friends')}
            style={{
              padding: '10px 20px',
              background: activeTab === 'friends' ? '#1a1a2e' : 'transparent',
              color: activeTab === 'friends' ? 'white' : '#666',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
             Friends ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab('add')}
            style={{
              padding: '10px 20px',
              background: activeTab === 'add' ? '#1a1a2e' : 'transparent',
              color: activeTab === 'add' ? 'white' : '#666',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
             Add Friend
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            style={{
              padding: '10px 20px',
              background: activeTab === 'activity' ? '#1a1a2e' : 'transparent',
              color: activeTab === 'activity' ? 'white' : '#666',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
             Activity Feed
          </button>
        </div>

        {/* Friends Tab */}
        {activeTab === 'friends' && (
          <div>
            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Pending Requests ({pendingRequests.length})</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {pendingRequests.map(request => (
                    <div key={request._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f5f5f5', borderRadius: '8px' }}>
                      <div>
                        <div style={{ fontWeight: '500' }}>{request.from.name}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>{request.from.email}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleAccept(request._id)} style={{ padding: '6px 12px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Accept</button>
                        <button onClick={() => handleDecline(request._id)} style={{ padding: '6px 12px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Decline</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Friends List */}
            <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Your Friends ({friends.length})</h3>
            {friends.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>No friends yet. Go to "Add Friend" to connect!</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {friends.map(friend => (
                  <div key={friend._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f5f5f5', borderRadius: '8px' }}>
                    <div>
                      <div style={{ fontWeight: '500' }}>{friend.name}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>{friend.email}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => handleNudge(friend._id, friend.name)}
                        style={{ padding: '6px 12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        Nudge
                      </button>
                      <button 
                        onClick={() => handleCheer(friend._id)}
                        style={{ padding: '6px 12px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                      >
                         Cheer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add Friend Tab */}
        {activeTab === 'add' && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #ddd' }}>
            <h3 style={{ marginBottom: '16px' }}>Add New Friend</h3>
            <form onSubmit={handleSendRequest} style={{ display: 'flex', gap: '12px' }}>
              <input
                type="text"
                placeholder="Enter friend's email or username"
                value={friendIdentifier}
                onChange={(e) => setFriendIdentifier(e.target.value)}
                required
                style={{ flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
              />
              <button type="submit" style={{ padding: '12px 24px', background: '#1a1a2e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Send Request</button>
            </form>
           </div>
        )}

        {/* Activity Feed Tab */}
        {activeTab === 'activity' && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #ddd' }}>
            <h3 style={{ marginBottom: '16px' }}>Friend Activity</h3>
            {activities.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>No activity yet. Friends will show up here!</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {activities.map(activity => (
                  <div key={activity._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f5f5f5', borderRadius: '8px' }}>
                    <div style={{ fontSize: '24px' }}>
                      {activity.type === 'completed_task'}
                      {activity.type === 'completed_assessment'}
                      {activity.type === 'cheered'}
                      {activity.type === 'joined_studhub'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div>{activity.message || `${activity.user?.name || 'Someone'} ${activity.type.replace('_', ' ')}`}</div>
                      <div style={{ fontSize: '11px', color: '#999' }}>{formatTime(activity.createdAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function StudyBuddy() {
  return (
    <StudyBuddyProvider>
      <StudyBuddyContent />
    </StudyBuddyProvider>
  );
}

export default StudyBuddy;