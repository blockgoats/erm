export interface RiskScenario {
  id: string;
  title: string;
  description: string;
  threat: string;
  vulnerability: string;
  asset: string;
  category: RiskCategory;
  likelihood: number; // 1-5
  impact: number; // 1-5
  exposure: number; // likelihood × impact
  riskOwner: string;
  lastReviewed: Date;
  nextReview: Date;
  status: RiskStatus;
  evidenceLinks: string[];
  mitigationActions: MitigationAction[];
  trend: 'up' | 'down' | 'stable';
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MitigationAction {
  id: string;
  description: string;
  owner: string;
  dueDate: Date;
  status: 'open' | 'in-progress' | 'completed';
  effectiveness: number; // 1-5
}

export type RiskCategory = 
  | 'Cyber Security'
  | 'Operational'
  | 'Financial'
  | 'Compliance'
  | 'Strategic'
  | 'Reputational';

export type RiskStatus = 'active' | 'mitigated' | 'accepted' | 'transferred';

export type RiskLevel = 'low' | 'medium' | 'high';

export interface RiskAppetite {
  category: RiskCategory;
  threshold: number;
  statement: string;
  breached: boolean;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  department: string;
}

export type UserRole = 'administrator' | 'risk-manager' | 'risk-owner' | 'executive' | 'auditor';

export interface AuditEntry {
  id: string;
  riskId: string;
  userId: string;
  action: string;
  timestamp: Date;
  details: Record<string, any>;
}

export interface BoardReport {
  id: string;
  title: string;
  period: string;
  generatedAt: Date;
  summary: string;
  keyFindings: string[];
  recommendations: string[];
  risks: RiskScenario[];
}