import { useEffect, useState, useRef } from 'react';
import { evidenceApi, Evidence } from '../lib/evidence';
import { Upload, Download, Trash2, FileText, Image, File } from 'lucide-react';
import { format } from 'date-fns';

interface EvidencePanelProps {
  riskId: string;
  canEdit?: boolean;
}

export default function EvidencePanel({ riskId, canEdit = true }: EvidencePanelProps) {
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadEvidence();
  }, [riskId]);

  const loadEvidence = async () => {
    try {
      const { evidence } = await evidenceApi.list(riskId);
      setEvidence(evidence);
    } catch (error) {
      console.error('Failed to load evidence:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await evidenceApi.upload(riskId, file);
      await loadEvidence();
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Failed to upload evidence:', error);
      alert('Failed to upload evidence: ' + (error.response?.data?.error || error.message));
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (evidenceItem: Evidence) => {
    try {
      const blob = await evidenceApi.download(evidenceItem.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = evidenceItem.file_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download evidence:', error);
      alert('Failed to download evidence');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this evidence?')) {
      return;
    }

    try {
      await evidenceApi.delete(id);
      await loadEvidence();
    } catch (error) {
      console.error('Failed to delete evidence:', error);
      alert('Failed to delete evidence');
    }
  };

  const getFileIcon = (fileType?: string) => {
    if (!fileType) return <File className="w-5 h-5" />;
    if (fileType.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (fileType.includes('pdf')) return <FileText className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  if (loading) {
    return <div className="text-center py-4 text-gray-500">Loading evidence...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Evidence & Attachments</h3>
        {canEdit && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              id="evidence-upload"
            />
            <label
              htmlFor="evidence-upload"
              className={`flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors ${
                uploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload Evidence'}
            </label>
          </div>
        )}
      </div>

      {evidence.length === 0 ? (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
          <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p>No evidence attached</p>
          {canEdit && <p className="text-sm mt-1">Click "Upload Evidence" to add files</p>}
        </div>
      ) : (
        <div className="space-y-2">
          {evidence.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="text-gray-600">
                  {getFileIcon(item.file_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.file_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Uploaded {format(new Date(item.created_at), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(item)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
                {canEdit && (
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

