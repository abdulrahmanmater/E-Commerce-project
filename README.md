# E-Commerce Backend API

A production-inspired E-Commerce Backend built with **Node.js**, **Express.js**, **TypeScript**, and **PostgreSQL**.

The goal of this project is not only to build an e-commerce API, but also to follow real-world backend architecture and engineering practices similar to those used in production systems.

---

# Features

## Authentication

* User Registration
* User Login
* Password Hashing using bcrypt
* JWT Access Token Generation
* Protected Routes
* Authentication Middleware

## Validation

* Request Validation using Zod
* Strong Type Safety with TypeScript DTOs

## Database

* PostgreSQL
* Connection Pool (`pg`)
* Parameterized Queries
* Layered Repository Pattern

## Architecture

* Layered Architecture
* Controllers
* Services
* Repositories
* DTOs
* Middlewares
* Utilities
* Validation Schemas

---

# Tech Stack

* Node.js
* Express.js
* TypeScript
* PostgreSQL
* pg
* Zod
* bcrypt
* jsonwebtoken
* dotenv

---

# Project Structure

```text
src
├── config
├── controllers
├── dtos
├── middlewares
├── repositories
├── routes
├── schemas
├── services
├── utils
├── app.ts
└── server.ts
```

---

# Current API

## Register

```http
POST /users
```

Creates a new user.

Response:

```json
{
  "message": "User created successfully",
  "full_name": "Ahmed Ali",
  "email": "ahmed@example.com",
  "role": "CUSTOMER",
  "data": {
    "accessToken": "<jwt>"
  }
}
```

---

## Login

```http
POST /auth/login
```

Authenticates the user and returns a JWT access token.

Response:

```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "full_name": "Ahmed Ali",
    "email": "ahmed@example.com",
    "role": "CUSTOMER"
  },
  "data": {
    "accessToken": "<jwt>"
  }
}
```

---

## Protected Route Example

```http
GET /
```

Headers:

```http
Authorization: Bearer <access_token>
```

---

# Environment Variables

Create a `.env` file in the project root.

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=ecommerce

JWT_SECRET=your_secret_key
```

---

# Installation

```bash
git clone <repository-url>

cd <repository-folder>

npm install
```

---

# Run Development Server

```bash
npm run dev
```

---

# Build

```bash
npm run build
```

---

# Future Roadmap

* Role-Based Authorization
* Products Module
* Categories Module
* Stores Module
* Shopping Cart
* Orders
* Inventory Management
* Refresh Tokens
* Email Verification
* Password Reset
* File Upload
* Redis Caching
* Testing (Unit & Integration)
* Docker
* CI/CD
* Deployment

---

# Engineering Principles

This project follows several backend engineering practices:

* Layered Architecture
* Separation of Concerns
* Type Safety
* DTO Pattern
* Repository Pattern
* Service Layer Pattern
* Input Validation
* Secure Password Storage
* JWT Authentication
* Parameterized SQL Queries

---

# License

This project is intended for learning, portfolio, and educational purposes.

