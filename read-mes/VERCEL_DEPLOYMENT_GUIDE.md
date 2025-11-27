# Vercel Deployment Guide for School Attendance System

This guide will walk you through deploying your Node.js attendance system to Vercel with Firebase credentials.

## Prerequisites

- Vercel account (sign up at https://vercel.com)
- Vercel CLI installed: `npm install -g vercel`
- Firebase service account JSON file
- Your project pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Step 1: Prepare Your Project

### 1.1 Install Vercel CLI
```bash
npm install -g vercel
```

### 1.2 Login to Vercel
```bash
vercel login
```

## Step 2: Configure Environment Variables

You'll need to set up environment variables in Vercel. Here's what you need:

### Required Environment Variables:

1. **JWT_SECRET** - Your JWT secret key
2. **FIREBASE_SERVICE_ACCOUNT** - Your Firebase service account JSON (as a string)
3. **SCHOOL_NAME** - Your school name
4. **SCHOOL_LATITUDE** - School GPS latitude
5. **SCHOOL_LONGITUDE** - School GPS longitude
6. **SCHOOL_RADIUS_METERS** - Geofence radius in meters

### Optional Environment Variables:

- **PORT** - (Vercel sets this automatically)
- **NODE_ENV** - (Set to "production" automatically)
- **JWT_EXPIRES_IN** - Token expiration (default: 24h)
- **BCRYPT_ROUNDS** - Password hashing rounds (default: 10)

## Step 3: Handle Firebase Credentials

Since Vercel doesn't support file uploads directly, you need to convert your Firebase service account JSON to an environment variable.

### Option 1: Using Vercel Dashboard (Recommended)

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name**: `FIREBASE_SERVICE_ACCOUNT`
   - **Value**: Copy the entire contents of your `firebase-service-account.json` file
   - **Environment**: Select Production, Preview, and Development

### Option 2: Using Vercel CLI

```bash
# Read your Firebase service account and set it as an environment variable
vercel env add FIREBASE_SERVICE_ACCOUNT production < firebase-service-account.json
```

## Step 4: Update Firebase Initialization Code

The current code reads from a file path. We need to update it to support both file-based (local) and environment variable (Vercel) configurations.

Update `src/services/notificationService.js`:

```javascript
initializeFirebase() {
  try {
    if (!this.initialized) {
      let serviceAccount;
      
      // Check if Firebase credentials are in environment variable (Vercel)
      if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        try {
          serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
          console.log('Using Firebase credentials from environment variable');
        } catch (parseError) {
          console.error('Error parsing FIREBASE_SERVICE_ACCOUNT:', parseError);
          return;
        }
      } 
      // Otherwise, try to load from file (local development)
      else if (config.firebase && config.firebase.serviceAccountPath) {
        const path = require('path');
        const serviceAccountPath = path.resolve(process.cwd(), config.firebase.serviceAccountPath);
        serviceAccount = require(serviceAccountPath);
        console.log('Using Firebase credentials from file');
      } else {
        console.warn('Firebase service account not configured, push notifications will be disabled');
        return;
      }
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      
      this.initialized = true;
      console.log(`[${new Date().toISOString()}] Firebase Admin SDK initialized successfully`);
    }
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
  }
}
```

## Step 5: Handle Database for Vercel

⚠️ **Important**: Vercel's serverless functions are stateless and don't support SQLite file-based databases in production.

### Solutions:

#### Option A: Use Vercel Postgres (Recommended for Production)
```bash
# Install Vercel Postgres
npm install @vercel/postgres
```

Then migrate your SQLite database to Postgres.

#### Option B: Use Turso (SQLite-compatible, serverless)
```bash
# Install Turso client
npm install @libsql/client
```

Turso provides a serverless SQLite database that works with Vercel.

#### Option C: Use PlanetScale (MySQL-compatible)
```bash
npm install @planetscale/database
```

#### Option D: Keep SQLite for Testing (Not recommended for production)
For testing purposes only, you can use an in-memory SQLite database, but data will be lost between deployments.

## Step 6: Deploy to Vercel

### Method 1: Deploy via Git (Recommended)

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to https://vercel.com/new
3. Import your repository
4. Configure environment variables in the dashboard
5. Click **Deploy**

### Method 2: Deploy via CLI

```bash
# From your project root
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

## Step 7: Set Environment Variables via CLI

```bash
# Set JWT secret
vercel env add JWT_SECRET production
# Enter your secret when prompted

# Set school configuration
vercel env add SCHOOL_NAME production
vercel env add SCHOOL_LATITUDE production
vercel env add SCHOOL_LONGITUDE production
vercel env add SCHOOL_RADIUS_METERS production

# Set Firebase credentials (paste entire JSON)
vercel env add FIREBASE_SERVICE_ACCOUNT production
```

## Step 8: Update Flutter App Configuration

After deployment, update your Flutter app's API configuration:

```dart
// parent_app/lib/config/api_config.dart
class ApiConfig {
  // Replace with your Vercel deployment URL
  static const String baseUrl = 'https://your-project.vercel.app/api';
  
  // ... rest of your config
}
```

## Step 9: Test Your Deployment

```bash
# Test health endpoint
curl https://your-project.vercel.app/health

# Test API endpoint
curl https://your-project.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

## Troubleshooting

### Issue: Firebase not initializing
- Check that `FIREBASE_SERVICE_ACCOUNT` is properly set
- Verify the JSON is valid (use a JSON validator)
- Check Vercel function logs: `vercel logs`

### Issue: Database errors
- SQLite doesn't work on Vercel serverless functions
- Migrate to a serverless database (Turso, Vercel Postgres, PlanetScale)

### Issue: Function timeout
- Vercel has a 10-second timeout for Hobby plan, 60 seconds for Pro
- Optimize slow database queries
- Consider upgrading your plan

### Issue: Environment variables not loading
- Redeploy after adding environment variables
- Check variable names match exactly
- Verify variables are set for the correct environment (production/preview/development)

## Viewing Logs

```bash
# View real-time logs
vercel logs --follow

# View logs for a specific deployment
vercel logs [deployment-url]
```

## Continuous Deployment

Once connected to Git, Vercel will automatically:
- Deploy on every push to main/master branch (production)
- Create preview deployments for pull requests
- Run builds and tests

## Security Checklist

- ✅ Never commit `firebase-service-account.json` to Git
- ✅ Use environment variables for all secrets
- ✅ Enable CORS only for your Flutter app domains
- ✅ Set up rate limiting (already configured)
- ✅ Use HTTPS only (Vercel provides this automatically)
- ✅ Regularly rotate JWT secrets

## Cost Considerations

**Vercel Free (Hobby) Plan:**
- 100 GB bandwidth per month
- Unlimited deployments
- 10-second function timeout
- Good for testing and small projects

**Vercel Pro Plan ($20/month):**
- 1 TB bandwidth
- 60-second function timeout
- Better for production use

## Next Steps

1. Set up a custom domain in Vercel dashboard
2. Configure SSL certificate (automatic with Vercel)
3. Set up monitoring and alerts
4. Implement database backup strategy
5. Set up staging environment for testing

## Support

- Vercel Documentation: https://vercel.com/docs
- Vercel Discord: https://vercel.com/discord
- Firebase Admin SDK: https://firebase.google.com/docs/admin/setup

---

**Note**: This deployment uses serverless functions. Each API request spins up a new function instance. For high-traffic applications, consider using Vercel's Edge Functions or a traditional VPS/container deployment.
