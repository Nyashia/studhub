const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const protect = require("../middleware/authMiddleware");

///////////// Get ALL tasks for logged-in user
router.get("/", protect, async (req, res) => {
  try {
    const { status, dueBefore, dueAfter } = req.query;

    let filter = { user: req.user.userId };

    // Filter by status
    if (status) {
      filter.status = status;
    }

    // Filter by due date range
    if (dueBefore || dueAfter) {
      filter.dueDate = {};

      if (dueBefore) {
        filter.dueDate.$lte = new Date(dueBefore);
      }

      if (dueAfter) {
        filter.dueDate.$gte = new Date(dueAfter);
      }
    }

    const tasks = await Task.find(filter).sort({ dueDate: 1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


///////////// Get ONE task 
router.get("/:id", protect, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!task) return res.status(404).json({ message: "Task not found" });

    res.json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

///////////// Create new task 
router.post("/", protect, async (req, res) => {
  try {
    const { title, description, dueDate, status } = req.body;

    const newTask = new Task({
      title,
      description,
      dueDate,
      status,
      user: req.user.userId
    });

    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

///////////// Update task 
router.put("/:id", protect, async (req, res) => {
  try {
    const updatedTask = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      req.body,
      { new: true }
    );

    if (!updatedTask)
      return res.status(404).json({ message: "Task not found" });

    res.json(updatedTask);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

///////////// Delete task 
router.delete("/:id", protect, async (req, res) => {
  try {
    const deletedTask = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!deletedTask)
      return res.status(404).json({ message: "Task not found" });

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;