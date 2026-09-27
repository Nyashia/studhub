const express = require('express');
const router = express.Router();

const Session = require('../models/Session');
const Activity = require('../models/Activity');
const auth = require('../middleware/authMiddleware');


// ==========================================
// CREATE SESSION
// ==========================================

router.post('/', auth, async (req, res) => {
    try {
        const { topic } = req.body;

        if (!topic || !topic.trim()) {
            return res.status(400).json({
                message: 'Topic is required'
            });
        }

        const userId = req.user.userId || req.user._id;

        const session = new Session({
            createdBy: userId,
            participants: [userId],
            topic: topic.trim(),
            status: 'active',
            startTime: new Date(),
            timerElapsed: 0,
            timerRunning: false,
            timerStartedAt: null
        });

        await session.save();

        await session.populate(
            'participants',
            'name email profilePicture'
        );

        res.status(201).json(session);

    } catch (error) {
        console.error('Create session error:', error);

        res.status(500).json({
            message: 'Failed to create study session'
        });
    }
});


// ==========================================
// GET ACTIVE SESSIONS
// ==========================================

router.get('/active', auth, async (req, res) => {
    try {

        const sessions = await Session.find({
            status: 'active'
        })
            .populate(
                'createdBy',
                'name email profilePicture'
            )
            .populate(
                'participants',
                'name email profilePicture'
            )
            .sort({ createdAt: -1 });

        res.json(sessions);

    } catch (error) {
        console.error('Get active sessions error:', error);

        res.status(500).json({
            message: 'Failed to fetch active sessions'
        });
    }
});


// ==========================================
// GET USER'S SESSIONS
// IMPORTANT: This must be BEFORE /:id
// ==========================================

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

        res.status(500).json({
            message: 'Failed to fetch your sessions'
        });
    }
});


// ==========================================
// GET SESSION BY ID
// ==========================================

router.get('/:id', auth, async (req, res) => {
    try {

        const userId = req.user.userId || req.user._id;

        const session = await Session.findOne({
            _id: req.params.id,
            $or: [
                { createdBy: userId },
                { participants: userId }
            ]
        })
            .populate(
                'createdBy',
                'name email profilePicture'
            )
            .populate(
                'participants',
                'name email profilePicture'
            );

        if (!session) {
            return res.status(404).json({
                message: 'Session not found'
            });
        }

        res.json(session);

    } catch (error) {
        console.error('Get session error:', error);

        res.status(500).json({
            message: 'Failed to fetch session'
        });
    }
});


// ==========================================
// JOIN SESSION
// ==========================================

router.post('/:id/join', auth, async (req, res) => {
    try {

        const userId = req.user.userId || req.user._id;

        const session = await Session.findOne({
            _id: req.params.id,
            status: 'active'
        });

        if (!session) {
            return res.status(404).json({
                message: 'Session not found or inactive'
            });
        }

        const alreadyJoined = session.participants.some(
            participant =>
                participant.toString() === userId.toString()
        );

        if (!alreadyJoined) {

            session.participants.push(userId);

            await session.save();
        }

        await session.populate(
            'participants',
            'name email profilePicture'
        );

        res.json(session);

    } catch (error) {
        console.error('Join session error:', error);

        res.status(500).json({
            message: 'Failed to join session'
        });
    }
});


// ==========================================
// LEAVE SESSION
// ==========================================

router.put('/:id/leave', auth, async (req, res) => {
    try {

        const userId = req.user.userId || req.user._id;

        const session = await Session.findOne({
            _id: req.params.id,
            status: 'active',
            participants: userId
        });

        if (!session) {
            return res.status(404).json({
                message: 'Session not found or you are not a participant'
            });
        }


        // Remove user
        session.participants =
            session.participants.filter(
                participant =>
                    participant.toString() !== userId.toString()
            );


        // If nobody is left, complete the session
        if (session.participants.length === 0) {

            // Save current timer time if running
            if (
                session.timerRunning &&
                session.timerStartedAt
            ) {

                const additionalSeconds = Math.floor(
                    (
                        Date.now() -
                        session.timerStartedAt.getTime()
                    ) / 1000
                );

                session.timerElapsed += additionalSeconds;
                session.timerRunning = false;
                session.timerStartedAt = null;
            }

            session.status = 'completed';
            session.endTime = new Date();

            session.duration = Math.round(
                session.timerElapsed / 60
            );
        }

        await session.save();

        res.json(session);

    } catch (error) {
        console.error('Leave session error:', error);

        res.status(500).json({
            message: 'Failed to leave session'
        });
    }
});


// ==========================================
// START SHARED TIMER
// ==========================================

router.post('/:id/timer/start', auth, async (req, res) => {
    try {

        const userId = req.user.userId || req.user._id;

        const session = await Session.findOne({
            _id: req.params.id,
            status: 'active',
            participants: userId
        });

        if (!session) {
            return res.status(404).json({
                message: 'Session not found or you are not a participant'
            });
        }


        // Don't restart an already running timer
        if (session.timerRunning) {
            return res.json(session);
        }


        session.timerRunning = true;
        session.timerStartedAt = new Date();

        await session.save();

        res.json(session);

    } catch (error) {
        console.error('Start timer error:', error);

        res.status(500).json({
            message: 'Failed to start timer'
        });
    }
});


// ==========================================
// PAUSE SHARED TIMER
// ==========================================

router.post('/:id/timer/pause', auth, async (req, res) => {
    try {

        const userId = req.user.userId || req.user._id;

        const session = await Session.findOne({
            _id: req.params.id,
            status: 'active',
            participants: userId
        });

        if (!session) {
            return res.status(404).json({
                message: 'Session not found or you are not a participant'
            });
        }


        // Nothing to pause
        if (
            !session.timerRunning ||
            !session.timerStartedAt
        ) {
            return res.json(session);
        }


        const additionalSeconds = Math.floor(
            (
                Date.now() -
                session.timerStartedAt.getTime()
            ) / 1000
        );


        session.timerElapsed += additionalSeconds;

        session.timerRunning = false;
        session.timerStartedAt = null;

        await session.save();

        res.json(session);

    } catch (error) {
        console.error('Pause timer error:', error);

        res.status(500).json({
            message: 'Failed to pause timer'
        });
    }
});


// ==========================================
// END SESSION
// ==========================================

router.put('/:id/end', auth, async (req, res) => {
    try {

        const userId = req.user.userId || req.user._id;

        const session = await Session.findOne({
            _id: req.params.id,
            createdBy: userId,
            status: {
                $in: ['active', 'paused']
            }
        });

        if (!session) {
            return res.status(404).json({
                message: 'Session not found or you are not the creator'
            });
        }


        // Save current timer time if running
        if (
            session.timerRunning &&
            session.timerStartedAt
        ) {

            const additionalSeconds = Math.floor(
                (
                    Date.now() -
                    session.timerStartedAt.getTime()
                ) / 1000
            );

            session.timerElapsed += additionalSeconds;

            session.timerRunning = false;
            session.timerStartedAt = null;
        }


        session.status = 'ended';
        session.endTime = new Date();

        // Actual study timer duration
        session.duration = Math.round(
            session.timerElapsed / 60
        );


        await session.save();


        // Create activity
        await Activity.create({
            user: userId,
            type: 'study_session',
            itemName: session.topic,
            duration: session.duration,
            message:
                `Studied ${session.topic} for ${session.duration} minutes`
        });


        res.json(session);

    } catch (error) {
        console.error('End session error:', error);

        res.status(500).json({
            message: 'Failed to end session'
        });
    }
});


// ==========================================
// ADD TASK
// ==========================================

router.post('/:id/tasks', auth, async (req, res) => {
    try {

        const userId = req.user.userId || req.user._id;

        const { text } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({
                message: 'Task text is required'
            });
        }


        const session = await Session.findOne({
            _id: req.params.id,
            status: 'active',
            participants: userId
        });

        if (!session) {
            return res.status(404).json({
                message: 'Session not found or you are not a participant'
            });
        }


        session.tasks.push({
            text: text.trim(),
            createdBy: userId
        });


        await session.save();

        await session.populate(
            'tasks.createdBy',
            'name'
        );


        res.status(201).json(session);

    } catch (error) {
        console.error('Add task error:', error);

        res.status(500).json({
            message: 'Failed to add task'
        });
    }
});


// ==========================================
// TOGGLE TASK
// ==========================================

router.put(
    '/:id/tasks/:taskId/toggle',
    auth,
    async (req, res) => {

        try {

            const userId =
                req.user.userId || req.user._id;


            const session = await Session.findOne({
                _id: req.params.id,
                status: 'active',
                participants: userId
            });


            if (!session) {
                return res.status(404).json({
                    message:
                        'Session not found or you are not a participant'
                });
            }


            const task =
                session.tasks.id(req.params.taskId);


            if (!task) {
                return res.status(404).json({
                    message: 'Task not found'
                });
            }


            task.completed = !task.completed;


            await session.save();


            // Create activity only when completed
            if (task.completed) {

                await Activity.create({
                    user: userId,
                    type: 'completed_task',
                    itemName: task.text,
                    message:
                        `Completed task: ${task.text}`
                });
            }


            await session.populate(
                'tasks.createdBy',
                'name'
            );


            res.json(session);

        } catch (error) {

            console.error(
                'Toggle task error:',
                error
            );

            res.status(500).json({
                message: 'Failed to update task'
            });
        }
    }
);


// ==========================================
// DELETE TASK
// ==========================================

router.delete(
    '/:id/tasks/:taskId',
    auth,
    async (req, res) => {

        try {

            const userId =
                req.user.userId || req.user._id;


            const session = await Session.findOne({
                _id: req.params.id,
                status: 'active',
                participants: userId
            });


            if (!session) {
                return res.status(404).json({
                    message:
                        'Session not found or you are not a participant'
                });
            }


            const task =
                session.tasks.id(req.params.taskId);


            if (!task) {
                return res.status(404).json({
                    message: 'Task not found'
                });
            }


            session.tasks =
                session.tasks.filter(
                    task =>
                        task._id.toString() !==
                        req.params.taskId
                );


            await session.save();


            res.json(session);

        } catch (error) {

            console.error(
                'Delete task error:',
                error
            );

            res.status(500).json({
                message: 'Failed to delete task'
            });
        }
    }
);


module.exports = router;