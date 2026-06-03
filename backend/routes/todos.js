const express = require('express');
const router = express.Router();
const Todo = require('../models/Todo');
const auth = require('../middleware/authMiddleware'); 

// Get all todos for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.user.userId }).sort({ createdAt: -1 });
    res.json(todos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new todo
router.post('/', auth, async (req, res) => {
  try {
    const todo = new Todo({
      user: req.user.userId,  // ✅ Use userId (from your token)
      text: req.body.text,
      completed: req.body.completed || false
    });
    const savedTodo = await todo.save();
    res.status(201).json(savedTodo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a todo
router.put('/:id', auth, async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user.userId });  // ✅ Use userId
    if (!todo) return res.status(404).json({ message: 'Todo not found' });
    
    todo.text = req.body.text || todo.text;
    todo.completed = req.body.completed !== undefined ? req.body.completed : todo.completed;
    
    const updatedTodo = await todo.save();
    res.json(updatedTodo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a todo
router.delete('/:id', auth, async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({ _id: req.params.id, user: req.user.userId });  // ✅ Use userId
    if (!todo) return res.status(404).json({ message: 'Todo not found' });
    res.json({ message: 'Todo deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;