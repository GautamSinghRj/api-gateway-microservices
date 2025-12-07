import express from 'express';
import userRouter from "./routes/user.routes"
import cors from "cors"
const host = process.env.HOST ?? '0.0.0.0';
const port = process.env.PORT ? Number(process.env.PORT) : 8001;
const app = express();
app.use(cors())
app.use(express.json())
app.use('/api/v1',userRouter);
app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
