const express = require('express');
const router = express.Router();
const StudyTopic = require('../models/StudyTopic');
const auth = require('../middleware/authMiddleware');

// GET all topics for user
router.get('/topics', auth, async (req, res) => {
  try {
    const topics = await StudyTopic.find({ user: req.user.userId });
    res.json(topics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET topics due for review
router.get('/due', auth, async (req, res) => {
  try {
    const topics = await StudyTopic.find({
      user: req.user.userId,
      mastered: false,
      nextReviewDate: { $lte: new Date() }
    }).sort({ nextReviewDate: 1 });
    res.json(topics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE a new study topic
router.post('/topics', auth, async (req, res) => {
  try {
    const { name, subject, difficulty } = req.body;
    const topic = new StudyTopic({
      user: req.user.userId,
      name,
      subject,
      difficulty,
      nextReviewDate: new Date()
    });
    await topic.save();
    res.status(201).json(topic);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// LOG a study session (mark as reviewed)
router.post('/topics/:id/review', auth, async (req, res) => {
  try {
    const topic = await StudyTopic.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    const now = new Date();
    const nextInterval = topic.interval * 2;
    const nextReviewDate = new Date(now);
    nextReviewDate.setDate(nextReviewDate.getDate() + nextInterval);

    topic.lastReviewed = now;
    topic.reviewCount += 1;
    topic.interval = Math.min(nextInterval, 30);
    topic.nextReviewDate = nextReviewDate;

    if (topic.reviewCount >= 5 && topic.interval >= 14) {
      topic.mastered = true;
    }

    await topic.save();
    res.json(topic);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE a topic
router.delete('/topics/:id', auth, async (req, res) => {
  try {
    await StudyTopic.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });
    res.json({ message: 'Topic deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// GET topics sorted by priority (highest first)
router.get('/priorities', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50; // Safety limit

    const topics = await StudyTopic.find({
      user: req.user.userId,
      mastered: false
    }).limit(limit);

    // If no topics, return empty array early
    if (topics.length === 0) {
      return res.json([]);
    }

    // Calculate priority score for each topic
    const prioritized = topics.map(topic => {
      const now = new Date();

      // 1. URGENCY SCORE (0-10)
      let urgencyScore = 0;
      if (topic.nextReviewDate) {
        const daysUntilReview = Math.ceil(
          (new Date(topic.nextReviewDate) - now) / (1000 * 60 * 60 * 24)
        );
        if (daysUntilReview <= 0) urgencyScore = 10;      // Overdue
        else if (daysUntilReview <= 1) urgencyScore = 9;   // Due today
        else if (daysUntilReview <= 3) urgencyScore = 7;
        else if (daysUntilReview <= 5) urgencyScore = 5;
        else if (daysUntilReview <= 7) urgencyScore = 3;
        else urgencyScore = 1;
      }

      //  DIFFICULTY SCORE (0-5)
      const difficultyMap = { easy: 1, medium: 3, hard: 5 };
      const difficultyScore = difficultyMap[topic.difficulty] || 3;

      //  MASTERY SCORE (fewer reviews = higher priority)
      // 5 - reviewCount, but never negative
      const masteryScore = Math.max(0, 5 - topic.reviewCount);

      // Time since last reviewed (if never reviewed, high priority)
      let timeBonus = 0;
      if (!topic.lastReviewed) {
        timeBonus = 3; // Never reviewed = needs attention
      } else {
        const daysSinceReview = Math.ceil(
          (now - new Date(topic.lastReviewed)) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceReview > 7) timeBonus = 2;
        else if (daysSinceReview > 3) timeBonus = 1;
      }

      // TOTAL SCORE (0-20)
      const totalScore = urgencyScore + difficultyScore + masteryScore + timeBonus;

      return {
        ...topic.toObject(),
        priorityScore: totalScore,
        urgencyScore,
        difficultyScore,
        masteryScore,
        timeBonus
      };
    });

    // Sort by priority score (highest first)
    prioritized.sort((a, b) => b.priorityScore - a.priorityScore);

    // Add a rank field
    prioritized.forEach((topic, index) => {
      topic.rank = index + 1;
    });

    res.json({
      total: prioritized.length,
      priorities: prioritized
    });
  } catch (error) {
    console.error('Priority calculation error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;