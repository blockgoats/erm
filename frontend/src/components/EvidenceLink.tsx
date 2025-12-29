import { Evidence } from '../types';
import { FileText, Download } from 'lucide-react';

interface EvidenceLinkProps {
  evidence: Evidence;
  onDownload?: (evidence: Evidence) => void;
}

export default function EvidenceLink({ evidence, onDownload }: EvidenceLinkProps) {
  const handleClick = () => {
    if (onDownload) {
      onDownload(evidence);
    } else {
      // Default: open in new tab or download
      window.open(`/api/evidence/${evidence.id}/download`, '_blank');
    }
  };

  return (
    <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded border border-gray-200">
      <FileText className="w-4 h-4 text-gray-400" />
      <span className="text-sm text-gray-700 flex-1">{evidence.fileName}</span>
      <span className="text-xs text-gray-500">
        {new Date(evidence.createdAt).toLocaleDateString()}
      </span>
      <button
        onClick={handleClick}
        className="text-blue-600 hover:text-blue-800"
        title="Download evidence"
      >
        <Download className="w-4 h-4" />
      </button>
    </div>
  );
}

