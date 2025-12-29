# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies

```bash
npm install
cd frontend && npm install
cd ../backend && npm install
```

### 2. Setup Environment

Create `backend/.env`:
```env
JWT_SECRET=your-secret-key-here-change-in-production
PORT=3001
```

### 3. Seed Database

```bash
cd backend
npm run seed
```

### 4. Start Servers

```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend  
cd frontend && npm run dev
```

### 5. Login

Go to http://localhost:3000/login

**Test Credentials:**
- Admin: `admin@acme.com` / `admin123`
- Risk Manager: `riskmanager@acme.com` / `manager123`
- Executive: `executive@acme.com` / `exec123`

---

## 📸 Taking Screenshots

See `docs/SCREENSHOTS.md` for detailed guide.

**Quick Steps:**
1. Start the app
2. Login with test credentials
3. Navigate to each page
4. Take full-page screenshots
5. Save to `docs/screenshots/`

**Required Screenshots:**
- Landing Page (`/`)
- Login Page (`/login`)
- Executive Dashboard (`/app/dashboard`)
- Risk Register (`/app/risks`)
- Risk Heatmap (`/app/heatmap`)
- Document Upload (`/app/documents/upload`)
- Review Queue (`/app/documents/review`)
- Board Report (`/app/board-report`)

---

## 🔄 GitHub Upload

See `GITHUB_SETUP.md` for complete guide.

**Quick Commands:**
```bash
git init
git add .
git commit -m "Initial commit: NIST 8286 ERM Platform"
git remote add origin https://github.com/YOUR_USERNAME/erm-platform.git
git branch -M main
git push -u origin main
```

---

**That's it! You're ready to go.** 🎉

