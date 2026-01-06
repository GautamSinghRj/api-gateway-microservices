import { Router } from 'express';
import { taskfiltering, taskFilteringGet } from '../controller/taskController';

const router = new Router();

router.post('/task',taskfiltering);
router.get('/job',taskFilteringGet);

export default router;