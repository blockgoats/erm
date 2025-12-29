/**
 * Document Upload Page
 * 
 * Upload compliance documents, audit reports, contracts, etc.
 * Automatically extracts risks and creates risk register entries.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { documentsApi, Document } from '../lib/documents';

export default function DocumentUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<'compliance_report' | 'audit_finding' | 'contract' | 'policy' | 'risk_assessment' | 'other' | ''>('');
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    document: Document;
    extracted_risks_count: number;
    extracted_clauses_count: number;
    created_risks: string[];
    review_queue_count: number;
  } | null>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf' && !selectedFile.name.endsWith('.pdf')) {
        setError('Please upload a PDF file');
        return;
      }
      setFile(selectedFile);
      setError('');
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const result = await documentsApi.upload(
        file,
        documentType || undefined
      );
      setUploadResult({
        document: result.document,
        extracted_risks_count: result.processing_result.extracted_risks_count,
        extracted_clauses_count: result.processing_result.extracted_clauses_count,
        created_risks: result.processing_result.created_risks,
        review_queue_count: result.processing_result.review_queue_count,
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8 animate-slide-up">
        <h1 className="text-headline text-gray-900 mb-3 gradient-text">Upload Document</h1>
        <p className="text-body text-gray-600">
          Upload compliance documents, audit reports, contracts, or policies. 
          The system will automatically extract risks and create risk register entries.
        </p>
      </div>

      {error && (
        <div className="mb-6 alert-breach animate-slide-up">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
            <p className="text-sm text-red-800 font-medium">{error}</p>
          </div>
        </div>
      )}

      {uploadResult ? (
        <div className="card-elevated p-8 animate-slide-up">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
              <CheckCircle className="w-7 h-7 text-green-600" />
            </div>
            <div>
              <h2 className="text-title text-gray-900">Document Processed Successfully</h2>
              <p className="text-caption mt-1">Your document has been analyzed and risks extracted</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="metric-card hover-lift">
                <div className="text-caption mb-2 font-medium">Extracted Risks</div>
                <div className="text-3xl font-bold text-gray-900">{uploadResult.extracted_risks_count}</div>
                <div className="text-xs text-gray-500 mt-1">Risks identified in document</div>
              </div>
              <div className="metric-card hover-lift">
                <div className="text-caption mb-2 font-medium">Extracted Clauses</div>
                <div className="text-3xl font-bold text-gray-900">{uploadResult.extracted_clauses_count}</div>
                <div className="text-xs text-gray-500 mt-1">Clauses extracted for review</div>
              </div>
              <div className="metric-card hover-lift">
                <div className="text-caption mb-2 font-medium">Risks Created</div>
                <div className="text-3xl font-bold text-blue-600">{uploadResult.created_risks.length}</div>
                <div className="text-xs text-gray-500 mt-1">Added to risk register</div>
              </div>
              <div className="metric-card hover-lift">
                <div className="text-caption mb-2 font-medium">Review Queue</div>
                <div className="text-3xl font-bold text-amber-600">{uploadResult.review_queue_count}</div>
                <div className="text-xs text-gray-500 mt-1">Items requiring review</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200">
              <button
                onClick={() => navigate('/app/risks')}
                className="btn-primary click-scale"
              >
                View Risk Register
              </button>
              {uploadResult.review_queue_count > 0 && (
                <button
                  onClick={() => navigate('/app/documents/review')}
                  className="btn-secondary click-scale bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200"
                >
                  Review Queue ({uploadResult.review_queue_count})
                </button>
              )}
              <button
                onClick={() => {
                  setUploadResult(null);
                  setFile(null);
                  setDocumentType('');
                }}
                className="btn-secondary click-scale"
              >
                Upload Another
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="card-elevated p-8 animate-slide-up">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Document Type (Optional)
              </label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value as any)}
                className="input-field"
              >
                <option value="">Auto-detect</option>
                <option value="compliance_report">Compliance Report</option>
                <option value="audit_finding">Audit Finding</option>
                <option value="contract">Contract</option>
                <option value="policy">Policy</option>
                <option value="risk_assessment">Risk Assessment</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                PDF Document
              </label>
              <div className="mt-1 flex justify-center px-6 pt-8 pb-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 transition-all duration-300 hover-lift bg-gradient-to-br from-gray-50 to-white">
                <div className="space-y-3 text-center">
                  {file ? (
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                        <FileText className="w-8 h-8 text-blue-600" />
                      </div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto h-14 w-14 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer rounded-lg font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                          <span className="hover-lift inline-block">Select a PDF file</span>
                          <input
                            type="file"
                            className="sr-only"
                            accept=".pdf,application/pdf"
                            onChange={handleFileSelect}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">PDF up to 50MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full btn-primary click-scale disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {uploading ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Processing Document...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  Upload and Process
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

