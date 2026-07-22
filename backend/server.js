require('dotenv').config();

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');

const userRoutes = require("./routes/user");      
const loginRoute = require("./routes/login");    
const registerRoute = require("./routes/register");
const assessmentRoute = require("./routes/assessment");
const todoRoutes = require('./routes/todos');
const scheduleRoutes = require("./routes/schedule");
const friendRoutes = require('./routes/friend');
const studyRoutes = require('./routes/study'); 
const sessionRoutes = require('./routes/sessions'); 

const app = express();
const PORT = process.env.PORT || 5000;
const mongoURI = process.env.MONGO_URI;

const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Store online users and their socket IDs
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log(' New client connected:', socket.id);

  // Register user
  socket.on('register-user', (userId) => {
    socket.userId = userId;
    onlineUsers.set(userId, socket.id);
    console.log(` User ${userId} registered with socket ${socket.id}`);
    console.log(` Online users: ${onlineUsers.size}`);
  });

  // Nudge
  socket.on('nudge', (data) => {
    console.log(` Nudge from ${socket.userId} to ${data.toUserId}: ${data.message}`);
    const recipientSocketId = onlineUsers.get(data.toUserId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('receive-nudge', {
        fromUserId: socket.userId,
        message: data.message,
        timestamp: new Date()
      });
    } else {
      console.log(` User ${data.toUserId} is offline`);
    }
  });

  // ========== STUDY SESSION SOCKET EVENTS ==========

  // Join a study session room
  socket.on('join-session', (sessionId) => {
    if (socket.sessionId) {
      socket.leave(`session-${socket.sessionId}`);
    }
    socket.join(`session-${sessionId}`);
    socket.sessionId = sessionId;
    console.log(` Socket ${socket.id} joined session ${sessionId}`);
    
    // Notify everyone in the session (including others)
    io.to(`session-${sessionId}`).emit('participant-joined', {
      userId: socket.userId,
      sessionId: sessionId,
      timestamp: new Date()
    });
  });

  // Leave a study session
  socket.on('leave-session', () => {
    if (socket.sessionId) {
      const sessionId = socket.sessionId;
      socket.leave(`session-${sessionId}`);
      console.log(` Socket ${socket.id} left session ${sessionId}`);
      
      //  Notify others
      io.to(`session-${sessionId}`).emit('participant-left', {
        userId: socket.userId,
        sessionId: sessionId,
        timestamp: new Date()
      });
      
      socket.sessionId = null;
    }
  });

  // Sync timer updates
  socket.on('timer-update', (data) => {
    const { sessionId, timeRemaining, isActive } = data;
    if (sessionId) {
      socket.to(`session-${sessionId}`).emit('timer-sync', {
        timeRemaining,
        isActive,
        updatedBy: socket.userId,
        timestamp: new Date()
      });
    }
  });

  // Session ended
  socket.on('session-ended', (data) => {
    const { sessionId, duration } = data;
    if (sessionId) {
      //  Notify everyone in the room that session ended
      io.to(`session-${sessionId}`).emit('session-ended', {
        duration,
        endedBy: socket.userId,
        timestamp: new Date()
      });
      //  Remove all sockets from this room (cleanup)
      io.in(`session-${sessionId}`).socketsLeave(sessionId);
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(' Client disconnected:', socket.id);
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      console.log(` Online users: ${onlineUsers.size}`);
    }
    // Clean up session if user was in one
    if (socket.sessionId) {
      socket.leave(`session-${socket.sessionId}`);
    }
  });
});

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

mongoose.connect(mongoURI)
  .then(() => {
    console.log(' MongoDB connected');

    app.use("/users", userRoutes);      
    app.use("/login", loginRoute); 
    app.use("/register", registerRoute); 
    app.use("/assessments", assessmentRoute);
    app.use("/todos", todoRoutes);
    app.use("/schedule", scheduleRoutes);
    app.use('/api/friends', friendRoutes);
    app.use('/api/study', studyRoutes);
    app.use('/api/sessions', sessionRoutes);

    app.get('/', (req, res) => res.send('StudHub API Running'));

    server.listen(PORT, () => {
      console.log(` Server running on http://localhost:${PORT}`);
      console.log(` Socket.IO ready`);
    });
  })
  .catch(err => {
    console.error('DB Connection Error:', err);
    process.exit(1);
  });