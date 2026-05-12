# EnergyPro - Appliance Bill Calculator

A premium, mobile-first Progressive Web App (PWA) for energy monitoring, consumption calculation, and solar savings tracking.

## Features
- **Mobile UI**: Native-like bottom navigation and touch-optimized controls.
- **Smart Billing**: Automatic tiered slab calculation for electricity bills.
- **Solar Integration**: Net metering and buyback credit tracking.
- **Dark Mode**: High-fidelity dark theme support.
- **PWA Ready**: Installable on Android/iOS via Chrome/Safari.

## How to Deploy and Get Your APK

### Step 1: Push to GitHub
1. Create a new repository on GitHub named `appliance-bill`.
2. Run the following commands in your terminal:
   ```powershell
   git remote add origin https://github.com/YOUR_USERNAME/appliance-bill.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Enable GitHub Pages
1. Go to your repository **Settings** on GitHub.
2. Click on **Pages** in the left sidebar.
3. Under **Build and deployment**, set the source to `Deploy from a branch`.
4. Select `main` branch and `/ (root)` folder, then click **Save**.
5. Wait a minute for GitHub to provide your URL (e.g., `https://YOUR_USERNAME.github.io/appliance-bill/`).

### Step 3: Generate APK using PWABuilder
1. Go to **[PWABuilder.com](https://www.pwabuilder.com/)**.
2. Paste your GitHub Pages URL.
3. Click **Start**.
4. Once analyzed, click **Package for Stores** and select **Android**.
5. Click **Download** to get your `.apk` package!

## Installation (PWA)
If you don't want an APK, simply open the URL on your Android phone's Chrome browser, tap the menu (three dots), and select **"Install App"**.
