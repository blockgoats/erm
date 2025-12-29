import api from './api';
import { RiskCategory } from './risks';

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

export interface EnterpriseRiskFilters {
  category?: RiskCategory;
  min_exposure?: number;
  max_exposure?: number;
}

export const enterpriseRisksApi = {
  async list(filters?: EnterpriseRiskFilters): Promise<{ risks: EnterpriseRisk[] }> {
    const { data } = await api.get('/enterprise-risks', { params: filters });
    return data;
  },

  async get(id: string): Promise<{ risk: EnterpriseRisk; components: any[] }> {
    const { data } = await api.get(`/enterprise-risks/${id}`);
    return data;
  },

  async refresh(): Promise<{ risks: EnterpriseRisk[] }> {
    const { data } = await api.post('/enterprise-risks/refresh');
    return data;
  },
};

