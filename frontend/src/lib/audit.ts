import api from './api';

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

export interface AuditFilters {
  user_id?: string;
  resource_type?: string;
  resource_id?: string;
  action?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
}

export const auditApi = {
  async list(filters?: AuditFilters): Promise<{ logs: AuditLog[] }> {
    const { data } = await api.get('/audit', { params: filters });
    return data;
  },

  async get(id: string): Promise<{ log: AuditLog }> {
    const { data } = await api.get(`/audit/${id}`);
    return data;
  },
};

