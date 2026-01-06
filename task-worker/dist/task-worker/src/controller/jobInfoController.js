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
var jobInfoController_exports = {};
__export(jobInfoController_exports, {
  jobInfo: () => jobInfo
});
module.exports = __toCommonJS(jobInfoController_exports);
var import_client = require("@prisma/client");
var import_adapter_pg = require("@prisma/adapter-pg");
const adapter = new import_adapter_pg.PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new import_client.PrismaClient({ adapter });
const jobInfo = async (req, res) => {
  const jobs = await prisma.job.findMany({ orderBy: { createdAt: "desc" } });
  return res.status(200).json({ jobs });
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  jobInfo
});
