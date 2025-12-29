import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';

export function initDatabase(dbPath: string): Database.Database {
  const db = new Database(dbPath);
  db.pragma('foreign_keys = ON');

  // Organizations & Tenancy
  db.exec(`
    CREATE TABLE IF NOT EXISTS organizations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS governance_committees (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      committee_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      committee_type TEXT CHECK (committee_type IN ('Board', 'Executive', 'Audit', 'Risk', 'Compliance', 'Other')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS raci_matrix (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      activity TEXT NOT NULL,
      resource_type TEXT NOT NULL,
      resource_id TEXT,
      responsible TEXT,
      accountable TEXT,
      consulted TEXT,
      informed TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS policy_hierarchy (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      policy_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      policy_type TEXT NOT NULL CHECK (policy_type IN ('Code of Conduct', 'Policy', 'Standard', 'Procedure', 'Guideline')),
      parent_policy_id TEXT,
      status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'under_review', 'approved', 'active', 'archived')),
      approved_by TEXT,
      approved_at TEXT,
      version TEXT NOT NULL DEFAULT '1.0',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
      FOREIGN KEY (parent_policy_id) REFERENCES policy_hierarchy(id) ON DELETE SET NULL,
      FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS attestations (
      id TEXT PRIMARY KEY,
      policy_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      attestation_status TEXT NOT NULL CHECK (attestation_status IN ('pending', 'acknowledged', 'declined')),
      attested_at TEXT,
      comments TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (policy_id) REFERENCES policy_hierarchy(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS business_units (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS systems (
      id TEXT PRIMARY KEY,
      business_unit_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      owner_role TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (business_unit_id) REFERENCES business_units(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS assets (
      id TEXT PRIMARY KEY,
      system_id TEXT,
      organization_id TEXT NOT NULL,
      name TEXT NOT NULL,
      asset_type TEXT NOT NULL CHECK (asset_type IN ('Application', 'Database', 'Cloud Service', 'Infrastructure', 'Network', 'Other')),
      criticality TEXT NOT NULL CHECK (criticality IN ('Low', 'Medium', 'High')),
      business_function TEXT NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (system_id) REFERENCES systems(id) ON DELETE SET NULL,
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
    );
  `);

  // Users & RBAC
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      full_name TEXT,
      organization_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS permissions (
      id TEXT PRIMARY KEY,
      resource TEXT NOT NULL,
      action TEXT NOT NULL,
      UNIQUE(resource, action)
    );

    CREATE TABLE IF NOT EXISTS role_permissions (
      role_id TEXT NOT NULL,
      permission_id TEXT NOT NULL,
      PRIMARY KEY (role_id, permission_id),
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
      FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_roles (
      user_id TEXT NOT NULL,
      role_id TEXT NOT NULL,
      organization_id TEXT,
      PRIMARY KEY (user_id, role_id, organization_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
    );
  `);

  // Cybersecurity Risk Register (CSRR)
  db.exec(`
    CREATE TABLE IF NOT EXISTS cyber_risks (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      business_unit_id TEXT,
      system_id TEXT,
      asset_id TEXT,
      risk_id TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      threat TEXT NOT NULL,
      vulnerability TEXT NOT NULL,
      impact_description TEXT NOT NULL,
      impact_type TEXT NOT NULL CHECK (impact_type IN ('Financial', 'Operational', 'Reputational', 'Compliance', 'Strategic')),
      likelihood INTEGER NOT NULL CHECK (likelihood >= 1 AND likelihood <= 5),
      impact INTEGER NOT NULL CHECK (impact >= 1 AND impact <= 5),
      exposure REAL NOT NULL,
      category TEXT NOT NULL,
      response_type TEXT CHECK (response_type IN ('avoid', 'mitigate', 'transfer', 'accept')),
      owner_role TEXT,
      owner_id TEXT,
      created_by TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      reviewed_at TEXT,
      next_review_at TEXT,
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
      FOREIGN KEY (business_unit_id) REFERENCES business_units(id) ON DELETE SET NULL,
      FOREIGN KEY (system_id) REFERENCES systems(id) ON DELETE SET NULL,
      FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE SET NULL,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS risk_responses (
      id TEXT PRIMARY KEY,
      risk_id TEXT NOT NULL,
      response_type TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'planned',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (risk_id) REFERENCES cyber_risks(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS treatment_plans (
      id TEXT PRIMARY KEY,
      risk_id TEXT NOT NULL,
      plan_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      response_type TEXT NOT NULL CHECK (response_type IN ('avoid', 'mitigate', 'transfer', 'accept')),
      owner_id TEXT,
      owner_role TEXT,
      status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'in_progress', 'completed', 'cancelled')),
      priority TEXT CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
      start_date TEXT,
      target_completion_date TEXT,
      actual_completion_date TEXT,
      budget_allocated REAL,
      residual_likelihood INTEGER CHECK (residual_likelihood >= 1 AND residual_likelihood <= 5),
      residual_impact INTEGER CHECK (residual_impact >= 1 AND residual_impact <= 5),
      residual_exposure REAL,
      decision_justification TEXT,
      approved_by TEXT,
      approved_at TEXT,
      created_by TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (risk_id) REFERENCES cyber_risks(id) ON DELETE CASCADE,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS treatment_plan_tasks (
      id TEXT PRIMARY KEY,
      treatment_plan_id TEXT NOT NULL,
      task_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      assigned_to TEXT,
      status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'blocked')),
      due_date TEXT,
      completed_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (treatment_plan_id) REFERENCES treatment_plans(id) ON DELETE CASCADE,
      FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS treatment_approvals (
      id TEXT PRIMARY KEY,
      treatment_plan_id TEXT NOT NULL,
      approver_id TEXT NOT NULL,
      approval_status TEXT NOT NULL CHECK (approval_status IN ('pending', 'approved', 'rejected')),
      comments TEXT,
      approved_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (treatment_plan_id) REFERENCES treatment_plans(id) ON DELETE CASCADE,
      FOREIGN KEY (approver_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS risk_history (
      id TEXT PRIMARY KEY,
      risk_id TEXT NOT NULL,
      changed_by TEXT NOT NULL,
      change_type TEXT NOT NULL,
      old_value TEXT,
      new_value TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (risk_id) REFERENCES cyber_risks(id) ON DELETE CASCADE,
      FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS evidence (
      id TEXT PRIMARY KEY,
      risk_id TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_type TEXT,
      uploaded_by TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (risk_id) REFERENCES cyber_risks(id) ON DELETE CASCADE,
      FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Enterprise Risk Register (ERR)
  db.exec(`
    CREATE TABLE IF NOT EXISTS enterprise_risks (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      aggregated_exposure REAL NOT NULL,
      category TEXT NOT NULL,
      priority_rank INTEGER,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS enterprise_risk_components (
      enterprise_risk_id TEXT NOT NULL,
      cyber_risk_id TEXT NOT NULL,
      PRIMARY KEY (enterprise_risk_id, cyber_risk_id),
      FOREIGN KEY (enterprise_risk_id) REFERENCES enterprise_risks(id) ON DELETE CASCADE,
      FOREIGN KEY (cyber_risk_id) REFERENCES cyber_risks(id) ON DELETE CASCADE
    );
  `);

  // Risk Appetite & Tolerance
  db.exec(`
    CREATE TABLE IF NOT EXISTS risk_appetite (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      objective TEXT NOT NULL,
      category TEXT NOT NULL,
      statement TEXT NOT NULL,
      tolerance_threshold REAL NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
    );

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

    CREATE TABLE IF NOT EXISTS risk_taxonomies (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      taxonomy_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      parent_id TEXT,
      level INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
      FOREIGN KEY (parent_id) REFERENCES risk_taxonomies(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS risk_frameworks (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      framework_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      version TEXT NOT NULL DEFAULT '1.0',
      is_active BOOLEAN NOT NULL DEFAULT 1,
      scoring_formula TEXT NOT NULL DEFAULT 'likelihood * impact',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS risk_framework_history (
      id TEXT PRIMARY KEY,
      framework_id TEXT NOT NULL,
      version TEXT NOT NULL,
      changes TEXT,
      changed_by TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (framework_id) REFERENCES risk_frameworks(id) ON DELETE CASCADE,
      FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS appetite_breaches (
      id TEXT PRIMARY KEY,
      appetite_id TEXT NOT NULL,
      risk_id TEXT,
      enterprise_risk_id TEXT,
      breach_value REAL NOT NULL,
      threshold_value REAL NOT NULL,
      detected_at TEXT NOT NULL DEFAULT (datetime('now')),
      acknowledged_at TEXT,
      resolved_at TEXT,
      FOREIGN KEY (appetite_id) REFERENCES risk_appetite(id) ON DELETE CASCADE,
      FOREIGN KEY (risk_id) REFERENCES cyber_risks(id) ON DELETE SET NULL,
      FOREIGN KEY (enterprise_risk_id) REFERENCES enterprise_risks(id) ON DELETE SET NULL
    );
  `);

  // Key Risk Indicators (KRIs)
  db.exec(`
    CREATE TABLE IF NOT EXISTS kris (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      metric_type TEXT NOT NULL,
      threshold_min REAL,
      threshold_max REAL,
      target_value REAL,
      current_value REAL,
      status TEXT NOT NULL DEFAULT 'green',
      linked_appetite_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
      FOREIGN KEY (linked_appetite_id) REFERENCES risk_appetite(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS kri_history (
      id TEXT PRIMARY KEY,
      kri_id TEXT NOT NULL,
      value REAL NOT NULL,
      status TEXT NOT NULL,
      recorded_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (kri_id) REFERENCES kris(id) ON DELETE CASCADE
    );
  `);

  // Audit Logs
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      organization_id TEXT,
      user_id TEXT,
      action TEXT NOT NULL,
      resource_type TEXT NOT NULL,
      resource_id TEXT,
      details TEXT,
      ip_address TEXT,
      user_agent TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );
  `);

  // Controls & Internal Audit (Chapter 8)
  db.exec(`
    CREATE TABLE IF NOT EXISTS controls (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      control_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      control_type TEXT NOT NULL CHECK (control_type IN ('Preventive', 'Detective', 'Corrective', 'Compensating')),
      control_category TEXT NOT NULL CHECK (control_category IN ('Technical', 'Administrative', 'Physical')),
      framework TEXT,
      owner_id TEXT,
      owner_role TEXT,
      effectiveness_rating TEXT CHECK (effectiveness_rating IN ('Effective', 'Partially Effective', 'Ineffective', 'Not Assessed')),
      last_assessed_at TEXT,
      next_assessment_at TEXT,
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deprecated')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS risk_control_mappings (
      id TEXT PRIMARY KEY,
      risk_id TEXT,
      enterprise_risk_id TEXT,
      control_id TEXT NOT NULL,
      mapping_type TEXT NOT NULL CHECK (mapping_type IN ('mitigates', 'monitors', 'detects')),
      effectiveness TEXT CHECK (effectiveness IN ('High', 'Medium', 'Low')),
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (risk_id) REFERENCES cyber_risks(id) ON DELETE CASCADE,
      FOREIGN KEY (enterprise_risk_id) REFERENCES enterprise_risks(id) ON DELETE CASCADE,
      FOREIGN KEY (control_id) REFERENCES controls(id) ON DELETE CASCADE,
      CHECK ((risk_id IS NOT NULL) OR (enterprise_risk_id IS NOT NULL))
    );

    CREATE TABLE IF NOT EXISTS audit_findings (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      control_id TEXT,
      finding_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      severity TEXT NOT NULL CHECK (severity IN ('Critical', 'High', 'Medium', 'Low')),
      status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'accepted')),
      assigned_to TEXT,
      due_date TEXT,
      resolved_at TEXT,
      resolution_notes TEXT,
      created_by TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
      FOREIGN KEY (control_id) REFERENCES controls(id) ON DELETE SET NULL,
      FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS control_assessments (
      id TEXT PRIMARY KEY,
      control_id TEXT NOT NULL,
      assessed_by TEXT NOT NULL,
      assessment_date TEXT NOT NULL DEFAULT (datetime('now')),
      effectiveness_rating TEXT NOT NULL CHECK (effectiveness_rating IN ('Effective', 'Partially Effective', 'Ineffective')),
      design_rating TEXT CHECK (design_rating IN ('Well Designed', 'Adequately Designed', 'Poorly Designed')),
      operating_effectiveness TEXT CHECK (operating_effectiveness IN ('Effective', 'Partially Effective', 'Ineffective')),
      notes TEXT,
      evidence_attached TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (control_id) REFERENCES controls(id) ON DELETE CASCADE,
      FOREIGN KEY (assessed_by) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Workflow Engine (Chapter X)
  db.exec(`
    CREATE TABLE IF NOT EXISTS workflows (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      workflow_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      trigger_type TEXT NOT NULL CHECK (trigger_type IN ('risk_created', 'risk_updated', 'treatment_submitted', 'finding_created', 'appetite_breach', 'manual')),
      trigger_conditions TEXT,
      enabled BOOLEAN NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS workflow_steps (
      id TEXT PRIMARY KEY,
      workflow_id TEXT NOT NULL,
      step_order INTEGER NOT NULL,
      step_type TEXT NOT NULL CHECK (step_type IN ('approval', 'notification', 'escalation', 'sla_timer', 'action')),
      name TEXT NOT NULL,
      config TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS workflow_approvers (
      id TEXT PRIMARY KEY,
      workflow_step_id TEXT NOT NULL,
      approver_type TEXT NOT NULL CHECK (approver_type IN ('user', 'role', 'dynamic')),
      approver_id TEXT,
      approver_role TEXT,
      approval_type TEXT NOT NULL CHECK (approval_type IN ('any', 'all', 'sequential')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (workflow_step_id) REFERENCES workflow_steps(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS workflow_instances (
      id TEXT PRIMARY KEY,
      workflow_id TEXT NOT NULL,
      resource_type TEXT NOT NULL,
      resource_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'cancelled', 'failed')),
      current_step_id TEXT,
      started_at TEXT NOT NULL DEFAULT (datetime('now')),
      completed_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE,
      FOREIGN KEY (current_step_id) REFERENCES workflow_steps(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS workflow_step_executions (
      id TEXT PRIMARY KEY,
      workflow_instance_id TEXT NOT NULL,
      workflow_step_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped', 'failed')),
      started_at TEXT,
      completed_at TEXT,
      result_data TEXT,
      error_message TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (workflow_instance_id) REFERENCES workflow_instances(id) ON DELETE CASCADE,
      FOREIGN KEY (workflow_step_id) REFERENCES workflow_steps(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS workflow_approvals (
      id TEXT PRIMARY KEY,
      workflow_step_execution_id TEXT NOT NULL,
      approver_id TEXT NOT NULL,
      approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
      comments TEXT,
      approved_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (workflow_step_execution_id) REFERENCES workflow_step_executions(id) ON DELETE CASCADE,
      FOREIGN KEY (approver_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sla_timers (
      id TEXT PRIMARY KEY,
      workflow_step_execution_id TEXT NOT NULL,
      duration_hours INTEGER NOT NULL,
      start_time TEXT NOT NULL DEFAULT (datetime('now')),
      end_time TEXT,
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'completed')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (workflow_step_execution_id) REFERENCES workflow_step_executions(id) ON DELETE CASCADE
    );
  `);

  // Compliance Mapping (Chapter 9)
  db.exec(`
    CREATE TABLE IF NOT EXISTS compliance_frameworks (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      framework_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      framework_type TEXT NOT NULL CHECK (framework_type IN ('NIST', 'ISO', 'COSO', 'SOX', 'GDPR', 'HIPAA', 'PCI-DSS', 'Other')),
      version TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS compliance_requirements (
      id TEXT PRIMARY KEY,
      framework_id TEXT NOT NULL,
      requirement_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      requirement_type TEXT CHECK (requirement_type IN ('Control', 'Policy', 'Standard', 'Procedure')),
      parent_requirement_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (framework_id) REFERENCES compliance_frameworks(id) ON DELETE CASCADE,
      FOREIGN KEY (parent_requirement_id) REFERENCES compliance_requirements(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS compliance_control_mappings (
      id TEXT PRIMARY KEY,
      requirement_id TEXT NOT NULL,
      control_id TEXT NOT NULL,
      mapping_type TEXT NOT NULL CHECK (mapping_type IN ('fully_implements', 'partially_implements', 'supports')),
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (requirement_id) REFERENCES compliance_requirements(id) ON DELETE CASCADE,
      FOREIGN KEY (control_id) REFERENCES controls(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS compliance_evidence_mappings (
      id TEXT PRIMARY KEY,
      requirement_id TEXT NOT NULL,
      evidence_id TEXT NOT NULL,
      evidence_type TEXT CHECK (evidence_type IN ('document', 'test_result', 'audit_finding', 'certification')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (requirement_id) REFERENCES compliance_requirements(id) ON DELETE CASCADE,
      FOREIGN KEY (evidence_id) REFERENCES evidence(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS compliance_coverage (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      framework_id TEXT NOT NULL,
      total_requirements INTEGER NOT NULL DEFAULT 0,
      mapped_requirements INTEGER NOT NULL DEFAULT 0,
      fully_covered INTEGER NOT NULL DEFAULT 0,
      partially_covered INTEGER NOT NULL DEFAULT 0,
      uncovered INTEGER NOT NULL DEFAULT 0,
      coverage_percentage REAL NOT NULL DEFAULT 0,
      last_calculated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
      FOREIGN KEY (framework_id) REFERENCES compliance_frameworks(id) ON DELETE CASCADE
    );
  `);

  // Performance & Maturity (Chapter 12)
  db.exec(`
    CREATE TABLE IF NOT EXISTS maturity_assessments (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      assessment_id TEXT NOT NULL,
      assessment_type TEXT NOT NULL CHECK (assessment_type IN ('Self-Assessment', 'Internal Audit', 'External Audit', 'Peer Review')),
      assessed_by TEXT NOT NULL,
      assessment_date TEXT NOT NULL,
      overall_score REAL NOT NULL CHECK (overall_score >= 0 AND overall_score <= 5),
      maturity_level TEXT NOT NULL CHECK (maturity_level IN ('Initial', 'Managed', 'Defined', 'Quantitatively Managed', 'Optimizing')),
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
      FOREIGN KEY (assessed_by) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS domain_scores (
      id TEXT PRIMARY KEY,
      assessment_id TEXT NOT NULL,
      domain TEXT NOT NULL,
      score REAL NOT NULL CHECK (score >= 0 AND score <= 5),
      maturity_level TEXT NOT NULL CHECK (maturity_level IN ('Initial', 'Managed', 'Defined', 'Quantitatively Managed', 'Optimizing')),
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (assessment_id) REFERENCES maturity_assessments(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS risk_reduction_metrics (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      metric_id TEXT NOT NULL,
      period_start TEXT NOT NULL,
      period_end TEXT NOT NULL,
      baseline_exposure REAL NOT NULL,
      current_exposure REAL NOT NULL,
      risk_reduction_percentage REAL NOT NULL,
      risks_addressed INTEGER NOT NULL DEFAULT 0,
      risks_mitigated INTEGER NOT NULL DEFAULT 0,
      risks_accepted INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS appetite_adherence_metrics (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      category TEXT NOT NULL,
      period_start TEXT NOT NULL,
      period_end TEXT NOT NULL,
      total_breaches INTEGER NOT NULL DEFAULT 0,
      breaches_acknowledged INTEGER NOT NULL DEFAULT 0,
      breaches_resolved INTEGER NOT NULL DEFAULT 0,
      adherence_percentage REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
    );

    -- Document Intelligence (PDF Processing)
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_hash TEXT NOT NULL,
      file_type TEXT NOT NULL,
      document_type TEXT CHECK (document_type IN ('compliance_report', 'audit_finding', 'contract', 'policy', 'risk_assessment', 'other')),
      version_number INTEGER NOT NULL DEFAULT 1,
      parent_document_id TEXT,
      uploaded_by TEXT NOT NULL,
      processing_status TEXT NOT NULL DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
      processing_error TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
      FOREIGN KEY (parent_document_id) REFERENCES documents(id) ON DELETE SET NULL,
      FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS extracted_clauses (
      id TEXT PRIMARY KEY,
      document_id TEXT NOT NULL,
      clause_text TEXT NOT NULL,
      clause_number TEXT,
      clause_type TEXT CHECK (clause_type IN ('obligation', 'prohibition', 'penalty', 'condition', 'right', 'definition', 'other')),
      confidence_score REAL NOT NULL DEFAULT 0.5 CHECK (confidence_score >= 0 AND confidence_score <= 1),
      requires_review BOOLEAN NOT NULL DEFAULT 1,
      reviewed_by TEXT,
      reviewed_at TEXT,
      review_status TEXT CHECK (review_status IN ('pending', 'approved', 'rejected', 'modified')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
      FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS compliance_obligations (
      id TEXT PRIMARY KEY,
      document_id TEXT NOT NULL,
      clause_id TEXT,
      risk_id TEXT,
      obligation_text TEXT NOT NULL,
      extracted_action TEXT,
      deadline_date TEXT,
      owner_role TEXT,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue', 'cancelled')),
      evidence_required BOOLEAN NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
      FOREIGN KEY (clause_id) REFERENCES extracted_clauses(id) ON DELETE SET NULL,
      FOREIGN KEY (risk_id) REFERENCES cyber_risks(id) ON DELETE SET NULL
    );
  `);

  // Initialize default roles and permissions
  initDefaultRoles(db);
  initDefaultPermissions(db);

  return db;
}

function initDefaultRoles(db: Database.Database) {
  const roles = [
    { id: 'admin', name: 'Administrator', description: 'Full system access' },
    { id: 'risk_manager', name: 'Risk Manager', description: 'Manage risks and assessments' },
    { id: 'risk_owner', name: 'Risk Owner', description: 'Own and respond to assigned risks' },
    { id: 'executive', name: 'Executive', description: 'View dashboards and reports' },
    { id: 'auditor', name: 'Auditor', description: 'Read-only access for audit purposes' },
  ];

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO roles (id, name, description) VALUES (?, ?, ?)
  `);

  for (const role of roles) {
    stmt.run(role.id, role.name, role.description);
  }
}

function initDefaultPermissions(db: Database.Database) {
  const permissions = [
    { id: 'users:read', resource: 'users', action: 'read' },
    { id: 'users:write', resource: 'users', action: 'write' },
    { id: 'risks:read', resource: 'risks', action: 'read' },
    { id: 'risks:write', resource: 'risks', action: 'write' },
    { id: 'risks:delete', resource: 'risks', action: 'delete' },
    { id: 'enterprise_risks:read', resource: 'enterprise_risks', action: 'read' },
    { id: 'enterprise_risks:write', resource: 'enterprise_risks', action: 'write' },
    { id: 'appetite:read', resource: 'appetite', action: 'read' },
    { id: 'appetite:write', resource: 'appetite', action: 'write' },
    { id: 'kri:read', resource: 'kri', action: 'read' },
    { id: 'kri:write', resource: 'kri', action: 'write' },
    { id: 'reports:read', resource: 'reports', action: 'read' },
    { id: 'reports:export', resource: 'reports', action: 'export' },
  ];

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO permissions (id, resource, action) VALUES (?, ?, ?)
  `);

  for (const perm of permissions) {
    stmt.run(perm.id, perm.resource, perm.action);
  }

  // Assign permissions to roles
  const rolePerms = [
    // Admin gets everything
    ['admin', 'users:read'], ['admin', 'users:write'],
    ['admin', 'risks:read'], ['admin', 'risks:write'], ['admin', 'risks:delete'],
    ['admin', 'enterprise_risks:read'], ['admin', 'enterprise_risks:write'],
    ['admin', 'appetite:read'], ['admin', 'appetite:write'],
    ['admin', 'kri:read'], ['admin', 'kri:write'],
    ['admin', 'reports:read'], ['admin', 'reports:export'],
    // Risk Manager
    ['risk_manager', 'risks:read'], ['risk_manager', 'risks:write'],
    ['risk_manager', 'enterprise_risks:read'], ['risk_manager', 'enterprise_risks:write'],
    ['risk_manager', 'appetite:read'], ['risk_manager', 'appetite:write'],
    ['risk_manager', 'kri:read'], ['risk_manager', 'kri:write'],
    ['risk_manager', 'reports:read'], ['risk_manager', 'reports:export'],
    // Risk Owner
    ['risk_owner', 'risks:read'], ['risk_owner', 'risks:write'],
    ['risk_owner', 'reports:read'],
    // Executive
    ['executive', 'risks:read'], ['executive', 'enterprise_risks:read'],
    ['executive', 'appetite:read'], ['executive', 'kri:read'],
    ['executive', 'reports:read'], ['executive', 'reports:export'],
    // Auditor
    ['auditor', 'risks:read'], ['auditor', 'enterprise_risks:read'],
    ['auditor', 'appetite:read'], ['auditor', 'kri:read'],
    ['auditor', 'reports:read'],
  ];

  const rolePermStmt = db.prepare(`
    INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
    VALUES (?, ?)
  `);

  for (const [roleId, permId] of rolePerms) {
    rolePermStmt.run(roleId, permId);
  }
}

