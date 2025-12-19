import { Router } from 'express';
import { httpWorker, pdfWorker, textWorker } from '../controller/workerController';

const route=new Router();

route.post("/http",httpWorker);
route.post("/pdf",pdfWorker);
route.post("/text",textWorker);