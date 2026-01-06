"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var worker_routes_exports = {};
__export(worker_routes_exports, {
  default: () => worker_routes_default
});
module.exports = __toCommonJS(worker_routes_exports);
var import_express = require("express");
var import_httpWorkerController = require("../controller/httpWorkerController");
var import_textWorkerController = require("../controller/textWorkerController");
var import_jobInfoController = require("../controller/jobInfoController");
const router = new import_express.Router();
router.post("/http", import_httpWorkerController.httpWorker);
router.post("/text", import_textWorkerController.textWorker);
router.get("/job", import_jobInfoController.jobInfo);
var worker_routes_default = router;
