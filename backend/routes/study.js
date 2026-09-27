const express = require('express');
const router = express.Router();
const StudyTopic = require('../models/StudyTopic');
const auth = require('../middleware/authMiddleware');

// ==========================================
// GET ALL TOPICS FOR USER
// ==========================================

router.get('/topics', auth, async (req, res) => {
  try {
    const topics = await StudyTopic.find({
      user: req.user.userId
    }).sort({ createdAt: -1 });

    res.json(topics);

  } catch (error) {
    console.error('Get topics error:', error);
    res.status(500).json({
      message: 'Failed to fetch study topics'
    });
  }
});


// ==========================================
// GET TOPICS DUE FOR REVIEW
// ==========================================

router.get('/due', auth, async (req, res) => {
  try {
    const topics = await StudyTopic.find({
      user: req.user.userId,
      mastered: false,
      nextReviewDate: { $lte: new Date() }
    }).sort({
      nextReviewDate: 1
    });

    res.json(topics);

  } catch (error) {
    console.error('Get due topics error:', error);
    res.status(500).json({
      message: 'Failed to fetch topics due for review'
    });
  }
});


// ==========================================
// CREATE NEW STUDY TOPIC
// ==========================================

router.post('/topics', auth, async (req, res) => {
  try {

    const { name, subject, difficulty } = req.body;

    // Validate required fields
    if (!name || !subject) {
      return res.status(400).json({
        message: 'Name and subject are required'
      });
    }

    const topic = new StudyTopic({
      user: req.user.userId,
      name: name.trim(),
      subject: subject.trim(),
      difficulty: difficulty || 'medium',
      nextReviewDate: new Date()
    });

    await topic.save();

    res.status(201).json(topic);

  } catch (error) {
    console.error('Create topic error:', error);

    res.status(400).json({
      message: error.message
    });
  }
});


// ==========================================
// REVIEW A STUDY TOPIC
// ==========================================

router.post('/topics/:id/review', auth, async (req, res) => {
  try {

    const topic = await StudyTopic.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!topic) {
      return res.status(404).json({
        message: 'Topic not found'
      });
    }

    const now = new Date();

    // Double the review interval
    const nextInterval = Math.min(topic.interval * 2, 30);

    const nextReviewDate = new Date(now);

    nextReviewDate.setDate(
      nextReviewDate.getDate() + nextInterval
    );

    topic.lastReviewed = now;
    topic.reviewCount += 1;
    topic.interval = nextInterval;
    topic.nextReviewDate = nextReviewDate;

    // Mark as mastered after enough successful reviews
    if (
      topic.reviewCount >= 5 &&
      topic.interval >= 14
    ) {
      topic.mastered = true;
    }

    await topic.save();

    res.json(topic);

  } catch (error) {
    console.error('Review topic error:', error);

    res.status(500).json({
      message: 'Failed to review topic'
    });
  }
});


// ==========================================
// DELETE A STUDY TOPIC
// ==========================================

router.delete('/topics/:id', auth, async (req, res) => {
  try {

    const topic = await StudyTopic.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!topic) {
      return res.status(404).json({
        message: 'Topic not found'
      });
    }

    res.json({
      message: 'Topic deleted successfully'
    });

  } catch (error) {
    console.error('Delete topic error:', error);

    res.status(500).json({
      message: 'Failed to delete topic'
    });
  }
});


// ==========================================
// GET PRIORITIZED STUDY TOPICS
// ==========================================

router.get('/priorities', auth, async (req, res) => {
  try {

    let limit = parseInt(req.query.limit) || 50;

    // Keep limit within a reasonable range
    limit = Math.min(Math.max(limit, 1), 100);

    const topics = await StudyTopic.find({
      user: req.user.userId,
      mastered: false
    }).limit(limit);

    if (topics.length === 0) {
      return res.json({
        total: 0,
        priorities: []
      });
    }

    const now = new Date();

    const prioritized = topics.map(topic => {

      let urgencyScore = 0;

      // ============================
      // URGENCY SCORE
      // ============================

      if (topic.nextReviewDate) {

        const daysUntilReview = Math.ceil(
          (new Date(topic.nextReviewDate) - now) /
          (1000 * 60 * 60 * 24)
        );

        if (daysUntilReview <= 0) {
          urgencyScore = 10;
        } else if (daysUntilReview <= 1) {
          urgencyScore = 9;
        } else if (daysUntilReview <= 3) {
          urgencyScore = 7;
        } else if (daysUntilReview <= 5) {
          urgencyScore = 5;
        } else if (daysUntilReview <= 7) {
          urgencyScore = 3;
        } else {
          urgencyScore = 1;
        }
      }


      // ============================
      // DIFFICULTY SCORE
      // ============================

      const difficultyMap = {
        easy: 1,
        medium: 3,
        hard: 5
      };

      const difficultyScore =
        difficultyMap[topic.difficulty] || 3;


      // ============================
      // MASTERY SCORE
      // ============================

      const masteryScore = Math.max(
        0,
        5 - topic.reviewCount
      );


      // ============================
      // TIME BONUS
      // ============================

      let timeBonus = 0;

      if (!topic.lastReviewed) {

        timeBonus = 3;

      } else {

        const daysSinceReview = Math.ceil(
          (now - new Date(topic.lastReviewed)) /
          (1000 * 60 * 60 * 24)
        );

        if (daysSinceReview > 7) {
          timeBonus = 2;
        } else if (daysSinceReview > 3) {
          timeBonus = 1;
        }
      }


      // ============================
      // TOTAL SCORE
      // ============================

      const totalScore =
        urgencyScore +
        difficultyScore +
        masteryScore +
        timeBonus;


      return {
        ...topic.toObject(),
        priorityScore: totalScore,
        urgencyScore,
        difficultyScore,
        masteryScore,
        timeBonus
      };
    });


    // Highest priority first
    prioritized.sort(
      (a, b) => b.priorityScore - a.priorityScore
    );


    // Add ranking
    prioritized.forEach((topic, index) => {
      topic.rank = index + 1;
    });


    res.json({
      total: prioritized.length,
      priorities: prioritized
    });

  } catch (error) {

    console.error('Priority calculation error:', error);

    res.status(500).json({
      message: 'Failed to calculate study priorities'
    });
  }
});


// ==========================================
// GET STUDY STREAK
// ==========================================

router.get('/streak', auth, async (req, res) => {
  try {

    const thirtyDaysAgo = new Date();

    thirtyDaysAgo.setDate(
      thirtyDaysAgo.getDate() - 30
    );


    const reviews = await StudyTopic.find({
      user: req.user.userId,
      lastReviewed: {
        $gte: thirtyDaysAgo
      }
    }).select('lastReviewed');


    // Create a set of unique review dates
    const reviewDates = new Set(
      reviews
        .filter(review => review.lastReviewed)
        .map(review =>
          new Date(
            review.lastReviewed
          ).toDateString()
        )
    );


    const today = new Date();

    const todayString =
      today.toDateString();


    const yesterday = new Date(today);

    yesterday.setDate(
      yesterday.getDate() - 1
    );

    const yesterdayString =
      yesterday.toDateString();


    // If there wasn't a review today or yesterday,
    // the streak is zero.
    if (
      !reviewDates.has(todayString) &&
      !reviewDates.has(yesterdayString)
    ) {
      return res.json({
        streak: 0
      });
    }


    // Start from today if reviewed today.
    // Otherwise start from yesterday.
    let currentDate = reviewDates.has(todayString)
      ? new Date(today)
      : new Date(yesterday);

    let streak = 0;


    while (
      reviewDates.has(
        currentDate.toDateString()
      )
    ) {

      streak++;

      currentDate.setDate(
        currentDate.getDate() - 1
      );
    }


    res.json({
      streak
    });

  } catch (error) {

    console.error('Study streak error:', error);

    res.status(500).json({
      message: 'Failed to calculate study streak'
    });
  }
});


module.exports = router;