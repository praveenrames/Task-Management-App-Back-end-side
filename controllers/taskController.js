import mongoose from "mongoose";
import Task from "../models/Task.js";

         // Add The Task

const addTask = async (req, res) => {

    const { title, description, status, priority, dueDate, createdAt } = req.body;

    try{
        const task = new Task({
            user: req.user,
            title,
            description,
            status,
            priority,
            dueDate,
            createdAt,
        });
        const userTask = await task.save();

        res.status(201).json(userTask);
    } catch (error) {
        res.status(400).json({ 
            error:'Somthing went wrong, please create task again.',
            message: error.message,
        })
    }
};

              // Edit The Task

const editTask = async (req, res) =>{
    const { title, description, status, priority, dueDate, } = req.body;

    try {
        const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });

        if(!task) {
            return res.status(404).json({ error: "Task not found."});
        }

        res.status(200).json({ message: 'Task updated.', task});
    } catch (error) {
        res.status(400).json({ 
            error: 'Edit unsuccessful, please try again.',
            message: error.message,
        });
    }
};
  
            // Delete The Task

const deleteTask = async (req, res) => {
    try {
          await Task.findOneAndDelete({
        _id: req.params.id,

    });
    res.status(200).json('Task successfully deleted.');
    } catch (error) {
       res.status(400).json({
       error: 'Something went wrong, please try again.',
       message: error.message,
    });
  }
};

             // Get The All Tasks

const getAllTasks = async (req, res) => {
    
    try {
        const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: 1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ 
            error: 'No tasks found.',
            message: error.message,
        });
    }
}

          // get Pending Tasks

const getPendingTasks = async (req, res) => {

    try {
        const tasks = await Task.find({ 
            user: req.user.id,
            status: 'pending',
        });
        res.json(tasks);
    } catch (error){
        res.status(400).json({
            error: 'No pending tasks found.',
            message: error.message,
        });
    }
};

const getInProgressTasks = async (req, res) => {

    try {
        const tasks = await Task.find({
            user: req.user.id,
            status: 'In Progress',
        });
        res.json(tasks);
    } catch (error) {
        res.status(400).json({
            error: 'No tasks in progress found.',
            message: error.message,
        });
    }
};

const getCompletedTasks = async (req, res) => {

    try {
        const tasks = await Task.find({
            user: req.user,
            status: 'Completed',
        });
        res.json(tasks);
    } catch (error) {
        res.status(400).json({
            error: 'No Completed tasks found.',
            message: error.message,
        });
    }
};

const getSingleTask = async (req, res) => {
    try {
        const task = await Task.findOne({
            _id: req.params.id,
        });
        res.json(task);
    } catch (error) {
        res.status(400).json({
            error: 'Task not found.',
            message: error.message,
        });
    }
}

const searchTasks = async (req, res) => {

    try {
        const query = req.query.title;
        const tasks = await Task.find({
            user: req.user.id,
            title: { $regex: query, $options: 'i' },
        });
        res.json(tasks);
    } catch (error) {
        res.status(404).json({ 
            error: 'No tasks found',
            message: error.message,
        });
    }
};
const TaskController = {
    addTask,
    editTask,
    deleteTask,
    getAllTasks,
    getPendingTasks,
    getInProgressTasks,
    getCompletedTasks,
    getSingleTask,
    searchTasks,
}

export default TaskController;