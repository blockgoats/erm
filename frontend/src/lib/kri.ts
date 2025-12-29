import api from './api';

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

export interface KRIHistory {
  id: string;
  kri_id: string;
  value: number;
  status: 'green' | 'yellow' | 'red';
  recorded_at: string;
}

export interface CreateKRIDTO {
  name: string;
  description?: string;
  metric_type: string;
  threshold_min?: number;
  threshold_max?: number;
  target_value?: number;
  linked_appetite_id?: string;
}

export interface KRIFilters {
  status?: 'green' | 'yellow' | 'red';
  linked_appetite_id?: string;
}

export const kriApi = {
  async list(filters?: KRIFilters): Promise<{ kris: KRI[] }> {
    const { data } = await api.get('/kri', { params: filters });
    return data;
  },

  async get(id: string): Promise<{ kri: KRI }> {
    const { data } = await api.get(`/kri/${id}`);
    return data;
  },

  async create(kri: CreateKRIDTO): Promise<{ kri: KRI }> {
    const { data } = await api.post('/kri', kri);
    return data;
  },

  async update(id: string, kri: Partial<CreateKRIDTO & { current_value?: number }>): Promise<{ kri: KRI }> {
    const { data } = await api.put(`/kri/${id}`, kri);
    return data;
  },

  async updateValue(id: string, value: number): Promise<{ kri: KRI }> {
    const { data } = await api.post(`/kri/${id}/value`, { value });
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/kri/${id}`);
  },

  async getHistory(id: string, limit?: number): Promise<{ history: KRIHistory[] }> {
    const { data } = await api.get(`/kri/${id}/history`, { params: { limit } });
    return data;
  },

  async getActiveBreaches(): Promise<{ kris: KRI[] }> {
    const { data } = await api.get('/kri/breaches/active');
    return data;
  },
};

