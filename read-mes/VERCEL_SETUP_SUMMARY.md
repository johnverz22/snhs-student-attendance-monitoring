# 🚀 Vercel Deployment - Complete Setup

## ✅ What's Configured

Your School Attendance System is now ready for Vercel deployment with:

1. **Firebase Environment Variable Support** ✅
   - Reads from `FIREBASE_SERVICE_ACCOUNT` env var (production)
   - Falls back to file path (local development)
   - Gracefully handles missing credentials

2. **Vercel Postgres Support** ✅
   - Supports Vercel's automatic `POSTGRES_*` variables
   - Falls back to custom `DB_*` variables
   - Auto-enables SSL in production

3. **Optimized Routes** ✅
   - Static files served efficiently
   - API routes properly configured
   - Admin interface accessible

## 📚 Documentation Created

1. **VERCEL_DEPLOYMENT.md** - Complete deployment guide (detailed)
2. **VERCEL_QUICK_DEPLOY.md** - 5-minute quick start
3. **DEPLOYMENT_CHECKLIST.md** - Step-by-step checklist

## 🔧 Files Updated

### 1. `src/config/index.js`
```javascript
database: {
  // Support both Vercel Postgres and custom PostgreSQL
  host: process.env.POSTGRES_HOST || process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.POSTGRES_DATABASE || process.env.DB_NAME || 'school_attendance',
  user: process.env.POSTGRES_USER || process.env.DB_USER || 'school_admin',
  password: process.env.POSTGRES_PASSWORD || process.env.DB_PASSWORD || 'school_password_123',
  ssl: process.env.DB_SSL === 'true' || process.env.NODE_ENV === 'production',
}
```

### 2. `src/services/notificationService.js`
Already supports:
- `FIREBASE_SERVICE_ACCOUNT` environment variable
- Falls back to file path for local development
- Graceful error handling

### 3. `vercel.json`
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/index.js",
      "use": "@vercel/node"
    },
    {
      "src": "public/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/admin/(.*)",
      "dest": "/public/admin/$1"
    },
    {
      "src": "/api/(.*)",
      "dest": "src/index.js"
    },
    {
      "src": "/health",
      "dest": "src/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "src/index.js"
    }
  ]
}
```

### 4. `.env.example`
Updated with Firebase configuration notes

## 🚀 Quick Deployment Steps

### 1. Prepare Firebase JSON
```bash
node -e "console.log(JSON.stringify(require('./firebase-service-account.json')))"
```
Copy the output.

### 2. Push to GitHub
```bash
git add .
git commit -m "Ready for Vercel"
git push origin main
```

### 3. Deploy on Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repo
3. Add environment variables:
   - `NODE_ENV=production`
   - `JWT_SECRET=<generate-64-char-secret>`
   - `FIREBASE_SERVICE_ACCOUNT=<your-json-string>`
   - Database credentials (or use Vercel Postgres)
4. Click Deploy

### 4. Initialize Database
```bash
psql "YOUR_POSTGRES_URL" < init-db.sql
```

### 5. Create Admin
```bash
curl -X POST https://your-app.vercel.app/api/auth/admin/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","email":"admin@school.com","password":"SecurePass123"}'
```

## 🔑 Environment Variables Required

### Minimum Required
```env
NODE_ENV=production
JWT_SECRET=<64-char-secret>
FIREBASE_SERVICE_ACCOUNT=<single-line-json>
```

### With Vercel Postgres
Vercel automatically provides:
- `POSTGRES_HOST`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`
- `POSTGRES_URL`

### With External PostgreSQL
```env
DB_HOST=your-host
DB_PORT=5432
DB_NAME=school_attendance
DB_USER=your-user
DB_PASSWORD=your-password
DB_SSL=true
```

## 📱 Update Mobile Apps

After deployment, update API URLs:

**student_app/lib/config/api_config.dart:**
```dart
static const String baseUrl = 'https://your-app.vercel.app/api';
```

**parent_app/lib/config/api_config.dart:**
```dart
static const String baseUrl = 'https://your-app.vercel.app/api';
```

## ✅ Verification

Test your deployment:

```bash
# Health check
curl https://your-app.vercel.app/health

# Admin login
curl -X POST https://your-app.vercel.app/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"YourPassword"}'

# Admin interface
open https://your-app.vercel.app/admin
```

## 🔄 Continuous Deployment

Every push to `main` automatically deploys:
```bash
git add .
git commit -m "Update feature"
git push origin main
```

## 📊 Monitoring

View logs:
```bash
vercel logs YOUR_PROJECT_URL
```

Or via Vercel Dashboard:
1. Go to your project
2. Click **Deployments**
3. Select a deployment
4. View **Functions** logs

## 🆘 Troubleshooting

### Firebase Error
**Issue**: `Error parsing FIREBASE_SERVICE_ACCOUNT`

**Solution**:
1. Ensure JSON is single-line (no line breaks)
2. Test locally first:
   ```bash
   export FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'
   npm start
   ```

### Database Connection Error
**Issue**: `Connection refused`

**Solution**:
1. Check `DB_SSL=true` is set
2. Verify credentials
3. For Vercel Postgres, ensure database is in same region

### Build Error
**Issue**: `Module not found`

**Solution**:
1. Run `npm install` locally
2. Ensure all deps in `package.json`
3. Clear Vercel cache and redeploy

## 📚 Documentation

- **Full Guide**: `VERCEL_DEPLOYMENT.md`
- **Quick Start**: `VERCEL_QUICK_DEPLOY.md`
- **Checklist**: `DEPLOYMENT_CHECKLIST.md`

## 🎯 Success Criteria

✅ Firebase configured via environment variable  
✅ Vercel Postgres support added  
✅ Routes optimized for Vercel  
✅ Documentation complete  
✅ Ready for deployment  

---

**Status**: Ready for Deployment ✅  
**Estimated Deployment Time**: 15-20 minutes  
**Next Step**: Follow `VERCEL_QUICK_DEPLOY.md`
