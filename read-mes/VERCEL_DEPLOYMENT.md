# 🚀 Vercel Deployment Guide

Complete guide to deploy your School Attendance System to Vercel with PostgreSQL and Firebase.

## 📋 Prerequisites

1. **GitHub Account** - Your code must be in a GitHub repository
2. **Vercel Account** - Sign up at https://vercel.com
3. **PostgreSQL Database** - Use Vercel Postgres or external provider
4. **Firebase Project** - For push notifications (optional)

## 🗄️ Step 1: Set Up PostgreSQL Database

### Option A: Vercel Postgres (Recommended)

1. Go to your Vercel dashboard
2. Click on **Storage** tab
3. Click **Create Database**
4. Select **Postgres**
5. Choose a name (e.g., `school-attendance-db`)
6. Select a region close to your users
7. Click **Create**

Vercel will automatically provide these environment variables:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

### Option B: External PostgreSQL (DigitalOcean, AWS RDS, etc.)

Get your connection details:
- Host
- Port
- Database name
- Username
- Password

## 🔥 Step 2: Prepare Firebase Credentials

### Get Your Firebase Service Account JSON

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **Project Settings** (gear icon)
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Download the JSON file

### Convert JSON to Single-Line String

**Option 1: Using Command Line (Mac/Linux)**
```bash
cat firebase-service-account.json | jq -c . | pbcopy
```

**Option 2: Using Node.js**
```bash
node -e "console.log(JSON.stringify(require('./firebase-service-account.json')))"
```

**Option 3: Manual**
1. Open the JSON file
2. Remove all line breaks and extra spaces
3. Make it a single line
4. Copy the entire string

Example:
```json
{"type":"service_account","project_id":"your-project","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}
```

## 🔧 Step 3: Configure Environment Variables in Vercel

### Via Vercel Dashboard

1. Go to your project in Vercel
2. Click **Settings**
3. Click **Environment Variables**
4. Add the following variables:

#### Required Variables

| Variable | Value | Environment |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Production |
| `DB_HOST` | Your PostgreSQL host | Production |
| `DB_PORT` | `5432` | Production |
| `DB_NAME` | Your database name | Production |
| `DB_USER` | Your database user | Production |
| `DB_PASSWORD` | Your database password | Production |
| `DB_SSL` | `true` | Production |
| `JWT_SECRET` | Generate a strong secret | Production |
| `FIREBASE_SERVICE_ACCOUNT` | Your single-line JSON | Production |

#### Optional Variables

| Variable | Value | Default |
|----------|-------|---------|
| `PORT` | `3000` | 3000 |
| `JWT_EXPIRES_IN` | `24h` | 24h |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | 7d |
| `SCHOOL_NAME` | Your school name | Sample School |
| `SCHOOL_LATITUDE` | Your school latitude | 14.5995 |
| `SCHOOL_LONGITUDE` | Your school longitude | 120.9842 |
| `SCHOOL_RADIUS_METERS` | Geofence radius | 100 |
| `BCRYPT_ROUNDS` | `10` | 10 |

### Generate JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 📦 Step 4: Push Code to GitHub

### Initialize Git (if not already done)

```bash
git init
git add .
git commit -m "Initial commit - School Attendance System"
```

### Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository (e.g., `school-attendance-system`)
3. **Don't** initialize with README (you already have code)

### Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/school-attendance-system.git
git branch -M main
git push -u origin main
```

## 🚀 Step 5: Deploy to Vercel

### Method 1: Via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/new
2. Click **Import Git Repository**
3. Select your GitHub repository
4. Configure project:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (leave as is)
   - **Build Command**: Leave empty (not needed for Node.js)
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`
5. Click **Deploy**

### Method 2: Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No
# - What's your project's name? school-attendance-system
# - In which directory is your code located? ./
# - Want to override settings? No

# Deploy to production
vercel --prod
```

## 🗃️ Step 6: Initialize Database Schema

After deployment, you need to create the database tables.

### Option 1: Using Vercel Postgres Dashboard

1. Go to your Vercel Postgres database
2. Click **Query** tab
3. Copy the contents of `init-db.sql`
4. Paste and execute

### Option 2: Using psql Command

```bash
# Get connection string from Vercel
# Go to Storage > Your Database > .env.local tab
# Copy POSTGRES_URL

# Connect and run schema
psql "YOUR_POSTGRES_URL" < init-db.sql
```

### Option 3: Using a Script

Create a deployment script:

```bash
# Create admin account after deployment
curl -X POST https://your-app.vercel.app/api/auth/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@school.com",
    "password": "YourSecurePassword123"
  }'
```

## ✅ Step 7: Verify Deployment

### Test Health Endpoint

```bash
curl https://your-app.vercel.app/health
```

Expected response:
```json
{"status":"ok","timestamp":"2025-11-24T..."}
```

### Test API Endpoint

```bash
curl https://your-app.vercel.app/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "YourPassword123"
  }'
```

### Test Admin Interface

Visit: `https://your-app.vercel.app/admin`

## 📱 Step 8: Update Mobile Apps

Update your Flutter apps with the production URL:

**student_app/lib/config/api_config.dart:**
```dart
class ApiConfig {
  static const String baseUrl = 'https://your-app.vercel.app/api';
}
```

**parent_app/lib/config/api_config.dart:**
```dart
class ApiConfig {
  static const String baseUrl = 'https://your-app.vercel.app/api';
}
```

## 🔄 Step 9: Set Up Continuous Deployment

Vercel automatically deploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Vercel will automatically deploy
```

### Preview Deployments

Every pull request gets a preview URL:
- Create a branch: `git checkout -b feature-name`
- Push changes: `git push origin feature-name`
- Create PR on GitHub
- Vercel creates preview deployment

## 🔐 Security Checklist

- [ ] Change default admin password
- [ ] Use strong JWT secret (64+ characters)
- [ ] Enable SSL (automatic on Vercel)
- [ ] Set `DB_SSL=true` for database
- [ ] Don't commit `.env` file
- [ ] Don't commit `firebase-service-account.json`
- [ ] Use environment variables for all secrets
- [ ] Enable rate limiting (already configured)
- [ ] Review CORS settings if needed

## 🐛 Troubleshooting

### Database Connection Errors

**Error**: `Connection refused` or `timeout`

**Solution**:
1. Check `DB_SSL=true` is set
2. Verify database credentials
3. Check if database allows connections from Vercel IPs
4. For Vercel Postgres, use `POSTGRES_URL` directly

### Firebase Initialization Errors

**Error**: `Error parsing FIREBASE_SERVICE_ACCOUNT`

**Solution**:
1. Ensure JSON is on a single line
2. Check for escaped quotes
3. Verify the JSON is valid
4. Test locally first:
   ```bash
   export FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'
   npm start
   ```

### Build Errors

**Error**: `Module not found`

**Solution**:
1. Ensure all dependencies are in `package.json`
2. Run `npm install` locally to verify
3. Check `node_modules` is in `.gitignore`
4. Clear Vercel cache and redeploy

### 404 Errors on Admin Routes

**Error**: Admin pages return 404

**Solution**:
1. Check `vercel.json` routes configuration
2. Ensure `public/admin` folder is committed
3. Verify static files are being served

## 📊 Monitoring

### View Logs

```bash
# Install Vercel CLI
npm install -g vercel

# View logs
vercel logs YOUR_PROJECT_URL
```

### Via Dashboard

1. Go to your project in Vercel
2. Click **Deployments**
3. Click on a deployment
4. Click **Functions** tab
5. View logs for each function

## 🔄 Database Migrations

When you update the schema:

1. Update `init-db.sql`
2. Create a migration script
3. Run against production database:

```bash
psql "YOUR_POSTGRES_URL" < migration.sql
```

## 💾 Backups

### Vercel Postgres

Automatic backups are included. To restore:
1. Go to Storage > Your Database
2. Click **Backups** tab
3. Select backup and restore

### Manual Backup

```bash
pg_dump "YOUR_POSTGRES_URL" > backup.sql
```

## 🎯 Production Checklist

- [ ] Database deployed and schema initialized
- [ ] All environment variables configured
- [ ] Firebase credentials added
- [ ] Admin account created
- [ ] Test all API endpoints
- [ ] Test admin interface
- [ ] Update mobile apps with production URL
- [ ] Test mobile app login and features
- [ ] Set up monitoring/alerts
- [ ] Configure custom domain (optional)
- [ ] Test push notifications
- [ ] Review security settings

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Node.js on Vercel](https://vercel.com/docs/functions/serverless-functions/runtimes/node-js)
- [Environment Variables](https://vercel.com/docs/projects/environment-variables)

## 🆘 Support

If you encounter issues:

1. Check Vercel deployment logs
2. Verify environment variables
3. Test database connection
4. Check Firebase configuration
5. Review this guide step by step

---

**Last Updated**: November 24, 2025  
**Vercel Version**: 2  
**Node.js Version**: 18.x (Vercel default)
