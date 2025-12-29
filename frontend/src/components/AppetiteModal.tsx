import { useState, useEffect } from 'react';
import { appetiteApi, RiskAppetite, CreateAppetiteDTO } from '../lib/appetite';
import { RiskCategory } from '../lib/risks';
import { X } from 'lucide-react';

interface AppetiteModalProps {
  appetite: RiskAppetite | null;
  onClose: () => void;
  onSave: () => void;
}

export default function AppetiteModal({ appetite, onClose, onSave }: AppetiteModalProps) {
  const [formData, setFormData] = useState<CreateAppetiteDTO>({
    objective: '',
    category: 'confidentiality',
    statement: '',
    tolerance_threshold: 10,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (appetite) {
      setFormData({
        objective: appetite.objective,
        category: appetite.category,
        statement: appetite.statement,
        tolerance_threshold: appetite.tolerance_threshold,
      });
    }
  }, [appetite]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (appetite) {
        await appetiteApi.update(appetite.id, formData);
      } else {
        await appetiteApi.create(formData);
      }
      onSave();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save risk appetite');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {appetite ? 'Edit Risk Appetite' : 'Create Risk Appetite'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Objective *
            </label>
            <input
              type="text"
              required
              value={formData.objective}
              onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
              placeholder="e.g., Availability, Data Protection, Operational Continuity"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as RiskCategory })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="confidentiality">Confidentiality</option>
              <option value="integrity">Integrity</option>
              <option value="availability">Availability</option>
              <option value="compliance">Compliance</option>
              <option value="reputation">Reputation</option>
              <option value="financial">Financial</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Appetite Statement *
            </label>
            <textarea
              required
              rows={4}
              value={formData.statement}
              onChange={(e) => setFormData({ ...formData, statement: e.target.value })}
              placeholder="e.g., We accept low to moderate confidentiality risks but will not tolerate risks that could result in significant data breaches affecting customer PII."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Natural language statement describing the organization's risk appetite for this category.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tolerance Threshold *
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="1"
                max="25"
                step="0.5"
                value={formData.tolerance_threshold}
                onChange={(e) => setFormData({ ...formData, tolerance_threshold: parseFloat(e.target.value) })}
                className="w-full"
              />
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Threshold: {formData.tolerance_threshold.toFixed(1)}</span>
                <span className="text-xs text-gray-500">(Exposure scale: 1-25)</span>
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Risks exceeding this exposure value will trigger breach alerts.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : appetite ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

