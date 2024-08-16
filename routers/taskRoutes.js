import {Router} from 'express';
import TaskController from '../controllers/taskController.js';

const router = Router();

router.post('/compose/newtask', TaskController.addTask);

router.put('/edit/:id', TaskController.editTask);

router.delete('/:id', TaskController.deleteTask);

router.get('/tasks', TaskController.getAllTasks);

router.get('/tasks/Pending', TaskController.getPendingTasks);

router.get('/tasks/inprogress', TaskController.getInProgressTasks);

router.get('/tasks/completed', TaskController.getCompletedTasks);

router.get('/task/:id', TaskController.getSingleTask);

router.get('/search', TaskController.searchTasks);

export default router;