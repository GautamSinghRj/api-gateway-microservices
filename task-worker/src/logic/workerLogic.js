import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import crypto from 'crypto';
import { Worker } from 'bullmq';
import axios from 'axios';
import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const worker = new Worker(
  'jobScheduler',
  async (job) => {
    console.log('JOB RECEIVED', job.name, job.data);
    switch (job.name) {
      case 'httpReq': {
        try {
          const { url, method, body } = job.data;
          const response = await axios({
            method: method,
            url: url,
            data: body,
            timeout: 10000,
          });
          const res = JSON.stringify(response.data);
          console.log(res);
          await prisma.job.create({
            data: {
              jobId: job.id ?? crypto.randomUUID(),
              result: res,
              type: 'Http_Request',
              status: '200',
            },
          });
        } catch (error) {
          console.log(`HTTP error:${error.message}`);
          throw error;
        }
        break;
      }
      case 'textSum': {
        const { text, wordLimit } = job.data;

        const prompt = `Summarize the following text in at most ${wordLimit} words.
        Be concise.
        Don't exceed the word limit.
        
        TEXT:
        ${text}`;

        const controller = new AbortController();
        const timeoutObj = setTimeout(() => controller.abort(), 10000);
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
              role: 'user',
              parts: [{ text: prompt }],
            },
            signal: controller.signal,
          });
          const text = response?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!text) {
            throw new Error('Empty ai response');
          }
          console.log(text);
          await prisma.job.create({
            data: {
              jobId: job.id ?? crypto.randomUUID(),
              result: text,
              type: 'Text_Summary',
              status: '200',
            },
          });
        } catch (error) {
          console.log(`SUMMARY ERROR: ${error.message}`);
          throw error;
        } finally {
          clearTimeout(timeoutObj);
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
      port: Number(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD,
    },
  }
);
