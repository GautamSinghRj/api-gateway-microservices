import { queue } from '../queue';
import cron from 'node-cron';
import crypto from 'crypto';

export const textWorker = async (req, res) => {
  const { payload, schedule } = req.body;
  const { text, wordLimit } = payload;
  if (!text || !wordLimit || !schedule) {
    return res
      .status(400)
      .json({ message: 'Payload and Schedule cannot be empty' });
  }
  if (text.split(/\s+/).length > 1200) {
    return res.status(400).json({ message: 'Text word limit is 1200' });
  }
  if (wordLimit > 150) {
    return res
      .status(400)
      .json({ message: 'Summary word limit cannot be more than 150' });
  }
  if (!cron.validate(schedule)) {
    return res.status(400).json({ message: 'Invalid cron expression' });
  }
  try {
    const hash = crypto
      .createHash('sha256')
      .update(text)
      .digest('hex')
      .slice(0, 12);
    const jobId = `text:${wordLimit}:${hash}:${schedule}`;
    await queue.add(
      'textSum',
      { text, wordLimit },
      {
        jobId,
        repeat: { pattern: schedule },
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
      }
    );
    return res
      .status(201)
      .json({ message: 'Job Scheduled succesfully', jobId });
  } catch (err) {
    return res.status(500).json({ message: 'Queue Error', err });
  }
};
