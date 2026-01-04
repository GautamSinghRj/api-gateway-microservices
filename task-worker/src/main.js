import express from 'express';
import { createConnection } from './config/redis';
import workerRouter from './routes/worker.routes.js';
import { setupBullboard } from './bullboard';
const host = process.env.HOST ?? '0.0.0.0';
const port = process.env.PORT ? Number(process.env.PORT) : 8003;
const app = express();
app.use(express.json());
setupBullboard(app);
app.use('/', workerRouter);
async function start() {
  try {
    await createConnection();
    app.listen(port, host, () => {
      console.log(`[ ready ] http://${host}:${port}`);
    });
  } catch (error) {
    console.log('Start Up failed', error);
    process.exit(1);
  }
}
start();
