const express = require("express");
const router = express.Router();
const Schedule = require("../models/Schedule");
const protect = require("../middleware/authMiddleware");

router.get("/", protect, async (req, res) => {
  try {
    let schedule = await Schedule.findOne({ user: req.user.userId });
    
    if (!schedule) {
      schedule = await Schedule.create({
        user: req.user.userId,
        classes: [],
        theme: 'default'
      });
    }
    
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/classes", protect, async (req, res) => {
  try {
    const { subject, day, startTime, endTime, location, color } = req.body;
    
    let schedule = await Schedule.findOne({ user: req.user.userId });
    
    if (!schedule) {
      schedule = new Schedule({ user: req.user.userId, classes: [] });
    }
    
    schedule.classes.push({
      subject,
      day,
      startTime,
      endTime,
      location,
      color: color || "#4CAF50"
    });
    
    await schedule.save();
    res.status(201).json(schedule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/classes/:classId", protect, async (req, res) => {
  try {
    const schedule = await Schedule.findOne({ user: req.user.userId });
    
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }
    
    schedule.classes = schedule.classes.filter(
      c => c._id.toString() !== req.params.classId
    );
    
    await schedule.save();
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;