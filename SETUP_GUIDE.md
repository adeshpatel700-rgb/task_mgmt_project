# Complete Setup Guide - Task Management System

This guide will walk you through setting up and running the complete Task Management System from scratch.

## Table of Contents

1. [Prerequisites Installation](#prerequisites-installation)
2. [Backend Setup](#backend-setup)
3. [Flutter App Setup](#flutter-app-setup)
4. [Running the Complete System](#running-the-complete-system)
5. [Building Release APK](#building-release-apk)
6. [Common Issues](#common-issues)

---

## Prerequisites Installation

### 1. Install Node.js

**Windows:**
1. Download from https://nodejs.org/ (LTS version 20.x)
2. Run installer
3. Verify: `node --version` and `npm --version`

**macOS:**
```bash
brew install node@20
```

**Linux:**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Install PostgreSQL

**Windows:**
1. Download from https://www.postgresql.org/download/windows/
2. Run installer (default port: 5432)
3. Remember the password you set for user `postgres`

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux:**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 3. Install Flutter

**Windows:**
1. Download Flutter SDK: https://docs.flutter.dev/get-started/install/windows
2. Extract to `C:\src\flutter`
3. Add to PATH: `C:\src\flutter\bin`
4. Run `flutter doctor`

**macOS:**
```bash
brew install flutter
flutter doctor
```

**Linux:**
```bash
# Download Flutter SDK
wget https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_3.x.x-stable.tar.xz
tar xf flutter_linux_3.x.x-stable.tar.xz
export PATH="$PATH:`pwd`/flutter/bin"
flutter doctor
```

### 4. Install Android Studio

1. Download from https://developer.android.com/studio
2. Install with default settings
3. Open Android Studio → Settings → Plugins → Install "Flutter" and "Dart"
4. Install Android SDK (via SDK Manager)
5. Create an Android Virtual Device (AVD) or connect physical device

### 5. Accept Android Licenses

```bash
flutter doctor --android-licenses
```

---

## Backend Setup

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages:
- express
- typescript
- prisma
- bcrypt
- jsonwebtoken
- zod
- And more...

### Step 3: Create Database

**Option A: Using psql command line**
```bash
psql -U postgres
CREATE DATABASE taskmanagement;
\q
```

**Option B: Using pgAdmin**
1. Open pgAdmin
2. Right-click "Databases" → Create → Database
3. Name: `taskmanagement`
4. Click "Save"

### Step 4: Configure Environment

```bash
# Windows
copy .env.example .env

# macOS/Linux
cp .env.example .env
```

Edit `.env` file:

```env
NODE_ENV=development
PORT=3000

# Update with your PostgreSQL credentials
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/taskmanagement

# Generate secure secrets (32+ characters)
JWT_ACCESS_SECRET=your-super-secret-access-key-min-32-characters-long-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-characters-long-change-this

JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

CORS_ORIGIN=http://localhost:3000,http://localhost:8080
```

**Generate Random Secrets:**

```bash
# Windows PowerShell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# macOS/Linux
openssl rand -hex 32
```

### Step 5: Run Database Migrations

```bash
npm run migrate
```

This creates the database tables (User, Task, RefreshToken).

### Step 6: Generate Prisma Client

```bash
npm run db:generate
```

### Step 7: (Optional) Seed Database

```bash
npm run db:seed
```

This creates a test user:
- Email: `test@example.com`
- Password: `password123`

### Step 8: Start Backend Server

```bash
npm run dev
```

You should see:
```
✅ Database connected successfully
🚀 Server is running on port 3000
📝 Environment: development
🔗 Health check: http://localhost:3000/health
```

**Test the server:**

Open browser: http://localhost:3000/health

You should see:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-02-27T..."
}
```

**Keep this terminal running!** Backend must be running for the app to work.

---

## Flutter App Setup

### Step 1: Open New Terminal

Keep backend terminal running, open a new terminal window.

### Step 2: Navigate to Flutter Directory

```bash
cd flutter_app
```

### Step 3: Install Dependencies

```bash
flutter pub get
```

### Step 4: Run Code Generation

```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

This generates:
- `*.freezed.dart` files (immutable models)
- `*.g.dart` files (JSON serialization)

### Step 5: Configure API Base URL

**Find your machine's IP address:**

**Windows:**
```bash
ipconfig
# Look for IPv4 Address (e.g., 192.168.1.100)
```

**macOS/Linux:**
```bash
ifconfig
# Look for inet address (e.g., 192.168.1.100)
```

**Edit: `lib/core/config/app_config.dart`**

For **Android Emulator**:
```dart
static const String apiBaseUrl = 'http://10.0.2.2:3000';
```

For **Physical Android Device**:
```dart
static const String apiBaseUrl = 'http://192.168.1.100:3000'; // Use your actual IP
```

### Step 6: Start Android Emulator or Connect Device

**Option A: Android Emulator**

1. Open Android Studio
2. Tools → Device Manager
3. Create Virtual Device (if not exists)
4. Click Play button to start emulator

**Option B: Physical Device**

1. Enable Developer Options on Android device:
   - Settings → About Phone → Tap "Build Number" 7 times
2. Enable USB Debugging:
   - Settings → Developer Options → USB Debugging
3. Connect device via USB
4. Accept debugging prompt on phone

**Verify device:**
```bash
flutter devices
```

Should show your emulator or device.

### Step 7: Run Flutter App

```bash
flutter run
```

Or select device:
```bash
flutter run -d <device-id>
```

**First launch takes 2-5 minutes** (compiling app for the first time).

Subsequent runs are much faster with hot reload.

---

## Running the Complete System

### Quick Start Checklist

- [ ] Backend server running (`npm run dev` in backend/)
- [ ] PostgreSQL database running
- [ ] Android emulator/device ready
- [ ] Flutter app running (`flutter run` in flutter_app/)

### Testing the App

1. **Register a new user**
   - Email: `yourname@example.com`
   - Password: `password123` (min 8 chars)
   - Click "Register"

2. **You're automatically logged in**
   - Redirected to Task Dashboard

3. **Create your first task**
   - Click "+" button
   - Title: "Complete setup guide"
   - Description: "Finish reading the docs"
   - Status: "To Do"
   - Click "Create Task"

4. **Try all features**
   - ✅ Toggle task status (circle icon)
   - ✅ Edit task (pencil icon)
   - ✅ Delete task (trash icon)
   - ✅ Filter by status (filter icon)
   - ✅ Search tasks (search bar)
   - ✅ Pull to refresh
   - ✅ Scroll for pagination

5. **Test authentication**
   - Click logout icon
   - Login again with credentials
   - All your tasks are still there!

### Hot Reload (During Development)

While app is running:
- Press `r` in terminal for **hot reload** (fast, preserves state)
- Press `R` in terminal for **hot restart** (slower, resets state)
- Press `q` to quit

Make changes to Dart code → Press `r` → See changes instantly!

---

## Building Release APK

### Step 1: Generate Keystore (First Time Only)

```bash
cd flutter_app

# Windows
keytool -genkey -v -keystore %userprofile%\upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload

# macOS/Linux
keytool -genkey -v -keystore ~/upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
```

Enter information when prompted:
- Keystore password: (create strong password)
- Key password: (use same as keystore password)
- Name: Your Name
- Organizational Unit: Your Company
- Organization: Your Company
- City, State, Country: (your location)

**Remember these passwords!** You'll need them forever for this app.

### Step 2: Create key.properties

```bash
# Windows
copy android\key.properties.example android\key.properties

# macOS/Linux
cp android/key.properties.example android/key.properties
```

Edit `android/key.properties`:

```properties
storePassword=YOUR_KEYSTORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=upload
storeFile=C:/Users/YourName/upload-keystore.jks
```

**Important**: Use absolute path for `storeFile`

### Step 3: Update API URL for Production

Edit `lib/core/config/app_config.dart`:

```dart
static const String apiBaseUrl = 'https://your-production-api.com';
```

### Step 4: Build Release APK

```bash
flutter build apk --release
```

Build takes 2-5 minutes.

**Output**: `build/app/outputs/flutter-apk/app-release.apk`

### Step 5: Install on Device

**Via USB:**
```bash
adb install build/app/outputs/flutter-apk/app-release.apk
```

**Manual Transfer:**
1. Copy `app-release.apk` to device
2. Open file on device
3. Install (may need to enable "Install from Unknown Sources")

### Step 6: Test Release APK Thoroughly

Test all features in release mode to ensure everything works!

---

## Common Issues

### Backend Issues

#### "Cannot connect to database"

**Solution:**
1. Check PostgreSQL is running:
   ```bash
   # Windows
   services.msc → Look for "postgresql"
   
   # macOS
   brew services list
   
   # Linux
   sudo systemctl status postgresql
   ```

2. Verify DATABASE_URL in `.env`
3. Test connection:
   ```bash
   psql -U postgres -d taskmanagement
   ```

#### "Port 3000 already in use"

**Solution:**
1. Kill process using port:
   ```bash
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   
   # macOS/Linux
   lsof -ti:3000 | xargs kill -9
   ```

2. Or change PORT in `.env`

#### "Prisma Client not found"

**Solution:**
```bash
npm run db:generate
```

### Flutter Issues

#### "Cannot connect to API"

**Solution:**

1. **Android Emulator**: Use `http://10.0.2.2:3000`
2. **Physical Device**: 
   - Use your machine's IP (not 127.0.0.1 or localhost)
   - Ensure device is on same WiFi network
   - Check firewall isn't blocking connections

3. Test API from browser on same device:
   `http://YOUR_IP:3000/health`

#### "Build failed: SDK not found"

**Solution:**
```bash
flutter doctor
# Fix any issues shown
flutter clean
flutter pub get
```

#### "Code generation failed"

**Solution:**
```bash
flutter clean
flutter pub get
flutter pub run build_runner clean
flutter pub run build_runner build --delete-conflicting-outputs
```

#### "Hot reload not working"

**Solution:**
1. Press `R` (capital R) for hot restart
2. If still not working, stop and rerun `flutter run`

#### "Keystore errors when building release"

**Solution:**
1. Verify `android/key.properties` exists and has correct values
2. Check keystore file path is absolute
3. Verify passwords are correct
4. Ensure keystore file exists at specified location

### Network Issues

#### "Connection timeout" / "No internet connection"

**Solution:**
1. Check backend is running
2. Ping backend from device:
   - Test in browser: `http://YOUR_IP:3000/health`
3. Check device WiFi connection
4. Disable VPN if active
5. Check firewall settings:
   ```bash
   # Windows: Allow Node.js through firewall
   # macOS: System Preferences → Security → Firewall → Allow node
   ```

### Database Issues

#### "Migration failed"

**Solution:**
```bash
# Reset database (WARNING: Deletes all data!)
npx prisma migrate reset

# Or manually:
psql -U postgres
DROP DATABASE taskmanagement;
CREATE DATABASE taskmanagement;
\q

# Then run migrations again
npm run migrate
```

---

## Next Steps

### For Development

1. **Backend**:
   - Add more endpoints as needed
   - Write unit tests
   - Add API documentation (Swagger)

2. **Flutter**:
   - Add more features
   - Write widget tests
   - Improve UI/UX

### For Production

1. **Backend**:
   - Deploy to cloud (Railway, Render, AWS)
   - Use managed PostgreSQL (Supabase, Neon)
   - Set up CI/CD
   - Configure logging/monitoring

2. **Flutter**:
   - Build release APK
   - Test on multiple devices
   - Prepare Play Store listing
   - Submit to Google Play

---

## Support

- **Backend README**: `backend/README.md`
- **Flutter README**: `flutter_app/README.md`
- **Main README**: `README.md`

---

## Quick Reference Commands

### Backend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run migrate      # Run migrations
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio
```

### Flutter
```bash
flutter run                          # Run app
flutter run -v                       # Run with verbose logging
flutter clean                        # Clean build files
flutter pub get                      # Install dependencies
flutter pub run build_runner build   # Generate code
flutter build apk --release          # Build release APK
flutter devices                      # List devices
flutter doctor                       # Check setup
```

---

**Congratulations! You now have a fully functional Task Management System! 🎉**
