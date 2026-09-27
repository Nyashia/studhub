const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],

  topic: {
    type: String,
    required: true,
    trim: true
  },

  status: {
    type: String,
    enum: ["active", "paused", "ended", "completed"],
    default: "active"
  },

  tasks: [
    {
      text: {
        type: String
      },

      completed: {
        type: Boolean,
        default: false
      },

      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    }
  ],

  startTime: {
    type: Date,
    default: Date.now
  },

  endTime: {
    type: Date
  },

  duration: {
    type: Number,
    default: 0
  },

  // Total seconds accumulated before the current timer run
  timerElapsed: {
    type: Number,
    default: 0
  },

  // Whether the shared timer is currently running
  timerRunning: {
    type: Boolean,
    default: false
  },

  // When the current timer run started
  timerStartedAt: {
    type: Date,
    default: null
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for quick queries
sessionSchema.index({
  status: 1,
  createdAt: -1
});

module.exports = mongoose.model("Session", sessionSchema);