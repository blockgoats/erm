import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { risksApi, CyberRisk, RiskStatus, RiskCategory } from '../lib/risks';
import { Plus, Filter } from 'lucide-react';
import RiskModal from '../components/RiskModal';

export default function RiskRegister() {
  const [risks, setRisks] = useState<CyberRisk[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRisk, setEditingRisk] = useState<CyberRisk | null>(null);
  const [filters, setFilters] = useState<{
    status?: RiskStatus;
    category?: RiskCategory;
  }>({});

  useEffect(() => {
    loadRisks();
  }, [filters]);

  const loadRisks = async () => {
    try {
      const { risks } = await risksApi.list(filters);
      setRisks(risks);
    } catch (error) {
      console.error('Failed to load risks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingRisk(null);
    setShowModal(true);
  };

  const handleEdit = (risk: CyberRisk) => {
    setEditingRisk(risk);
    setShowModal(true);
  };

  const handleSave = async () => {
    setShowModal(false);
    await loadRisks();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this risk?')) {
      try {
        await risksApi.delete(id);
        await loadRisks();
      } catch (error) {
        console.error('Failed to delete risk:', error);
        alert('Failed to delete risk');
      }
    }
  };

  const getExposureColor = (exposure: number) => {
    if (exposure >= 20) return 'bg-red-100 text-red-800 border-red-300';
    if (exposure >= 10) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-green-100 text-green-800 border-green-300';
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cybersecurity Risk Register</h1>
          <p className="mt-2 text-gray-600">Manage and track cybersecurity risks</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleCreate}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Risk
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            value={filters.status || ''}
            onChange={(e) => setFilters({ ...filters, status: e.target.value as RiskStatus || undefined })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Statuses</option>
            <option value="identified">Identified</option>
            <option value="assessed">Assessed</option>
            <option value="treated">Treated</option>
            <option value="accepted">Accepted</option>
            <option value="monitored">Monitored</option>
            <option value="closed">Closed</option>
          </select>
          <select
            value={filters.category || ''}
            onChange={(e) => setFilters({ ...filters, category: e.target.value as RiskCategory || undefined })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Categories</option>
            <option value="confidentiality">Confidentiality</option>
            <option value="integrity">Integrity</option>
            <option value="availability">Availability</option>
            <option value="compliance">Compliance</option>
            <option value="reputation">Reputation</option>
            <option value="financial">Financial</option>
          </select>
        </div>
      </div>

      {/* Risk Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Threat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Likelihood
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Impact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Exposure
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {risks.map((risk) => (
                <tr key={risk.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link
                      to={`/risks/${risk.id}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      {risk.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {risk.threat}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {risk.likelihood}/5
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {risk.impact}/5
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getExposureColor(risk.exposure)}`}>
                      {risk.exposure}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {risk.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {risk.status}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(risk)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(risk.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {risks.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No risks found. Click "Add Risk" to create your first risk.
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <RiskModal
          risk={editingRisk}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

