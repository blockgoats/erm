// User & Role Types
export type UserRole = 'admin' | 'risk_manager' | 'risk_owner' | 'executive' | 'auditor';

export interface User {
  id: string;
  email: string;
  fullName: string;
  organizationId: string;
  roles: UserRole[];
}

// Risk Types
export interface CyberRisk {
  id: string;
  organizationId: string;
  businessUnitId?: string;
  systemId?: string;
  assetId?: string;
  title: string;
  description: string;
  threat: string;
  vulnerability: string;
  impactDescription: string;
  likelihood: 1 | 2 | 3 | 4 | 5;
  impact: 1 | 2 | 3 | 4 | 5;
  exposure: number; // likelihood × impact
  category: string;
  status: 'identified' | 'assessed' | 'treated' | 'monitored' | 'closed';
  ownerId?: string;
  ownerName?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
  nextReviewAt?: string;
}

export interface EnterpriseRisk {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  aggregatedExposure: number;
  category: string;
  priorityRank?: number;
  status: 'active' | 'mitigated' | 'accepted';
  createdAt: string;
  updatedAt: string;
  componentRiskIds: string[];
}

export interface RiskAppetite {
  id: string;
  organizationId: string;
  category: string;
  statement: string;
  toleranceThreshold: number;
  createdAt: string;
  updatedAt: string;
}

export interface AppetiteBreach {
  id: string;
  appetiteId: string;
  riskId?: string;
  enterpriseRiskId?: string;
  breachValue: number;
  thresholdValue: number;
  detectedAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
}

export interface RiskHistory {
  id: string;
  riskId: string;
  changedBy: string;
  changeType: string;
  oldValue?: string;
  newValue?: string;
  createdAt: string;
}

export interface Evidence {
  id: string;
  riskId: string;
  fileName: string;
  filePath: string;
  fileType?: string;
  uploadedBy: string;
  createdAt: string;
}

// UI State Types
export interface AppState {
  user: User | null;
  selectedOrganizationId: string | null;
  viewMode: 'system' | 'organization' | 'enterprise';
}

