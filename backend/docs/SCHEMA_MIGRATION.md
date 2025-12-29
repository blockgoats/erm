# Schema Migration Guide

## Changes for NIST Day-1 Requirements

### New Fields Added

#### Systems Table
- `owner_role TEXT NOT NULL` - System owner role (not personal details)

#### Assets Table
- `criticality TEXT NOT NULL CHECK (criticality IN ('Low', 'Medium', 'High'))` - Asset criticality
- `business_function TEXT NOT NULL` - Business function supported
- `asset_type` now has CHECK constraint: `('Application', 'Database', 'Cloud Service', 'Infrastructure', 'Network', 'Other')`

#### Cyber Risks Table
- `risk_id TEXT NOT NULL UNIQUE` - Unique risk identifier (e.g., RISK-001)
- `impact_type TEXT NOT NULL CHECK (impact_type IN ('Financial', 'Operational', 'Reputational', 'Compliance', 'Strategic'))` - Type of impact
- `response_type TEXT CHECK (response_type IN ('avoid', 'mitigate', 'transfer', 'accept'))` - Risk response type
- `owner_role TEXT` - Risk owner role (in addition to owner_id)

#### Risk Appetite Table
- `objective TEXT NOT NULL` - Objective (e.g., availability, compliance)

#### New Table: Risk Scoring Scales
```sql
CREATE TABLE IF NOT EXISTS risk_scoring_scales (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  scale_type TEXT NOT NULL CHECK (scale_type IN ('likelihood', 'impact')),
  level INTEGER NOT NULL CHECK (level >= 1 AND level <= 5),
  label TEXT NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  UNIQUE(organization_id, scale_type, level)
);
```

## Migration Steps

### Option 1: Fresh Database (Recommended for New Installs)

1. Delete existing database file (if any)
2. Run application - schema will be created automatically
3. Run seed script: `npm run seed`

### Option 2: Migrate Existing Database

If you have existing data, run these SQL migrations:

```sql
-- Add system owner_role
ALTER TABLE systems ADD COLUMN owner_role TEXT NOT NULL DEFAULT 'System Owner';

-- Add asset criticality and business_function
ALTER TABLE assets ADD COLUMN criticality TEXT NOT NULL DEFAULT 'Medium' CHECK (criticality IN ('Low', 'Medium', 'High'));
ALTER TABLE assets ADD COLUMN business_function TEXT NOT NULL DEFAULT 'Business function not specified';

-- Add risk_id, impact_type, response_type, owner_role to cyber_risks
ALTER TABLE cyber_risks ADD COLUMN risk_id TEXT;
ALTER TABLE cyber_risks ADD COLUMN impact_type TEXT NOT NULL DEFAULT 'Operational' CHECK (impact_type IN ('Financial', 'Operational', 'Reputational', 'Compliance', 'Strategic'));
ALTER TABLE cyber_risks ADD COLUMN response_type TEXT CHECK (response_type IN ('avoid', 'mitigate', 'transfer', 'accept'));
ALTER TABLE cyber_risks ADD COLUMN owner_role TEXT;

-- Generate risk_ids for existing risks
UPDATE cyber_risks SET risk_id = 'RISK-' || printf('%03d', ROWID) WHERE risk_id IS NULL;

-- Make risk_id unique
CREATE UNIQUE INDEX idx_cyber_risks_risk_id ON cyber_risks(risk_id);

-- Add objective to risk_appetite
ALTER TABLE risk_appetite ADD COLUMN objective TEXT NOT NULL DEFAULT 'Risk Management';

-- Create risk_scoring_scales table
CREATE TABLE IF NOT EXISTS risk_scoring_scales (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  scale_type TEXT NOT NULL CHECK (scale_type IN ('likelihood', 'impact')),
  level INTEGER NOT NULL CHECK (level >= 1 AND level <= 5),
  label TEXT NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  UNIQUE(organization_id, scale_type, level)
);

-- Seed default scoring scales for existing organizations
INSERT INTO risk_scoring_scales (id, organization_id, scale_type, level, label, description)
SELECT 
  lower(hex(randomblob(16))),
  id,
  'likelihood',
  1,
  'Rare',
  'Occurs very rarely, less than once per year'
FROM organizations
UNION ALL
SELECT lower(hex(randomblob(16))), id, 'likelihood', 2, 'Unlikely', 'Occurs infrequently, 1-2 times per year' FROM organizations
UNION ALL
SELECT lower(hex(randomblob(16))), id, 'likelihood', 3, 'Possible', 'Occurs occasionally, 3-5 times per year' FROM organizations
UNION ALL
SELECT lower(hex(randomblob(16))), id, 'likelihood', 4, 'Likely', 'Occurs frequently, 6-10 times per year' FROM organizations
UNION ALL
SELECT lower(hex(randomblob(16))), id, 'likelihood', 5, 'Almost Certain', 'Occurs very frequently, more than 10 times per year' FROM organizations
UNION ALL
SELECT lower(hex(randomblob(16))), id, 'impact', 1, 'Negligible', 'Minor inconvenience, no business impact' FROM organizations
UNION ALL
SELECT lower(hex(randomblob(16))), id, 'impact', 2, 'Minor', 'Limited business impact, easily recoverable' FROM organizations
UNION ALL
SELECT lower(hex(randomblob(16))), id, 'impact', 3, 'Moderate', 'Significant business impact, requires recovery effort' FROM organizations
UNION ALL
SELECT lower(hex(randomblob(16))), id, 'impact', 4, 'Major', 'Severe business impact, extended recovery time' FROM organizations
UNION ALL
SELECT lower(hex(randomblob(16))), id, 'impact', 5, 'Catastrophic', 'Enterprise-wide outage, critical business failure' FROM organizations;
```

## Verification

After migration, verify:

```sql
-- Check systems have owner_role
SELECT COUNT(*) FROM systems WHERE owner_role IS NULL OR owner_role = '';

-- Check assets have criticality and business_function
SELECT COUNT(*) FROM assets WHERE criticality IS NULL OR business_function IS NULL;

-- Check risks have risk_id, impact_type
SELECT COUNT(*) FROM cyber_risks WHERE risk_id IS NULL OR impact_type IS NULL;

-- Check scoring scales exist
SELECT COUNT(*) FROM risk_scoring_scales WHERE organization_id IN (SELECT id FROM organizations);

-- Check appetite has objective
SELECT COUNT(*) FROM risk_appetite WHERE objective IS NULL OR objective = '';
```

All counts should be 0.

