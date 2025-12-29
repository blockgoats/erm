import { useState, useEffect } from 'react';
import { risksApi, CyberRisk, CreateRiskDTO, RiskCategory, ImpactType } from '../lib/risks';
import { X } from 'lucide-react';

interface RiskModalProps {
  risk: CyberRisk | null;
  onClose: () => void;
  onSave: () => void;
}

export default function RiskModal({ risk, onClose, onSave }: RiskModalProps) {
  const [formData, setFormData] = useState<CreateRiskDTO>({
    title: '',
    description: '',
    threat: '',
    vulnerability: '',
    impact_description: '',
    impact_type: 'Operational',
    likelihood: 1,
    impact: 1,
    category: 'confidentiality',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (risk) {
      setFormData({
        title: risk.title,
        description: risk.description,
        threat: risk.threat,
        vulnerability: risk.vulnerability,
        impact_description: risk.impact_description,
        impact_type: risk.impact_type,
        likelihood: risk.likelihood,
        impact: risk.impact,
        category: risk.category,
        response_type: risk.response_type,
        owner_role: risk.owner_role,
      });
    }
  }, [risk]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (risk) {
        await risksApi.update(risk.id, formData);
      } else {
        await risksApi.create(formData);
      }
      onSave();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save risk');
    } finally {
      setLoading(false);
    }
  };

  const exposure = formData.likelihood * formData.impact;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {risk ? 'Edit Risk' : 'Create New Risk'}
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
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Threat *
              </label>
              <input
                type="text"
                required
                value={formData.threat}
                onChange={(e) => setFormData({ ...formData, threat: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vulnerability *
              </label>
              <input
                type="text"
                required
                value={formData.vulnerability}
                onChange={(e) => setFormData({ ...formData, vulnerability: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Impact Description *
            </label>
            <textarea
              required
              rows={2}
              value={formData.impact_description}
              onChange={(e) => setFormData({ ...formData, impact_description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Impact Type *
            </label>
            <select
              required
              value={formData.impact_type}
              onChange={(e) => setFormData({ ...formData, impact_type: e.target.value as ImpactType })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Financial">Financial</option>
              <option value="Operational">Operational</option>
              <option value="Reputational">Reputational</option>
              <option value="Compliance">Compliance</option>
              <option value="Strategic">Strategic</option>
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Likelihood (1-5) *
              </label>
              <input
                type="number"
                min="1"
                max="5"
                required
                value={formData.likelihood}
                onChange={(e) => setFormData({ ...formData, likelihood: parseInt(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Impact (1-5) *
              </label>
              <input
                type="number"
                min="1"
                max="5"
                required
                value={formData.impact}
                onChange={(e) => setFormData({ ...formData, impact: parseInt(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exposure (Auto-calculated)
              </label>
              <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">
                <span className={`text-lg font-semibold ${
                  exposure >= 20 ? 'text-red-600' :
                  exposure >= 10 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {exposure}
                </span>
              </div>
            </div>
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
              {loading ? 'Saving...' : risk ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

