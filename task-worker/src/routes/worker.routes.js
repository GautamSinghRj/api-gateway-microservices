import { Router } from 'express';
import { httpWorker } from '../controller/httpWorkerController';
import { textWorker } from '../controller/textWorkerController';
import { emailWorker } from '../controller/emailWorkerController';

const route = new Router();

route.post('/http', httpWorker);
route.post('/email', emailWorker);
route.post('/text', textWorker);
