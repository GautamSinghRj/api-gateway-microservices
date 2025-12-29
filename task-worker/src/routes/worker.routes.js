import { Router } from 'express';
import { httpWorker } from '../controller/httpWorkerController';
import { textWorker } from '../controller/textWorkerController';
import { emailWorker } from '../controller/emailWorkerController';

const router = new Router();

router.post('/http', httpWorker);
router.post('/email', emailWorker);
router.post('/text', textWorker);
 
export default router;