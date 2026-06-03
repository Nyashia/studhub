const mongoose = require("mongoose");

const scheduleItemSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  day: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  location: { type: String, default: "" },
  color: { type: String, default: "#4CAF50" }
});

const scheduleSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  classes: [scheduleItemSchema],
  theme: { type: String, default: 'default' }
});

module.exports = mongoose.model("Schedule", scheduleSchema);