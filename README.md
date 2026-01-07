# 🚀 API Gateway Microservices Architecture

A production-ready microservices system implementing the API Gateway pattern using Node.js, Express, JWT authentication, BullMQ, and Redis.
This project demonstrates secure request routing, service decoupling, and asynchronous background processing, reflecting real-world backend architectures used in scalable systems.

---

## 📌 Key Features

- Centralized API Gateway
- JWT-based authentication and authorization
- Reverse proxy routing to downstream microservices
- Background job processing with BullMQ
- Dedicated worker service for async and cron tasks
- Clean separation of microservices
- Scalable, modular, and extensible architecture
- Docker-ready deployment

---

## 🧠 Architecture Overview

Client (Web / Mobile / Postman)
|
v
API Gateway
|
|-- Auth Service      → Authentication & JWT issuance
|-- Task Service      → Core business APIs
|-- Worker Service   → Background jobs / cron tasks

---

### Why API Gateway?

- Single entry point for clients
- Centralized security and authentication
- Service abstraction and isolation
- Improved scalability and observability

---

## 🧩 Microservices Breakdown

### API Gateway

- Entry point for all client requests
- Validates JWT tokens before routing
- Proxies requests to downstream services
- Handles CORS, security headers, and logging

Tech Stack:
- Node.js
- Express
- JWT
- Helmet
- Morgan
- http-proxy-middleware

---

### Auth Service

- Handles user authentication logic
- Issues JWT tokens
- Protects downstream services

---

### Task Service

- Contains core business logic
- Exposes protected APIs
- Sends long-running tasks to queues

---

### Worker Service

- Processes background jobs
- Uses BullMQ with Redis
- Suitable for cron jobs, notifications, AI processing, and heavy computations

---

## ⚙️ Tech Stack

Runtime: Node.js  
Framework: Express  
Authentication: JWT  
Queue: BullMQ  
Broker: Redis  
Security: Helmet, CORS  
Logging: Morgan  
Deployment: Docker, Render  

---

## 🛠 Environment Variables

Create a .env file for each service:

PORT=3000  
JWT_SECRET=your_secret_key  
REDIS_URL=redis://localhost:6379  

Ensure JWT_SECRET is the same across all services that validate tokens.

---

## ▶️ Running the Project Locally

### Prerequisites

- Node.js v18 or higher
- Redis (local or cloud)
- Docker (optional)

---

### Clone the Repository

git clone https://github.com/GautamSinghRj/api-gateway-microservices.git  
cd api-gateway-microservices  

---

### Install Dependencies

npm install  

Repeat this inside each microservice directory if required.

---

### Start Redis

redis-server  

Or using Docker:

docker run -p 6379:6379 redis  

---

### Start All Services

Run each service in a separate terminal:

npm run dev  

Recommended start order:
1. Auth Service
2. Task Service
3. Worker Service
4. API Gateway

---

### Access the API Gateway

http://localhost:<GATEWAY_PORT>

All client requests must go through the API Gateway.

---

## ✅ Verification Checklist

- Auth service issues JWT tokens
- Gateway validates tokens correctly
- Protected routes are accessible
- Background jobs are processed by workers
- Redis queues are active

---

## 🐳 Docker (Optional)

docker-compose up --build  

This starts:
- API Gateway
- All microservices
- Redis
