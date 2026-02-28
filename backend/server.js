const db = require("./db");
const Task = require("./models/Task");
const User = require('./models/User');

const express = require('express');
const app = express();
const PORT = 5000;
exports.PORT = PORT;

app.use(express.json());


app.get('/', (req, res) => {
  res.send('Hello StudHub backend!');
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

