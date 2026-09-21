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
3. Generate the app's custom icon and splash screen from `resources/icon.png`
4. Build a **release** APK with Gradle (signed so it installs directly)
5. Upload it as a downloadable artifact

You can watch it happen under the **Actions** tab of your repo.

### Step 4 — Download the APK
1. Go to your repo on GitHub → **Actions** tab
2. Click the latest successful workflow run ("Build Android APK")
3. Scroll down to **Artifacts** → download `warranty-tracker-release-apk`
4. Unzip it — you'll get `app-release.apk`

### Step 5 — Install it on your phone
1. Transfer `app-release.apk` to your Android phone (email it to yourself, use Google Drive, USB, etc.)
2. On your phone, tap the APK file to install it
3. Android will warn about "installing from unknown sources" — this is normal for apps not from the Play Store. Allow it for this file.
4. Open the app — you should see the custom shield icon and the app name, and the install/open flow should work the same as any normal app.

**About the "release" signing used here:** this workflow signs the release APK using the same auto-generated debug key Android tooling creates on the fly, purely so the APK installs cleanly without you having to manage a keystore. It is a real release build (optimized build type, no "debug" banner), but it is **not** signed the way Play Store submissions require. For that you need your own keystore — see below.

---

## Making changes

- App UI/logic lives in `www/index.html`, `www/style.css`, `www/app.js` — plain HTML/CSS/JS, no build step required.
- Change the app name or package ID in `capacitor.config.json` before your first build.
- Every push to `main` triggers a fresh APK build automatically.

### Changing the app icon
The icon is generated from files in `resources/`:
- `icon.png` — 1024×1024 legacy fallback icon
- `icon-foreground.png` / `icon-background.png` — adaptive icon layers (modern Android launchers)
- `splash.png` / `splash-dark.png` — splash screen shown on app launch

Replace these with your own artwork (keep the same filenames and sizes) and push — the workflow regenerates every Android icon size automatically via `@capacitor/assets`, no manual resizing needed.

## Publishing to the Google Play Store (optional, later)

The release APK this workflow produces is great for testing and personal/direct-install use, but the Play Store requires a build signed with your **own permanent keystore** (not the shared debug key this workflow currently uses). When you're ready:
1. Generate a signing keystore (`keytool -genkey -v -keystore release.keystore -alias warrantytracker -keyalg RSA -keysize 2048 -validity 10000`)
2. Store the keystore file + its passwords as GitHub Actions secrets (don't commit the keystore itself)
3. Replace the workflow's "Sign release builds..." step with one that writes those secrets into `android/app/build.gradle`'s `signingConfigs.release` block instead of reusing `signingConfigs.debug`
4. Optionally switch to `./gradlew bundleRelease` to produce an `.aab`, which Play Store prefers over a raw APK
5. Create a Google Play Console developer account ($25 one-time fee) and follow their submission flow

Happy to walk through this step by step whenever you're ready to publish for real.

This is a separate, well-documented step — happy to walk through it once you're ready to publish.

## Product ideas for monetization later

The current app is a free local-only MVP. Natural next steps if you want to build toward the subscription model discussed earlier:
- Add email parsing (Gmail API) to auto-detect purchases instead of manual entry
- Add a backend + account system so data syncs across devices
- Add a "price adjustment" checker that watches for price drops on tracked items
- Gate advanced features (auto-import, multi-device sync, unlimited items) behind a paid tier

---

## AdMob ads

The app shows a banner ad at the bottom of the screen, and an interstitial ad every 3rd item deletion, both powered by `@capacitor-community/admob`.

- **Banner ad unit ID** is wired in at `www/app.js` (`ADMOB_BANNER_ID`): `ca-app-pub-9502060049942116/2395408598`.
- **Interstitial ad unit ID** is wired in at `www/app.js` (`ADMOB_INTERSTITIAL_ID`): `ca-app-pub-9502060049942116/2908570604`. It preloads on launch and shows after every 3rd item deletion, then preloads the next one.
- **App ID** (a separate ID, format `ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY`) is read from `admob-app-id.txt` at build time and injected into `AndroidManifest.xml` automatically. It is currently set to your real App ID: `ca-app-pub-9502060049942116~7801357520`. If you ever need to change it (new app, different AdMob account), edit that file and push.

Before real ads will actually serve, double-check in the [AdMob console](https://apps.admob.com/) that the app this App ID belongs to has its **package name set to `com.warrantytracker.app`** (or whatever you change `appId` to in `capacitor.config.json`) — a mismatch here is the most common reason ads don't show even with a correct App ID.

### About `app-ads.txt` — and getting a free domain to host it
The `app-ads.txt` file in this repo contains the entry you gave me:
```
google.com, pub-9502060049942116, DIRECT, f08c47fec0942fa0
```
This file is **not used by the app itself** — it has no effect inside the APK. It exists to verify ad-serving authorization, and Google/Amazon check for it at `https://yourdomain.com/app-ads.txt` on the **website you list as your app's developer website** in the store listing.

If you don't already own a domain, the free way to get one is **GitHub Pages**, which gives you `https://your-username.github.io` at no cost:

1. On GitHub, create a **new, separate repo** named exactly `your-username.github.io` (replace with your real GitHub username — this exact name is what makes it a root-level Pages site instead of a sub-path).
2. Upload just one file to it: `app-ads.txt`, with the same content shown above.
3. Go to that repo's **Settings → Pages**, set source to the `main` branch, save. After a minute, `https://your-username.github.io/app-ads.txt` will be live.
4. Put `https://your-username.github.io` as your **developer website** in the Google Play Console / Amazon Developer Console app listing.

(Don't use *this* project's repo for that — Project Pages serve at `username.github.io/repo-name/`, a sub-path, which some crawlers won't treat as domain root. The separate `username.github.io` repo is the one that serves at the true root.)

### Ad placement note
Google's AdMob policies require ads to be clearly distinguishable from content and not placed where they could be accidentally tapped. The current setup shows one adaptive banner anchored to the bottom of the screen (padded so it never overlaps the "+" button or list items), plus an interstitial that appears after every 3rd item deletion — a natural break point, not mid-task. Review [AdMob's placement policies](https://support.google.com/admob/answer/6128877) if you add more ad units later, since policy violations can get an account suspended.
