# Test Students Endpoint

## The Problem
The `/api/admin/students` route exists in the code but the server hasn't picked up the changes yet.

## Solution: Restart the Server

### Step 1: Stop the Server
```bash
# Find the process
ps aux | grep "node.*index.js" | grep -v grep

# Kill it (the PID is shown in the output, e.g., 6779)
kill 6779
```

Or simply press `Ctrl+C` in the terminal where the server is running.

### Step 2: Start the Server
```bash
npm start
```

### Step 3: Verify the Route is Loaded
After restart, you should see in the console that the server started successfully.

### Step 4: Test the Endpoint

**Option A: Using the Browser**
1. Login at: http://localhost:3000/admin/login.html
2. Navigate to: http://localhost:3000/admin/students.html
3. The table should now load with student data

**Option B: Using curl**
```bash
# First, login to get a token
curl -X POST http://localhost:3000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | jq -r '.data.accessToken'

# Copy the token from the output, then test the students endpoint
curl "http://localhost:3000/api/admin/students?page=1&limit=20&archived=false" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  | jq
```

## Why This Happens

Node.js caches required modules. When you modify a route file, the changes don't take effect until the server process is restarted. This is normal behavior.

## Quick Restart Script

```bash
# One-liner to restart
pkill -f "node.*index.js" && npm start
```

## Verification Checklist

After restart, verify:
- [ ] Server starts without errors
- [ ] Database migration runs (if first time)
- [ ] No "Route not found" errors in console
- [ ] Admin login works
- [ ] Students page loads
- [ ] Students table populates with data

## If Still Not Working

1. **Check server logs** for any errors during startup
2. **Verify the route exists** in src/routes/admin.js (line ~704)
3. **Check if routes are mounted** in src/index.js (should have `app.use('/api/admin', require('./routes/admin'))`)
4. **Clear browser cache** and try again
5. **Check browser console** for any JavaScript errors

## Expected Behavior After Restart

✅ Server starts successfully
✅ Routes are registered
✅ `/api/admin/students` endpoint responds
✅ Student management page works
✅ All CRUD operations function correctly
