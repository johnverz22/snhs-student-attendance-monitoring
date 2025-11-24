# Quick Deploy Checklist

## ✅ Code Fixed
The serverless crash has been fixed. The app is now properly structured for Vercel.

## 🔧 Before You Deploy

### 1. Set Environment Variables in Vercel Dashboard

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these (copy-paste ready):

#### Database (REQUIRED)
```
POSTGRES_HOST=your-postgres-host-here
POSTGRES_DATABASE=school_attendance
POSTGRES_USER=your-username-here
POSTGRES_PASSWORD=your-password-here
DB_SSL=true
```

#### JWT Secret (REQUIRED)
```
JWT_SECRET=change-this-to-a-random-secure-string-min-32-chars
```

#### School Config (REQUIRED)
```
SCHOOL_NAME=Your School Name
SCHOOL_LATITUDE=40.7128
SCHOOL_LONGITUDE=-74.0060
SCHOOL_RADIUS_METERS=100
```

#### Environment (REQUIRED)
```
NODE_ENV=production
```

### 2. Deploy
```bash
git add .
git commit -m "Fix Vercel serverless function crash"
git push
```

### 3. Test After Deploy
```bash
# Replace YOUR_DOMAIN with your actual Vercel domain
curl https://YOUR_DOMAIN.vercel.app/health
```

Expected response:
```json
{"status":"ok","timestamp":"2024-...","env":"production"}
```

## 🎯 What Was Fixed

1. **Created serverless-compatible entry point** (`api/index.js`)
2. **Lazy database initialization** - DB connects on first request, not at startup
3. **Graceful error handling** - Returns 503 instead of crashing
4. **Updated Vercel config** - Points to new entry point

## 📝 Notes

- The app still works locally with `npm start` or `npm run dev`
- Database initializes automatically on first API request
- Health check endpoint works without database connection
- All routes are now serverless-compatible

## ❓ If It Still Fails

1. Check Vercel Function Logs:
   - Dashboard → Deployments → Click deployment → Functions tab
   
2. Verify environment variables are set (not empty)

3. Check database connection from Vercel:
   - Ensure your database allows connections from Vercel IPs
   - Verify SSL is enabled if required

4. Test individual endpoints:
   ```bash
   curl https://YOUR_DOMAIN.vercel.app/api/auth/login
   ```
