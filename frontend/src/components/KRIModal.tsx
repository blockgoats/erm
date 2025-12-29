import { useState, useEffect } from 'react';
import { kriApi, KRI, CreateKRIDTO } from '../lib/kri';
import { appetiteApi } from '../lib/appetite';
import { X } from 'lucide-react';

interface KRIModalProps {
  kri: KRI | null;
  onClose: () => void;
  onSave: () => void;
}

export default function KRIModal({ kri, onClose, onSave }: KRIModalProps) {
  const [formData, setFormData] = useState<CreateKRIDTO>({
    name: '',
    description: '',
    metric_type: 'numeric',
    threshold_min: undefined,
    threshold_max: undefined,
    target_value: undefined,
    linked_appetite_id: undefined,
  });
  const [appetites, setAppetites] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAppetites();
    if (kri) {
      setFormData({
        name: kri.name,
        description: kri.description || '',
        metric_type: kri.metric_type,
        threshold_min: kri.threshold_min,
        threshold_max: kri.threshold_max,
        target_value: kri.target_value,
        linked_appetite_id: kri.linked_appetite_id,
      });
    }
  }, [kri]);

  const loadAppetites = async () => {
    try {
      const { appetites } = await appetiteApi.list();
      setAppetites(appetites);
    } catch (error) {
      console.error('Failed to load appetites:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (kri) {
        await kriApi.update(kri.id, formData);
      } else {
        await kriApi.create(formData);
      }
      onSave();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save KRI');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {kri ? 'Edit KRI' : 'Create KRI'}
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
              Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Failed Login Attempts per Day"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe what this KRI measures and why it's important"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Metric Type *
            </label>
            <select
              required
              value={formData.metric_type}
              onChange={(e) => setFormData({ ...formData, metric_type: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="numeric">Numeric</option>
              <option value="percentage">Percentage</option>
              <option value="count">Count</option>
              <option value="rate">Rate</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Threshold
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.threshold_min ?? ''}
                onChange={(e) => setFormData({ ...formData, threshold_min: e.target.value ? parseFloat(e.target.value) : undefined })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Min"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Threshold
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.threshold_max ?? ''}
                onChange={(e) => setFormData({ ...formData, threshold_max: e.target.value ? parseFloat(e.target.value) : undefined })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Max"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Value
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.target_value ?? ''}
              onChange={(e) => setFormData({ ...formData, target_value: e.target.value ? parseFloat(e.target.value) : undefined })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ideal value"
            />
            <p className="mt-1 text-xs text-gray-500">
              The ideal or target value for this KRI
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Link to Risk Appetite (Optional)
            </label>
            <select
              value={formData.linked_appetite_id || ''}
              onChange={(e) => setFormData({ ...formData, linked_appetite_id: e.target.value || undefined })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">None</option>
              {appetites.map((appetite) => (
                <option key={appetite.id} value={appetite.id}>
                  {appetite.category.charAt(0).toUpperCase() + appetite.category.slice(1)} - {appetite.statement.substring(0, 50)}...
                </option>
              ))}
            </select>
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
              {loading ? 'Saving...' : kri ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

