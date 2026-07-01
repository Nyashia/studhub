const mongoose = require('mongoose');

const studyTopicSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  lastReviewed: {
    type: Date,
    default: null
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  interval: {
    type: Number,  // days between reviews
    default: 1
  },
  nextReviewDate: {
    type: Date,
    default: null
  },
  mastered: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for quick queries
studyTopicSchema.index({ user: 1, nextReviewDate: 1 });

module.exports = mongoose.model('StudyTopic', studyTopicSchema);