import mongoose from "mongoose";
import User from './User.js';

const {model, Schema} = mongoose;
const optionRequired = {
    type: String,
    required: true,
};

const today = new Date();
let dd = today.getDate();
let mm = today.getMonth();
let yyyy = today.getFullYear();

const TaskSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: User,
    },
    title: optionRequired,
    description : {
        type: String,
    },
    status: optionRequired,
    priority: optionRequired,
    dueDate: {
        type: String,
    },
    createdAt: {
        type: String,
        default: new Date().toLocaleDateString('default'),
    }
})

const Task = mongoose.model('Task', TaskSchema);
export default Task;