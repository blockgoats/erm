import { useEffect, useState } from 'react';
import { appetiteApi, RiskAppetite, AppetiteBreach } from '../lib/appetite';
import { Plus, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import AppetiteModal from '../components/AppetiteModal';

export default function AppetiteManagement() {
  const [appetites, setAppetites] = useState<RiskAppetite[]>([]);
  const [breaches, setBreaches] = useState<AppetiteBreach[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAppetite, setEditingAppetite] = useState<RiskAppetite | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [appetitesRes, breachesRes] = await Promise.all([
        appetiteApi.list(),
        appetiteApi.getActiveBreaches(),
      ]);
      setAppetites(appetitesRes.appetites);
      setBreaches(breachesRes.breaches);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingAppetite(null);
    setShowModal(true);
  };

  const handleEdit = (appetite: RiskAppetite) => {
    setEditingAppetite(appetite);
    setShowModal(true);
  };

  const handleSave = async () => {
    setShowModal(false);
    await loadData();
    // Recheck breaches after save
    await appetiteApi.checkBreaches();
    await loadData();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this risk appetite?')) {
      try {
        await appetiteApi.delete(id);
        await loadData();
      } catch (error) {
        console.error('Failed to delete appetite:', error);
        alert('Failed to delete risk appetite');
      }
    }
  };

  const handleAcknowledgeBreach = async (breachId: string) => {
    try {
      await appetiteApi.acknowledgeBreach(breachId);
      await loadData();
    } catch (error) {
      console.error('Failed to acknowledge breach:', error);
    }
  };

  const handleResolveBreach = async (breachId: string) => {
    try {
      await appetiteApi.resolveBreach(breachId);
      await loadData();
    } catch (error) {
      console.error('Failed to resolve breach:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Risk Appetite & Tolerance</h1>
          <p className="mt-2 text-gray-600">Define risk appetite statements and monitor tolerance breaches</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Appetite Statement
        </button>
      </div>

      {/* Breach Alerts */}
      {breaches.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
            <h2 className="text-lg font-semibold text-red-900">Active Appetite Breaches</h2>
          </div>
          <div className="space-y-3">
            {breaches.map((breach) => {
              const appetite = appetites.find(a => a.id === breach.appetite_id);
              return (
                <div key={breach.id} className="bg-white rounded-lg p-4 border border-red-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {appetite ? `${appetite.category.charAt(0).toUpperCase()}${appetite.category.slice(1)} Risk Breach` : 'Unknown Risk Breach'}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Current: <span className="font-semibold text-red-600">{breach.breach_value.toFixed(1)}</span> | 
                        Threshold: <span className="font-semibold">{breach.threshold_value.toFixed(1)}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Detected: {new Date(breach.detected_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {!breach.acknowledged_at && (
                        <button
                          onClick={() => handleAcknowledgeBreach(breach.id)}
                          className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                        >
                          Acknowledge
                        </button>
                      )}
                      {!breach.resolved_at && (
                        <button
                          onClick={() => handleResolveBreach(breach.id)}
                          className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Appetite Statements */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Risk Appetite Statements</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tolerance Threshold
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
              {appetites.map((appetite) => {
                const hasBreach = breaches.some(b => b.appetite_id === appetite.id);
                return (
                  <tr key={appetite.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                      {appetite.category}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-md">
                      {appetite.statement}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        {appetite.tolerance_threshold.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {hasBreach ? (
                        <span className="flex items-center text-sm text-red-600">
                          <XCircle className="w-4 h-4 mr-1" />
                          Breach
                        </span>
                      ) : (
                        <span className="flex items-center text-sm text-green-600">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Within Tolerance
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(appetite)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(appetite.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {appetites.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No risk appetite statements defined. Click "Add Appetite Statement" to create one.
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <AppetiteModal
          appetite={editingAppetite}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

