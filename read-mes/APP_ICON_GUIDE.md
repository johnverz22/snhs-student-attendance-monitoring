# App Icon Setup Guide

## ✅ App Names Updated
- **Student App**: "SNHS Attendance - Student"
- **Parent App**: "SNHS Attendance - Parent"

## 📱 App Icon Locations

### Android Icon Folders

Both apps use the same folder structure for icons:

#### Student App Icons:
```
student_app/android/app/src/main/res/
├── mipmap-hdpi/
│   └── ic_launcher.png       (72x72 px)
├── mipmap-mdpi/
│   └── ic_launcher.png       (48x48 px)
├── mipmap-xhdpi/
│   └── ic_launcher.png       (96x96 px)
├── mipmap-xxhdpi/
│   └── ic_launcher.png       (144x144 px)
└── mipmap-xxxhdpi/
    └── ic_launcher.png       (192x192 px)
```

#### Parent App Icons:
```
parent_app/android/app/src/main/res/
├── mipmap-hdpi/
│   └── ic_launcher.png       (72x72 px)
├── mipmap-mdpi/
│   └── ic_launcher.png       (48x48 px)
├── mipmap-xhdpi/
│   └── ic_launcher.png       (96x96 px)
├── mipmap-xxhdpi/
│   └── ic_launcher.png       (144x144 px)
└── mipmap-xxxhdpi/
    └── ic_launcher.png       (192x192 px)
```

## 🎨 Creating App Icons

### Option 1: Use Online Icon Generator (Easiest)

1. **Create your icon design** (1024x1024 px recommended)
   - Use Canva, Figma, or any design tool
   - Make it simple and recognizable
   - Use school colors/logo

2. **Generate all sizes automatically**:
   - Go to: https://icon.kitchen/
   - Or: https://appicon.co/
   - Or: https://easyappicon.com/
   
3. **Upload your 1024x1024 icon**

4. **Download Android icons**

5. **Replace the files** in the mipmap folders

### Option 2: Manual Creation

If you have a design tool (Photoshop, GIMP, etc.):

1. Create 5 versions of your icon:
   - **mdpi**: 48x48 px
   - **hdpi**: 72x72 px
   - **xhdpi**: 96x96 px
   - **xxhdpi**: 144x144 px
   - **xxxhdpi**: 192x192 px

2. Save as PNG with transparency

3. Name all files `ic_launcher.png`

4. Place in respective folders

### Option 3: Use Flutter Package (Automated)

1. **Install flutter_launcher_icons package**:

Add to `pubspec.yaml`:
```yaml
dev_dependencies:
  flutter_launcher_icons: ^0.13.1

flutter_launcher_icons:
  android: true
  ios: false
  image_path: "assets/icon/app_icon.png"
```

2. **Place your 1024x1024 icon** at:
   - `student_app/assets/icon/app_icon.png`
   - `parent_app/assets/icon/app_icon.png`

3. **Run the generator**:
```bash
# For student app
cd student_app
flutter pub get
flutter pub run flutter_launcher_icons

# For parent app
cd parent_app
flutter pub get
flutter pub run flutter_launcher_icons
```

## 🎯 Icon Design Recommendations

### Student App Icon Ideas:
- 📚 Book with student cap
- 🎓 Graduation cap
- 👤 Student silhouette
- 📱 Phone with checkmark
- 🏫 School building
- Color: Blue/Green tones

### Parent App Icon Ideas:
- 👨‍👩‍👧 Family icon
- 👁️ Eye (monitoring)
- 🔔 Bell (notifications)
- 📊 Chart/graph
- 🏠 House with checkmark
- Color: Purple/Orange tones

### Design Tips:
- ✅ Keep it simple and recognizable
- ✅ Use high contrast colors
- ✅ Avoid small details (they disappear at small sizes)
- ✅ Test at different sizes
- ✅ Use school colors if possible
- ✅ Make student and parent icons visually distinct
- ❌ Don't use text (hard to read at small sizes)
- ❌ Don't use photos (use illustrations/icons)

## 📂 Quick File Replacement

### For Student App:
```bash
# Navigate to icon folders
cd student_app/android/app/src/main/res/

# Replace icons (example with your files)
cp ~/Downloads/student-icon-48.png mipmap-mdpi/ic_launcher.png
cp ~/Downloads/student-icon-72.png mipmap-hdpi/ic_launcher.png
cp ~/Downloads/student-icon-96.png mipmap-xhdpi/ic_launcher.png
cp ~/Downloads/student-icon-144.png mipmap-xxhdpi/ic_launcher.png
cp ~/Downloads/student-icon-192.png mipmap-xxxhdpi/ic_launcher.png
```

### For Parent App:
```bash
# Navigate to icon folders
cd parent_app/android/app/src/main/res/

# Replace icons (example with your files)
cp ~/Downloads/parent-icon-48.png mipmap-mdpi/ic_launcher.png
cp ~/Downloads/parent-icon-72.png mipmap-hdpi/ic_launcher.png
cp ~/Downloads/parent-icon-96.png mipmap-xhdpi/ic_launcher.png
cp ~/Downloads/parent-icon-144.png mipmap-xxhdpi/ic_launcher.png
cp ~/Downloads/parent-icon-192.png mipmap-xxxhdpi/ic_launcher.png
```

## 🔄 After Changing Icons

1. **Clean the build**:
```bash
flutter clean
```

2. **Rebuild the app**:
```bash
flutter build apk --release
```

3. **Uninstall old app from device** (if already installed)

4. **Install new APK**

The new icon will appear on your launcher!

## 📱 Testing Icons

### On Device:
1. Install the APK
2. Check home screen launcher
3. Check app drawer
4. Check recent apps screen
5. Verify icon looks good at all sizes

### Before Building:
You can preview icons using Android Studio:
1. Open `android` folder in Android Studio
2. Navigate to `res/mipmap-*` folders
3. View icons in preview pane

## 🎨 Free Icon Resources

### Icon Design Tools:
- **Canva**: https://canva.com (easy, templates available)
- **Figma**: https://figma.com (professional)
- **GIMP**: https://gimp.org (free Photoshop alternative)

### Icon Generators:
- **Icon Kitchen**: https://icon.kitchen/ (best for Android)
- **App Icon Generator**: https://appicon.co/
- **Easy App Icon**: https://easyappicon.com/

### Free Icons/Graphics:
- **Flaticon**: https://flaticon.com
- **Icons8**: https://icons8.com
- **Font Awesome**: https://fontawesome.com
- **Material Icons**: https://fonts.google.com/icons

## 📋 Checklist

- [ ] Design or download icon (1024x1024 px)
- [ ] Generate all required sizes
- [ ] Replace icons in student app mipmap folders
- [ ] Replace icons in parent app mipmap folders
- [ ] Clean build: `flutter clean`
- [ ] Rebuild APKs: `flutter build apk --release`
- [ ] Test on device
- [ ] Verify icons look good at all sizes
- [ ] Check both apps have distinct icons

## 💡 Pro Tips

1. **Use different colors** for student and parent apps so users can easily distinguish them

2. **Add a small badge** or indicator:
   - Student app: Small "S" badge
   - Parent app: Small "P" badge

3. **Test on dark mode** - Make sure icon looks good on both light and dark backgrounds

4. **Keep it consistent** with your school branding

5. **Adaptive icons** (optional): Create separate foreground and background layers for Android 8+

## 🚀 Quick Start

**Fastest way to get started:**

1. Go to https://icon.kitchen/
2. Upload a 1024x1024 icon design
3. Download Android icons
4. Extract and copy to mipmap folders
5. Rebuild APK
6. Done!

---

**Current Status:**
✅ App names updated
⏳ Icons ready to be replaced (currently using default Flutter icon)

Replace the icons following this guide, then rebuild the APKs!
