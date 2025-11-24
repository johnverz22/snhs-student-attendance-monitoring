# Server Restart Instructions

## Issue
The new `/api/admin/students` endpoint was added but the server needs to be restarted to load the new routes.

## Solution

### 1. Stop the Server
If the server is running, stop it:
- Press `Ctrl+C` in the terminal where the server is running
- Or find and kill the process:
  ```bash
  # Find the process
  lsof -i :3000
  
  # Kill it (replace PID with actual process ID)
  kill -9 PID
  ```

### 2. Start the Server
```bash
npm start
```

Or if using nodemon:
```bash
npm run dev
```

### 3. Verify the Server Started
You should see:
```
Database initialized successfully
Server running on port 3000
```

### 4. Check the Migration
The database migration should run automatically:
```
Running migrations from version 1 to 2...
Applying migration 2...
Added section and is_archived fields to students table
Migrations completed successfully
```

### 5. Test the Endpoint
Open your browser and navigate to:
```
http://localhost:3000/admin/students.html
```

Or test with curl:
```bash
# First login to get token
curl -X POST http://localhost:3000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Then test the students endpoint (replace TOKEN with actual token)
curl http://localhost:3000/api/admin/students?page=1&limit=20&archived=false \
  -H "Authorization: Bearer TOKEN"
```

## Troubleshooting

### If migration doesn't run:
```bash
# Manually run the database initialization
node src/scripts/initDatabase.js
```

### If port 3000 is in use:
```bash
# Find what's using port 3000
lsof -i :3000

# Kill it
kill -9 PID
```

### If you see "Route not found":
1. Make sure you restarted the server
2. Check that `src/routes/admin.js` has the route at line 704
3. Verify `src/index.js` mounts the admin routes: `app.use('/api/admin', require('./routes/admin'))`

### Check server logs:
The server should log all registered routes on startup. Look for:
```
GET /api/admin/students
```

## Quick Restart Command
```bash
# Stop any running server and start fresh
pkill -f "node.*index.js" && npm start
```

## After Restart

The student management page should now work:
1. Login at: http://localhost:3000/admin/login.html
2. Navigate to: http://localhost:3000/admin/students.html
3. You should see the students table populate with data
4. Filters, search, and pagination should work
5. Edit, archive, and unarchive buttons should function

## Note
All the code changes have been made. The only thing needed is a server restart to load the new routes and run the database migration.
