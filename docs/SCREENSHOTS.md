# Screenshots Guide

This document lists the recommended screenshots to showcase the ERM Platform.

## 📸 Required Screenshots

### 1. Landing Page
**File:** `landing-page.png`  
**Path:** `/`  
**What to capture:**
- Hero section with value proposition
- Key features section
- Professional header with logo
- Call-to-action button

**Tips:**
- Use full browser window
- Ensure text is readable
- Show the calm, professional aesthetic

---

### 2. Login Page
**File:** `login.png`  
**Path:** `/login`  
**What to capture:**
- Clean login form
- NIST reference (if visible)
- Professional styling
- Error handling (optional: show error state)

**Tips:**
- Center the form
- Show the shield icon
- Clean, minimal design

---

### 3. Executive Dashboard
**File:** `executive-dashboard.png`  
**Path:** `/app/dashboard`  
**What to capture:**
- Single-screen overview
- Top 5 enterprise risks
- Key metrics (total risks, critical risks, exposure)
- Appetite breach alerts
- Trend indicators

**Tips:**
- Full screen capture
- Show all metrics visible without scrolling
- Highlight the "30-second understanding" principle

---

### 4. Risk Register
**File:** `risk-register.png`  
**Path:** `/app/risks`  
**What to capture:**
- Table view with risks
- Color-coded exposure badges (green/amber/red)
- Inline editing capability
- Risk scenario structure visible
- Filters and search

**Tips:**
- Show multiple risks with different exposure levels
- Highlight the inline editing feature
- Show the risk scenario columns

---

### 5. Risk Heatmap
**File:** `risk-heatmap.png`  
**Path:** `/app/heatmap`  
**What to capture:**
- 5×5 matrix visualization
- Color coding (green/amber/red)
- Hover tooltip (optional: show tooltip)
- Risk distribution

**Tips:**
- Show risks distributed across the matrix
- Highlight the color coding
- Show tooltip if possible

---

### 6. Document Upload
**File:** `document-upload.png`  
**Path:** `/app/documents/upload`  
**What to capture:**
- Upload interface
- File selection area
- Document type selector
- Upload button

**Tips:**
- Show the drag-and-drop area
- Highlight the enhanced UI with new CSS
- Show the professional styling

---

### 7. Document Processing Results
**File:** `document-results.png`  
**Path:** `/app/documents/upload` (after upload)  
**What to capture:**
- Success message
- Metrics grid (extracted risks, clauses, created risks, review queue)
- Action buttons (View Risk Register, Review Queue)
- Professional card design

**Tips:**
- Show the metrics clearly
- Highlight the automatic risk creation
- Show the enhanced UI styling

---

### 8. Review Queue
**File:** `review-queue.png`  
**Path:** `/app/documents/review`  
**What to capture:**
- Queue list (left sidebar)
- Selected clause detail (right panel)
- Confidence scores
- Clause type badges
- Approve/Reject/Modify buttons

**Tips:**
- Show the two-column layout
- Highlight confidence scores
- Show the enhanced styling

---

### 9. Board Report
**File:** `board-report.png`  
**Path:** `/app/board-report`  
**What to capture:**
- McKinsey-style format
- Large fonts
- Executive summary
- Risk trends
- Plain-English conclusions

**Tips:**
- Print preview mode (if available)
- Show the professional format
- Highlight the board-ready presentation

---

### 10. Risk Appetite
**File:** `risk-appetite.png`  
**Path:** `/app/appetite`  
**What to capture:**
- Natural-language statements
- Threshold sliders
- Breach alerts
- Live preview

**Tips:**
- Show active breaches if any
- Highlight the natural language approach
- Show threshold visualization

---

### 11. Enterprise Risks
**File:** `enterprise-risks.png`  
**Path:** `/app/enterprise-risks`  
**What to capture:**
- Top 10 prioritized risks
- Aggregated exposure
- Trend indicators
- Category filters

**Tips:**
- Show the ranked list
- Highlight trend arrows
- Show the roll-up view

---

### 12. Risk Detail Page
**File:** `risk-detail.png`  
**Path:** `/app/risks/:id`  
**What to capture:**
- Full risk context
- Risk scenario (Threat, Vulnerability, Asset, Impact)
- History timeline
- Evidence links
- Treatment plans

**Tips:**
- Show comprehensive risk information
- Highlight explainability features
- Show evidence linking

---

## 🎨 Screenshot Guidelines

### Technical Requirements
- **Format**: PNG (preferred) or JPG
- **Resolution**: Minimum 1920×1080 (Full HD)
- **Aspect Ratio**: 16:9 or 4:3
- **File Size**: Optimize to < 500KB per image

### Styling
- **Browser**: Use Chrome or Firefox
- **Theme**: Light mode (default)
- **Zoom**: 100% (no zoom)
- **Window**: Full browser window (not dev tools)

### Content
- **Data**: Use seeded test data
- **Privacy**: No real user data
- **Clarity**: Ensure all text is readable
- **Consistency**: Same browser, same zoom level

### Naming Convention
- Use kebab-case: `feature-name.png`
- Be descriptive: `risk-register-table-view.png`
- Include state if relevant: `login-error-state.png`

---

## 📁 Directory Structure

```
docs/
└── screenshots/
    ├── landing-page.png
    ├── login.png
    ├── executive-dashboard.png
    ├── risk-register.png
    ├── risk-heatmap.png
    ├── document-upload.png
    ├── document-results.png
    ├── review-queue.png
    ├── board-report.png
    ├── risk-appetite.png
    ├── enterprise-risks.png
    └── risk-detail.png
```

---

## 🚀 How to Take Screenshots

### Using Browser DevTools
1. Open the page
2. Press `F12` to open DevTools
3. Press `Ctrl+Shift+P` (Cmd+Shift+P on Mac)
4. Type "Capture screenshot"
5. Select "Capture full size screenshot"

### Using Browser Extensions
- **Full Page Screen Capture** (Chrome)
- **FireShot** (Chrome/Firefox)
- **Awesome Screenshot** (Chrome/Firefox)

### Using OS Tools
- **Windows**: Snipping Tool or Win+Shift+S
- **Mac**: Cmd+Shift+4 (area) or Cmd+Shift+3 (full screen)
- **Linux**: Use screenshot tool or `gnome-screenshot`

---

## ✅ Checklist

Before uploading to GitHub:

- [ ] All 12 screenshots taken
- [ ] Screenshots are clear and readable
- [ ] Consistent styling across all screenshots
- [ ] Files named correctly
- [ ] Files optimized (< 500KB each)
- [ ] Screenshots added to README.md
- [ ] Screenshots directory created

---

## 📝 Adding Screenshots to README

Once screenshots are ready, update README.md:

```markdown
## 📸 Screenshots

### Landing Page
![Landing Page](docs/screenshots/landing-page.png)

### Executive Dashboard
![Executive Dashboard](docs/screenshots/executive-dashboard.png)

...
```

---

**Ready to showcase your world-class ERM platform!** 🚀

