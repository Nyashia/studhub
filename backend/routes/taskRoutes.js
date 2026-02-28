const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

///////////////////////////////////////////// task 

//get all tasks
app.get('/task', async (req,res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (error) {
       res.status(500).json({ error: error.message });
  }
});

//get a task by id 
app.get('/task/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

///////////// Create a new task
app.post('/task', async (req, res) => {
  try {
    const { title, description, dueDate, status } = req.body;
    const newTask = new Task({ title, description, dueDate, status });
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

///////////// Update a task
app.put('/task/:id', async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedTask) return res.status(404).json({ message: "Task not found" });
    res.json(updatedTask);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

///////////// Delete a task
app.delete('/task/:id', async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedTask) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
