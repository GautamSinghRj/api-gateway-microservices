import { Router } from 'express';
import { taskfiltering } from '../controller/taskController';

const route = new Router();

route.post('/task',taskfiltering);
