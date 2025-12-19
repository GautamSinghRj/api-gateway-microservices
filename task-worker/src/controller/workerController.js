import { Queue, Worker } from 'bullmq';
import cron from 'node-cron';
import crypto from 'crypto';
import axios from 'axios';
import { GoogleGenAI } from '@google/genai';

const queue = new Queue('task-queue', {
  connection: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
  },
});

export const httpWorker = async (req, res) => {
  const { payload, schedule } = req.body;
  const { url, method, body } = payload;
  if (!url || !method || !schedule) {
    return res
      .status(400)
      .json({ message: 'Payload and Schedule cannot be empty' });
  }
  const arr = ['GET', 'POST', 'PATCH', 'PUT'];
  if (!arr.includes(method)) {
    return res
      .status(400)
      .json({ message: 'Method could be only GET POST PUT PATCH' });
  }
  if (method != 'GET' && !body) {
    return res.status(400).json({ message: 'Body cannot be empty or null' });
  }
  if (!cron.validate(schedule)) {
    return res.status(400).json({ message: 'Invalid cron expression' });
  }
  try {
    const hash = crypto
      .createHash('sha256')
      .update(JSON.stringify({ url, method, body }))
      .digest('hex')
      .slice(0, 12);
    const jobId = `http:${hash}:${schedule}`;
    await queue.add(
      'httpReq',
      { url, method, body },
      {
        jobId,
        repeat: { pattern: schedule },
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
      }
    );
    return;
  } catch (err) {
    return res.status(500).json({ message: 'Queue Error', err });
  }
};

/*export const pdfWorker = async (req, res) => {
  if (!file || !wordLimit || !schedule) {
    const { payload, schedule } = req.body;
    const { file, wordLimit } = payload;
    return res
      .status(400)
      .json({ message: 'Payload and Schedule cannot be empty' });
  }
  if (!cron.validate(schedule)) {
    return res.status(400).json({ message: 'Invalid cron expression' });
  }
  try {
    await queue.add(
      'pdfSum',
      { file, wordLimit },
      { jobId: job, repeat: { pattern: schedule } }
    );
    return;
  } catch (err) {
    return res.status(500).json({ message: 'Queue Error', err });
  }
};
*/
export const textWorker = async (req, res) => {
  const { payload, schedule } = req.body;
  const { text, wordLimit } = payload;
  if (!text || !wordLimit || !schedule) {
    return res
      .status(400)
      .json({ message: 'Payload and Schedule cannot be empty' });
  }
  if (text.split(/\s+/).length() > 1200) {
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
    return;
  } catch (err) {
    return res.status(500).json({ message: 'Queue Error', err });
  }
};

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const worker = new Worker(
  'task-queue',
  async (job) => {
    switch (job.name) {
      case 'httpReq': {
        try {
          const { url, method, body } = job.data;
          const response = await axios({
            method: method,
            url: url,
            data: body,
            timeout:10000
          });
        } catch (error) {
          throw new Error(error.message);
        }
        break;
      }

      case 'textSum': {
        const { text, wordLimit } = job.data;

        const prompt = `Summarize the following text in at most ${wordLimit} words.Be concise.Don't exceed the word limit.TEXT:${text}`;
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
              role: 'user',
              parts: [{ text: prompt }],
            },
          });
        } catch (error) {
          throw new Error(error.message);
        }
        break;
      }
      default:
        throw new Error(`Unknown job type:${job.name}`);
    }
  },
  {
    connection: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_PASSWORD,
    },
  }
);
