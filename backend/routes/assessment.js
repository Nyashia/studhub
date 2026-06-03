const express = require("express");
const router = express.Router();
const Assessment = require("../models/Assessment");
const protect = require("../middleware/authMiddleware");

// GET all assessments for logged-in user (sorted by date, closest first)
router.get("/", protect, async (req, res) => {
  try {
    const assessments = await Assessment.find({ user: req.user.userId }).sort({ date: 1 });
    res.json(assessments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single assessment
router.get("/:id", protect, async (req, res) => {
  try {
    const assessment = await Assessment.findOne({
      _id: req.params.id,
      user: req.user.userId  
    });
    if (!assessment) return res.status(404).json({ message: "Assessment not found" });
    res.json(assessment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE new assessment
router.post("/", protect, async (req, res) => {
  try {
    const { name, subject, date, notes, type } = req.body;
    const assessment = await Assessment.create({
      user: req.user.userId,  
      name,
      subject,
      date,
      notes,
      type
    });
    res.status(201).json(assessment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// UPDATE assessment
router.put("/:id", protect, async (req, res) => {
  try {
    const assessment = await Assessment.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },  
      req.body,
      { new: true, runValidators: true }
    );
    if (!assessment) return res.status(404).json({ message: "Assessment not found" });
    res.json(assessment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE assessment
router.delete("/:id", protect, async (req, res) => {
  try {
    const assessment = await Assessment.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId  
    });
    if (!assessment) return res.status(404).json({ message: "Assessment not found" });
    res.json({ message: "Assessment deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;