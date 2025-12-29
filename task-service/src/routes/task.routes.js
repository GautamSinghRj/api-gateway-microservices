import { Router } from 'express';
import { taskfiltering } from '../controller/taskController';

const router = new Router();

router.post('/task',taskfiltering);

export default router;