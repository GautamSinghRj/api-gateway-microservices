import { Worker } from 'bullmq';
import axios from 'axios';
import { GoogleGenAI } from '@google/genai';
import nodemailer from 'nodemailer';
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_KEY,
  },
});
transporter.verify();
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
          await job.log(`HTTP ${response.status} Success`);
          await job.log(
            `Response:${JSON.stringify(response.data).slice(0, 500)}`
          );
          return response.data;
        } catch (error) {
          await job.log(`HTTP error:${error.message}`);
          throw error;
        }
      }
      case 'emailSender': {
        const { recipent } = job.data;
        if (!recipent) {
          throw new Error('Recipient email missing');
        }
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
          if (!htmlText || !htmlText.trim()) {
            throw new Error('AI returned empty HTML');
          }
          await transporter.sendMail({
            from: `"ApiGateway" <${process.env.BREVO_SMTP_USER}>`,
            to: recipent,
            subject: 'Welcome to the newsletter',
            html: htmlText,
          });
          await job.log(`Email sent to ${recipent}`);
          return { status: `sent`, recipent };
        } catch (error) {
          await job.log(`EMAIL ERROR: ${error.message}`);
          throw error;
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
          await job.log(`Summary generated (${text.split(' ').length} words)`);
          await job.log(`SUMMARY:\n${text}`);
          return text;
        } catch (error) {
          await job.log(`SUMMARY ERROR: ${error.message}`);
          throw error;
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
