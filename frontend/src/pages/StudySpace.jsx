import React, { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { StudyProvider, useStudy } from '../context/StudyContext';
import styles from '../styles/studySpace.module.css';  

function StudySpaceContent() {
  const { dueTopics, topics, addTopic, reviewTopic, deleteTopic, loading } = useStudy();
  const [newTopic, setNewTopic] = useState({ name: '', subject: '', difficulty: 'medium' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState('all');

  const handleAddTopic = async (e) => {
    e.preventDefault();
    if (!newTopic.name.trim() || !newTopic.subject.trim()) {
      alert('Please fill in all fields');
      return;
    }
    const result = await addTopic(newTopic);
    if (result.success) {
      setNewTopic({ name: '', subject: '', difficulty: 'medium' });
      setShowAddForm(false);
    }
  };

  const totalTopics = topics.length;
  const masteredCount = topics.filter(t => t.mastered).length;
  const dueCount = dueTopics.length;

  const filteredTopics = topics.filter(topic => {
    if (filter === 'mastered') return topic.mastered;
    if (filter === 'active') return !topic.mastered;
    return true;
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className={styles.loading}>Loading your study topics...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}> Study Space</h1>
          <p className={styles.subtitle}>Track your topics and review them with active recall.</p>
        </div>

        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Total Topics</div>
            <div className={styles.statNumber}>{totalTopics}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}> Mastered</div>
            <div className={`${styles.statNumber} ${styles.green}`}>{masteredCount}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}> Due for Review</div>
            <div className={`${styles.statNumber} ${styles.orange}`}>{dueCount}</div>
          </div>
        </div>

        {/* Add Topic Button */}
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={styles.addBtn}
        >
          {showAddForm ? '− Cancel' : '+ Add Topic'}
        </button>

        {/* Add Topic Form */}
        {showAddForm && (
          <form onSubmit={handleAddTopic} className={styles.form}>
            <div className={styles.formGrid}>
              <input
                type="text"
                placeholder="Topic name"
                value={newTopic.name}
                onChange={(e) => setNewTopic({ ...newTopic, name: e.target.value })}
                required
                className={styles.formInput}
              />
              <input
                type="text"
                placeholder="Subject"
                value={newTopic.subject}
                onChange={(e) => setNewTopic({ ...newTopic, subject: e.target.value })}
                required
                className={styles.formInput}
              />
              <select
                value={newTopic.difficulty}
                onChange={(e) => setNewTopic({ ...newTopic, difficulty: e.target.value })}
                className={styles.formSelect}
              >
                <option value="easy">Easy</option>
                <option value="medium"> Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <button type="submit" className={styles.submitBtn}>
              Add Topic
            </button>
          </form>
        )}

        {/* Due for Review */}
        <h2 className={styles.sectionTitle}> Due for Review Today</h2>
        {dueTopics.length === 0 ? (
          <p className={styles.emptyState}>No topics due today. Great job!</p>
        ) : (
          <div className={styles.dueList}>
            {dueTopics.map(topic => (
              <div key={topic._id} className={styles.dueCard}>
                <div className={styles.dueInfo}>
                  <div className={styles.dueName}>{topic.name}</div>
                  <div className={styles.dueMeta}>
                    {topic.subject} • {topic.difficulty}
                  </div>
                  <div className={styles.dueReviewCount}>
                    Reviews: {topic.reviewCount} • Interval: {topic.interval} days
                  </div>
                </div>
                <div className={styles.dueActions}>
                  <button
                    onClick={() => reviewTopic(topic._id)}
                    className={styles.reviewBtn}
                  >
                     Review
                  </button>
                  <button
                    onClick={() => deleteTopic(topic._id)}
                    className={styles.deleteBtn}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* All Topics */}
        <h2 className={styles.sectionTitle}>All Topics</h2>

        {/* Filter Buttons */}
        <div className={styles.filterGroup}>
          <button
            onClick={() => setFilter('all')}
            className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`${styles.filterBtn} ${filter === 'active' ? styles.active : ''}`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('mastered')}
            className={`${styles.filterBtn} ${filter === 'mastered' ? styles.active : ''}`}
          >
             Mastered
          </button>
        </div>

        {filteredTopics.length === 0 ? (
          <p className={styles.emptyState}>No topics in this category.</p>
        ) : (
          <div className={styles.topicList}>
            {filteredTopics.map(topic => (
              <div
                key={topic._id}
                className={`${styles.topicItem} ${topic.mastered ? styles.mastered : ''}`}
              >
                <div>
                  <span className={styles.topicName}>{topic.name}</span>
                  <span className={styles.topicSubject}>{topic.subject}</span>
                  <span className={styles.topicStatus}>
                    {topic.mastered ? ' Mastered' : `Next review: ${topic.nextReviewDate ? new Date(topic.nextReviewDate).toLocaleDateString() : 'Not scheduled'}`}
                  </span>
                </div>
                <button
                  onClick={() => deleteTopic(topic._id)}
                  className={styles.topicDelete}
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function StudySpace() {
  return (
    <StudyProvider>
      <StudySpaceContent />
    </StudyProvider>
  );
}

export default StudySpace;