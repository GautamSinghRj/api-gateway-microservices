import { Router } from 'express';
import { httpWorker } from '../controller/httpWorkerController';
import { textWorker } from '../controller/textWorkerController';
import { jobInfo } from '../controller/jobInfoController';

const router = new Router();

router.post('/http', httpWorker);
router.post('/text', textWorker);
router.get('/job',jobInfo);
 
export default router;