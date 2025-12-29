import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import jwt from 'jsonwebtoken';
import { createProxyMiddleware } from 'http-proxy-middleware';

const host = process.env.HOST ?? '0.0.0.0';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;
const app = express();
app.use(express.json());
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
    route: '/task',
    target: 'http://task-service:8002',
  },
];

const rateLimit = 18;
const interval = 60 * 1000;
const reqCount = {};

setInterval(() => {
  Object.keys(reqCount).forEach((ipAddress) => (reqCount[ipAddress] = 0));
}, interval);

//this is middleware function it takes req, res and next(here the next() helps us to go to next middleware like app.get())
function rateLimitTimeout(req, res, next) {
  const ipAddress = req.ip;

  reqCount[ipAddress] = (reqCount[ipAddress] || 0) + 1;

  if (reqCount[ipAddress] > rateLimit) {
    return res
      .status(429)
      .json({ status: 'Error', message: 'Rate Limit Exceeded' });
  }
  req.setTimeout(15000, () => {
    res.status(504).json({ status: 'Error', message: 'Gateway Timeout' });
    req.destroy();
  });
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

services.forEach(({ route, target }) => {
  console.log(route);
  const proxyOptions = {
    target,
    changeOrigin: true,
  };
  const middlewares = [rateLimitTimeout];
  if (route === '/task') middlewares.unshift(authMiddleware);
  app.use(route, ...middlewares, createProxyMiddleware(proxyOptions));
});

/*try {
  return 
} catch (err) {
  console.warn("Switching to different copy");  
  return
}*/
app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
