import { Worker } from 'bullmq';
import axios from 'axios';
import { GoogleGenAI } from '@google/genai';
import { Resend } from 'resend';
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const resend = new Resend(process.env.RESEND_API_KEY);
const worker = new Worker(
  'jobScheduler',
  async (job) => {
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
          return response.data;
        } catch (error) {
          if (error.response) {
            throw new Error(
              `HTTP ${error.response.status}:${JSON.stringify(
                error.response.data
              )}`
            );
          }
          throw error instanceof Error ? error : new Error(String(error));
        }
      }
      case 'emailSender': {
        const { recipent } = job.data;
        const prompt = `You are a professional newsletter copywriter.
        Generate a short, engaging welcome newsletter email in clean HTML.

        GOAL:
        Welcome a new user to our newsletter and clearly explain the value they will receive.

        CONTEXT:
        - The brand is modern, developer-friendly, and trustworthy
        - The audience is tech-curious users
        - Tone should be friendly, concise, and professional
        - No emojis
        - No markdown
        - Use semantic HTML only (h1, p, ul, li, a)
        - Inline styles are allowed but must be minimal

        CONTENT REQUIREMENTS:
        1. A clear and friendly headline
        2. A brief welcome paragraph
        3. 3 bullet points explaining what kind of content the user will receive
        4. A short closing paragraph with a call-to-action
        5. Keep the entire email under 180 words

        RESTRICTIONS:
        - Do NOT include scripts, iframes, or external assets
        - Do NOT include fake statistics or promises
        - Do NOT include unsubscribe links
        - Output ONLY valid HTML (no explanations)

        END GOAL:
        The output should be directly usable as the 'html' body of an email.`;
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
          const htmlText = response?.candidates?.[0]?.content?.parts?.[0]?.text;
          await resend.emails.send({
            from: 'freegamingworld413@gmail.com',
            to: recipent,
            subject: 'Welcome to the newsletter',
            html: htmlText,
          });
          return;
        } catch (error) {
          if (error.response) {
            throw new Error(
              `HTTP ${error.response.status}:${JSON.stringify(
                error.response.data
              )}`
            );
          }
          throw error instanceof Error ? error : new Error(String(error));
        } finally {
          clearTimeout(timeoutObj);
        }
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
          return text;
        } catch (error) {
          if (error.name === 'AbortError') {
            throw new Error('AI Timeout');
          }
          throw error instanceof Error ? error : new Error(String(error));
        } finally {
          clearTimeout(timeoutObj);
        }
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

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});
worker.on('failed', (job, err) => {
  console.log(`Job ${job.id} failed`, err.message);
});
