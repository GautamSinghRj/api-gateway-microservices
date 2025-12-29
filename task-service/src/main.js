import express from 'express';
import taskRouter from "./routes/task.routes.js"
const host = process.env.HOST ?? '0.0.0.0';
const port = process.env.PORT ? Number(process.env.PORT) : 8002;
const app = express();
app.use('/',taskRouter);
app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
