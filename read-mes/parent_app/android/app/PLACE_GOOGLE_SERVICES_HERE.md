# Google Services Configuration

## Required File

Place your `google-services.json` file in this directory.

**Location:** `parent_app/android/app/google-services.json`

## How to Get This File

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (or create a new one)
3. Click the Android icon to add an Android app
4. Enter package name: `com.schoolattendance.parent_app`
5. Download the `google-services.json` file
6. Place it in this directory

## Important

- This file contains your Firebase configuration
- It should NOT be committed to version control
- It's already added to `.gitignore`
- Each developer needs their own copy from Firebase Console

## Verification

After placing the file, verify it contains:
- `project_info` section with your project ID
- `client` section with package name `com.schoolattendance.parent_app`
- `api_key` section

## Troubleshooting

If you get build errors:
1. Verify the file is named exactly `google-services.json`
2. Verify it's in the correct directory: `parent_app/android/app/`
3. Run `flutter clean` and rebuild
4. Check that package name matches in the file

For more details, see `FIREBASE_SETUP_GUIDE.md` in the project root.
