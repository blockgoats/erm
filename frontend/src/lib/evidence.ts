import api from './api';

export interface Evidence {
  id: string;
  risk_id: string;
  file_name: string;
  file_path: string;
  file_type?: string;
  uploaded_by: string;
  created_at: string;
}

export const evidenceApi = {
  async list(riskId: string): Promise<{ evidence: Evidence[] }> {
    const { data } = await api.get(`/evidence/risk/${riskId}`);
    return data;
  },

  async upload(riskId: string, file: File): Promise<{ evidence: Evidence }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('risk_id', riskId);

    const { data } = await api.post('/evidence', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  async download(id: string): Promise<Blob> {
    const response = await api.get(`/evidence/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/evidence/${id}`);
  },
};

