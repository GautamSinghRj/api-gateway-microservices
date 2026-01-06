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
var userController_exports = {};
__export(userController_exports, {
  healthCheck: () => healthCheck,
  loginUser: () => loginUser,
  registerUser: () => registerUser
});
module.exports = __toCommonJS(userController_exports);
var import_client = require("@prisma/client");
var import_adapter_pg = require("@prisma/adapter-pg");
var import_bcrypt = __toESM(require("bcrypt"));
var import_generateToken = require("../utility/generateToken");
const adapter = new import_adapter_pg.PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new import_client.PrismaClient({ adapter });
const registerUser = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Invalid Credentials" });
    const hashedPassword = await import_bcrypt.default.hash(password, 10);
    const foundUser = await prisma.user.findUnique({
      where: {
        email
      }
    });
    if (foundUser)
      return res.status(409).json({ message: "Invalid User" });
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name
      }
    });
    const token = (0, import_generateToken.generateToken)(user);
    return res.status(201).json({ message: "Thanks, user added in database", token });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error", error: err });
  }
};
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Invalid Credentials" });
    const user = await prisma.user.findUnique({
      where: {
        email
      }
    });
    if (!user)
      return res.status(404).json({ message: "Invalid User" });
    const isMatch = await import_bcrypt.default.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid Password" });
    const token = (0, import_generateToken.generateToken)(user);
    return res.status(200).json({ message: `Welcome ${user.name || ""}`, token });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error", error: err });
  }
};
const healthCheck = (req, res) => {
  console.log("HEALTH CHECK CALLED");
  return res.sendStatus(200);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  healthCheck,
  loginUser,
  registerUser
});
