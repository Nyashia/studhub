const mongoose = require('mongoose');

const mongoURI = 'mongodb://127.0.0.1:27017/studhub';

mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected locally!'))
  .catch(err => console.error('MongoDB connection error:', err));