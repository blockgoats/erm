import { RiskHistory as RiskHistoryType } from '../types';
import { format } from 'date-fns';
import { User, Clock } from 'lucide-react';

interface RiskHistoryProps {
  history: RiskHistoryType[];
}

export default function RiskHistory({ history }: RiskHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p>No history recorded</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {history.map((entry) => (
        <div key={entry.id} className="border-l-2 border-gray-300 pl-4 py-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-900">{entry.changedBy}</span>
                <span className="text-xs text-gray-500">
                  {format(new Date(entry.createdAt), 'MMM d, yyyy HH:mm')}
                </span>
              </div>
              <div className="mt-1">
                <span className="text-xs font-medium text-gray-600 uppercase">{entry.changeType}</span>
                {entry.oldValue && entry.newValue && (
                  <div className="mt-1 text-sm text-gray-700">
                    <span className="line-through text-red-600">{entry.oldValue}</span>
                    {' → '}
                    <span className="text-green-600">{entry.newValue}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

