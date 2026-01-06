"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var import_client = require("@prisma/client");
var import_adapter_pg = require("@prisma/adapter-pg");
var import_crypto = __toESM(require("crypto"));
var import_bullmq = require("bullmq");
var import_axios = __toESM(require("axios"));
var import_genai = require("@google/genai");
const ai = new import_genai.GoogleGenAI({ apiKey: process.env.API_KEY });
const adapter = new import_adapter_pg.PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new import_client.PrismaClient({ adapter });
const worker = new import_bullmq.Worker(
  "jobScheduler",
  async (job) => {
    console.log("JOB RECEIVED", job.name, job.data);
    switch (job.name) {
      case "httpReq": {
        try {
          const { url, method, body } = job.data;
          const response = await (0, import_axios.default)({
            method,
            url,
            data: body,
            timeout: 1e4
          });
          const res = JSON.stringify(response.data);
          console.log(res);
          await prisma.job.create({
            data: {
              jobId: job.id ?? import_crypto.default.randomUUID(),
              result: res,
              type: "Http_Request",
              status: "200"
            }
          });
        } catch (error) {
          console.log(`HTTP error:${error.message}`);
          throw error;
        }
        break;
      }
      case "textSum": {
        const { text, wordLimit } = job.data;
        const prompt = `Summarize the following text in at most ${wordLimit} words.
        Be concise.
        Don't exceed the word limit.
        
        TEXT:
        ${text}`;
        const controller = new AbortController();
        const timeoutObj = setTimeout(() => controller.abort(), 1e4);
        try {
          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: {
              role: "user",
              parts: [{ text: prompt }]
            },
            signal: controller.signal
          });
          const text2 = response?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!text2) {
            throw new Error("Empty ai response");
          }
          console.log(text2);
          await prisma.job.create({
            data: {
              jobId: job.id ?? import_crypto.default.randomUUID(),
              result: text2,
              type: "Text_Summary",
              status: "200"
            }
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
      password: process.env.REDIS_PASSWORD
    }
  }
);
