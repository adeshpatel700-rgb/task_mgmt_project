# Task Management System

A full-stack task management application with RESTful API and Flutter mobile app.

## Overview

Backend API built with Node.js, TypeScript, Express, and PostgreSQL. Mobile app uses Flutter with clean architecture and Riverpod for state management.

**Live API**: https://task-management-backend-8bvu.onrender.com

**📱 Download APK**: [app-release.apk](https://github.com/adeshpatel700-rgb/task_mgmt_project/raw/main/release/app-release.apk) (48 MB)

## Features

**Backend API**
- User authentication with JWT (access + refresh tokens)
- Task CRUD operations with validation
- Pagination, filtering, and search
- PostgreSQL database with Prisma ORM
- Security: bcrypt, helmet, CORS, rate limiting

**Mobile App**
- User registration and login
- Task management (create, edit, delete)
- Status filtering and search
- Infinite scroll with pagination
- Token refresh handling
- Secure local storage

## Tech Stack

### Backend
- Node.js + TypeScript (strict mode)
- Express.js
- PostgreSQL + Prisma ORM
- JWT authentication
- Zod validation
- Winston logging

### Mobile
- Flutter 3.38.9
- Riverpod (state management)
- Dio (HTTP client)
- go_router (navigation)
- flutter_secure_storage

## Quick Start

### Backend

```bash
cd backend
npm install

# Setup database
cp .env.example .env
# Add your DATABASE_URL to .env
npx prisma migrate dev

# Run development server
npm run dev
```

### Flutter App

```bash
cd flutter_app
flutter pub get
flutter run

# Build release APK
flutter build apk --release
```

## API Endpoints

Base URL: `https://task-management-backend-8bvu.onrender.com/api`

### Authentication
```
POST /auth/register    - Register new user
POST /auth/login       - Login user
POST /auth/refresh     - Refresh access token
POST /auth/logout      - Logout user
```

### Tasks
```
GET    /tasks         - Get all tasks (paginated)
POST   /tasks         - Create new task
GET    /tasks/:id     - Get task by ID
PATCH  /tasks/:id     - Update task
DELETE /tasks/:id     - Delete task
PATCH  /tasks/:id/toggle - Toggle task status
```

Query parameters for `/tasks`:
- `status` - Filter by TODO, IN_PROGRESS, or DONE
- `search` - Search in task title
- `limit` - Items per page (default: 20)
- `cursor` - Pagination cursor

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── modules/        # Auth and tasks modules
│   │   ├── middleware/     # Authentication, validation, errors
│   │   ├── config/         # Environment and database
│   │   └── utils/          # Logger
│   └── prisma/
│       ├── schema.prisma   # Database schema
│       └── migrations/     # Database migrations
│
└── flutter_app/
    └── lib/
        ├── features/       # Auth and tasks features
        │   ├── auth/      # Login, register screens
        │   └── tasks/     # Task list, create, edit
        ├── core/          # Config, API client, storage
        └── shared/        # Reusable widgets and theme
```

## Environment Variables

Create `backend/.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/taskdb
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
NODE_ENV=development
PORT=3000
CORS_ORIGIN=*
```

## Testing

Run backend API tests:

```bash
node test-api.js
```

Tests all endpoints including auth, CRUD operations, pagination, filtering, and token refresh.

## Database Schema

**Users**
- id (UUID)
- email (unique)
- password (hashed)
- timestamps

**Tasks**
- id (UUID)
- title
- description
- status (TODO | IN_PROGRESS | DONE)
- userId (foreign key)
- timestamps

**RefreshTokens**
- id (UUID)
- token (unique)
- userId (foreign key)
- expiresAt
- createdAt

## Deployment

Backend deployed on Render with PostgreSQL database. Automatic deployments from main branch.

Mobile app available as APK for Android devices.

## License

MIT
