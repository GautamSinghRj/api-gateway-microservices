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
var import_express = __toESM(require("express"));
var import_cors = __toESM(require("cors"));
var import_helmet = __toESM(require("helmet"));
var import_morgan = __toESM(require("morgan"));
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
var import_http_proxy_middleware = require("http-proxy-middleware");
const host = process.env.HOST ?? "0.0.0.0";
const port = process.env.PORT ? Number(process.env.PORT) : 3e3;
const app = (0, import_express.default)();
app.use((0, import_cors.default)());
app.use((0, import_helmet.default)());
app.use((0, import_morgan.default)("combined"));
app.disable("x-powered-by");
const services = [
  {
    route: "/register",
    target: "http://auth-service:8001"
  },
  {
    route: "/health",
    target: "http://auth-service:8001"
  },
  {
    route: "/login",
    target: "http://auth-service:8001"
  },
  {
    route: "/job",
    target: "http://task-worker:8003",
    auth: true
  },
  {
    route: "/task",
    target: "http://task-service:8002",
    auth: true
  }
];
const rateLm = 18;
const interval = 60 * 1e3;
const reqCount = {};
setInterval(() => {
  Object.keys(reqCount).forEach((ipAddress) => reqCount[ipAddress] = 0);
}, interval);
function rateLimit(req, res, next) {
  const ipAddress = req.ip;
  reqCount[ipAddress] = (reqCount[ipAddress] || 0) + 1;
  if (reqCount[ipAddress] > rateLm) {
    return res.status(429).json({ status: "Error", message: "Rate Limit Exceeded" });
  }
  next();
}
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ message: "Unauthorized" });
  const token = authHeader.split(" ")[1];
  try {
    import_jsonwebtoken.default.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: "Expired or Invalid Token" });
  }
}
services.forEach(({ route, target, auth }) => {
  const middlewares = [rateLimit];
  if (auth)
    middlewares.unshift(authMiddleware);
  app.use(
    ...middlewares,
    (0, import_http_proxy_middleware.createProxyMiddleware)({
      target,
      changeOrigin: true,
      pathFilter: route
    })
  );
});
app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
