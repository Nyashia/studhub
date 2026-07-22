const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const auth = require('../middleware/authMiddleware');

// ========== CREATE ==========
router.post('/', auth, async (req, res) => {
    try {
        const { topic } = req.body;
        if (!topic) {
            return res.status(400).json({ message: 'Topic is required' });
        }

        const userId = req.user.userId || req.user._id;

        const session = new Session({
            createdBy: userId,
            participants: [userId],
            topic,
            status: 'active',
            startTime: new Date()
        });

        await session.save();
        await session.populate('participants', 'name email');
        res.status(201).json(session);
    } catch (error) {
        console.error('Create session error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ========== GET ACTIVE SESSIONS ==========
router.get('/active', auth, async (req, res) => {
    try {
        const sessions = await Session.find({ status: 'active' })
            .populate('createdBy', 'name')
            .populate('participants', 'name')
            .sort({ createdAt: -1 });
        res.json(sessions);
    } catch (error) {
        console.error('Get active sessions error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ========== GET SESSION BY ID  ==========
router.get('/:id', auth, async (req, res) => {
    try {
        const session = await Session.findOne({
            _id: req.params.id
        })
            .populate('createdBy', 'name')
            .populate('participants', 'name');

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        res.json(session);
    } catch (error) {
        console.error('Get session error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ========== JOIN SESSION BY ID ==========
router.post('/:id/join', auth, async (req, res) => {
    try {
        const userId = req.user.userId || req.user._id;
        const session = await Session.findOne({
            _id: req.params.id,
            status: 'active'
        });

        if (!session) {
            return res.status(404).json({ message: 'Session not found or inactive' });
        }

        // Check if user is already in session
        const alreadyJoined = session.participants.some(
            p => p.toString() === userId.toString()
        );

        if (!alreadyJoined) {
            session.participants.push(userId);
            await session.save();
        }

        await session.populate('participants', 'name email');
        res.json(session);
    } catch (error) {
        console.error('Join session error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ========== LEAVE SESSION ==========
router.put('/:id/leave', auth, async (req, res) => {
    try {
        const userId = req.user.userId || req.user._id;
        const session = await Session.findOne({
            _id: req.params.id,
            status: 'active'
        });

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        // Remove user from participants
        session.participants = session.participants.filter(
            p => p.toString() !== userId.toString()
        );

        // If no participants left, mark as completed
        if (session.participants.length === 0) {
            session.status = 'completed';
            session.endTime = new Date();
            session.duration = Math.round((session.endTime - session.startTime) / 60000);
        }

        await session.save();
        res.json(session);
    } catch (error) {
        console.error('Leave session error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ========== END SESSION ==========
router.put('/:id/end', auth, async (req, res) => {
    try {
        const userId = req.user.userId || req.user._id;
        const session = await Session.findOne({
            _id: req.params.id,
            createdBy: userId,
            status: { $in: ['active', 'paused'] }
        });

        if (!session) {
            return res.status(404).json({ message: 'Session not found or you are not the creator' });
        }

        session.status = 'ended';
        session.endTime = new Date();
        session.duration = Math.round((session.endTime - session.startTime) / 60000);

        await session.save();
        res.json(session);
    } catch (error) {
        console.error('End session error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ========== GET USER'S SESSIONS ==========
router.get('/my-sessions', auth, async (req, res) => {
    try {
        const userId = req.user.userId || req.user._id;
        const sessions = await Session.find({
            $or: [
                { createdBy: userId },
                { participants: userId }
            ]
        })
            .populate('createdBy', 'name')
            .populate('participants', 'name')
            .sort({ createdAt: -1 })
            .limit(20);
        res.json(sessions);
    } catch (error) {
        console.error('Get my sessions error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ========== TASK MANAGEMENT ==========

// Add task to session
router.post('/:id/tasks', auth, async (req, res) => {
    try {
        const userId = req.user.userId || req.user._id;
        const { text } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({ message: 'Task text is required' });
        }

        const session = await Session.findOne({
            _id: req.params.id,
            status: 'active'
        });

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        session.tasks.push({
            text: text.trim(),
            createdBy: userId
        });

        await session.save();
        await session.populate('tasks.createdBy', 'name');
        res.status(201).json(session);
    } catch (error) {
        console.error('Add task error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Toggle task completion
router.put('/:id/tasks/:taskId/toggle', auth, async (req, res) => {
    try {
        const session = await Session.findOne({
            _id: req.params.id,
            status: 'active'
        });

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        const task = session.tasks.id(req.params.taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        task.completed = !task.completed;
        await session.save();
        await session.populate('tasks.createdBy', 'name');
        res.json(session);
    } catch (error) {
        console.error('Toggle task error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete task
router.delete('/:id/tasks/:taskId', auth, async (req, res) => {
    try {
        const session = await Session.findOne({
            _id: req.params.id,
            status: 'active'
        });

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        session.tasks = session.tasks.filter(t => t._id.toString() !== req.params.taskId);
        await session.save();
        res.json(session);
    } catch (error) {
        console.error('Delete task error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;