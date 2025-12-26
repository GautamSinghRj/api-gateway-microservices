import { queue } from '../queue';
import cron from 'node-cron';
import crypto from 'crypto';

export const httpWorker = async (req, res) => {
  const { payload, schedule } = req.body;
  const { url, method, body } = payload;
  if (!url || !method || !schedule) {
    return res
      .status(400)
      .json({ message: 'Payload and Schedule cannot be empty' });
  }
  const arr = ['GET', 'POST', 'PATCH', 'PUT'];
  const modMethod = method.toUpperCase();
  if (!arr.includes(modMethod)) {
    return res
      .status(400)
      .json({ message: 'Method could be only GET POST PUT PATCH' });
  }
  if (modMethod != 'GET' && !body) {
    return res.status(400).json({ message: 'Body cannot be empty or null' });
  }
  if (!cron.validate(schedule)) {
    return res.status(400).json({ message: 'Invalid cron expression' });
  }
  try {
    const hash = crypto
      .createHash('sha256')
      .update(`${modMethod}:${url}:${JSON.stringify(body ?? {})}`)
      .digest('hex')
      .slice(0, 12);
    const jobId = `http:${hash}:${schedule}`;
    await queue.add(
      'httpReq',
      { url, method: modMethod, body },
      {
        jobId,
        repeat: { pattern: schedule },
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
      }
    );
    return res
      .status(201)
      .json({ message: 'Job scheduled successfully', jobId });
  } catch (err) {
    return res.status(500).json({ message: 'Queue Error', err });
  }
};