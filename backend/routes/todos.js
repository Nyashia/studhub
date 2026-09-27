const express = require('express');
const router = express.Router();

const Todo = require('../models/Todo');
const auth = require('../middleware/authMiddleware');

// ==========================================
// GET ALL TODOS
// ==========================================

router.get('/', auth, async (req, res) => {
  try {
    const todos = await Todo.find({
      user: req.user.userId
    }).sort({ createdAt: -1 });

    res.json(todos);

  } catch (err) {
    console.error('Error fetching todos:', err);

    res.status(500).json({
      message: 'Failed to fetch todos'
    });
  }
});

// ==========================================
// CREATE TODO
// ==========================================

router.post('/', auth, async (req, res) => {
  try {
    const { text, completed } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        message: 'Todo text is required'
      });
    }

    const todo = new Todo({
      user: req.user.userId,
      text: text.trim(),
      completed: completed || false
    });

    const savedTodo = await todo.save();

    res.status(201).json(savedTodo);

  } catch (err) {
    console.error('Error creating todo:', err);

    res.status(400).json({
      message: err.message
    });
  }
});

// ==========================================
// UPDATE TODO
// ==========================================

router.put('/:id', auth, async (req, res) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!todo) {
      return res.status(404).json({
        message: 'Todo not found'
      });
    }

    if (req.body.text !== undefined) {
      if (!req.body.text.trim()) {
        return res.status(400).json({
          message: 'Todo text cannot be empty'
        });
      }

      todo.text = req.body.text.trim();
    }

    if (req.body.completed !== undefined) {
      todo.completed = req.body.completed;
    }

    const updatedTodo = await todo.save();

    res.json(updatedTodo);

  } catch (err) {
    console.error('Error updating todo:', err);

    res.status(400).json({
      message: err.message
    });
  }
});

// ==========================================
// DELETE TODO
// ==========================================

router.delete('/:id', auth, async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!todo) {
      return res.status(404).json({
        message: 'Todo not found'
      });
    }

    res.json({
      message: 'Todo deleted'
    });

  } catch (err) {
    console.error('Error deleting todo:', err);

    res.status(500).json({
      message: 'Failed to delete todo'
    });
  }
});

module.exports = router;