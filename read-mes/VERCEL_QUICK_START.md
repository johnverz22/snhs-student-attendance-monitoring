# Vercel Deployment - Quick Start

## 🚀 Fast Deployment (3 Steps)

### Step 1: Install & Login
```bash
npm install -g vercel
vercel login
```

### Step 2: Set Firebase Credentials
```bash
# Copy your firebase-service-account.json content
cat firebase-service-account.json | pbcopy  # macOS
# or
cat firebase-service-account.json  # Copy manually

# Then set it as environment variable in Vercel dashboard:
# https://vercel.com/dashboard → Your Project → Settings → Environment Variables
# Name: FIREBASE_SERVICE_ACCOUNT
# Value: Paste the JSON content
```

### Step 3: Deploy
```bash
# Option A: Use the deployment script
./deploy-to-vercel.sh

# Option B: Manual deployment
vercel --prod
```

## 📋 Required Environment Variables

Set these in Vercel Dashboard (Settings → Environment Variables):

| Variable | Example | Required |
|----------|---------|----------|
| `FIREBASE_SERVICE_ACCOUNT` | `{entire JSON content}` | Yes |
| `JWT_SECRET` | `your-secret-key-here` | Yes |
| `SCHOOL_NAME` | `Sto. Rosario National High School` | Yes |
| `SCHOOL_LATITUDE` | `14.5995` | Yes |
| `SCHOOL_LONGITUDE` | `120.9842` | Yes |
| `SCHOOL_RADIUS_METERS` | `100` | Yes |

## 🔧 After Deployment

1. **Get your deployment URL** (e.g., `https://your-app.vercel.app`)

2. **Update Flutter apps:**

```dart
// parent_app/lib/config/api_config.dart
static const String baseUrl = 'https://your-app.vercel.app/api';

// student_app/lib/config/api_config.dart  
static const String baseUrl = 'https://your-app.vercel.app/api';
```

3. **Test the deployment:**
```bash
# Health check
curl https://your-app.vercel.app/health

# Test login
curl https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@school.com","password":"admin123"}'
```

## ⚠️ Important Notes

### Database Limitation
SQLite doesn't work on Vercel serverless functions. You have 3 options:

1. **Turso (Recommended)** - SQLite-compatible, serverless
   ```bash
   npm install @libsql/client
   ```

2. **Vercel Postgres** - Native Vercel integration
   ```bash
   npm install @vercel/postgres
   ```

3. **PlanetScale** - MySQL-compatible
   ```bash
   npm install @planetscale/database
   ```

### Firebase Setup
- The code now supports both file-based (local) and environment variable (Vercel) Firebase credentials
- No code changes needed - it automatically detects the environment

## 🐛 Troubleshooting

### Firebase not working?
```bash
# Check logs
vercel logs --follow

# Verify environment variable is set
vercel env ls
```

### Deployment failed?
```bash
# Check build logs
vercel logs [deployment-url]

# Redeploy
vercel --prod --force
```

### Need to update environment variables?
```bash
# Remove old variable
vercel env rm FIREBASE_SERVICE_ACCOUNT production

# Add new one
vercel env add FIREBASE_SERVICE_ACCOUNT production
```

## 📚 Full Documentation

For detailed instructions, see: `VERCEL_DEPLOYMENT_GUIDE.md`

## 🆘 Quick Commands

```bash
# View logs
vercel logs --follow

# List deployments
vercel ls

# Remove deployment
vercel rm [deployment-name]

# Open dashboard
vercel dashboard

# Check who's logged in
vercel whoami
```

## 💰 Pricing

- **Free Plan**: 100GB bandwidth, 10s timeout - Good for testing
- **Pro Plan**: $20/mo, 1TB bandwidth, 60s timeout - Recommended for production

---

**Need Help?** Check the full guide: `VERCEL_DEPLOYMENT_GUIDE.md`
