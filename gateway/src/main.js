import express from 'express';
import cors from "cors";
import helmet from 'helmet';
import morgan from 'morgan';
import { createProxyMiddleware } from 'http-proxy-middleware';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;
const app = express();
app.use(cors());
app.use(helmet());
app.use(morgan("combined"));
app.get('/', (req, res) => {
  res.send({ message: 'Hello API' });
});
app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
