import { useEffect, useState } from 'react';
import { risksApi } from '../lib/risks';
import { Clock, User, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface RiskHistoryTimelineProps {
  riskId: string;
}

interface RiskHistory {
  id: string;
  risk_id: string;
  changed_by: string;
  change_type: string;
  old_value?: string;
  new_value?: string;
  created_at: string;
}

export default function RiskHistoryTimeline({ riskId }: RiskHistoryTimelineProps) {
  const [history, setHistory] = useState<RiskHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [riskId]);

  const loadHistory = async () => {
    try {
      const { history } = await risksApi.getHistory(riskId);
      setHistory(history);
    } catch (error) {
      console.error('Failed to load risk history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChangeDescription = (change: RiskHistory) => {
    const changeType = change.change_type.replace(/_/g, ' ');
    if (change.old_value && change.new_value) {
      return `${changeType}: "${change.old_value}" → "${change.new_value}"`;
    } else if (change.new_value) {
      return `${changeType}: "${change.new_value}"`;
    } else if (change.old_value) {
      return `${changeType}: removed "${change.old_value}"`;
    }
    return changeType;
  };

  if (loading) {
    return <div className="text-center py-4 text-gray-500">Loading history...</div>;
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
        <p>No history recorded for this risk</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk History Timeline</h3>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

        <div className="space-y-6">
          {history.map((change, index) => (
            <div key={change.id} className="relative flex items-start">
              {/* Timeline dot */}
              <div className="relative z-10 flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full border-2 border-blue-500">
                <Clock className="w-4 h-4 text-blue-600" />
              </div>

              {/* Content */}
              <div className="ml-6 flex-1 bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900">
                        User {change.changed_by.substring(0, 8)}...
                      </span>
                      <span className="text-xs text-gray-500">
                        {format(new Date(change.created_at), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 capitalize">
                      {getChangeDescription(change)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

