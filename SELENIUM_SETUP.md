# Selenium Screenshot Automation Setup ✅

## 🎯 What's Set Up

Automated screenshot capture using Selenium WebDriver with TypeScript/JavaScript.

---

## ✅ Installed Dependencies

- `selenium-webdriver` - Selenium WebDriver
- `chromedriver` - Chrome browser driver
- `@types/selenium-webdriver` - TypeScript types
- `ts-node` - TypeScript execution

---

## 📁 Files Created

1. **`scripts/screenshot.js`** - Main screenshot automation script (CommonJS)
2. **`scripts/screenshot.ts`** - TypeScript version (for reference)
3. **`scripts/README.md`** - Usage instructions
4. **`scripts/tsconfig.json`** - TypeScript config

---

## 🚀 How to Use

### Step 1: Start the Application

```bash
# Terminal 1: Start both servers
npm run dev

# Or separately:
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

### Step 2: Run Screenshot Script

```bash
# Terminal 3: Take screenshots
npm run screenshots
```

### Step 3: Check Results

```bash
ls -la docs/screenshots/
```

---

## 📸 Screenshots Captured

The script automatically captures:

1. ✅ Landing Page (`/`)
2. ✅ Login Page (`/login`)
3. ✅ Executive Dashboard (`/app/dashboard`)
4. ✅ Risk Register (`/app/risks`)
5. ✅ Risk Heatmap (`/app/heatmap`)
6. ✅ Document Upload (`/app/documents/upload`)
7. ✅ Review Queue (`/app/documents/review`)
8. ✅ Board Report (`/app/board-report`)
9. ✅ Risk Appetite (`/app/appetite`)
10. ✅ Enterprise Risks (`/app/enterprise-risks`)

---

## ⚙️ Configuration

### Custom Base URL

```bash
BASE_URL=http://localhost:3002 npm run screenshots
```

### Edit Screenshot List

Edit `scripts/screenshot.js` to:
- Add more pages
- Change login credentials
- Adjust wait times
- Add custom actions

---

## 🔧 Troubleshooting

### Chrome Not Found

```bash
# Install Chrome (if not installed)
# Ubuntu/Debian:
sudo apt-get install google-chrome-stable

# Or use Chromium:
sudo apt-get install chromium-browser
```

### ChromeDriver Issues

```bash
# Reinstall chromedriver
npm install chromedriver --save-dev
```

### Port Not Accessible

- Make sure frontend is running on port 3000
- Or update `BASE_URL` in script
- Check firewall settings

### Login Fails

- Verify test credentials in script
- Make sure database is seeded: `cd backend && npm run seed`
- Check browser console for errors

### Screenshots Are Blank

- Increase wait times in script (currently 2-3 seconds)
- Check if pages load correctly manually
- Verify selectors in `waitFor` fields

---

## 📝 Script Features

- ✅ Automatic login with test credentials
- ✅ Waits for page elements to load
- ✅ Full-page screenshots
- ✅ Error handling and logging
- ✅ Configurable base URL
- ✅ Saves to organized directory

---

## 🎨 Screenshot Quality

- **Resolution**: 1920×1080 (Full HD)
- **Format**: PNG
- **Size**: Optimized automatically
- **Full Page**: Yes (captures entire page)

---

## 🔄 Workflow

1. Start application (`npm run dev`)
2. Wait for servers to be ready
3. Run screenshot script (`npm run screenshots`)
4. Screenshots saved to `docs/screenshots/`
5. Add screenshots to git
6. Update README.md with screenshot references
7. Push to GitHub

---

## ✅ Status

- ✅ Selenium installed
- ✅ ChromeDriver installed
- ✅ Script created
- ✅ NPM script added
- ✅ Documentation complete

**Ready to capture screenshots!** 📸

---

## 🚀 Quick Command

```bash
# One-liner (after servers are running):
npm run screenshots && echo "✅ Screenshots saved to docs/screenshots/"
```

---

**Automated screenshot capture is ready!** 🎉

