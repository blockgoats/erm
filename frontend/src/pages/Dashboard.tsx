import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { risksApi, CyberRisk } from '../lib/risks';
import { enterpriseRisksApi, EnterpriseRisk } from '../lib/enterpriseRisks';
import { appetiteApi, AppetiteBreach } from '../lib/appetite';
import { kriApi, KRI } from '../lib/kri';
import { AlertTriangle, TrendingUp, Shield, FileText, Activity } from 'lucide-react';

export default function Dashboard() {
  const [risks, setRisks] = useState<CyberRisk[]>([]);
  const [enterpriseRisks, setEnterpriseRisks] = useState<EnterpriseRisk[]>([]);
  const [breaches, setBreaches] = useState<AppetiteBreach[]>([]);
  const [kris, setKris] = useState<KRI[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [risksRes, enterpriseRisksRes, breachesRes, krisRes] = await Promise.all([
        risksApi.list(),
        enterpriseRisksApi.list(),
        appetiteApi.getActiveBreaches(),
        kriApi.list(),
      ]);
      setRisks(risksRes.risks);
      setEnterpriseRisks(enterpriseRisksRes.risks);
      setBreaches(breachesRes.breaches);
      setKris(krisRes.kris);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const criticalRisks = risks.filter(r => r.exposure >= 20);
  const highRisks = risks.filter(r => r.exposure >= 10 && r.exposure < 20);
  const totalExposure = risks.reduce((sum, r) => sum + r.exposure, 0);
  const topEnterpriseRisks = enterpriseRisks.slice(0, 5);
  const redKRIs = kris.filter(k => k.status === 'red');
  const yellowKRIs = kris.filter(k => k.status === 'yellow');

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Executive Dashboard</h1>
        <p className="mt-2 text-gray-600">Overview of enterprise cybersecurity risks</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Risks</p>
              <p className="text-2xl font-bold text-gray-900">{risks.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Critical Risks</p>
              <p className="text-2xl font-bold text-red-600">{criticalRisks.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">High Risks</p>
              <p className="text-2xl font-bold text-yellow-600">{highRisks.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Shield className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Exposure</p>
              <p className="text-2xl font-bold text-gray-900">{totalExposure.toFixed(1)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Activity className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">KRI Status</p>
              <div className="flex items-center gap-2 mt-1">
                {redKRIs.length > 0 && (
                  <span className="text-lg font-bold text-red-600">{redKRIs.length} Red</span>
                )}
                {yellowKRIs.length > 0 && (
                  <span className="text-lg font-bold text-yellow-600">{yellowKRIs.length} Yellow</span>
                )}
                {redKRIs.length === 0 && yellowKRIs.length === 0 && (
                  <span className="text-lg font-bold text-green-600">All Green</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Appetite Breaches Alert */}
      {breaches.length > 0 && (
        <div className="bg-red-50 border-2 border-red-400 rounded-lg p-6">
          <div className="flex items-start">
            <AlertTriangle className="h-8 w-8 text-red-600 flex-shrink-0" />
            <div className="ml-4 flex-1">
              <h2 className="text-xl font-semibold text-red-900">Appetite Breaches Detected</h2>
              <p className="mt-1 text-sm text-red-700">
                {breaches.length} risk{breaches.length !== 1 ? 's' : ''} exceed acceptable tolerance thresholds
              </p>
              <div className="mt-4 space-y-2">
                {breaches.slice(0, 3).map((breach) => {
                  const risk = enterpriseRisks.find(r => r.id === breach.enterprise_risk_id);
                  return (
                    <div key={breach.id} className="bg-white rounded p-3 border border-red-200">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">{risk?.title || 'Unknown Risk'}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Exposure: {breach.breach_value.toFixed(1)}</span>
                          <span className="text-sm text-red-600">Threshold: {breach.threshold_value}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {breaches.length > 3 && (
                <Link
                  to="/app/appetite"
                  className="mt-3 inline-block text-sm text-red-700 hover:text-red-900 font-medium"
                >
                  View all {breaches.length} breaches →
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Top 5 Enterprise Risks */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Top 5 Enterprise Risks</h2>
          <Link
            to="/app/enterprise-risks"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            View all →
          </Link>
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topEnterpriseRisks.length > 0 ? (
                topEnterpriseRisks.map((risk) => (
                  <tr key={risk.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        #{risk.priority_rank || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{risk.title}</div>
                      <div className="text-sm text-gray-500 max-w-md truncate">{risk.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                      {risk.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          risk.aggregated_exposure >= 20
                            ? 'bg-red-100 text-red-800'
                            : risk.aggregated_exposure >= 10
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {risk.aggregated_exposure.toFixed(1)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No enterprise risks found. Go to Enterprise Risks page to refresh aggregation.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

