# ⚡ Quick Vercel Deployment

## 🚀 5-Minute Deployment Guide

### Step 1: Prepare Firebase JSON (2 minutes)

```bash
# Convert Firebase JSON to single line
node -e "console.log(JSON.stringify(require('./firebase-service-account.json')))"

# Copy the output - you'll need it for Vercel
```

### Step 2: Push to GitHub (1 minute)

```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### Step 3: Deploy on Vercel (2 minutes)

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Add environment variables:

```env
NODE_ENV=production
DB_HOST=your-postgres-host
DB_PORT=5432
DB_NAME=school_attendance
DB_USER=your-user
DB_PASSWORD=your-password
DB_SSL=true
JWT_SECRET=your-64-char-secret
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
```

4. Click **Deploy**

### Step 4: Initialize Database

```bash
# Connect to your PostgreSQL database
psql "YOUR_POSTGRES_URL" < init-db.sql
```

### Step 5: Create Admin Account

```bash
curl -X POST https://your-app.vercel.app/api/auth/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@school.com",
    "password": "SecurePassword123"
  }'
```

## ✅ Done!

Visit: `https://your-app.vercel.app/admin`

---

## 📋 Environment Variables Checklist

Copy this template to Vercel:

```env
# Required
NODE_ENV=production
DB_HOST=
DB_PORT=5432
DB_NAME=school_attendance
DB_USER=
DB_PASSWORD=
DB_SSL=true
JWT_SECRET=
FIREBASE_SERVICE_ACCOUNT=

# Optional (with defaults)
SCHOOL_NAME=Sto. Rosario National High School
SCHOOL_LATITUDE=14.5995
SCHOOL_LONGITUDE=120.9842
SCHOOL_RADIUS_METERS=100
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=10
```

## 🔑 Generate JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 🗄️ Using Vercel Postgres

If using Vercel Postgres, you only need:

```env
NODE_ENV=production
JWT_SECRET=your-secret
FIREBASE_SERVICE_ACCOUNT=your-json
```

Vercel automatically provides:
- `POSTGRES_URL`
- `POSTGRES_HOST`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

Update `src/config/index.js` to use these:

```javascript
database: {
  host: process.env.POSTGRES_HOST || process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.POSTGRES_DATABASE || process.env.DB_NAME || 'school_attendance',
  user: process.env.POSTGRES_USER || process.env.DB_USER || 'school_admin',
  password: process.env.POSTGRES_PASSWORD || process.env.DB_PASSWORD || 'school_password_123',
  ssl: process.env.DB_SSL === 'true' || process.env.NODE_ENV === 'production',
},
```

## 🔄 Continuous Deployment

Every push to `main` branch automatically deploys:

```bash
git add .
git commit -m "Update"
git push origin main
```

## 📱 Update Mobile Apps

```dart
// In api_config.dart
static const String baseUrl = 'https://your-app.vercel.app/api';
```

---

**Need help?** See full guide: `VERCEL_DEPLOYMENT.md`
