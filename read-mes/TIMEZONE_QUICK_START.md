# Quick Start - Timezone Fix for Manila/Philippines

## What Was Fixed

Your attendance system was storing times in UTC instead of Manila time (UTC+8), causing all timestamps to be 8 hours behind.

## Quick Fix (3 Steps)

### 1. Set Timezone in Admin Panel

```
1. Open: http://localhost:3000/admin
2. Go to: Settings
3. Select: "UTC+8" or "Asia/Manila" 
4. Click: Save Changes
```

### 2. Fix Existing Data (Run Once)

```bash
npm run fix-timezone
```

This adds 8 hours to all existing attendance logs.

**⚠️ Only run this ONCE!**

### 3. Restart Server

```bash
npm start
```

## Verify It Works

```bash
npm run test-timezone
```

Should show:
- Timezone: UTC+8
- Current local time in Manila timezone
- Sample attendance log with correct time

## Done! 

New attendance logs will automatically use Manila time (UTC+8).

---

**Need help?** See detailed guide: `read-mes/TIMEZONE_FIX_GUIDE.md`
