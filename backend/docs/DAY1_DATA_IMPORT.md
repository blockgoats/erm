# Day-1 Data Import Guide

This guide explains how to import the minimum dataset required to launch and sell the ERM platform per NIST IR 8286 requirements.

## 📋 Required Data Sources

Day-1 data comes from:
- Existing Excel risk registers
- GRC spreadsheets
- Security review documents
- Risk committee notes
- Interviews with CISO / ERM officer

**No integrations required** - manual import is sufficient for launch.

## 🗂️ Data Structure

### A. Organization & Structure Data

**Required Fields:**
- Organization name
- Business units / departments
- Systems / applications
- System owners (role, not personal details)

**Example:**
```
Org: Acme Corp
BU: Payments
System: Payment Gateway
Owner Role: IT Ops Lead
```

**CSV Format:**
```csv
organization,businessUnit,system,systemOwnerRole,asset,assetType,assetCriticality,businessFunction
Acme Corp,Payments,Payment Gateway,IT Ops Lead,Payment App,Application,High,Process customer payments
Acme Corp,Payments,Customer Database,Data Protection Officer,Customer DB,Database,High,Store customer PII
Acme Corp,HR,HR Management System,HR Director,HR App,Application,Medium,Manage employee data
```

### B. Asset Metadata (High-Level Only)

**Required:**
- Asset / system name
- Asset type (Application, Database, Cloud Service, Infrastructure, Network, Other)
- Criticality (Low, Medium, High)
- Business function supported

**❌ Do NOT collect:**
- IP addresses
- Secrets
- Configs
- Credentials

### C. Cybersecurity Risk Register Data (CSRR)

**Required CSRR fields (from NIST Table 1):**
- Risk ID
- Risk description (scenario-based)
- Risk category (Access Control, Availability, Confidentiality, etc.)
- Asset impacted
- Likelihood (1–5)
- Impact (1–5)
- Impact Type (Financial, Operational, Reputational, Compliance, Strategic)
- Exposure (computed: likelihood × impact)
- Risk response type (avoid, mitigate, transfer, accept)
- Risk owner (role)
- Status

**CSV Format:**
```csv
riskId,title,description,threat,vulnerability,impactDescription,impactType,likelihood,impact,category,businessUnit,system,asset,ownerRole,responseType,status
RISK-001,Unauthorized Access,External attacker gains access,External attacker,Weak authentication,Financial loss $5M,Financial,4,5,Access Control,Payments,Payment Gateway,Payment App,IT Ops Lead,mitigate,identified
RISK-002,Data Breach,Customer PII exposed,Malicious insider,Insufficient controls,Regulatory fines $10M,Compliance,3,5,Confidentiality,Payments,Customer Database,Customer DB,Data Protection Officer,mitigate,assessed
```

### D. Risk Scoring Scales (Config Data)

**Required:**
- Likelihood scale definition (1-5 with labels)
- Impact scale definition (1-5 with labels)

**Default Scales:**
```
Likelihood:
1 = Rare
2 = Unlikely
3 = Possible
4 = Likely
5 = Almost Certain

Impact:
1 = Negligible
2 = Minor
3 = Moderate
4 = Major
5 = Catastrophic
```

These are seeded automatically but can be customized per organization.

### E. Risk Appetite & Tolerance Statements

**Required:**
- Objective (e.g., availability, compliance)
- Appetite statement (qualitative)
- Tolerance threshold (quantitative)

**CSV Format:**
```csv
objective,category,statement,toleranceThreshold
Availability,Availability,High appetite for availability. Critical systems must maintain 99.9% uptime.,5.0
Data Protection,Confidentiality,Zero tolerance for data breaches involving customer PII.,12.0
Operational Continuity,Availability,Moderate operational disruption risks acceptable for non-critical systems.,10.0
```

## 🚀 Import Methods

### Method 1: Seed Script (Quick Start)

```bash
cd backend
npm run seed
```

This creates example Day-1 data for "Acme Corp" with:
- 1 Organization
- 3 Business Units
- 3 Systems
- 3 Assets
- 3 Risk Appetite Statements
- 3 Cybersecurity Risks
- Risk Scoring Scales

### Method 2: API Import

#### Import Organization Structure

```bash
curl -X POST http://localhost:3001/api/import/org-structure \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": "org-id",
    "rows": [
      {
        "organization": "Acme Corp",
        "businessUnit": "Payments",
        "system": "Payment Gateway",
        "systemOwnerRole": "IT Ops Lead",
        "asset": "Payment App",
        "assetType": "Application",
        "assetCriticality": "High",
        "businessFunction": "Process customer payments"
      }
    ]
  }'
```

#### Import Risks

```bash
curl -X POST http://localhost:3001/api/import/risks \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": "org-id",
    "createdBy": "user-id",
    "rows": [
      {
        "riskId": "RISK-001",
        "title": "Unauthorized Access",
        "description": "Risk description",
        "threat": "External attacker",
        "vulnerability": "Weak authentication",
        "impactDescription": "Financial loss $5M",
        "impactType": "Financial",
        "likelihood": 4,
        "impact": 5,
        "category": "Access Control",
        "businessUnit": "Payments",
        "system": "Payment Gateway",
        "asset": "Payment App",
        "ownerRole": "IT Ops Lead",
        "responseType": "mitigate",
        "status": "identified"
      }
    ]
  }'
```

#### Import Risk Appetite

```bash
curl -X POST http://localhost:3001/api/import/appetite \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": "org-id",
    "rows": [
      {
        "objective": "Availability",
        "category": "Availability",
        "statement": "High appetite for availability. Critical systems must maintain 99.9% uptime.",
        "toleranceThreshold": 5.0
      }
    ]
  }'
```

### Method 3: Excel/CSV File Upload (Frontend)

A frontend component can be built to:
1. Upload CSV/Excel files
2. Parse and validate data
3. Call the import APIs
4. Show import results

## ✅ Validation

After import, verify:

1. **Organization Structure:**
   - All business units created
   - All systems linked to business units
   - All assets linked to systems/organization
   - System owner roles assigned

2. **Risk Register:**
   - All risks have required fields
   - Likelihood and Impact are 1-5
   - Exposure = Likelihood × Impact
   - Risks linked to correct assets/systems

3. **Risk Appetite:**
   - All objectives defined
   - Tolerance thresholds set
   - Statements are clear and governance-ready

4. **Scoring Scales:**
   - Likelihood scale: 5 levels (1-5)
   - Impact scale: 5 levels (1-5)
   - Descriptions are business-friendly

## 📊 Data Quality Checklist

- [ ] Organization name is clear and professional
- [ ] Business units represent actual departments
- [ ] Systems are real applications (not hypothetical)
- [ ] System owners are roles, not people
- [ ] Assets have clear business functions
- [ ] Risk descriptions are scenario-based (Threat + Vulnerability + Impact)
- [ ] Impact types are specified (Financial/Operational/Reputational)
- [ ] Risk categories align with NIST categories
- [ ] Appetite statements are in natural language
- [ ] Tolerance thresholds are numeric and defensible

## 🔄 Next Steps After Import

1. **Review Enterprise Risk Aggregation:**
   - System → Organization → Enterprise roll-up should work automatically
   - Top N enterprise risks should be calculated

2. **Verify Appetite Breaches:**
   - Check if any risks exceed tolerance thresholds
   - Review breach alerts

3. **Generate Board Report:**
   - Verify executive dashboard shows correct data
   - Test board report generation

4. **Audit Trail:**
   - All imports should create audit log entries
   - Version history should be tracked

## 🚫 What NOT to Import (Day-1)

These are post-launch features:
- KRI data (can be manual initially)
- Detailed evidence files (optional)
- Financial estimates (optional)
- Control mappings (post-launch)
- Vendor risk data (post-launch)

## 📝 Notes

- **NIST 8286 is about risk governance, not detection**
- Focus on structure and risk register data first
- Appetite statements are what differentiate from Excel
- Enterprise aggregation is derived, not imported
- Keep it simple for Day-1 launch

