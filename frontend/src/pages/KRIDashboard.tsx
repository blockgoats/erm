import { useEffect, useState } from 'react';
import { kriApi, KRI, KRIHistory } from '../lib/kri';
import { Plus, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import KRIModal from '../components/KRIModal';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function KRIDashboard() {
  const [kris, setKris] = useState<KRI[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingKRI, setEditingKRI] = useState<KRI | null>(null);
  const [selectedKRI, setSelectedKRI] = useState<KRI | null>(null);
  const [history, setHistory] = useState<KRIHistory[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'green' | 'yellow' | 'red'>('all');

  useEffect(() => {
    loadKRIs();
  }, [filterStatus]);

  const loadKRIs = async () => {
    try {
      const filters = filterStatus !== 'all' ? { status: filterStatus } : undefined;
      const { kris } = await kriApi.list(filters);
      setKris(kris);
    } catch (error) {
      console.error('Failed to load KRIs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async (kriId: string) => {
    try {
      const { history } = await kriApi.getHistory(kriId, 30); // Last 30 records
      setHistory(history);
    } catch (error) {
      console.error('Failed to load KRI history:', error);
    }
  };

  const handleCreate = () => {
    setEditingKRI(null);
    setShowModal(true);
  };

  const handleEdit = (kri: KRI) => {
    setEditingKRI(kri);
    setShowModal(true);
  };

  const handleViewDetails = async (kri: KRI) => {
    setSelectedKRI(kri);
    await loadHistory(kri.id);
  };

  const handleSave = async () => {
    setShowModal(false);
    await loadKRIs();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this KRI?')) {
      try {
        await kriApi.delete(id);
        await loadKRIs();
      } catch (error) {
        console.error('Failed to delete KRI:', error);
        alert('Failed to delete KRI');
      }
    }
  };

  const handleUpdateValue = async (id: string, value: number) => {
    try {
      await kriApi.updateValue(id, value);
      await loadKRIs();
      if (selectedKRI?.id === id) {
        await loadHistory(id);
      }
    } catch (error) {
      console.error('Failed to update KRI value:', error);
      alert('Failed to update KRI value');
    }
  };

  const getStatusIcon = (status: 'green' | 'yellow' | 'red') => {
    switch (status) {
      case 'green':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'yellow':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'red':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getStatusColor = (status: 'green' | 'yellow' | 'red') => {
    switch (status) {
      case 'green':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'red':
        return 'bg-red-100 text-red-800 border-red-300';
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading KRIs...</div>;
  }

  const chartData = history
    .slice()
    .reverse()
    .map((h) => ({
      date: new Date(h.recorded_at).toLocaleDateString(),
      value: h.value,
      status: h.status,
    }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Key Risk Indicators (KRIs)</h1>
          <p className="mt-2 text-gray-600">Monitor key metrics that indicate risk exposure</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add KRI
        </button>
      </div>

      {/* Status Filter */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Filter by status:</span>
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1 text-sm rounded ${
              filterStatus === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterStatus('green')}
            className={`px-3 py-1 text-sm rounded ${
              filterStatus === 'green' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Green
          </button>
          <button
            onClick={() => setFilterStatus('yellow')}
            className={`px-3 py-1 text-sm rounded ${
              filterStatus === 'yellow' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Yellow
          </button>
          <button
            onClick={() => setFilterStatus('red')}
            className={`px-3 py-1 text-sm rounded ${
              filterStatus === 'red' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Red
          </button>
        </div>
      </div>

      {/* KRI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kris.map((kri) => (
          <div
            key={kri.id}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{kri.name}</h3>
                {kri.description && (
                  <p className="text-sm text-gray-600 mt-1">{kri.description}</p>
                )}
              </div>
              {getStatusIcon(kri.status)}
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Current Value</span>
                  <span className={`text-lg font-bold ${getStatusColor(kri.status).split(' ')[1]}`}>
                    {kri.current_value !== undefined ? kri.current_value.toFixed(2) : 'N/A'}
                  </span>
                </div>
                {kri.target_value !== undefined && (
                  <div className="text-xs text-gray-500">
                    Target: {kri.target_value.toFixed(2)}
                  </div>
                )}
              </div>

              {(kri.threshold_min !== undefined || kri.threshold_max !== undefined) && (
                <div className="text-xs text-gray-500">
                  Range: {kri.threshold_min ?? '∞'} - {kri.threshold_max ?? '∞'}
                </div>
              )}

              <div className="pt-3 border-t border-gray-200 flex gap-2">
                <button
                  onClick={() => handleViewDetails(kri)}
                  className="flex-1 px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleEdit(kri)}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(kri.id)}
                  className="px-3 py-1 text-sm bg-red-50 text-red-700 rounded hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {kris.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No KRIs found. Click "Add KRI" to create your first indicator.</p>
        </div>
      )}

      {/* KRI Detail Modal */}
      {selectedKRI && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{selectedKRI.name}</h2>
              <button
                onClick={() => setSelectedKRI(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Value</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.01"
                      defaultValue={selectedKRI.current_value}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                      onBlur={(e) => {
                        const value = parseFloat(e.target.value);
                        if (!isNaN(value)) {
                          handleUpdateValue(selectedKRI.id, value);
                        }
                      }}
                    />
                    {getStatusIcon(selectedKRI.status)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <span className={`inline-block px-3 py-2 rounded-lg border ${getStatusColor(selectedKRI.status)}`}>
                    {selectedKRI.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {selectedKRI.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <p className="text-gray-900">{selectedKRI.description}</p>
                </div>
              )}

              {history.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">Trend (Last 30 Records)</label>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedKRI(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <KRIModal
          kri={editingKRI}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

