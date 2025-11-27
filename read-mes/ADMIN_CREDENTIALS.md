# Admin Login Credentials

## ⚠️ IMPORTANT: Disable Vercel Protection First!

Your Vercel deployment has **Deployment Protection** enabled. You need to disable it before accessing your app.

### Quick Fix:
1. Go to: https://vercel.com/dashboard
2. Open your project: `snhs-student-attendance-monitoring-glw2kktxl`
3. Go to **Settings** → **Deployment Protection**
4. Select **"Standard Protection"** or **"Off"**
5. Click **Save**

**See `VERCEL_PROTECTION_DISABLE.md` for detailed instructions.**

---

## 🎉 Your Admin Account is Ready!

An admin account already exists in your database.

### Login Information

**Login URL:** https://snhs-student-attendance-monitoring-glw2kktxl.vercel.app/admin

**Default Credentials:**
- **Username:** `admin`
- **Email:** `admin@school.com`
- **Password:** `Admin123` (or check your previous setup)

### If You Don't Know the Password

You have two options:

#### Option 1: Create a New Admin User
```bash
node create-admin-vercel.js superadmin superadmin@school.com MyNewPassword123
```

#### Option 2: Reset the Existing Admin Password

Create a password reset script:
```bash
node reset-admin-password.js admin NewPassword123
```

## Testing Your Admin Access

1. **Open the admin panel:**
   ```
   https://snhs-student-attendance-monitoring-glw2kktxl.vercel.app/admin
   ```

2. **Login with credentials above**

3. **You should see:**
   - Dashboard with statistics
   - Student management
   - Attendance logs
   - QR code management
   - Reports

## Quick Test Commands

Test if the API is working:

```bash
# Test health endpoint
curl https://snhs-student-attendance-monitoring-glw2kktxl.vercel.app/health

# Test admin login
curl -X POST https://snhs-student-attendance-monitoring-glw2kktxl.vercel.app/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin123"}'
```

## Security Reminder

⚠️ **IMPORTANT:** If you're using the default password `Admin123`, change it immediately after first login!

## Need Help?

- Check `CREATE_ADMIN_GUIDE.md` for detailed instructions
- Check `VERCEL_FIX.md` for deployment troubleshooting
- Check Vercel logs if you encounter errors
