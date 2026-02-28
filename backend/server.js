const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); 
const taskRoutes = require("./routes/taskRoutes");

const app = express();
const PORT = 5000;

// CORS middleware
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
}));

// JSON middleware
app.use(express.json());


// Connect to MongoDB then start server
const mongoURI = 'mongodb://127.0.0.1:27017/studhub';

mongoose.connect(mongoURI)
  .then(() => {
    console.log('✅ MongoDB connected successfully!');
    

    app.use("/task", taskRoutes);
    
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