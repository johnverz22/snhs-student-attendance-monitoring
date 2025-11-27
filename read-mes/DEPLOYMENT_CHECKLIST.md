# ✅ Vercel Deployment Checklist

## Pre-Deployment

- [ ] Code is working locally
- [ ] All tests pass (`./test-all-endpoints.sh`)
- [ ] PostgreSQL database ready (Vercel Postgres or external)
- [ ] Firebase project created (for push notifications)
- [ ] GitHub repository created

## Firebase Setup

- [ ] Download Firebase service account JSON
- [ ] Convert JSON to single-line string:
  ```bash
  node -e "console.log(JSON.stringify(require('./firebase-service-account.json')))"
  ```
- [ ] Copy the output for Vercel environment variables

## GitHub Setup

- [ ] Initialize git repository
  ```bash
  git init
  git add .
  git commit -m "Initial commit"
  ```
- [ ] Create GitHub repository
- [ ] Push code to GitHub
  ```bash
  git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
  git push -u origin main
  ```

## Vercel Configuration

### Import Project
- [ ] Go to https://vercel.com/new
- [ ] Click "Import Git Repository"
- [ ] Select your GitHub repository
- [ ] Click "Import"

### Environment Variables

Add these in Vercel Settings > Environment Variables:

#### Required Variables
- [ ] `NODE_ENV` = `production`
- [ ] `JWT_SECRET` = (generate with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`)
- [ ] `FIREBASE_SERVICE_ACCOUNT` = (your single-line JSON)

#### Database Variables (if not using Vercel Postgres)
- [ ] `DB_HOST` = your PostgreSQL host
- [ ] `DB_PORT` = `5432`
- [ ] `DB_NAME` = `school_attendance`
- [ ] `DB_USER` = your database user
- [ ] `DB_PASSWORD` = your database password
- [ ] `DB_SSL` = `true`

#### Optional Variables
- [ ] `SCHOOL_NAME` = your school name
- [ ] `SCHOOL_LATITUDE` = your school latitude
- [ ] `SCHOOL_LONGITUDE` = your school longitude
- [ ] `SCHOOL_RADIUS_METERS` = `100`

### Deploy
- [ ] Click "Deploy"
- [ ] Wait for deployment to complete
- [ ] Note your deployment URL (e.g., `your-app.vercel.app`)

## Post-Deployment

### Initialize Database
- [ ] Connect to PostgreSQL database
- [ ] Run schema initialization:
  ```bash
  psql "YOUR_POSTGRES_URL" < init-db.sql
  ```

### Create Admin Account
- [ ] Create first admin user:
  ```bash
  curl -X POST https://your-app.vercel.app/api/auth/admin/register \
    -H "Content-Type: application/json" \
    -d '{
      "username": "admin",
      "email": "admin@school.com",
      "password": "YourSecurePassword123"
    }'
  ```

### Test Deployment
- [ ] Test health endpoint:
  ```bash
  curl https://your-app.vercel.app/health
  ```
- [ ] Test admin login:
  ```bash
  curl -X POST https://your-app.vercel.app/api/auth/admin/login \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"YourSecurePassword123"}'
  ```
- [ ] Visit admin interface: `https://your-app.vercel.app/admin`
- [ ] Login and verify dashboard loads

## Mobile App Configuration

### Update API URLs

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

### Test Mobile Apps
- [ ] Update API URLs in both apps
- [ ] Test student login
- [ ] Test parent login
- [ ] Test attendance logging
- [ ] Test push notifications

## Security Review

- [ ] Changed default admin password
- [ ] JWT secret is strong (64+ characters)
- [ ] Database SSL enabled
- [ ] Firebase credentials secured in environment variable
- [ ] No sensitive data in git repository
- [ ] `.env` file in `.gitignore`
- [ ] `firebase-service-account.json` in `.gitignore`

## Monitoring Setup

- [ ] Set up Vercel monitoring
- [ ] Configure error alerts
- [ ] Set up database monitoring
- [ ] Test error logging

## Documentation

- [ ] Update README with production URL
- [ ] Document environment variables
- [ ] Share admin credentials with team (securely)
- [ ] Document deployment process

## Optional Enhancements

- [ ] Configure custom domain
- [ ] Set up staging environment
- [ ] Configure preview deployments
- [ ] Set up automated backups
- [ ] Add monitoring/analytics
- [ ] Configure CDN for static assets

## Troubleshooting

If deployment fails, check:
- [ ] All environment variables are set correctly
- [ ] Database connection is working
- [ ] Firebase JSON is valid single-line string
- [ ] No syntax errors in code
- [ ] Dependencies are in package.json
- [ ] Vercel logs for error messages

## Success Criteria

✅ Deployment successful  
✅ Health endpoint returns 200  
✅ Admin login works  
✅ Admin dashboard loads  
✅ API endpoints respond correctly  
✅ Mobile apps can connect  
✅ Database queries work  
✅ Push notifications configured  

---

## Quick Commands Reference

### Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Convert Firebase JSON
```bash
node -e "console.log(JSON.stringify(require('./firebase-service-account.json')))"
```

### Initialize Database
```bash
psql "YOUR_POSTGRES_URL" < init-db.sql
```

### Test Deployment
```bash
curl https://your-app.vercel.app/health
```

### View Logs
```bash
vercel logs YOUR_PROJECT_URL
```

---

**Estimated Time**: 15-20 minutes  
**Difficulty**: Intermediate  
**Prerequisites**: GitHub account, Vercel account, PostgreSQL database
