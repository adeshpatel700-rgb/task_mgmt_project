# 🚀 Backend Deployment Guide - Railway (Free & Easy)

## Why Railway?
- ✅ **FREE**: $5 credit/month (enough for small apps)
- ✅ **Easy**: Deploy from GitHub in 3 clicks
- ✅ **PostgreSQL**: Free managed PostgreSQL database included
- ✅ **Auto-deploy**: Automatic deployments on git push
- ✅ **No credit card**: Required but won't charge until you exceed free tier

## Alternative Free Options
- **Render.com**: Similar to Railway, also free tier
- **Fly.io**: Good free tier, requires credit card
- **Heroku**: No longer has a free tier

---

## 🎯 Step-by-Step Deployment on Railway

### Step 1: Prepare Your Code (5 minutes)

#### 1.1 Add Start Script
Your `backend/package.json` already has the correct scripts:
```json
{
  "scripts": {
    "start": "node dist/server.js",
    "build": "tsc",
    "migrate:deploy": "prisma migrate deploy"
  }
}
```

#### 1.2 Add Railway Configuration
Create [`backend/railway.json`](backend/railway.json):
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run db:generate && npm run build"
  },
  "deploy": {
    "startCommand": "npm run migrate:deploy && npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

#### 1.3 Create Nixpacks Configuration
Create [`backend/nixpacks.toml`](backend/nixpacks.toml):
```toml
[phases.build]
cmds = ["npm install", "npx prisma generate", "npm run build"]

[phases.deploy]
cmds = ["npx prisma migrate deploy", "npm start"]

[start]
cmd = "npm start"
```

---

### Step 2: Push Code to GitHub (3 minutes)

#### 2.1 Initialize Git Repository
```powershell
cd c:\Users\ADESH\Desktop\newwwww\Task

# Initialize git
git init

# Create .gitignore
echo "node_modules
dist
.env
*.log
.DS_Store
flutter_app/build
flutter_app/.dart_tool
flutter_app/.flutter-plugins
flutter_app/.flutter-plugins-dependencies
flutter_app/android/.gradle
flutter_app/android/local.properties
flutter_app/android/key.properties" | Out-File -FilePath .gitignore -Encoding utf8

# Add all files
git add .

# Commit
git commit -m "Initial commit: Task Management System"
```

#### 2.2 Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `task-management-system`
3. Description: `Task Management System - Track B Mobile Engineer`
4. **Keep it Public** (required for Railway free tier)
5. **Don't** initialize with README (we already have files)
6. Click "Create repository"

#### 2.3 Push to GitHub
```powershell
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/task-management-system.git
git branch -M main
git push -u origin main
```

---

### Step 3: Deploy on Railway (5 minutes)

#### 3.1 Sign Up for Railway
1. Go to https://railway.app
2. Click "Login" → "Login with GitHub"
3. Authorize Railway to access your GitHub
4. **Add payment method** (credit card required but won't be charged for free tier)

#### 3.2 Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Select your repository: `task-management-system`
4. Railway will detect it's a Node.js app

#### 3.3 Add PostgreSQL Database
1. Click "+ New" in your project
2. Select "Database" → "PostgreSQL"
3. Railway will create a PostgreSQL database
4. **It will automatically set DATABASE_URL environment variable**

#### 3.4 Configure Backend Service
1. Click on your backend service
2. Go to "Settings" tab
3. Set **Root Directory**: `backend`
4. Set **Watch Paths**: `backend/**`

#### 3.5 Set Environment Variables
1. Go to "Variables" tab
2. Add these variables:
```
NODE_ENV=production
PORT=3000
JWT_ACCESS_SECRET=a922df5665062850e33bbf044486bec7dd18be42bc5a45716477c61c066abe5a
JWT_REFRESH_SECRET=dd058734ebd44288558c299eca62544f300c8b7adc41840b4faffccb2c7b239e
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CORS_ORIGIN=*
```

**Note**: `DATABASE_URL` is automatically set by Railway's PostgreSQL plugin.

#### 3.6 Deploy
1. Go to "Deployments" tab
2. Click "Deploy"
3. Wait 2-3 minutes for build and deployment
4. Once deployed, you'll see "Success" status

#### 3.7 Get Public URL
1. Go to "Settings" tab
2. Click "Generate Domain" under "Domains"
3. You'll get a URL like: `https://your-app.railway.app`
4. **Copy this URL** - you'll need it for the Flutter app!

---

### Step 4: Test Your Deployed API (2 minutes)

#### 4.1 Test Health Endpoint
Open in browser:
```
https://your-app.railway.app/health
```

You should see:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-02-28T..."
}
```

#### 4.2 Test Registration (Using PowerShell)
```powershell
$body = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "https://your-app.railway.app/auth/register" -Method Post -Body $body -ContentType "application/json"

$response
```

You should get tokens back!

---

### Step 5: Update Flutter App (2 minutes)

#### 5.1 Update API URL
Edit [`flutter_app/lib/core/config/app_config.dart`](flutter_app/lib/core/config/app_config.dart):

```dart
class AppConfig {
  // Change this to your Railway URL
  static const String apiBaseUrl = 'https://your-app.railway.app';
  
  static const Duration connectTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
}
```

#### 5.2 Rebuild APK
```powershell
cd flutter_app
flutter build apk --release
```

New APK location: `flutter_app/build/app/outputs/flutter-apk/app-release.apk`

---

## 📱 Install APK on Android Device

### Option 1: USB Installation
```powershell
cd flutter_app
adb install build/app/outputs/flutter-apk/app-release.apk
```

### Option 2: Manual Transfer
1. Copy `app-release.apk` to your phone (via USB, email, cloud)
2. Open the file on your device
3. Allow "Install from Unknown Sources" if prompted
4. Install the app

---

## ✅ Final Testing

1. **Open the app** on your Android device
2. **Register** a new account
3. **Login** with credentials
4. **Create tasks** and test all features
5. **Verify** pagination, filtering, search work
6. **Test** offline/online behavior

---

## 📊 Monitor Your Deployment

### Railway Dashboard
- **Logs**: View real-time logs
- **Metrics**: CPU, memory, network usage
- **Database**: Query your PostgreSQL database
- **Usage**: Track your credit usage

### View Logs
1. Go to Railway dashboard
2. Click your service
3. Go to "Deployments" tab
4. Click latest deployment
5. View logs in real-time

---

## 🔧 Troubleshooting

### "Build Failed"
**Solution**: Check Railway build logs for errors
- Missing dependencies? Add to `package.json`
- TypeScript errors? Run `npm run build` locally first
- Prisma issues? Ensure `prisma generate` runs before build

### "Database Connection Failed"
**Solution**: 
- Ensure PostgreSQL service is added to project
- Check `DATABASE_URL` is set automatically
- View database logs in Railway dashboard

### "502 Bad Gateway"
**Solution**:
- Check deployment logs for Node.js errors
- Ensure PORT environment variable is set
- Verify `npm start` command works locally

### "CORS Errors" in Flutter App
**Solution**:
- Set `CORS_ORIGIN=*` in Railway environment variables
- Or set specific origin: `CORS_ORIGIN=https://your-flutter-app-domain.com`

---

## 💰 Railway Pricing

### Free Tier ($5/month credit)
- ✅ Perfect for this project
- ✅ Includes PostgreSQL database
- ✅ Auto-sleep after inactivity (free tier)
- ✅ Custom domain support
- ✅ 500 GB bandwidth
- ✅ Unlimited builds

### Cost Breakdown
- **Backend**: ~$1-2/month
- **PostgreSQL**: ~$1-2/month
- **Total**: ~$2-4/month (within free $5 credit)

### If You Exceed Free Tier
- Railway will email you
- You can upgrade to Pro ($20/month)
- Or switch to Render.com (also has free tier)

---

## 🎯 Alternative: Deploy to Render.com

### Why Render?
- ✅ True free tier (doesn't require credit card)
- ✅ Free PostgreSQL database
- ⚠️ Slower (free tier spins down after 15 mins inactivity)

### Quick Steps
1. Go to https://render.com
2. Sign up with GitHub
3. New → Web Service
4. Connect your repository
5. Root Directory: `backend`
6. Build Command: `npm install && npx prisma generate && npm run build`
7. Start Command: `npm run migrate:deploy && npm start`
8. Add PostgreSQL database (free tier)
9. Set environment variables

Same process, just different platform!

---

## 📚 Additional Resources

- Railway Docs: https://docs.railway.app
- Render Docs: https://render.com/docs
- Prisma Deploy: https://www.prisma.io/docs/guides/deployment

---

## 🎉 Congratulations!

Your Task Management System is now deployed and accessible from anywhere!

**Your Live URLs:**
- Backend API: `https://your-app.railway.app`
- API Health: `https://your-app.railway.app/health`
- Android APK: `flutter_app/build/app/outputs/flutter-apk/app-release.apk`

**Next Steps:**
1. Share your GitHub repository
2. Install APK on Android device
3. Submit your project
4. Celebrate! 🎊
