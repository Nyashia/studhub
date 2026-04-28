const dotenv = require('dotenv');
dotenv.config

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const taskRoutes = require("./routes/taskRoutes");
const userRoutes = require("./routes/user");      
const loginRoute = require("./routes/login");    
const registerRoute = require("./routes/register");
const assessmentRoute = require("./routes/assessment");
const todoRoutes = require('./routes/todos');

const app = express();
const PORT = process.env.PORT || 5000;
const mongoURI = process.env.MONGO_URI;

// CORS config
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));


// JSON middleware
app.use(express.json());

// Connect to MongoDB then start server
mongoose.connect(mongoURI)
  .then(() => {
    console.log('MongoDB connected successfully!');

    // Routes
    app.use("/task", taskRoutes);
    app.use("/users", userRoutes);      
    app.use("/login", loginRoute); 
    app.use("/register", registerRoute); 
    app.use("/assessment", assessmentRoute);
    app.use("/todos", todoRoutes);

    app.get('/', (req, res) => {
      res.send('Hello StudHub backend!');
    });

    // Global error handler
    app.use((err, req, res, next) => {
      console.error('Error:', err.stack);
      res.status(err.status || 500).json({ 
        message: err.message || 'Something went wrong!' 
      });
    });

    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });