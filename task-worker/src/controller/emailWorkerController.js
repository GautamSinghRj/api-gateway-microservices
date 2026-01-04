import { queue } from '../queue/queue';
import cron from 'node-cron';
import crypto from 'crypto';

export const emailWorker = async (req, res) => {
  const { payload, schedule } = req.body;
  const { recipent } = payload;
  if (!payload || !schedule) {
    return res
      .status(400)
      .json({ message: 'Payload and Schedule cannot be empty' });
  }
  if (!recipent) {
    return res.status(400).json({ message: 'Recipent is required' });
  }
  if (!cron.validate(schedule)) {
    return res.status(400).json({ message: 'Invalid cron expression' });
  }
  const hash = crypto
    .createHash('sha256')
    .update(recipent)
    .digest('hex')
    .slice(0, 12);
  const jobId = `http:${hash}:${schedule}`;
  try {
    await queue.add(
      'emailSender',
      { recipent },
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
