# Render Deployment Guide

## Why Render?
- ✅ Free tier: 750 hours/month (enough for 24/7)
- ✅ Free PostgreSQL database (1GB storage, 97 connections)
- ✅ Auto-deploys from GitHub
- ✅ Very similar to Railway
- ✅ No credit card required for free tier

## Quick Deployment (5 Minutes)

### Method 1: Using Render Dashboard (Easiest)

#### Step 1: Create Render Account
1. Go to https://render.com
2. Click "Get Started"
3. Sign up with GitHub (recommended) or email

#### Step 2: Connect GitHub Repository
1. In Render Dashboard, click "New +"
2. Select "Blueprint"
3. Connect your GitHub account if not already connected
4. Search for your repository: `task_mgmt_project`
5. Click "Connect"
6. Render will detect the `render.yaml` file automatically
7. Click "Apply" to create services

#### Step 3: Set JWT Secrets
After services are created:
1. Go to your backend service (task-management-backend)
2. Click "Environment" tab
3. Update these variables with your actual secrets:
   - `JWT_ACCESS_SECRET`: `a922df5665062850e33bbf044486bec7dd18be42bc5a45716477c61c066abe5a`
   - `JWT_REFRESH_SECRET`: `dd058734ebd44288558c299eca62544f300c8b7adc41840b4faffccb2c7b239e`
4. Click "Save Changes"
5. Service will auto-redeploy

#### Step 4: Wait for Deployment
- Database: ~2 minutes to provision
- Backend: ~5 minutes to build and deploy
- Watch the logs in the "Logs" tab

#### Step 5: Get Your URL
- Once deployed, your URL will be: `https://task-management-backend.onrender.com`
- Test it: `https://task-management-backend.onrender.com/health`

### Method 2: Manual Setup (Alternative)

If Blueprint doesn't work, create services manually:

#### 1. Create PostgreSQL Database
1. Dashboard → New + → PostgreSQL
2. Name: `task-management-db`
3. Database: `taskmanagement`
4. User: `taskmanagement`
5. Region: Singapore (or closest to you)
6. Plan: Free
7. Click "Create Database"
8. Wait ~2 minutes for provisioning

#### 2. Create Web Service
1. Dashboard → New + → Web Service
2. Connect Repository: `task_mgmt_project`
3. Configure:
   - **Name**: `task-management-backend`
   - **Region**: Singapore
   - **Branch**: main
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npx prisma migrate deploy && npm start`
   - **Plan**: Free

#### 3. Add Environment Variables
In the web service settings, add:

```
NODE_ENV=production
PORT=3000
JWT_ACCESS_SECRET=a922df5665062850e33bbf044486bec7dd18be42bc5a45716477c61c066abe5a
JWT_REFRESH_SECRET=dd058734ebd44288558c299eca62544f300c8b7adc41840b4faffccb2c7b239e
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CORS_ORIGIN=*
DATABASE_URL=[Internal Connection String]
```

For `DATABASE_URL`:
1. Go to your PostgreSQL database
2. Copy the "Internal Connection String"
3. Paste it as the value for `DATABASE_URL`

#### 4. Deploy
- Click "Create Web Service"
- Wait for build and deployment (~5 minutes)

## Testing Your Deployment

### 1. Health Check
```bash
curl https://task-management-backend.onrender.com/health
```
Expected: `{"status":"ok","timestamp":"..."}`

### 2. Register User
```bash
curl -X POST https://task-management-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456",
    "name": "Test User"
  }'
```

### 3. Login
```bash
curl -X POST https://task-management-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456"
  }'
```

## Update Flutter App

Once your backend is deployed:

### 1. Get Your Render URL
- Example: `https://task-management-backend.onrender.com`

### 2. Update Flutter Configuration
Edit `flutter_app/lib/core/config/app_config.dart`:

```dart
class AppConfig {
  static const String baseUrl = 'https://task-management-backend.onrender.com';
  
  // API endpoints
  static const String apiVersion = '/api';
  
  // Auth endpoints
  static const String registerEndpoint = '$apiVersion/auth/register';
  static const String loginEndpoint = '$apiVersion/auth/login';
  static const String refreshEndpoint = '$apiVersion/auth/refresh';
  static const String logoutEndpoint = '$apiVersion/auth/logout';
  
  // Task endpoints
  static const String tasksEndpoint = '$apiVersion/tasks';
  
  // Pagination
  static const int defaultPageSize = 20;
  
  // Timeouts
  static const Duration connectTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
}
```

### 3. Rebuild APK
```powershell
cd flutter_app
flutter clean
flutter pub get
flutter build apk --release
```

### 4. Install APK
- Location: `flutter_app\build\app\outputs\flutter-apk\app-release.apk`
- Transfer to Android device and install

## Important Notes

### Free Tier Limitations
- **Spins down after 15 minutes of inactivity**
  - First request after idle takes ~30-60 seconds (cold start)
  - Add a health check ping service if needed (e.g., cron-job.org)
- **750 hours/month**: Enough for 24/7 operation
- **PostgreSQL**: 1GB storage, 97 connections

### Keeping Service Awake (Optional)
To prevent cold starts, use a free ping service:

1. **UptimeRobot** (https://uptimerobot.com):
   - Create account
   - Add monitor: `https://task-management-backend.onrender.com/health`
   - Interval: 5 minutes
   - Prevents spin-down

2. **Cron-Job.org** (https://cron-job.org):
   - Create job
   - URL: `https://task-management-backend.onrender.com/health`
   - Interval: */5 * * * * (every 5 minutes)

### Performance Tips
1. **Enable HTTP/2**: Automatically enabled on Render
2. **Add Caching**: Consider adding Redis (free tier available)
3. **Optimize Migrations**: Run `npx prisma migrate deploy` only when needed

## Troubleshooting

### Build Fails
- Check logs in Render Dashboard → Logs tab
- Common issues:
  - Missing `package.json` in root directory → Use "Root Directory: backend"
  - Node version mismatch → Add `engines` in package.json

### Database Connection Issues
- Ensure `DATABASE_URL` uses the **Internal Connection String**
- Check PostgreSQL is provisioned (status: Available)
- Verify connection string format: `postgresql://user:password@host:port/database`

### Migrations Fail
- Check Prisma schema is correct
- Ensure `prisma` is in dependencies (not devDependencies)
- View migration logs in deployment logs

### Service Won't Start
- Check environment variables are set correctly
- View logs: Dashboard → your service → Logs
- Ensure PORT=3000 is set
- Verify start command: `npx prisma migrate deploy && npm start`

## Alternative: Fly.io Deployment

If Render doesn't work, here's Fly.io setup:

```powershell
# Install Fly CLI
irm https://fly.io/install.ps1 | iex

# Login
fly auth login

# Initialize (in backend directory)
cd backend
fly launch --name task-management-backend --region sin

# Add PostgreSQL
fly postgres create --name task-management-db --region sin

# Attach database
fly postgres attach task-management-db

# Set environment variables
fly secrets set JWT_ACCESS_SECRET=a922df5665062850e33bbf044486bec7dd18be42bc5a45716477c61c066abe5a
fly secrets set JWT_REFRESH_SECRET=dd058734ebd44288558c299eca62544f300c8b7adc41840b4faffccb2c7b239e
fly secrets set JWT_ACCESS_EXPIRY=15m
fly secrets set JWT_REFRESH_EXPIRY=7d
fly secrets set CORS_ORIGIN=*
fly secrets set NODE_ENV=production

# Deploy
fly deploy
```

## Support

- **Render Docs**: https://render.com/docs
- **Community Forum**: https://community.render.com
- **Status**: https://status.render.com

---

**Recommended**: Use Render Dashboard method (Method 1) - it's the easiest and most reliable.

Your backend will be live at: `https://task-management-backend.onrender.com`
