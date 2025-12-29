import api from './api';

export interface Document {
  id: string;
  organization_id: string;
  file_name: string;
  file_path: string;
  file_hash: string;
  file_type: string;
  document_type: 'compliance_report' | 'audit_finding' | 'contract' | 'policy' | 'risk_assessment' | 'other' | null;
  version_number: number;
  parent_document_id: string | null;
  uploaded_by: string;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  processing_error: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExtractedClause {
  id: string;
  document_id: string;
  clause_text: string;
  clause_number: string | null;
  clause_type: 'obligation' | 'prohibition' | 'penalty' | 'condition' | 'right' | 'definition' | 'other' | null;
  confidence_score: number;
  requires_review: boolean;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_status: 'pending' | 'approved' | 'rejected' | 'modified' | null;
  created_at: string;
}

export interface ExtractedRisk {
  title: string;
  description: string;
  threat: string;
  vulnerability: string;
  impact_description: string;
  category: string;
  likelihood: number;
  impact: number;
  source_clause: string;
  confidence: number;
  requires_review: boolean;
}

export interface DocumentProcessingResult {
  document: Document;
  extracted_risks: ExtractedRisk[];
  extracted_clauses: ExtractedClause[];
  created_risks: string[];
  review_queue_count: number;
}

export const documentsApi = {
  async list(): Promise<{ documents: Document[] }> {
    const { data } = await api.get('/documents');
    return data;
  },

  async get(id: string): Promise<{ document: Document }> {
    const { data } = await api.get(`/documents/${id}`);
    return data;
  },

  async upload(
    file: File,
    documentType?: 'compliance_report' | 'audit_finding' | 'contract' | 'policy' | 'risk_assessment' | 'other'
  ): Promise<{
    document: Document;
    processing_result: {
      extracted_risks_count: number;
      extracted_clauses_count: number;
      created_risks: string[];
      review_queue_count: number;
    };
  }> {
    const formData = new FormData();
    formData.append('file', file);
    if (documentType) {
      formData.append('document_type', documentType);
    }

    const { data } = await api.post('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  async getProcessingResult(id: string): Promise<{ processing_result: DocumentProcessingResult }> {
    const { data } = await api.get(`/documents/${id}/processing-result`);
    return data;
  },

  async getReviewQueue(): Promise<{ review_queue: ExtractedClause[] }> {
    const { data } = await api.get('/documents/review/queue');
    return data;
  },
};

