import api from './api';

export interface BoardReportData {
  generated_at: string;
  organization_name: string;
  period: string;
  top_risks: Array<{
    rank: number;
    title: string;
    category: string;
    exposure: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  appetite_breaches: Array<{
    category: string;
    breach_value: number;
    threshold: number;
    risk_title: string;
  }>;
  summary: {
    total_risks: number;
    critical_risks: number;
    total_exposure: number;
    breaches_count: number;
  };
  conclusions: string[];
}

export const reportsApi = {
  async getBoardReport(period?: string): Promise<{ report: BoardReportData }> {
    const { data } = await api.get('/reports/board', { params: { period } });
    return data;
  },

  async exportPDF(period?: string): Promise<Blob> {
    const response = await api.get('/reports/board/pdf', {
      params: { period },
      responseType: 'blob',
    });
    return response.data;
  },
};

