# E-Commerce Backend API

A production-inspired E-Commerce Backend built with **Node.js**, **Express.js**, **TypeScript**, and **PostgreSQL**.

The goal of this project is not only to build an e-commerce API, but also to follow real-world backend architecture and engineering practices similar to those used in production systems.

---

# Features

## Authentication

- User Registration
- User Login
- Password Hashing using bcrypt
- JWT Access Token Generation
- Protected Routes
- Authentication Middleware

## Authorization

- Role-Based Authorization (RBAC)
- Ownership Authorization Middleware
- Seller Ownership Validation
- Custom Authorization Middleware

## Validation

- Request Validation using Zod
- Strong Type Safety with TypeScript DTOs
- Query Parameter Validation
- Pagination Parameter Validation
- Filtering Parameter Validation

## Error Handling

- Global Error Handler
- Custom Error Classes
- Centralized Error Responses

Supported Custom Errors:

- BadRequestError
- UnauthorizedError
- ForbiddenError
- NotFoundError
- ConflictError

## Database

- PostgreSQL
- Connection Pool (`pg`)
- Parameterized Queries
- Raw SQL Queries
- Foreign Key Relationships
- PostgreSQL ENUMs
- Soft Delete
- Database Constraints
- Layered Repository Pattern

## Architecture

- Layered Architecture
- Controllers
- Services
- Repositories
- DTOs
- Middlewares
- Utilities
- Validation Schemas
- Database Types
- Centralized Constants

---

# Product Management

- Create Product
- Get Product by ID
- Update Product
- Soft Delete Product
- Get All Public Products
- Get Seller's Products
- Product Ownership Validation
- Hidden Products
- Product Quantity Management
- Product Price Filtering

## Product Querying

The product listing APIs support:

- Pagination
- Category Filtering
- Minimum Price Filtering
- Maximum Price Filtering
- Sorting by:
  - Price
  - Name
  - Created At
  - Updated At

- Ascending / Descending Sorting
- Stable secondary sorting by Product ID
- `hasNextPage`
- `hasPreviousPage`
- `totalItems`
- `totalPages`

Example:

```http
GET /products?page=2&limit=10&category=electronics&minPrice=100&maxPrice=5000&sorting=price&sortOrder=asc
```

---

# Store Management

- Create Store
- Get Store by ID
- Store Status Management
- Seller-Owned Stores
- Store Ownership Validation
- Get Products by Store
- Store Product Pagination
- Store Product Filtering
- Store Product Sorting
- Open / Closed Store Validation

Supported Store Statuses:

```text
PENDING
OPEN
HIDDEN
REJECTED
```

Public store product APIs only expose products from stores that are currently `OPEN`.

---

# Seller Management

- Seller Profile Creation
- Seller Profile Validation
- Seller Store Management
- Seller Product Management
- Seller Ownership Checks
- Get My Products
- Filter Seller Products
- Sort Seller Products
- Paginate Seller Products

Seller product queries support:

```text
category
isHidden
minPrice
maxPrice
sorting
sortOrder
page
limit
```

---

# Category Management

- Product Categories
- Many-to-Many relationship between Products and Categories
- Category-based Product Filtering
- Category existence validation

Product/category filtering uses SQL `EXISTS` where appropriate to avoid unnecessary joins in the main query.

---

# Pagination

The API uses page-based pagination.

Example response:

```json
{
  "pagination": {
    "totalItems": 42,
    "totalPages": 5,
    "page": 2,
    "limit": 10,
    "hasNextPage": true,
    "hasPreviousPage": true
  }
}
```

Pagination parameters:

```text
page
limit
```

Default values:

```text
page = 1
limit = 10
```

The API limits the maximum page size to prevent unnecessarily large database queries.

---

# Filtering

Supported product filters include:

```text
category
minPrice
maxPrice
isHidden
```

Filters are dynamically added to SQL queries only when they are provided.

All user-provided values are passed through PostgreSQL parameterized queries.

---

# Sorting

Sorting is implemented using a whitelist of allowed database columns.

Supported sorting fields:

```text
price
name
createdAt
updatedAt
```

Supported sort orders:

```text
asc
desc
```

User input is never directly inserted as an arbitrary SQL column or SQL direction.

Example:

```text
sorting=price&sortOrder=desc
```

This approach prevents SQL injection through dynamic `ORDER BY` clauses.

---

# Query Architecture

The repository layer dynamically builds SQL queries based on the requested filters.

The implementation separates:

- SQL conditions
- SQL parameter values
- Pagination
- Sorting
- Optional category filtering

Example structure:

```text
Query Parameters
       ↓
Zod Validation
       ↓
DTO
       ↓
Service
       ↓
Repository
       ↓
Dynamic SQL + Parameterized Values
       ↓
PostgreSQL
```

---

# Current API

## Register

```http
POST /auth/register
```

Creates a new user.

Response:

```json
{
  "message": "User created successfully",
  "full_name": "Ahmed Ali",
  "email": "ahmed@example.com",
  "role": "CUSTOMER",
  "tokens": {
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
  "tokens": {
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

# Current Development Status

The project currently has the following major modules implemented:

```text
Authentication
Authorization
Users
Seller Profiles
Stores
Products
Categories
Pagination
Filtering
Sorting
Soft Delete
Error Handling
Validation
```

The next major stage is implementing the complete purchasing flow:

```text
Shopping Cart
      ↓
Orders
      ↓
Inventory
      ↓
Payments
```

---

# Future Roadmap

- Shopping Cart
- Orders
- Inventory Management
- Payment Integration
- Refresh Tokens
- Email Verification
- Password Reset
- File Upload
- Redis Caching
- Unit Testing
- Integration Testing
- API Documentation with Swagger / OpenAPI
- Docker
- CI/CD
- Deployment
- Performance Optimization
- Security Hardening

---

# Engineering Principles

This project follows several backend engineering practices:

- Layered Architecture
- Separation of Concerns
- Type Safety
- DTO Pattern
- Repository Pattern
- Service Layer Pattern
- Input Validation
- Secure Password Storage
- JWT Authentication
- Role-Based Authorization (RBAC)
- Ownership-Based Authorization
- Global Error Handling
- Custom Error Classes
- Parameterized SQL Queries
- SQL Injection Prevention
- Dynamic Query Construction
- Whitelisted Sorting
- Pagination
- Filtering
- Soft Delete
- Database Transactions
- Row-Level Locking where required

---

# License

This project is intended for learning, portfolio, and educational purposes.
