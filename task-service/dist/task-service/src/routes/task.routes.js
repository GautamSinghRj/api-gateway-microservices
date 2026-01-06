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
var task_routes_exports = {};
__export(task_routes_exports, {
  default: () => task_routes_default
});
module.exports = __toCommonJS(task_routes_exports);
var import_express = require("express");
var import_taskController = require("../controller/taskController");
const router = new import_express.Router();
router.post("/task", import_taskController.taskfiltering);
router.get("/job", import_taskController.taskFilteringGet);
var task_routes_default = router;
