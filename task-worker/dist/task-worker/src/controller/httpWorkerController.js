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
var httpWorkerController_exports = {};
__export(httpWorkerController_exports, {
  httpWorker: () => httpWorker
});
module.exports = __toCommonJS(httpWorkerController_exports);
var import_queue = require("../queue/queue");
var import_node_cron = __toESM(require("node-cron"));
var import_crypto = __toESM(require("crypto"));
const httpWorker = async (req, res) => {
  const { payload, schedule } = req.body;
  const { url, method, body } = payload;
  if (!url || !method || !schedule) {
    return res.status(400).json({ message: "Payload and Schedule cannot be empty" });
  }
  const arr = ["GET", "POST", "PATCH", "PUT"];
  const modMethod = method.toUpperCase();
  if (!arr.includes(modMethod)) {
    return res.status(400).json({ message: "Method could be only GET POST PUT PATCH" });
  }
  if (modMethod != "GET" && !body) {
    return res.status(400).json({ message: "Body cannot be empty or null" });
  }
  if (!import_node_cron.default.validate(schedule)) {
    return res.status(400).json({ message: "Invalid cron expression" });
  }
  try {
    const hash = import_crypto.default.createHash("sha256").update(`${modMethod}:${url}:${JSON.stringify(body ?? {})}`).digest("hex").slice(0, 12);
    const jobId = `http:${hash}:${schedule}`;
    await import_queue.queue.add(
      "httpReq",
      { url, method: modMethod, body },
      {
        jobId,
        repeat: { pattern: schedule },
        attempts: 3,
        backoff: { type: "exponential", delay: 5e3 }
      }
    );
    return res.status(201).json({ message: "Job scheduled successfully", jobId });
  } catch (err) {
    return res.status(500).json({ message: "Queue Error", err });
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  httpWorker
});
