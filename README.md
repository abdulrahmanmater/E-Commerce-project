# E-Commerce Backend API

A production-inspired E-Commerce Backend built with Node.js, Express, TypeScript, and PostgreSQL.

## Tech Stack

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- pg

## Features

- User Registration
- Layered Architecture (Route → Controller → Service → Repository)
- PostgreSQL Connection Pool
- Environment Variables Configuration

## Project Structure

```
src/
├── config/
├── controllers/
├── dtos/
├── repositories/
├── routes/
├── services/
├── app.ts
└── server.ts
```

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create your environment file

Copy:

```text
.env.example
```

to

```text
.env
```

and update the database credentials.

### 4. Run the project

```bash
npm run dev
```

## Current Progress

- ✅ Project initialization
- ✅ Express server setup
- ✅ PostgreSQL connection
- ✅ Create User endpoint
- ⏳ Authentication
- ⏳ Validation
- ⏳ Products Module
- ⏳ Orders Module

## License

MIT