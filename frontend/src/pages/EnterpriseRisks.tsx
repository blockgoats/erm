import { useEffect, useState } from 'react';
import { enterpriseRisksApi, EnterpriseRisk, EnterpriseRiskFilters } from '../lib/enterpriseRisks';
import { RiskCategory } from '../lib/risks';
import { RefreshCw, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function EnterpriseRisks() {
  const [risks, setRisks] = useState<EnterpriseRisk[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<EnterpriseRiskFilters>({});

  useEffect(() => {
    loadRisks();
  }, [filters]);

  const loadRisks = async () => {
    try {
      const { risks } = await enterpriseRisksApi.list(filters);
      // Show top 10 only
      setRisks(risks.slice(0, 10));
    } catch (error) {
      console.error('Failed to load enterprise risks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await enterpriseRisksApi.refresh();
      await loadRisks();
    } catch (error) {
      console.error('Failed to refresh enterprise risks:', error);
      alert('Failed to refresh enterprise risks');
    } finally {
      setRefreshing(false);
    }
  };

  const getExposureColor = (exposure: number) => {
    if (exposure >= 20) return 'bg-red-100 text-red-800 border-red-300';
    if (exposure >= 10) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-green-100 text-green-800 border-green-300';
  };

  const getTrendIcon = (_risk: EnterpriseRisk, index: number) => {
    // Simple trend based on priority rank (lower rank = higher priority)
    // In a real app, this would compare with historical data
    if (index < 3) {
      return <TrendingUp className="w-4 h-4 text-red-600" />;
    }
    if (index >= 7) {
      return <TrendingDown className="w-4 h-4 text-green-600" />;
    }
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  if (loading) {
    return <div className="text-center py-12">Loading enterprise risks...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Enterprise Risk Register</h1>
          <p className="mt-2 text-gray-600">Top 10 prioritized enterprise risks</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh Aggregation'}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-4">
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

      {/* Top 10 Enterprise Risks */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Top 10 Enterprise Risks</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aggregated Exposure
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trend
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {risks.map((risk, index) => (
                <tr key={risk.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-900">
                      #{risk.priority_rank || index + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{risk.title}</div>
                      <div className="text-sm text-gray-500 max-w-md truncate">{risk.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {risk.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${getExposureColor(risk.aggregated_exposure)}`}>
                      {risk.aggregated_exposure.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getTrendIcon(risk, index)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {risks.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No enterprise risks found. Click "Refresh Aggregation" to generate enterprise risks from cybersecurity risks.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

