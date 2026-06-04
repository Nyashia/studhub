require('dotenv').config();

const express = require('express');
const http = require('http'); // Required for Socket.IO
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


io.on('connection', (socket) => {
  console.log('✅ New client connected:', socket.id);

  socket.on('register-user', (userId) => {
    socket.userId = userId;
    console.log(` User ${userId} registered with socket ${socket.id}`);
  });

  socket.on('nudge', (data) => {
    console.log(`📨 Nudge from ${socket.userId} to ${data.toUserId}: ${data.message}`);
    // Broadcast to all other clients (for testing)
    socket.broadcast.emit('receive-nudge', {
      fromUserId: socket.userId,
      message: data.message,
      timestamp: new Date()
    });
  });

  socket.on('disconnect', () => {
    console.log(' Client disconnected:', socket.id);
  });
});


app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());


mongoose.connect(mongoURI)
  .then(() => {
    console.log('✅ MongoDB connected');

    app.use("/users", userRoutes);      
    app.use("/login", loginRoute); 
    app.use("/register", registerRoute); 
    app.use("/assessments", assessmentRoute);
    app.use("/todos", todoRoutes);
    app.use("/schedule", scheduleRoutes);
    app.use('/api/friends', friendRoutes);

    app.get('/', (req, res) => res.send('StudHub API Running'));

    
    server.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`✅ Socket.IO ready`);
    });
  })
  .catch(err => {
    console.error('DB Connection Error:', err);
    process.exit(1);
  });