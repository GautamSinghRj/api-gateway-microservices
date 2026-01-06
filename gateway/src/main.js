import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import jwt from 'jsonwebtoken';
import { createProxyMiddleware } from 'http-proxy-middleware';

const host = process.env.HOST ?? '0.0.0.0';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;
const app = express();
app.use(cors());
app.use(helmet());
app.use(morgan('combined'));
app.disable('x-powered-by');

const services = [
  {
    route: '/register',
    target: 'http://auth-service:8001',
  },
  {
    route: '/health',
    target: 'http://auth-service:8001',
  },
  {
    route: '/login',
    target: 'http://auth-service:8001',
  },
  {
    route: '/job',
    target: 'http://task-worker:8003',
    auth: true,
  },
  {
    route: '/task',
    target: 'http://task-service:8002',
    auth: true,
  },
];

const rateLm = 18;
const interval = 60 * 1000;
const reqCount = {};

setInterval(() => {
  Object.keys(reqCount).forEach((ipAddress) => (reqCount[ipAddress] = 0));
}, interval);

//this is middleware function it takes req, res and next(here the next() helps us to go to next middleware like app.get())
function rateLimit(req, res, next) {
  const ipAddress = req.ip;

  reqCount[ipAddress] = (reqCount[ipAddress] || 0) + 1;

  if (reqCount[ipAddress] > rateLm) {
    return res
      .status(429)
      .json({ status: 'Error', message: 'Rate Limit Exceeded' });
  }
  next();
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ message: 'Unauthorized' });
  const token = authHeader.split(' ')[1];
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: 'Expired or Invalid Token' });
  }
}

services.forEach(({ route, target, auth }) => {
  const middlewares = [rateLimit];
  if (auth) middlewares.unshift(authMiddleware);
  app.use(
    ...middlewares,
    createProxyMiddleware({
      target,
      changeOrigin: true,
      pathFilter: route,
    })
  );
});

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
