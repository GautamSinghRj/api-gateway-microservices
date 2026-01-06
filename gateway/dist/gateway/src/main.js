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
app.set("trust proxy", 1);
app.use((0, import_cors.default)());
app.use((0, import_helmet.default)());
app.use((0, import_morgan.default)("combined"));
app.disable("x-powered-by");
const services = [
  {
    route: "/register",
    target: process.env.AUTH_SERVICE_URL
  },
  {
    route: "/health",
    target: process.env.AUTH_SERVICE_URL
  },
  {
    route: "/login",
    target: process.env.AUTH_SERVICE_URL
  },
  {
    route: "/job",
    target: process.env.TASK_WORKER_URL,
    auth: true
  },
  {
    route: "/task",
    target: process.env.TASK_SERVICE_URL,
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
  const ipAddress = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
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
app.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>API Gateway Documentation</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: #0f172a;
      color: #e5e7eb;
      padding: 40px;
      line-height: 1.6;
    }
    h1, h2 {
      color: #38bdf8;
    }
    code {
      background: #020617;
      padding: 4px 6px;
      border-radius: 4px;
      color: #a5f3fc;
    }
    pre {
      background: #020617;
      padding: 12px;
      border-radius: 6px;
      overflow-x: auto;
    }
    .route {
      margin-bottom: 30px;
      border-left: 4px solid #38bdf8;
      padding-left: 16px;
    }
    .auth {
      color: #fca5a5;
      font-weight: bold;
    }
  </style>
</head>
<body>

<h1>\u{1F680} API Gateway Documentation</h1>
<p>
This project is a centralized <strong>API Gateway</strong> designed to manage and route
client requests across multiple backend microservices. It handles
<strong>authentication</strong>, <strong>rate limiting</strong>, <strong>security headers</strong>,
and <strong>request proxying</strong> at a single entry point, allowing individual services
to remain lightweight and focused purely on business logic.
</p>

<p>
By introducing this gateway layer, the system becomes easier to scale,
monitor, and secure, while avoiding duplicated logic such as JWT validation
and traffic control across services.
</p>


<hr />

<div class="route">
  <h2>POST /register</h2>
  <p>Register a new user</p>

  <strong>Request Body:</strong>
  <pre>{
  "email": "user@example.com",
  "password": "securePassword",
  "name": "John Doe"
}</pre>

  <p><strong>Required:</strong> <code>email</code>, <code>password</code></p>
</div>

<div class="route">
  <h2>POST /login</h2>
  <p>User authentication</p>

  <strong>Request Body:</strong>
  <pre>{
  "email": "user@example.com",
  "password": "securePassword"
}</pre>

  <p><strong>Required:</strong> <code>email</code>, <code>password</code></p>
</div>

<div class="route">
  <h2>GET /health</h2>
  <p>Checks authentication service health</p>
</div>

<div class="route">
  <h2>GET /job</h2>
  <p>Returns status and results of all cron jobs</p>

  <p class="auth">\u{1F512} Requires Authorization Header</p>
</div>

<div class="route">
  <h2>POST /task</h2>
  <p>Create a scheduled background task</p>

  <p class="auth">\u{1F512} Requires Authorization Header</p>

  <strong>Request Body:</strong>
  <pre>{
  "type": "text_summarizer | http_request",
  "payload": {
    "key": "value"
  },
  "schedule": "*/5 * * * *"
}</pre>

  <p>
    <strong>schedule:</strong> Standard <a href="https://crontab.guru/" target="_blank">cron expression</a>
  </p>
</div>

<hr />
<p>\u{1F4CC} Rate limit: <strong>18 requests/min per IP</strong></p>

</body>
</html>
  `);
});
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
