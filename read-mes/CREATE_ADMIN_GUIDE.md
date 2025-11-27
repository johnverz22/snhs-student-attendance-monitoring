# Create Admin User for Vercel

## Quick Start

### Option 1: Using Default Credentials
```bash
node create-admin-vercel.js
```

This creates:
- **Username:** `admin`
- **Email:** `admin@school.com`
- **Password:** `Admin123!`

### Option 2: Custom Credentials
```bash
node create-admin-vercel.js myusername admin@example.com MySecurePass123
```

## Prerequisites

Your `.env` file must have the Vercel Postgres credentials:

```env
POSTGRES_HOST=your-postgres-host
POSTGRES_DATABASE=your-database-name
POSTGRES_USER=your-username
POSTGRES_PASSWORD=your-password
DB_SSL=true
```

## After Creating Admin

1. **Login to your app:**
   - URL: https://snhs-student-attendance-monitoring-glw2kktxl.vercel.app/admin
   - Use the username and password shown in the script output

2. **Change the password immediately** (recommended for security)

3. **Test the admin panel:**
   - View students
   - View attendance logs
   - Manage QR codes
   - View reports

## Troubleshooting

### Error: "Admin account already exists"
**Solution:** Use different credentials or delete the existing admin from the database

### Error: "Connection failed"
**Solution:** 
1. Check your `.env` file has correct Vercel Postgres credentials
2. Get credentials from Vercel Dashboard → Your Project → Storage → Postgres
3. Ensure `DB_SSL=true` for Vercel Postgres

### Error: "Table admins does not exist"
**Solution:** The database schema needs to be initialized. The app should do this automatically on first request, or you can run migrations manually.

## Security Notes

- Never commit the default password to production
- Always change default passwords after first login
- Use strong passwords (min 8 chars, mix of letters, numbers, symbols)
- Keep your database credentials secure
