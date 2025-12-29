import api from './api';
import { RiskCategory } from './risks';

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

export interface CreateAppetiteDTO {
  objective: string;
  category: RiskCategory;
  statement: string;
  tolerance_threshold: number;
}

export const appetiteApi = {
  async list(category?: RiskCategory): Promise<{ appetites: RiskAppetite[] }> {
    const { data } = await api.get('/appetite', { params: { category } });
    return data;
  },

  async get(id: string): Promise<{ appetite: RiskAppetite }> {
    const { data } = await api.get(`/appetite/${id}`);
    return data;
  },

  async create(appetite: CreateAppetiteDTO): Promise<{ appetite: RiskAppetite }> {
    const { data } = await api.post('/appetite', appetite);
    return data;
  },

  async update(id: string, appetite: Partial<CreateAppetiteDTO>): Promise<{ appetite: RiskAppetite }> {
    const { data } = await api.put(`/appetite/${id}`, appetite);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/appetite/${id}`);
  },

  async getActiveBreaches(): Promise<{ breaches: AppetiteBreach[] }> {
    const { data } = await api.get('/appetite/breaches/active');
    return data;
  },

  async checkBreaches(category?: RiskCategory): Promise<{ breaches: AppetiteBreach[] }> {
    const { data } = await api.post('/appetite/breaches/check', { category });
    return data;
  },

  async acknowledgeBreach(breachId: string): Promise<{ success: boolean }> {
    const { data } = await api.post(`/appetite/breaches/${breachId}/acknowledge`);
    return data;
  },

  async resolveBreach(breachId: string): Promise<{ success: boolean }> {
    const { data } = await api.post(`/appetite/breaches/${breachId}/resolve`);
    return data;
  },
};

