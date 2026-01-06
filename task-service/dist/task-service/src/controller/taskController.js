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
var taskController_exports = {};
__export(taskController_exports, {
  taskFilteringGet: () => taskFilteringGet,
  taskfiltering: () => taskfiltering
});
module.exports = __toCommonJS(taskController_exports);
var import_axios = __toESM(require("axios"));
const taskfiltering = async (req, res) => {
  const { type, payload, schedule } = req.body;
  const routes = {
    http_request: "/http",
    text_summarizer: "/text"
  };
  if (!type || !payload)
    return res.status(400).json({ message: "request and payload are required" });
  if (!req.headers.authorization) {
    return res.status(401).json({ message: "Unauthorized access" });
  }
  const body = { payload, schedule };
  const route = routes[type];
  if (!route) {
    return res.status(400).json({ message: "Wrong type of task entered" });
  }
  try {
    const response = await import_axios.default.post(`https://task-worker-7m56.onrender.com${route}`, body, {
      headers: { Authorization: req.headers.authorization },
      timeout: 1e4
    });
    return res.status(200).json(response.data);
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    return res.status(503).json({ message: "Task service unavailable", err });
  }
};
const taskFilteringGet = async (req, res) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ message: "Unauthorized access" });
  }
  try {
    const response = await import_axios.default.get("http://task-worker:8003/job", {
      headers: {
        Authorization: req.headers.authorization
      },
      timeout: 1e4
    });
    return res.status(200).json(response.data);
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    return res.status(503).json({
      message: "Task service unavailable"
    });
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  taskFilteringGet,
  taskfiltering
});
