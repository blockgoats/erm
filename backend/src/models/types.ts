// Core Entity Types

export interface Organization {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface BusinessUnit {
  id: string;
  organization_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface System {
  id: string;
  business_unit_id: string;
  name: string;
  description?: string;
  owner_role: string;
  created_at: string;
  updated_at: string;
}

export type AssetType = 'Application' | 'Database' | 'Cloud Service' | 'Infrastructure' | 'Network' | 'Other';
export type AssetCriticality = 'Low' | 'Medium' | 'High';

export interface Asset {
  id: string;
  system_id?: string;
  organization_id: string;
  name: string;
  asset_type: AssetType;
  criticality: AssetCriticality;
  business_function: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name?: string;
  organization_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
}

// Risk Types

export type RiskStatus = 'identified' | 'assessed' | 'treated' | 'accepted' | 'monitored' | 'closed';
export type RiskCategory = 'confidentiality' | 'integrity' | 'availability' | 'compliance' | 'reputation' | 'financial';
export type ResponseType = 'avoid' | 'mitigate' | 'transfer' | 'accept';

export type ImpactType = 'Financial' | 'Operational' | 'Reputational' | 'Compliance' | 'Strategic';

export interface CyberRisk {
  id: string;
  organization_id: string;
  business_unit_id?: string;
  system_id?: string;
  asset_id?: string;
  risk_id: string;
  title: string;
  description: string;
  threat: string;
  vulnerability: string;
  impact_description: string;
  impact_type: ImpactType;
  likelihood: number; // 1-5
  impact: number; // 1-5
  exposure: number; // computed: likelihood * impact
  category: RiskCategory;
  response_type?: ResponseType;
  owner_role?: string;
  status: RiskStatus;
  owner_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  reviewed_at?: string;
  next_review_at?: string;
}

export interface RiskResponse {
  id: string;
  risk_id: string;
  response_type: ResponseType;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface RiskHistory {
  id: string;
  risk_id: string;
  changed_by: string;
  change_type: string;
  old_value?: string;
  new_value?: string;
  created_at: string;
}

export interface EnterpriseRisk {
  id: string;
  organization_id: string;
  title: string;
  description: string;
  aggregated_exposure: number;
  category: RiskCategory;
  priority_rank?: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface RiskAppetite {
  id: string;
  organization_id: string;
  objective: string;
  category: RiskCategory;
  statement: string;
  tolerance_threshold: number;
  created_at: string;
  updated_at: string;
}

export interface RiskScoringScale {
  id: string;
  organization_id: string;
  scale_type: 'likelihood' | 'impact';
  level: number; // 1-5
  label: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface AppetiteBreach {
  id: string;
  appetite_id: string;
  risk_id?: string;
  enterprise_risk_id?: string;
  breach_value: number;
  threshold_value: number;
  detected_at: string;
  acknowledged_at?: string;
  resolved_at?: string;
}

export interface KRI {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  metric_type: string;
  threshold_min?: number;
  threshold_max?: number;
  target_value?: number;
  current_value?: number;
  status: 'green' | 'yellow' | 'red';
  linked_appetite_id?: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  organization_id?: string;
  user_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface Evidence {
  id: string;
  risk_id: string;
  file_name: string;
  file_path: string;
  file_type?: string;
  uploaded_by: string;
  created_at: string;
}

// DTOs for API

export interface CreateRiskDTO {
  risk_id?: string;
  title: string;
  description: string;
  threat: string;
  vulnerability: string;
  impact_description: string;
  impact_type: ImpactType;
  likelihood: number;
  impact: number;
  category: RiskCategory;
  response_type?: ResponseType;
  business_unit_id?: string;
  system_id?: string;
  asset_id?: string;
  owner_role?: string;
  owner_id?: string;
}

export interface UpdateRiskDTO {
  title?: string;
  description?: string;
  threat?: string;
  vulnerability?: string;
  impact_description?: string;
  impact_type?: ImpactType;
  likelihood?: number;
  impact?: number;
  category?: RiskCategory;
  status?: RiskStatus;
  response_type?: ResponseType;
  business_unit_id?: string;
  system_id?: string;
  asset_id?: string;
  owner_role?: string;
  owner_id?: string;
}

