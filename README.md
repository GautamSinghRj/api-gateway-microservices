# 🚀 API Gateway Microservices Architecture

A scalable **API Gateway–based microservices system** built with Node.js, designed for **authentication, service orchestration, background jobs, and secure internal communication**.

This project demonstrates **real-world backend engineering concepts** such as API Gateway pattern, message queues, workers, JWT security, and service-to-service communication.

---

## ✨ Features

- 🌐 **API Gateway** as a single entry point
- 🔐 **JWT-based Authentication & Authorization**
- 🧩 **Decoupled Microservices Architecture**
- ⚙️ **Background Job Processing using BullMQ**
- 🕒 **Cron-based Task Scheduling**
- 🔁 **Inter-service Communication**
- 📬 **Newsletter, HTTP methods calls & AI Text Support**
- 📊 **Scalable and Production-Ready Design**

---

## 🏗️ Architecture Overview

```text
Client
   |
   v
API Gateway
   |
   |── Auth Service
   |── Gateway Service
   |── Task Service
   |── Worker Service (BullMQ)
   |
 Redis (Queue)