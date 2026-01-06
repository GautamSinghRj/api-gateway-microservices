"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var textWorkerController_exports = {};
__export(textWorkerController_exports, {
  textWorker: () => textWorker
});
module.exports = __toCommonJS(textWorkerController_exports);
var import_queue = require("../queue/queue");
var import_node_cron = __toESM(require("node-cron"));
var import_crypto = __toESM(require("crypto"));
const textWorker = async (req, res) => {
  const { payload, schedule } = req.body;
  const { text, wordLimit } = payload;
  if (!text || !wordLimit || !schedule) {
    return res.status(400).json({ message: "Payload and Schedule cannot be empty" });
  }
  if (text.split(/\s+/).length > 1200) {
    return res.status(400).json({ message: "Text word limit is 1200" });
  }
  if (wordLimit > 150) {
    return res.status(400).json({ message: "Summary word limit cannot be more than 150" });
  }
  if (!import_node_cron.default.validate(schedule)) {
    return res.status(400).json({ message: "Invalid cron expression" });
  }
  try {
    const hash = import_crypto.default.createHash("sha256").update(text).digest("hex").slice(0, 12);
    const jobId = `text:${wordLimit}:${hash}:${schedule}`;
    await import_queue.queue.add(
      "textSum",
      { text, wordLimit },
      {
        jobId,
        repeat: { pattern: schedule },
        attempts: 3,
        backoff: { type: "exponential", delay: 5e3 }
      }
    );
    return res.status(201).json({ message: "Job Scheduled succesfully", jobId });
  } catch (err) {
    return res.status(500).json({ message: "Queue Error", err });
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  textWorker
});
