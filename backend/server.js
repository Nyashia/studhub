require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');

const setupSocket = require('./socket/socketHandler');

const userRoutes = require('./routes/user');
const loginRoute = require('./routes/login');
const registerRoute = require('./routes/register');
const assessmentRoute = require('./routes/assessment');
const todoRoutes = require('./routes/todos');
const scheduleRoutes = require('./routes/schedule');
const friendRoutes = require('./routes/friend');
const studyRoutes = require('./routes/study');
const sessionRoutes = require('./routes/sessions');
const uploadRoutes = require('./routes/upload');

const app = express();

const PORT = process.env.PORT || 5000;
const mongoURI = process.env.MONGO_URI;

const server = http.createServer(app);

// ============================================================
// SOCKET.IO
// ============================================================

const io = setupSocket(server);


// ============================================================
// MIDDLEWARE
// ============================================================

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

app.use('/uploads', express.static('uploads'));


// ============================================================
// DATABASE
// ============================================================

mongoose.connect(mongoURI)
  .then(() => {

    console.log('MongoDB connected');

    // ========================================================
    // ROUTES
    // ========================================================

    app.use('/users', userRoutes);
    app.use('/login', loginRoute);
    app.use('/register', registerRoute);
    app.use('/assessments', assessmentRoute);
    app.use('/todos', todoRoutes);
    app.use('/schedule', scheduleRoutes);
    app.use('/api/friends', friendRoutes);
    app.use('/api/study', studyRoutes);
    app.use('/api/sessions', sessionRoutes);
    app.use('/api/upload', uploadRoutes);

    // ========================================================
    // ROOT ROUTE
    // ========================================================

    app.get('/', (req, res) => {
      res.send('StudHub API Running');
    });

    // ========================================================
    // START SERVER
    // ========================================================

    server.listen(PORT, () => {

      console.log(
        `Server running on http://localhost:${PORT}`
      );

      console.log('Socket.IO ready');
    });

  })
  .catch(err => {

    console.error(
      'DB Connection Error:',
      err
    );

    process.exit(1);
  });