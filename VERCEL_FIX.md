# Vercel Deployment Fix

## Problem
The serverless function was crashing with `FUNCTION_INVOCATION_FAILED` error because:
1. Database initialization was happening asynchronously with `process.exit(1)` on failure
2. The app wasn't properly structured for serverless environments
3. Vercel needs an immediate export, not async initialization at module level

## Solution Applied

### 1. Created Serverless-Compatible Structure
- Created `api/index.js` as the Vercel entry point
- Created `src/app.js` with lazy database initialization
- Modified `src/index.js` to use the new app structure for local development

### 2. Database Initialization Changes
- Database now initializes on first request, not at module load
- Added `ensureDbInitialized` middleware for API routes
- Returns 503 error instead of crashing when database fails in production
- Database connection is cached and reused across requests

### 3. Updated Vercel Configuration
- Changed build source from `src/index.js` to `api/index.js`
- Simplified routing to use single serverless function

## Required Vercel Environment Variables

You MUST set these in your Vercel project settings:

### Database (Required)
```
POSTGRES_HOST=your-postgres-host
POSTGRES_DATABASE=your-database-name
POSTGRES_USER=your-database-user
POSTGRES_PASSWORD=your-database-password
```

Or use Vercel Postgres (automatically sets these):
```
POSTGRES_URL=postgresql://...
```

### JWT (Required)
```
JWT_SECRET=your-production-secret-key-change-this
```

### School Configuration (Required)
```
SCHOOL_NAME=Your School Name
SCHOOL_LATITUDE=40.7128
SCHOOL_LONGITUDE=-74.0060
SCHOOL_RADIUS_METERS=100
```

### Firebase (Optional - for push notifications)
```
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"..."}
```

### Other Settings
```
NODE_ENV=production
DB_SSL=true
```

## Deployment Steps

1. **Set Environment Variables in Vercel**
   - Go to your Vercel project settings
   - Navigate to Environment Variables
   - Add all required variables listed above

2. **Deploy**
   ```bash
   git add .
   git commit -m "Fix serverless function crash"
   git push
   ```

3. **Verify Deployment**
   - Check `/health` endpoint: `https://your-app.vercel.app/health`
   - Should return: `{"status":"ok","timestamp":"...","env":"production"}`

4. **Test API Endpoints**
   ```bash
   # Test health
   curl https://your-app.vercel.app/health
   
   # Test API (should return 401 or proper response)
   curl https://your-app.vercel.app/api/auth/login
   ```

## Common Issues

### Issue: Still getting 500 error
**Solution**: Check Vercel logs for specific error messages
- Go to Vercel Dashboard → Your Project → Deployments → Click on deployment → Functions tab
- Look for error details

### Issue: Database connection failed
**Solution**: Verify environment variables are set correctly
- Ensure `POSTGRES_*` variables are set
- If using Vercel Postgres, ensure it's linked to your project
- Check that `DB_SSL=true` for production databases

### Issue: JWT errors
**Solution**: Ensure `JWT_SECRET` is set in Vercel environment variables

## Testing Locally

The app still works locally with the same commands:
```bash
npm start       # Production mode
npm run dev     # Development mode with nodemon
```

## Files Changed
- ✅ Created `api/index.js` - Vercel serverless entry point
- ✅ Created `src/app.js` - Express app with lazy DB initialization
- ✅ Modified `src/index.js` - Local development server
- ✅ Updated `vercel.json` - New build configuration
