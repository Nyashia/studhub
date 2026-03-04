require('dotenv').config(); 

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const taskRoutes = require("./routes/taskRoutes");
const userRoutes = require("./routes/user");      // User management
const loginRoute = require("./routes/login");     // Login
const registerRoute = require("./routes/register"); // Register

const app = express();
const PORT = process.env.PORT || 5000;
const mongoURI = process.env.MONGO_URI;

// CORS
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
}));

// JSON middleware
app.use(express.json());

// Connect to MongoDB then start server
mongoose.connect(mongoURI)
  .then(() => {
    console.log('✅ MongoDB connected successfully!');

    // Routes
    app.use("/task", taskRoutes);
    app.use("/users", userRoutes);      
    app.use("/login", loginRoute);  // Login
    app.use("/register", registerRoute); // Register

    app.get('/', (req, res) => {
      res.send('Hello StudHub backend!');
    });

    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });