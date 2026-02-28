# Task Management System - Backend API

Production-grade REST API for task management built with Node.js, TypeScript, Prisma, and PostgreSQL.

## Features

- ✅ JWT-based authentication with refresh token rotation
- ✅ Secure password hashing with bcrypt
- ✅ CRUD operations for tasks
- ✅ Cursor-based pagination
- ✅ Filtering by status and search by title
- ✅ Request validation with Zod
- ✅ Centralized error handling
- ✅ Rate limiting and security headers
- ✅ TypeScript strict mode
- ✅ Prisma ORM with PostgreSQL

## Tech Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript (strict mode)
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Validation**: Zod
- **Authentication**: JWT (jsonwebtoken)
- **Security**: Helmet, CORS, express-rate-limit
- **Password Hashing**: bcrypt

## Prerequisites

- Node.js 20 or higher
- PostgreSQL 14 or higher
- npm or yarn

## Installation

1. **Clone the repository**

```bash
cd backend
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Required environment variables:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://username:password@localhost:5432/taskmanagement
JWT_ACCESS_SECRET=your-super-secret-access-key-min-32-characters-long
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-characters-long
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CORS_ORIGIN=http://localhost:3000,http://localhost:8080
```

**⚠️ Important**: Generate secure random secrets for production:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

4. **Setup database**

Create PostgreSQL database:

```bash
createdb taskmanagement
```

Run migrations:

```bash
npm run migrate
```

Generate Prisma Client:

```bash
npm run db:generate
```

5. **Seed database (optional)**

```bash
npm run db:seed
```

This creates a test user:
- Email: `test@example.com`
- Password: `password123`

## Running the Server

**Development mode** (with auto-reload):

```bash
npm run dev
```

**Production build**:

```bash
npm run build
npm start
```

Server will start on `http://localhost:3000`

Health check: `http://localhost:3000/health`

## API Documentation

### Base URL

```
http://localhost:3000
```

### Authentication Endpoints

#### 1. Register User

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (201)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com"
    },
    "tokens": {
      "accessToken": "jwt-token",
      "refreshToken": "jwt-refresh-token"
    }
  }
}
```

#### 2. Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200)**: Same as register

#### 3. Refresh Tokens

```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "accessToken": "new-jwt-token",
    "refreshToken": "new-refresh-token"
  }
}
```

#### 4. Logout

```http
POST /auth/logout
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

**Response (204)**: No content

### Task Endpoints

**All task endpoints require authentication**. Include the access token in the Authorization header:

```
Authorization: Bearer <access-token>
```

#### 1. Get Tasks (with pagination, filtering, search)

```http
GET /tasks?limit=20&cursor=uuid&status=TODO&search=project
Authorization: Bearer <access-token>
```

**Query Parameters**:
- `limit` (optional): Number of tasks to return (default: 20, max: 100)
- `cursor` (optional): Task ID for cursor-based pagination
- `status` (optional): Filter by status (`TODO`, `IN_PROGRESS`, `DONE`)
- `search` (optional): Search by title (case-insensitive)

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": "uuid",
        "title": "Complete project",
        "description": "Finish the API implementation",
        "status": "TODO",
        "userId": "uuid",
        "createdAt": "2026-02-27T12:00:00.000Z",
        "updatedAt": "2026-02-27T12:00:00.000Z"
      }
    ],
    "nextCursor": "uuid-or-null",
    "hasMore": true
  }
}
```

#### 2. Create Task

```http
POST /tasks
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "title": "New Task",
  "description": "Task description (optional)",
  "status": "TODO"
}
```

**Response (201)**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "New Task",
    "description": "Task description",
    "status": "TODO",
    "userId": "uuid",
    "createdAt": "2026-02-27T12:00:00.000Z",
    "updatedAt": "2026-02-27T12:00:00.000Z"
  }
}
```

#### 3. Get Task by ID

```http
GET /tasks/:id
Authorization: Bearer <access-token>
```

**Response (200)**: Same structure as single task object

#### 4. Update Task

```http
PATCH /tasks/:id
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description",
  "status": "IN_PROGRESS"
}
```

All fields are optional.

**Response (200)**: Updated task object

#### 5. Delete Task

```http
DELETE /tasks/:id
Authorization: Bearer <access-token>
```

**Response (204)**: No content

#### 6. Toggle Task Status

```http
PATCH /tasks/:id/toggle
Authorization: Bearer <access-token>
```

Cycles through: `TODO` → `IN_PROGRESS` → `DONE` → `TODO`

**Response (200)**: Updated task object

### Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message"
}
```

**Common Status Codes**:
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (missing/invalid token)
- `404`: Not Found
- `409`: Conflict (duplicate email)
- `429`: Too Many Requests (rate limit exceeded)
- `500`: Internal Server Error

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Database seeding
├── src/
│   ├── config/
│   │   ├── database.ts      # Prisma client singleton
│   │   └── env.ts           # Environment validation
│   ├── middleware/
│   │   ├── authGuard.ts     # JWT verification
│   │   ├── errorHandler.ts # Centralized error handling
│   │   └── validate.ts      # Zod validation middleware
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.schemas.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.controller.ts
│   │   │   └── auth.routes.ts
│   │   └── tasks/
│   │       ├── task.schemas.ts
│   │       ├── task.service.ts
│   │       ├── task.controller.ts
│   │       └── task.routes.ts
│   ├── types/
│   │   └── index.ts         # Shared TypeScript types
│   ├── utils/
│   │   └── logger.ts        # Logging utility
│   ├── app.ts               # Express app setup
│   └── server.ts            # Server entry point
├── .env                     # Environment variables
├── .env.example             # Environment template
├── .gitignore
├── package.json
├── tsconfig.json            # TypeScript config (strict mode)
└── README.md
```

## Database Schema

### User
- `id`: UUID (primary key)
- `email`: String (unique, indexed)
- `password`: String (hashed)
- `createdAt`: DateTime
- `updatedAt`: DateTime

### Task
- `id`: UUID (primary key)
- `title`: String
- `description`: String (optional)
- `status`: Enum (TODO, IN_PROGRESS, DONE)
- `userId`: UUID (foreign key, indexed)
- `createdAt`: DateTime (indexed)
- `updatedAt`: DateTime

### RefreshToken
- `id`: UUID (primary key)
- `token`: String (unique, indexed)
- `userId`: UUID (foreign key, indexed)
- `expiresAt`: DateTime
- `createdAt`: DateTime

## Security Features

- **Password Hashing**: bcrypt with salt rounds 10
- **JWT Tokens**: 
  - Access token: 15 minutes expiry
  - Refresh token: 7 days expiry
  - Refresh token rotation on use
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configurable allowed origins
- **Helmet**: Security headers
- **Input Validation**: Zod schemas for all requests
- **SQL Injection Prevention**: Prisma ORM parametrized queries
- **Error Sanitization**: No sensitive data in error responses

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run migrate` - Run database migrations
- `npm run migrate:deploy` - Deploy migrations (production)
- `npm run db:generate` - Generate Prisma Client
- `npm run db:studio` - Open Prisma Studio (DB GUI)
- `npm run db:seed` - Seed database with test data

## Deployment

### Prerequisites
- PostgreSQL database (hosted or managed service)
- Node.js 20+ runtime environment

### Steps

1. **Set up database**:
   - Create production PostgreSQL database
   - Note connection string

2. **Configure environment**:
   ```env
   NODE_ENV=production
   DATABASE_URL=postgresql://user:pass@host:5432/dbname
   JWT_ACCESS_SECRET=<secure-random-string>
   JWT_REFRESH_SECRET=<secure-random-string>
   CORS_ORIGIN=https://yourdomain.com
   ```

3. **Build application**:
   ```bash
   npm install
   npm run build
   ```

4. **Run migrations**:
   ```bash
   npm run migrate:deploy
   ```

5. **Start server**:
   ```bash
   npm start
   ```

### Deployment Platforms

**Recommended platforms**:
- Railway
- Render
- Fly.io
- AWS (EC2, ECS, Elastic Beanstalk)
- DigitalOcean App Platform
- Heroku

### Database Hosting

**Recommended services**:
- Supabase (PostgreSQL)
- Neon
- Railway (PostgreSQL)
- AWS RDS
- DigitalOcean Managed Databases

## Testing the API

Use any HTTP client (Postman, Thunder Client, curl, etc.)

**Example flow**:

1. Register a new user
2. Login to get tokens
3. Create tasks using access token
4. List tasks with pagination
5. Filter tasks by status
6. Search tasks by title
7. Update/delete tasks
8. Refresh token when access token expires

## Troubleshooting

**Database connection issues**:
- Verify PostgreSQL is running
- Check DATABASE_URL format
- Ensure database exists

**Migration errors**:
- Reset database: `npx prisma migrate reset`
- Generate client: `npm run db:generate`

**JWT errors**:
- Ensure secrets are at least 32 characters
- Check token expiry times
- Verify token format in Authorization header

## License

MIT

## Support

For issues or questions, please open an issue on the repository.
