# Task Management System - Track B (Mobile Engineer)

**Production-ready task management system** built according to Software Engineering Assessment requirements. This project includes a **Node.js/TypeScript backend API** and a **Flutter mobile application** for Android.

## 🎯 Project Overview

This is a complete implementation of **Track B - Mobile Engineer Track** featuring:

- **Backend API**: Node.js + TypeScript + PostgreSQL + Prisma ORM
- **Mobile App**: Flutter with Clean Architecture + Riverpod
- **Authentication**: JWT-based with refresh token rotation
- **Task Management**: Full CRUD with pagination, filtering, and search

## 📁 Project Structure

```
Task/
├── backend/                    # Node.js Backend API
│   ├── src/
│   │   ├── config/            # Environment & database config
│   │   ├── middleware/        # Auth guard, validation, error handling
│   │   ├── modules/
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   └── tasks/         # Task management endpoints
│   │   ├── types/             # TypeScript types
│   │   ├── utils/             # Logger utility
│   │   ├── app.ts             # Express app setup
│   │   └── server.ts          # Server entry point
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.ts            # Database seeding
│   ├── package.json
│   ├── tsconfig.json          # TypeScript strict mode
│   └── README.md              # Backend documentation
│
└── flutter_app/               # Flutter Mobile App
    ├── lib/
    │   ├── core/              # Config, network, storage, router
    │   ├── features/
    │   │   ├── auth/          # Authentication feature
    │   │   └── tasks/         # Task management feature
    │   ├── shared/            # Theme, widgets
    │   └── main.dart          # App entry point
    ├── android/               # Android configuration
    ├── pubspec.yaml           # Flutter dependencies
    └── README.md              # Flutter documentation
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+ 
- **PostgreSQL** 14+
- **Flutter** 3.2+
- **Android Studio** (for Android builds)

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials and JWT secrets

# Setup database
npm run migrate

# (Optional) Seed sample data
npm run db:seed

# Start development server
npm run dev
```

Backend runs on: `http://localhost:3000`

### 2. Flutter App Setup

```bash
# Navigate to Flutter directory
cd flutter_app

# Install dependencies
flutter pub get

# Run code generation
flutter pub run build_runner build --delete-conflicting-outputs

# Update API URL in lib/core/config/app_config.dart
# For Android Emulator: http://10.0.2.2:3000
# For Physical Device: http://YOUR_MACHINE_IP:3000

# Run the app
flutter run
```

## ✨ Features Implemented

### Backend API (MANDATORY)

✅ **Technology Stack**
- Node.js with TypeScript (strict mode)
- PostgreSQL database
- Prisma ORM (type-safe, schema-first)
- Express.js framework
- Zod for validation
- JWT authentication

✅ **Authentication Endpoints**
- `POST /auth/register` - User registration
- `POST /auth/login` - User login  
- `POST /auth/refresh` - Token refresh (with rotation)
- `POST /auth/logout` - User logout

✅ **Task Management Endpoints**
- `GET /tasks` - Get tasks with pagination, filtering, search
- `POST /tasks` - Create task
- `GET /tasks/:id` - Get single task
- `PATCH /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task
- `PATCH /tasks/:id/toggle` - Toggle task status

✅ **Production Features**
- Cursor-based pagination
- Password hashing (bcrypt)
- JWT access + refresh tokens
- Request validation with Zod
- Centralized error handling
- Rate limiting (100 req/15min)
- Security headers (Helmet)
- CORS configuration
- Environment-based config
- Structured logging
- Database indexing
- Proper HTTP status codes

### Flutter Mobile App

✅ **Architecture**
- Clean Architecture (Domain, Data, Presentation)
- Repository pattern
- Dependency injection with Riverpod
- Type-safe navigation with GoRouter

✅ **Authentication**
- Login screen with validation
- Register screen with validation
- Secure token storage (flutter_secure_storage)
- Automatic token refresh on 401
- Auth state management

✅ **Task Dashboard**
- Infinite scroll with cursor pagination
- Pull-to-refresh
- Filter by status (TODO, IN_PROGRESS, DONE)
- Search by title
- Loading/Error/Empty states
- ListView.builder for performance

✅ **Task Operations**
- Create task with form validation
- Edit task
- Delete task with confirmation
- Toggle status with optimistic updates
- Snackbar feedback

✅ **Production Features**
- Null safety enabled
- Error-safe API handling
- Network interceptors
- Secure storage
- Material Design 3
- Release APK configuration
- ProGuard rules

## 🔒 Security Implementation

### Backend
- bcrypt password hashing (10 rounds)
- JWT access tokens (15min expiry)
- JWT refresh tokens (7d expiry, stored in DB)
- Refresh token rotation
- Rate limiting per IP
- Helmet security headers
- CORS whitelist
- Input validation
- SQL injection prevention (Prisma)
- No secrets in code

### Mobile
- Encrypted token storage
- Automatic token refresh
- 401 error interception
- No hardcoded secrets
- HTTPS for production
- Input validation
- Defensive coding

## 🏗️ Architecture Decisions

### 1. **Prisma ORM** (chosen over TypeORM)
- **Justification**: Superior TypeScript integration, type-safe queries, intuitive schema-first approach, automatic migration generation, better DX for greenfield projects

### 2. **Zod Validation** (chosen over class-validator)
- **Justification**: Runtime type validation with excellent TypeScript inference, composable schemas, single source of truth for validation + types

### 3. **Cursor-based Pagination** (chosen over offset)
- **Justification**: Prevents page drift when data changes, consistent results, better performance on large datasets, production-grade scalability

### 4. **Riverpod State Management** (Flutter)
- **Justification**: Type-safe, compile-time dependency injection, excellent testability, modern architecture support

## 📊 Database Schema

### User
- `id` (UUID, primary key)
- `email` (unique, indexed)
- `password` (bcrypt hashed)
- `createdAt`, `updatedAt`

### Task
- `id` (UUID, primary key)
- `title` (string)
- `description` (optional string)
- `status` (enum: TODO, IN_PROGRESS, DONE)
- `userId` (foreign key, indexed)
- `createdAt` (indexed), `updatedAt`

### RefreshToken
- `id` (UUID, primary key)
- `token` (unique, indexed)
- `userId` (foreign key, indexed)
- `expiresAt` (DateTime)
- `createdAt`

## 🧪 Testing the System

### 1. Start Backend
```bash
cd backend
npm run dev
# Server starts on http://localhost:3000
```

### 2. Start Flutter App
```bash
cd flutter_app
flutter run
```

### 3. Test Flow
1. **Register** new user (email + password)
2. **Login** with credentials
3. **Create tasks** using + button
4. **Filter tasks** by status
5. **Search tasks** by title
6. **Toggle status** (TODO → IN_PROGRESS → DONE → TODO)
7. **Edit/Delete** tasks
8. **Pull to refresh** 
9. **Scroll for pagination**
10. **Logout**

### Test User (if seeded)
- Email: `test@example.com`
- Password: `password123`

## 📱 Building Release APK

### 1. Generate Keystore
```bash
keytool -genkey -v -keystore ~/upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
```

### 2. Configure Signing
Create `flutter_app/android/key.properties`:
```properties
storePassword=your-password
keyPassword=your-password
keyAlias=upload
storeFile=/path/to/upload-keystore.jks
```

### 3. Update API URL
Edit `flutter_app/lib/core/config/app_config.dart` to production URL

### 4. Build APK
```bash
cd flutter_app
flutter build apk --release
```

**Output**: `flutter_app/build/app/outputs/flutter-apk/app-release.apk`

### 5. Install APK
```bash
adb install build/app/outputs/flutter-apk/app-release.apk
```

## 📚 API Documentation

See [backend/README.md](backend/README.md) for complete API documentation including:
- All endpoints with examples
- Request/response formats
- Error codes
- Authentication flow
- Pagination details

## 🛠️ Development Commands

### Backend
```bash
npm run dev          # Start dev server with hot reload
npm run build        # Build for production
npm start            # Start production server
npm run migrate      # Run database migrations
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio (DB GUI)
```

### Flutter
```bash
flutter run                    # Run app
flutter run -d <device-id>    # Run on specific device
flutter build apk --release    # Build release APK
flutter pub get                # Install dependencies
flutter pub run build_runner build  # Generate code
```

## 📦 Deployment

### Backend Deployment
Recommended platforms:
- Railway
- Render
- Fly.io
- AWS (EC2, ECS, Elastic Beanstalk)
- DigitalOcean

Database hosting:
- Supabase (PostgreSQL)
- Neon
- Railway
- AWS RDS

### Mobile Deployment
1. Build release APK
2. Test thoroughly on multiple devices
3. Prepare Play Store listing
4. Submit to Google Play Store

## 🔍 Troubleshooting

### Backend Issues

**Database connection failed**
- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Ensure database exists

**JWT errors**
- Ensure JWT secrets are at least 32 characters
- Check token expiry settings

### Flutter Issues  

**Cannot connect to API**
- Android Emulator: Use `http://10.0.2.2:3000`
- Physical Device: Use your machine's IP
- Ensure backend is running

**Build errors**
- Run `flutter clean`
- Run `flutter pub get`
- Run code generation again

## 📄 License

MIT

## 🎓 Assessment Compliance

This project strictly follows the **Track B - Mobile Engineer Track** requirements:

✅ Backend API (Node.js + TypeScript + SQL + ORM) - MANDATORY
✅ Mobile App (Flutter, Android APK) - MANDATORY
✅ JWT authentication with refresh tokens
✅ Task CRUD with pagination, filtering, search
✅ Clean architecture
✅ Modern state management (Riverpod)
✅ Production-ready security
✅ Proper error handling
✅ Environment configuration
✅ Complete documentation

**No additional features were added beyond requirements.**
**No technology substitutions were made.**
**All specified requirements are implemented.**

---

**Built with ❤️ for Software Engineering Assessment - Track B**
