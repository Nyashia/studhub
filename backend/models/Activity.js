const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  friendId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  type: {
    type: String,
    enum: [
      "completed_task",
      "completed_assessment",
      "joined_studhub",
      "cheered",
      "study_session"
    ],
    required: true
  },

  itemName: {
    type: String,
    default: ""
  },

  duration: {
    type: Number,
    default: 0
  },

  message: {
    type: String,
    default: ""
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Activity", activitySchema);