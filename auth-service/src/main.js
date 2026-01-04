import express from 'express';
import userRouter from "./routes/user.routes.js"
const host = process.env.HOST ?? '0.0.0.0';
const port = process.env.PORT ? Number(process.env.PORT) : 8001;
const app = express();
app.use(express.json())
app.use('/',userRouter);
app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
