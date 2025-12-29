# Enterprise Risk Management (ERM) Platform

> **A world-class NIST IR 8286r1-aligned Cybersecurity ERM SaaS Platform**

Transform cybersecurity risks into board-ready enterprise risk intelligence. Built for CISOs, Risk Officers, and Board Members.

![ERM Platform](https://via.placeholder.com/1200x600/1e40af/ffffff?text=ERM+Platform+Dashboard)

## 🎯 Core Value Proposition

> **"Executives should understand enterprise cyber risk in under 30 seconds."**

This platform turns cybersecurity risks into actionable intelligence, enabling data-driven decisions at the board level.

---

## ✨ Key Features

### 🛡️ Core Risk Management

- **Risk Register (CSRR)**: Comprehensive cybersecurity risk register with scenario-based assessment
- **Risk Scoring**: Deterministic 5×5 matrix with exposure calculation (Likelihood × Impact)
- **Enterprise Risk Roll-Up**: System → Organization → Enterprise hierarchy per NIST
- **Risk Appetite & Tolerance**: Natural-language statements with breach detection
- **Executive Dashboard**: Single-screen overview (no scrolling required)

### 📄 PDF Intelligence (NEW!)

- **Document Upload**: Upload compliance documents, audit reports, contracts, policies
- **Automatic Risk Extraction**: AI-powered extraction of risks from documents
- **NLP-Based Classification**: Advanced clause classification (obligation, prohibition, penalty, etc.)
- **Actor Extraction**: "Who must do what" identification
- **Deadline Extraction**: Automatic deadline detection and calculation
- **Dependency Detection**: Cross-clause relationship mapping
- **Ambiguity Detection**: Flags vague language requiring clarification
- **Review Queue**: Human-in-the-loop for low-confidence extractions

### 📊 Reporting & Analytics

- **Board Report**: McKinsey-style presentation format
- **Risk Heatmap**: Visual 5×5 matrix with color coding
- **KRI Dashboard**: Key Risk Indicators with trend analysis
- **Audit Trail**: Complete version history and change tracking

### 🔐 Enterprise Features

- **Role-Based Access Control**: 5 roles with granular permissions
- **Multi-Tenant Architecture**: Organization isolation
- **Evidence Management**: Link documents and evidence to risks
- **Workflow Engine**: Automated approval and notification workflows
- **Audit Logging**: Complete audit trail for compliance

---

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Zustand (state management)
- React Router v6 (routing)
- Recharts (visualizations)
- Lucide React (icons)

**Backend:**
- Node.js + Express
- TypeScript
- SQLite (database)
- JWT (authentication)
- Better-SQLite3 (database driver)

### Project Structure

```
erm/
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Main application screens
│   │   ├── store/          # Zustand state management
│   │   ├── lib/            # API clients
│   │   └── types/          # TypeScript definitions
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── db/             # Database schema
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── middleware/     # Auth, audit logging
│   └── package.json
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd erm

# Install dependencies
npm install
cd frontend && npm install
cd ../backend && npm install
```

### Environment Setup

Create `backend/.env`:

```env
JWT_SECRET=your-secret-key-here
PORT=3001
DOCUMENT_UPLOAD_DIR=./uploads/documents
EVIDENCE_UPLOAD_DIR=./uploads/evidence
```

### Database Setup

```bash
cd backend
npm run seed
```

This creates:
- Organization: "Acme Corp"
- Business Units, Systems, Assets
- Sample risks and appetite statements
- Test users

### Run Development Servers

```bash
# From root directory
npm run dev

# Or separately:
# Terminal 1: Frontend (http://localhost:3000)
cd frontend && npm run dev

# Terminal 2: Backend (http://localhost:3001)
cd backend && npm run dev
```

### Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Administrator | `admin@acme.com` | `admin123` |
| Risk Manager | `riskmanager@acme.com` | `manager123` |
| Executive | `executive@acme.com` | `exec123` |
| Risk Owner | `riskowner@acme.com` | `owner123` |

---

## 📸 Screenshots

Screenshots are automatically generated using Selenium. See `scripts/README.md` for details.

### Automated Screenshot Capture

```bash
# Make sure frontend and backend are running
npm run dev

# In another terminal, run:
npm run screenshots
```

This will automatically capture all major pages and save them to `docs/screenshots/`.

### Manual Screenshots

If you prefer manual screenshots, see `docs/SCREENSHOTS.md` for detailed instructions.

### Screenshot List:

1. **Landing Page** (`landing-page.png`)
   - Professional landing page
   - Value proposition
   - Call-to-action

2. **Login Page** (`login.png`)
   - Clean, enterprise-grade login
   - NIST reference

3. **Executive Dashboard** (`executive-dashboard.png`)
   - Single-screen overview
   - Top risks, metrics, trends

4. **Risk Register** (`risk-register.png`)
   - Table view with inline editing
   - Color-coded exposure badges
   - Risk scenario structure

5. **Risk Heatmap** (`risk-heatmap.png`)
   - 5×5 matrix visualization
   - Color coding (green/amber/red)
   - Hover tooltips

6. **Document Upload** (`document-upload.png`)
   - Upload interface
   - Processing results
   - Extracted risks display

7. **Review Queue** (`review-queue.png`)
   - Pending review items
   - Clause details
   - Confidence scores

8. **Board Report** (`board-report.png`)
   - McKinsey-style format
   - Executive summary
   - Risk trends

9. **Risk Appetite** (`risk-appetite.png`)
   - Natural-language statements
   - Breach alerts
   - Threshold visualization

10. **Enterprise Risks** (`enterprise-risks.png`)
    - Top 10 prioritized risks
    - Roll-up view
    - Trend indicators

---

## 📋 Implemented Features

### Core Risk Management

#### 1. Risk Register (CSRR)
- ✅ Table view with inline editing (no modals)
- ✅ Risk Scenario structure (Threat, Vulnerability, Asset, Impact)
- ✅ Color-coded exposure badges
- ✅ Likelihood & Impact always visible
- ✅ Risk owner assignment
- ✅ Status lifecycle tracking
- ✅ Last reviewed date

#### 2. Risk Scoring
- ✅ 5×5 matrix heatmap
- ✅ Deterministic formula: `Exposure = Likelihood × Impact`
- ✅ Hover tooltips with business meaning
- ✅ Visual color coding (Green ≤6, Amber 7-12, Red >12)
- ✅ Customizable scoring scales

#### 3. Enterprise Risk Roll-Up
- ✅ Top 10 ranked list
- ✅ Category-based aggregation
- ✅ Exposure normalization
- ✅ Component risk linking
- ✅ Trend indicators (↑ ↓)

#### 4. Risk Appetite & Tolerance
- ✅ Natural-language policy statements
- ✅ Threshold sliders with numeric bounds
- ✅ Automatic breach detection
- ✅ Breach acknowledgment workflow
- ✅ Governance-focused presentation

#### 5. Executive Dashboard
- ✅ Single screen, no scrolling
- ✅ Top 5 enterprise risks
- ✅ Appetite breach alerts
- ✅ Key metrics at a glance
- ✅ Trend visualization

#### 6. Board Report
- ✅ McKinsey-style presentation
- ✅ Large fonts, minimal colors
- ✅ Explicit conclusions
- ✅ Quarter-over-quarter deltas
- ✅ Plain-English summaries

### PDF Intelligence (Phase 1 & 2)

#### Layer 1: PDF Parsing
- ✅ PDF ingestion (native + scanned)
- ✅ Text extraction
- ✅ Version fingerprinting (SHA-256 hash)
- ✅ Document metadata tracking

#### Layer 2: Interpretation Engine
- ✅ **Advanced Clause Classification**: 7 types (obligation, prohibition, penalty, condition, right, definition, other)
- ✅ **Actor Extraction**: "Who must do what" identification
- ✅ **Time Binding**: Deadline extraction ("within 30 days of X")
- ✅ **Dependency Detection**: Cross-clause relationships
- ✅ **Ambiguity Detection**: Vague language flagging
- ✅ **Enhanced Confidence Scoring**: Multi-factor calculation

#### Layer 6: Human-in-the-Loop
- ✅ Review queue for low-confidence extractions
- ✅ Confidence-based prioritization
- ✅ Approve/Reject/Modify workflow
- ✅ Audit trail for reviews

#### Integration
- ✅ Auto-create risk register entries
- ✅ Link extracted obligations to compliance tasks
- ✅ Store extracted metadata (actors, deadlines, dependencies)

### Additional Features

- ✅ Role-based UI (5 roles with different views)
- ✅ Explainability tooltips everywhere
- ✅ Audit trail and version history
- ✅ Evidence linking (one-click access)
- ✅ Risk detail page with full context
- ✅ KRI Dashboard with trend analysis
- ✅ Workflow engine for approvals
- ✅ Controls library
- ✅ Audit findings management

---

## 🎨 Design System

### Colors

- **Green** (`#10b981`): Acceptable risk (exposure ≤6)
- **Amber** (`#f59e0b`): Monitor (exposure 7-12)
- **Red** (`#ef4444`): Action required (exposure >12)
- **Blue** (`#1e40af`): Primary actions, links

### Typography

- **Font**: Inter (humanist sans-serif)
- **Style**: Calm, neutral, institutional
- **Layout**: Dense but readable

### UX Principles

- ✅ No jargon (business language preferred)
- ✅ Time as first-class dimension
- ✅ Visual consistency (semantic colors)
- ✅ Defensible and auditable
- ✅ Role-aware experience
- ✅ Explainability everywhere

---

## 🔐 User Roles

| Role | Permissions | Use Case |
|------|------------|----------|
| **Administrator** | Full system access | System administration |
| **Risk Manager** | Manage risks, assessments | Day-to-day risk management |
| **Risk Owner** | Own assigned risks | Risk response and mitigation |
| **Executive** | View dashboards, reports | Strategic oversight |
| **Auditor** | Read-only access | Compliance audits |

---

## 📊 Information Architecture

Hierarchy mirrors NIST IR 8286r1:

```
System → Organization → Enterprise
```

- Drill-down flows downward
- Roll-up flows upward
- Never flatten risk views by default

---

## 🚫 UX Pitfalls Avoided

- ❌ Over-visualization
- ❌ "Security dashboard" look
- ❌ Startup-y animations
- ❌ Dark mode as default
- ❌ Mobile-first mindset

**This is a boardroom product, not a dev tool.**

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Risks
- `GET /api/risks` - List risks
- `POST /api/risks` - Create risk
- `GET /api/risks/:id` - Get risk details
- `PUT /api/risks/:id` - Update risk
- `DELETE /api/risks/:id` - Delete risk

### Documents (PDF Intelligence)
- `POST /api/documents` - Upload and process document
- `GET /api/documents` - List documents
- `GET /api/documents/:id` - Get document details
- `GET /api/documents/review/queue` - Get review queue
- `GET /api/documents/:id/processing-result` - Get processing results

### Enterprise Risks
- `GET /api/enterprise-risks` - List enterprise risks
- `POST /api/enterprise-risks` - Create enterprise risk

### Risk Appetite
- `GET /api/appetite` - List appetite statements
- `POST /api/appetite` - Create appetite statement
- `GET /api/appetite/breaches` - Get active breaches

### Reports
- `GET /api/reports/board` - Generate board report
- `GET /api/reports/executive` - Generate executive report

See API documentation for complete endpoint list.

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Login with all test users
- [ ] Create, edit, delete risks
- [ ] Upload PDF document
- [ ] Review extracted clauses
- [ ] View executive dashboard
- [ ] Generate board report
- [ ] Test role-based access

### Test Data

Run `npm run seed` in backend directory to create test data:
- 1 Organization
- 3 Business Units
- 3 Systems
- 3 Assets
- 3 Cybersecurity Risks
- 3 Risk Appetite Statements
- 4 Test Users

---

## 📚 Documentation

- [UI Principles](frontend/src/UI_PRINCIPLES.md) - Design system guidelines
- [Day-1 Data Import](backend/docs/DAY1_DATA_IMPORT.md) - Data import guide
- [Schema Migration](backend/docs/SCHEMA_MIGRATION.md) - Database migration guide

---

## 🛠️ Development

### Build

```bash
# Build frontend
cd frontend && npm run build

# Build backend
cd backend && npm run build
```

### Automated Screenshots

Capture screenshots of all pages automatically:

```bash
# Make sure frontend and backend are running first
npm run dev

# In another terminal:
npm run screenshots
```

Screenshots will be saved to `docs/screenshots/`. See `scripts/README.md` for details.

### Database

The database is automatically created on first run. To reset:

```bash
cd backend
rm data/erm.db
npm run seed
```

---

## 📈 Roadmap

### Phase 1 ✅ (Complete)
- Core risk management
- Basic PDF parsing
- Risk extraction

### Phase 2 ✅ (Complete)
- Enhanced NLP extraction
- Actor extraction
- Deadline extraction
- Ambiguity detection

### Phase 3 (Planned)
- Workflow conversion (obligations → tasks)
- Calendar integration
- SLA timers

### Phase 4 (Planned)
- Risk & impact modeling from documents
- Penalty simulation
- Historical learning

### Phase 5 (Planned)
- Change intelligence
- Semantic diff
- Auto-update workflows

---

## 🤝 Contributing

This is a private enterprise project. For contributions, please contact the project maintainers.

---

## 📝 License

Private - Enterprise Use Only

---

## 🙏 Acknowledgments

- Built following NIST IR 8286r1 guidelines
- Enterprise UX principles from industry best practices
- PDF Intelligence framework based on 7-layer architecture

---

## 📞 Support

For issues or questions, please contact the development team.

---

**Built with ❤️ for enterprise risk management**
