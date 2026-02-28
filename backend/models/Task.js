const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    dueDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['pending', 'in progress', 'completed'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('Task', taskSchema);