# Screenshot Automation Scripts

## 🚀 Automated Screenshot Capture

Use Selenium to automatically capture screenshots of all major pages.

### Prerequisites

1. **Chrome Browser** installed
2. **ChromeDriver** (installed via npm)
3. **Frontend and Backend running**

### Setup

```bash
# Install dependencies (already done)
npm install

# Make sure frontend and backend are running
npm run dev
```

### Usage

```bash
# Take all screenshots
npm run screenshots

# Or with custom base URL
BASE_URL=http://localhost:3002 npm run screenshots
```

### What It Does

1. Opens Chrome browser
2. Navigates to each page
3. Logs in if required
4. Waits for page to load
5. Takes full-page screenshot
6. Saves to `docs/screenshots/`

### Screenshots Captured

1. `landing-page.png` - Landing page
2. `login.png` - Login page
3. `executive-dashboard.png` - Executive dashboard
4. `risk-register.png` - Risk register
5. `risk-heatmap.png` - Risk heatmap
6. `document-upload.png` - Document upload
7. `review-queue.png` - Review queue
8. `board-report.png` - Board report
9. `risk-appetite.png` - Risk appetite
10. `enterprise-risks.png` - Enterprise risks

### Troubleshooting

**ChromeDriver not found:**
```bash
npm install chromedriver --save-dev
```

**Port not accessible:**
- Make sure frontend is running on port 3000 (or update BASE_URL)
- Make sure backend is running on port 3001

**Login fails:**
- Check test credentials in script
- Make sure database is seeded: `cd backend && npm run seed`

**Screenshots are blank:**
- Increase wait times in script
- Check browser console for errors
- Make sure page fully loads before screenshot

---

**Automated screenshot capture ready!** 📸

