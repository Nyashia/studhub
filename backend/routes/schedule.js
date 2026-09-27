const express = require("express");
const router = express.Router();
const Schedule = require("../models/Schedule");
const protect = require("../middleware/authMiddleware");

// =====================================================
// GET USER'S SCHEDULE
// =====================================================

router.get("/", protect, async (req, res) => {
  try {
    let schedule = await Schedule.findOne({
      user: req.user.userId
    });

    // Create an empty schedule if the user doesn't have one
    if (!schedule) {
      schedule = await Schedule.create({
        user: req.user.userId,
        classes: [],
        theme: "default"
      });
    }

    res.json(schedule);

  } catch (error) {
    console.error("Get schedule error:", error);

    res.status(500).json({
      message: "Failed to load schedule"
    });
  }
});


// =====================================================
// ADD A CLASS
// =====================================================

router.post("/classes", protect, async (req, res) => {
  try {
    const {
      subject,
      code,
      day,
      startTime,
      endTime,
      location,
      color
    } = req.body;

    // Required fields
    if (!subject || !day || !startTime || !endTime) {
      return res.status(400).json({
        message: "Subject, day, start time and end time are required"
      });
    }

    let schedule = await Schedule.findOne({
      user: req.user.userId
    });

    // Create schedule if one doesn't exist
    if (!schedule) {
      schedule = new Schedule({
        user: req.user.userId,
        classes: []
      });
    }

    schedule.classes.push({
      subject: subject.trim(),
      code: code ? code.trim() : "",
      day,
      startTime,
      endTime,
      location: location ? location.trim() : "",
      color: color || "#e07a5f"
    });

    await schedule.save();

    res.status(201).json(schedule);

  } catch (error) {
    console.error("Add class error:", error);

    res.status(400).json({
      message: "Failed to add class"
    });
  }
});


// =====================================================
// UPDATE A CLASS
// =====================================================

router.put("/classes/:classId", protect, async (req, res) => {
  try {
    const schedule = await Schedule.findOne({
      user: req.user.userId
    });

    if (!schedule) {
      return res.status(404).json({
        message: "Schedule not found"
      });
    }

    const classItem = schedule.classes.id(req.params.classId);

    if (!classItem) {
      return res.status(404).json({
        message: "Class not found"
      });
    }

    const {
      subject,
      code,
      day,
      location,
      color,
      startTime,
      endTime
    } = req.body;

    // Only update fields that were actually provided
    if (subject !== undefined) {
      classItem.subject = subject.trim();
    }

    if (code !== undefined) {
      classItem.code = code.trim();
    }

    if (day !== undefined) {
      classItem.day = day;
    }

    if (location !== undefined) {
      classItem.location = location.trim();
    }

    if (color !== undefined) {
      classItem.color = color;
    }

    if (startTime !== undefined) {
      classItem.startTime = startTime;
    }

    if (endTime !== undefined) {
      classItem.endTime = endTime;
    }

    await schedule.save();

    res.json(schedule);

  } catch (error) {
    console.error("Update class error:", error);

    res.status(400).json({
      message: "Failed to update class"
    });
  }
});


// =====================================================
// DELETE A CLASS
// =====================================================

router.delete("/classes/:classId", protect, async (req, res) => {
  try {
    const schedule = await Schedule.findOne({
      user: req.user.userId
    });

    if (!schedule) {
      return res.status(404).json({
        message: "Schedule not found"
      });
    }

    const classItem = schedule.classes.id(req.params.classId);

    if (!classItem) {
      return res.status(404).json({
        message: "Class not found"
      });
    }

    classItem.deleteOne();

    await schedule.save();

    res.json(schedule);

  } catch (error) {
    console.error("Delete class error:", error);

    res.status(500).json({
      message: "Failed to delete class"
    });
  }
});


// =====================================================
// UPDATE THEME
// =====================================================

router.put("/theme", protect, async (req, res) => {
  try {
    const { theme } = req.body;

    if (!theme) {
      return res.status(400).json({
        message: "Theme is required"
      });
    }

    const schedule = await Schedule.findOneAndUpdate(
      { user: req.user.userId },
      {
        theme,
        updatedAt: new Date()
      },
      {
        new: true,
        upsert: true
      }
    );

    res.json(schedule);

  } catch (error) {
    console.error("Update schedule theme error:", error);

    res.status(400).json({
      message: "Failed to update schedule theme"
    });
  }
});


module.exports = router;