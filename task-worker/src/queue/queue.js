import { Queue } from 'bullmq';

export const queue = new Queue('jobScheduler', {
  connection: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
  },
});
