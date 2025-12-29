import api from './api';

export type RiskStatus = 'identified' | 'assessed' | 'treated' | 'accepted' | 'monitored' | 'closed';
export type RiskCategory = 'confidentiality' | 'integrity' | 'availability' | 'compliance' | 'reputation' | 'financial';

export type ImpactType = 'Financial' | 'Operational' | 'Reputational' | 'Compliance' | 'Strategic';
export type ResponseType = 'avoid' | 'mitigate' | 'transfer' | 'accept';

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
  likelihood: number;
  impact: number;
  exposure: number;
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

export interface RiskFilters {
  status?: RiskStatus;
  category?: RiskCategory;
  business_unit_id?: string;
  owner_id?: string;
  min_exposure?: number;
  max_exposure?: number;
}

export const risksApi = {
  async list(filters?: RiskFilters): Promise<{ risks: CyberRisk[] }> {
    const { data } = await api.get('/risks', { params: filters });
    return data;
  },

  async get(id: string): Promise<{ risk: CyberRisk }> {
    const { data } = await api.get(`/risks/${id}`);
    return data;
  },

  async create(risk: CreateRiskDTO): Promise<{ risk: CyberRisk }> {
    const { data } = await api.post('/risks', risk);
    return data;
  },

  async update(id: string, risk: Partial<CreateRiskDTO>): Promise<{ risk: CyberRisk }> {
    const { data } = await api.put(`/risks/${id}`, risk);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/risks/${id}`);
  },

  async getHistory(id: string): Promise<{ history: any[] }> {
    const { data } = await api.get(`/risks/${id}/history`);
    return data;
  },

  async bulkImport(risks: CreateRiskDTO[]): Promise<{ created: number; errors: string[] }> {
    const { data } = await api.post('/risks/bulk-import', { risks });
    return data;
  },
};

export const scoringApi = {
  async calculate(likelihood: number, impact: number): Promise<{ score: any }> {
    const { data } = await api.post('/scoring/calculate', { likelihood, impact });
    return data;
  },

  async getMatrix(): Promise<{ matrix: { matrix: number[][]; maxExposure: number } }> {
    const { data } = await api.get('/scoring/matrix');
    return data;
  },
};

