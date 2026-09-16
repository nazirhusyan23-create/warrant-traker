# Warranty Tracker

A simple mobile app that tracks return windows and warranty deadlines for things you buy, so you stop losing money to missed deadlines.

- Add a purchase: item name, retailer, price, purchase date, return window (days), warranty length (months)
- The app calculates deadlines automatically and flags anything expiring soon
- Local notifications remind you 2 days before a return window or warranty closes
- Everything is stored **locally on the device** (no backend, no account, no server costs)

This is a real, working MVP — not a mockup. It's built with [Capacitor](https://capacitorjs.com/), which wraps a normal web app (HTML/CSS/JS) into a native Android app.

---

## Turn this into an installable APK (no local Android setup needed)

You don't need Android Studio installed on your computer. GitHub will build the APK for you automatically.

### Step 1 — Create a GitHub repository
1. Go to [github.com/new](https://github.com/new) and create a new repository (public or private).
2. Don't initialize it with a README (you already have one here).

### Step 2 — Push this code to your new repo
From inside this folder, run:

```bash
git init
git add .
git commit -m "Initial commit: Warranty Tracker app"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
git push -u origin main
```

### Step 3 — Let GitHub Actions build the APK
As soon as you push, GitHub Actions will automatically:
1. Install dependencies
2. Add the Android platform via Capacitor
3. Build a debug APK with Gradle
4. Upload it as a downloadable artifact

You can watch it happen under the **Actions** tab of your repo.

### Step 4 — Download the APK
1. Go to your repo on GitHub → **Actions** tab
2. Click the latest successful workflow run ("Build Android APK")
3. Scroll down to **Artifacts** → download `warranty-tracker-debug-apk`
4. Unzip it — you'll get `app-debug.apk`

### Step 5 — Install it on your phone
1. Transfer `app-debug.apk` to your Android phone (email it to yourself, use Google Drive, USB, etc.)
2. On your phone, tap the APK file to install it
3. Android will warn about "installing from unknown sources" — this is normal for apps not from the Play Store. Allow it for this file.
4. Open the app — you're done.

This debug APK is **unsigned** and perfectly fine for installing on your own device or sharing with friends/testers. It is **not** suitable for uploading to the Google Play Store — that requires a signed release build (see below).

---

## Making changes

- App UI/logic lives in `www/index.html`, `www/style.css`, `www/app.js` — plain HTML/CSS/JS, no build step required.
- Change the app name or package ID in `capacitor.config.json` before your first build.
- Every push to `main` triggers a fresh APK build automatically.

## Publishing to the Google Play Store (optional, later)

The debug APK from this workflow is great for testing but Play Store requires a **signed release build**. When you're ready:
1. Generate a signing keystore (`keytool -genkey ...`)
2. Add the keystore + `android/gradle.properties` signing config
3. Change the workflow's build step to `./gradlew assembleRelease` (or `bundleRelease` for an `.aab`)
4. Create a Google Play Console developer account ($25 one-time fee) and follow their submission flow

This is a separate, well-documented step — happy to walk through it once you're ready to publish.

## Product ideas for monetization later

The current app is a free local-only MVP. Natural next steps if you want to build toward the subscription model discussed earlier:
- Add email parsing (Gmail API) to auto-detect purchases instead of manual entry
- Add a backend + account system so data syncs across devices
- Add a "price adjustment" checker that watches for price drops on tracked items
- Gate advanced features (auto-import, multi-device sync, unlimited items) behind a paid tier
