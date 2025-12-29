import api from './api';

export type ControlType = 'Preventive' | 'Detective' | 'Corrective' | 'Compensating';
export type ControlCategory = 'Technical' | 'Administrative' | 'Physical';
export type EffectivenessRating = 'Effective' | 'Partially Effective' | 'Ineffective' | 'Not Assessed';
export type ControlStatus = 'active' | 'inactive' | 'deprecated';
export type MappingType = 'mitigates' | 'monitors' | 'detects';
export type FindingSeverity = 'Critical' | 'High' | 'Medium' | 'Low';
export type FindingStatus = 'open' | 'in_progress' | 'resolved' | 'accepted';

export interface Control {
  id: string;
  organization_id: string;
  control_id: string;
  name: string;
  description?: string;
  control_type: ControlType;
  control_category: ControlCategory;
  framework?: string;
  owner_id?: string;
  owner_role?: string;
  effectiveness_rating?: EffectivenessRating;
  last_assessed_at?: string;
  next_assessment_at?: string;
  status: ControlStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateControlDTO {
  control_id?: string;
  name: string;
  description?: string;
  control_type: ControlType;
  control_category: ControlCategory;
  framework?: string;
  owner_id?: string;
  owner_role?: string;
  next_assessment_at?: string;
}

export interface RiskControlMapping {
  id: string;
  risk_id?: string;
  enterprise_risk_id?: string;
  control_id: string;
  mapping_type: MappingType;
  effectiveness?: 'High' | 'Medium' | 'Low';
  notes?: string;
  created_at: string;
}

export interface AuditFinding {
  id: string;
  organization_id: string;
  control_id?: string;
  finding_id: string;
  title: string;
  description: string;
  severity: FindingSeverity;
  status: FindingStatus;
  assigned_to?: string;
  due_date?: string;
  resolved_at?: string;
  resolution_notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ControlAssessment {
  id: string;
  control_id: string;
  assessed_by: string;
  assessment_date: string;
  effectiveness_rating: 'Effective' | 'Partially Effective' | 'Ineffective';
  design_rating?: 'Well Designed' | 'Adequately Designed' | 'Poorly Designed';
  operating_effectiveness?: 'Effective' | 'Partially Effective' | 'Ineffective';
  notes?: string;
  evidence_attached?: string;
  created_at: string;
}

export const controlsApi = {
  async list(filters?: any): Promise<{ controls: Control[] }> {
    const { data } = await api.get('/controls', { params: filters });
    return data;
  },

  async get(id: string): Promise<{ control: Control }> {
    const { data } = await api.get(`/controls/${id}`);
    return data;
  },

  async create(control: CreateControlDTO): Promise<{ control: Control }> {
    const { data } = await api.post('/controls', control);
    return data;
  },

  async update(id: string, control: Partial<CreateControlDTO>): Promise<{ control: Control }> {
    const { data } = await api.put(`/controls/${id}`, control);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/controls/${id}`);
  },

  // Mappings
  async createMapping(mapping: any): Promise<{ mapping: RiskControlMapping }> {
    const { data } = await api.post('/controls/mappings', mapping);
    return data;
  },

  async getMappingsForRisk(riskId: string): Promise<{ mappings: RiskControlMapping[] }> {
    const { data } = await api.get(`/controls/mappings/risk/${riskId}`);
    return data;
  },

  async getMappingsForEnterpriseRisk(enterpriseRiskId: string): Promise<{ mappings: RiskControlMapping[] }> {
    const { data } = await api.get(`/controls/mappings/enterprise-risk/${enterpriseRiskId}`);
    return data;
  },

  async deleteMapping(id: string): Promise<void> {
    await api.delete(`/controls/mappings/${id}`);
  },

  // Findings
  async createFinding(finding: any): Promise<{ finding: AuditFinding }> {
    const { data } = await api.post('/controls/findings', finding);
    return data;
  },

  async listFindings(filters?: any): Promise<{ findings: AuditFinding[] }> {
    const { data } = await api.get('/controls/findings', { params: filters });
    return data;
  },

  async updateFinding(id: string, finding: any): Promise<{ finding: AuditFinding }> {
    const { data } = await api.put(`/controls/findings/${id}`, finding);
    return data;
  },

  // Assessments
  async createAssessment(assessment: any): Promise<{ assessment: ControlAssessment }> {
    const { data } = await api.post('/controls/assessments', assessment);
    return data;
  },

  async getAssessmentsForControl(controlId: string): Promise<{ assessments: ControlAssessment[] }> {
    const { data } = await api.get(`/controls/assessments/control/${controlId}`);
    return data;
  },
};

