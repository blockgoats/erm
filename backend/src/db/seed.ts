import { getDatabase } from './index.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Day-1 Seed Data
 * Minimum dataset to launch and sell per NIST IR 8286 requirements
 */

export function seedDay1Data() {
  const db = getDatabase();

  // 1. Organization & Structure Data
  const orgId = uuidv4();
  db.prepare(`
    INSERT INTO organizations (id, name) VALUES (?, ?)
  `).run(orgId, 'Acme Corp');

  // Business Units
  const paymentsBuId = uuidv4();
  const hrBuId = uuidv4();
  const itBuId = uuidv4();

  db.prepare(`
    INSERT INTO business_units (id, organization_id, name) VALUES (?, ?, ?)
  `).run(paymentsBuId, orgId, 'Payments');
  
  db.prepare(`
    INSERT INTO business_units (id, organization_id, name) VALUES (?, ?, ?)
  `).run(hrBuId, orgId, 'Human Resources');
  
  db.prepare(`
    INSERT INTO business_units (id, organization_id, name) VALUES (?, ?, ?)
  `).run(itBuId, orgId, 'IT Operations');

  // Systems with Owner Roles
  const paymentGatewayId = uuidv4();
  const hrSystemId = uuidv4();
  const customerDbId = uuidv4();

  db.prepare(`
    INSERT INTO systems (id, business_unit_id, name, description, owner_role) 
    VALUES (?, ?, ?, ?, ?)
  `).run(paymentGatewayId, paymentsBuId, 'Payment Gateway', 'Core payment processing system', 'IT Ops Lead');

  db.prepare(`
    INSERT INTO systems (id, business_unit_id, name, description, owner_role) 
    VALUES (?, ?, ?, ?, ?)
  `).run(hrSystemId, hrBuId, 'HR Management System', 'Employee data and payroll system', 'HR Director');

  db.prepare(`
    INSERT INTO systems (id, business_unit_id, name, description, owner_role) 
    VALUES (?, ?, ?, ?, ?)
  `).run(customerDbId, paymentsBuId, 'Customer Database', 'Primary customer data repository', 'Data Protection Officer');

  // Assets (High-Level Only - Not CMDB)
  const paymentAppId = uuidv4();
  const customerDbAssetId = uuidv4();
  const cloudStorageId = uuidv4();

  db.prepare(`
    INSERT INTO assets (id, system_id, organization_id, name, asset_type, criticality, business_function, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    paymentAppId,
    paymentGatewayId,
    orgId,
    'Payment Processing Application',
    'Application',
    'High',
    'Process customer payments and transactions',
    'Core payment processing application'
  );

  db.prepare(`
    INSERT INTO assets (id, system_id, organization_id, name, asset_type, criticality, business_function, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    customerDbAssetId,
    customerDbId,
    orgId,
    'Customer PII Database',
    'Database',
    'High',
    'Store and manage customer personal information',
    'Primary database containing customer PII'
  );

  db.prepare(`
    INSERT INTO assets (id, system_id, organization_id, name, asset_type, criticality, business_function, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    cloudStorageId,
    null,
    orgId,
    'Cloud Storage Service',
    'Cloud Service',
    'Medium',
    'Store backup and archive data',
    'AWS S3 bucket for data backups'
  );

  // 2. Risk Scoring Scales Configuration
  const likelihoodScales = [
    { level: 1, label: 'Rare', description: 'Occurs very rarely, less than once per year' },
    { level: 2, label: 'Unlikely', description: 'Occurs infrequently, 1-2 times per year' },
    { level: 3, label: 'Possible', description: 'Occurs occasionally, 3-5 times per year' },
    { level: 4, label: 'Likely', description: 'Occurs frequently, 6-10 times per year' },
    { level: 5, label: 'Almost Certain', description: 'Occurs very frequently, more than 10 times per year' },
  ];

  const impactScales = [
    { level: 1, label: 'Negligible', description: 'Minor inconvenience, no business impact' },
    { level: 2, label: 'Minor', description: 'Limited business impact, easily recoverable' },
    { level: 3, label: 'Moderate', description: 'Significant business impact, requires recovery effort' },
    { level: 4, label: 'Major', description: 'Severe business impact, extended recovery time' },
    { level: 5, label: 'Catastrophic', description: 'Enterprise-wide outage, critical business failure' },
  ];

  const scaleStmt = db.prepare(`
    INSERT INTO risk_scoring_scales (id, organization_id, scale_type, level, label, description)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const scale of likelihoodScales) {
    scaleStmt.run(uuidv4(), orgId, 'likelihood', scale.level, scale.label, scale.description);
  }

  for (const scale of impactScales) {
    scaleStmt.run(uuidv4(), orgId, 'impact', scale.level, scale.label, scale.description);
  }

  // 3. Risk Appetite & Tolerance Statements
  const appetiteStmt = db.prepare(`
    INSERT INTO risk_appetite (id, organization_id, objective, category, statement, tolerance_threshold)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  appetiteStmt.run(
    uuidv4(),
    orgId,
    'Availability',
    'Availability',
    'The organization has high appetite for availability. Critical systems must maintain 99.9% uptime. Tolerance threshold: ≤ 5 minutes downtime during business hours.',
    5.0
  );

  appetiteStmt.run(
    uuidv4(),
    orgId,
    'Data Protection',
    'Confidentiality',
    'The organization has zero tolerance for data breaches involving customer PII. Any risk with exposure greater than 12 requires immediate executive escalation and treatment plan.',
    12.0
  );

  appetiteStmt.run(
    uuidv4(),
    orgId,
    'Operational Continuity',
    'Availability',
    'The organization accepts moderate operational disruption risks (exposure ≤ 10) for non-critical systems. Critical systems must maintain exposure below 8.',
    10.0
  );

  // 4. Cybersecurity Risk Register Data (CSRR) - NIST Table 1
  const riskStmt = db.prepare(`
    INSERT INTO cyber_risks (
      id, organization_id, business_unit_id, system_id, asset_id, risk_id,
      title, description, threat, vulnerability, impact_description, impact_type,
      likelihood, impact, exposure, category, response_type, owner_role, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Create a default user for created_by
  const defaultUserId = uuidv4();
  db.prepare(`
    INSERT INTO users (id, email, password_hash, full_name, organization_id)
    VALUES (?, ?, ?, ?, ?)
  `).run(defaultUserId, 'admin@acme.com', 'hashed_password', 'System Administrator', orgId);

  // Sample risks
  const risk1Id = uuidv4();
  riskStmt.run(
    risk1Id,
    orgId,
    paymentsBuId,
    paymentGatewayId,
    paymentAppId,
    'RISK-001',
    'Unauthorized Access to Payment Gateway',
    'Risk of external attacker gaining unauthorized access to payment processing system, leading to financial fraud and data breach',
    'External attacker',
    'Weak authentication mechanisms and insufficient access controls',
    'Financial loss up to $5M, operational disruption for 2-3 days, regulatory fines, reputation damage',
    'Financial',
    4,
    5,
    20.0,
    'Access Control',
    'mitigate',
    'IT Ops Lead',
    defaultUserId
  );

  const risk2Id = uuidv4();
  riskStmt.run(
    risk2Id,
    orgId,
    paymentsBuId,
    customerDbId,
    customerDbAssetId,
    'RISK-002',
    'Customer PII Data Breach',
    'Risk of unauthorized access to customer database resulting in exposure of personal identifiable information',
    'Malicious insider or external attacker',
    'Insufficient database access controls and lack of encryption at rest',
    'Regulatory fines up to $10M (GDPR), reputation damage, customer loss, legal liability',
    'Compliance',
    3,
    5,
    15.0,
    'Confidentiality',
    'mitigate',
    'Data Protection Officer',
    defaultUserId
  );

  const risk3Id = uuidv4();
  riskStmt.run(
    risk3Id,
    orgId,
    itBuId,
    null,
    cloudStorageId,
    'RISK-003',
    'Cloud Service Provider Outage',
    'Risk of cloud service provider experiencing extended outage, impacting backup and archive capabilities',
    'Cloud provider infrastructure failure',
    'Single cloud provider dependency, no multi-cloud strategy',
    'Inability to restore from backups for 24-48 hours, potential data loss, business continuity impact',
    'Operational',
    2,
    4,
    8.0,
    'Availability',
    'transfer',
    'IT Ops Lead',
    defaultUserId
  );

  console.log('✅ Day-1 seed data created successfully');
  console.log(`   Organization: Acme Corp (${orgId})`);
  console.log(`   Business Units: 3`);
  console.log(`   Systems: 3`);
  console.log(`   Assets: 3`);
  console.log(`   Risk Scoring Scales: 10 (5 likelihood + 5 impact)`);
  console.log(`   Risk Appetite Statements: 3`);
  console.log(`   Cybersecurity Risks: 3`);
}

