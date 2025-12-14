# Building Caliph Attendance Mobile App (APK)

This guide explains how to build an Android APK from the Caliph Attendance web app.

## Prerequisites

Before you can build the APK, you need to install the following on your local computer:

1. **Node.js** (v18 or higher) - https://nodejs.org/
2. **Android Studio** - https://developer.android.com/studio
3. **Java JDK 17** - Usually included with Android Studio

## Step-by-Step Instructions

### 1. Download the Project

Download the project files from Replit to your local computer.

### 2. Install Dependencies

Open a terminal in the project folder and run:

```bash
cd Caliph-Attendance
npm install
```

### 3. Configure Server URL

Before building, you need to update the app to connect to your deployed server.

Edit `client/src/pages/Login.tsx` and update the API calls to use your deployed URL:

```typescript
// Change from:
fetch("/api/teachers/count")

// To (replace with your actual deployed URL):
fetch("https://your-app.replit.app/api/teachers/count")
```

Do the same for all API calls in the app.

### 4. Build for Mobile

Run the build command:

```bash
npm run build:mobile
```

This will:
- Build the web app
- Sync the files with the Android project

### 5. Open in Android Studio

```bash
npm run android:open
```

Or manually open the `android` folder in Android Studio.

### 6. Build the APK

In Android Studio:

1. Go to **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**
2. Wait for the build to complete
3. Click "locate" to find your APK file

The APK will be in: `android/app/build/outputs/apk/debug/app-debug.apk`

### 7. Install on Your Phone

Transfer the APK to your Android phone and install it. You may need to enable "Install from unknown sources" in your phone settings.

## Teacher Accounts

The app supports up to 5 teacher accounts:
- Each teacher can register with their name, email, and password
- Once 5 teachers are registered, no more can join
- Teachers can log out from the Settings page

## Important Notes

- The mobile app connects to your deployed backend server
- Make sure your Replit app is deployed and running
- Each teacher's attendance data is stored locally on their device
- The backend stores teacher login information

## Troubleshooting

**App doesn't connect to server:**
- Make sure your Replit app is deployed (published)
- Check that the API URLs in the code point to your deployed URL

**Build fails:**
- Make sure Android Studio has the Android SDK installed
- Try "File > Sync Project with Gradle Files" in Android Studio

**Login doesn't work:**
- Verify the database is running on Replit
- Check the server logs in Replit for errors
