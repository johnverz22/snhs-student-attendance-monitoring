# App Icon Locations - Quick Reference

## ✅ App Names Changed
- **Student App**: Now shows as "SNHS Attendance - Student" on launcher
- **Parent App**: Now shows as "SNHS Attendance - Parent" on launcher

## 📍 Exact Icon File Locations

### Student App Icons
Replace these 5 files with your student app icon:

```
student_app/android/app/src/main/res/mipmap-mdpi/ic_launcher.png      (48x48 px)
student_app/android/app/src/main/res/mipmap-hdpi/ic_launcher.png      (72x72 px)
student_app/android/app/src/main/res/mipmap-xhdpi/ic_launcher.png     (96x96 px)
student_app/android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png    (144x144 px)
student_app/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png   (192x192 px)
```

### Parent App Icons
Replace these 5 files with your parent app icon:

```
parent_app/android/app/src/main/res/mipmap-mdpi/ic_launcher.png       (48x48 px)
parent_app/android/app/src/main/res/mipmap-hdpi/ic_launcher.png       (72x72 px)
parent_app/android/app/src/main/res/mipmap-xhdpi/ic_launcher.png      (96x96 px)
parent_app/android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png     (144x144 px)
parent_app/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png    (192x192 px)
```

## 🎯 Quick Steps

1. **Create or download your icons** (use https://icon.kitchen/)
2. **Replace the files** above with your new icons
3. **Rebuild APKs**:
   ```bash
   cd student_app && flutter build apk --release
   cd parent_app && flutter build apk --release
   ```
4. **Install on device** - New icons will appear!

## 💡 Icon Design Suggestions

### Student App (Blue/Green theme):
- 🎓 Graduation cap icon
- 📚 Book with student
- 👤 Student silhouette
- Use blue or green colors

### Parent App (Purple/Orange theme):
- 👨‍👩‍👧 Family icon
- 👁️ Eye (monitoring)
- 🔔 Bell icon
- Use purple or orange colors

## ⚡ Fastest Method

1. Go to: **https://icon.kitchen/**
2. Upload a 1024x1024 icon design
3. Click "Download" → Select "Android"
4. Extract the zip file
5. Copy the mipmap folders to your app
6. Rebuild!

---

**Status**: App names updated ✅ | Icons ready to replace ⏳
