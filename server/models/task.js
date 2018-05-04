const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TaskSchema = new mongoose.Schema({
    taskText: { type: String, required:true, minlength:3 },
    added: { type: Date, required: true},
    timezone: { type: String },
    expires: { type: Date, required: true },
    adder: { type: Schema.Types.ObjectId, ref: 'User' },
    _user: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, required: true, default: 'Not done' }
}, {timestamps: true});

const Task = mongoose.model('Task', TaskSchema);
module.exports = Task;