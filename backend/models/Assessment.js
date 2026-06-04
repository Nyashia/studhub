const mongoose = require("mongoose");
const Activity = require('../models/Activity');


const assessmentSchema = new mongoose.Schema({

  user: {  
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
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
  date: {
    type: Date,
    required: true
  },
  notes: {
    type: String,
    default: ""
  },
  type: {
    type: String,
    enum: ['exam', 'assignment', 'lab', 'test'],
    default: 'assignment'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  completed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});


module.exports = mongoose.model("Assessment", assessmentSchema);