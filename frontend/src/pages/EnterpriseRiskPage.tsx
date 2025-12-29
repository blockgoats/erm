import { useState, useEffect } from 'react';
import { EnterpriseRisk } from '../types';
import RiskExposureBadge from '../components/RiskExposureBadge';
import { TrendingUp, TrendingDown, Minus, Filter } from 'lucide-react';

export default function EnterpriseRiskPage() {
  const [risks, setRisks] = useState<EnterpriseRisk[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterAppetiteBreach, setFilterAppetiteBreach] = useState<boolean | null>(null);

  useEffect(() => {
    // Mock data - Top 10 Enterprise Risks
    const mockRisks: EnterpriseRisk[] = [
      {
        id: '1',
        organizationId: 'org-1',
        title: 'Data Breach Risk',
        description: 'Aggregated risk from multiple systems handling customer PII',
        aggregatedExposure: 18.5,
        category: 'Data Breach',
        priorityRank: 1,
        status: 'active',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-20T10:00:00Z',
        componentRiskIds: ['risk-1', 'risk-2'],
      },
      {
        id: '2',
        organizationId: 'org-1',
        title: 'Operational Disruption Risk',
        description: 'Risk of critical business systems being unavailable',
        aggregatedExposure: 15.2,
        category: 'Operational Disruption',
        priorityRank: 2,
        status: 'active',
        createdAt: '2024-01-10T10:00:00Z',
        updatedAt: '2024-01-18T10:00:00Z',
        componentRiskIds: ['risk-3'],
      },
      {
        id: '3',
        organizationId: 'org-1',
        title: 'Third-Party Supply Chain Risk',
        description: 'Risk from vendor and partner security weaknesses',
        aggregatedExposure: 12.8,
        category: 'Third-Party Risk',
        priorityRank: 3,
        status: 'active',
        createdAt: '2024-01-05T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        componentRiskIds: ['risk-4'],
      },
      {
        id: '4',
        organizationId: 'org-1',
        title: 'Regulatory Compliance Risk',
        description: 'Risk of non-compliance with cybersecurity regulations',
        aggregatedExposure: 11.5,
        category: 'Compliance',
        priorityRank: 4,
        status: 'active',
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-12T10:00:00Z',
        componentRiskIds: ['risk-5'],
      },
      {
        id: '5',
        organizationId: 'org-1',
        title: 'Insider Threat Risk',
        description: 'Risk from malicious or negligent employees',
        aggregatedExposure: 10.2,
        category: 'Insider Threat',
        priorityRank: 5,
        status: 'active',
        createdAt: '2023-12-28T10:00:00Z',
        updatedAt: '2024-01-10T10:00:00Z',
        componentRiskIds: ['risk-6'],
      },
      {
        id: '6',
        organizationId: 'org-1',
        title: 'Cloud Infrastructure Risk',
        description: 'Risk from cloud service provider dependencies',
        aggregatedExposure: 9.8,
        category: 'Infrastructure',
        priorityRank: 6,
        status: 'active',
        createdAt: '2023-12-25T10:00:00Z',
        updatedAt: '2024-01-08T10:00:00Z',
        componentRiskIds: ['risk-7'],
      },
      {
        id: '7',
        organizationId: 'org-1',
        title: 'Application Security Risk',
        description: 'Risk from vulnerabilities in custom applications',
        aggregatedExposure: 8.5,
        category: 'Application Security',
        priorityRank: 7,
        status: 'active',
        createdAt: '2023-12-20T10:00:00Z',
        updatedAt: '2024-01-05T10:00:00Z',
        componentRiskIds: ['risk-8'],
      },
      {
        id: '8',
        organizationId: 'org-1',
        title: 'Network Security Risk',
        description: 'Risk from network-based attacks',
        aggregatedExposure: 7.2,
        category: 'Network Security',
        priorityRank: 8,
        status: 'active',
        createdAt: '2023-12-15T10:00:00Z',
        updatedAt: '2024-01-02T10:00:00Z',
        componentRiskIds: ['risk-9'],
      },
      {
        id: '9',
        organizationId: 'org-1',
        title: 'Identity & Access Management Risk',
        description: 'Risk from weak authentication and authorization',
        aggregatedExposure: 6.8,
        category: 'IAM',
        priorityRank: 9,
        status: 'active',
        createdAt: '2023-12-10T10:00:00Z',
        updatedAt: '2023-12-28T10:00:00Z',
        componentRiskIds: ['risk-10'],
      },
      {
        id: '10',
        organizationId: 'org-1',
        title: 'Physical Security Risk',
        description: 'Risk from physical access to facilities and equipment',
        aggregatedExposure: 5.5,
        category: 'Physical Security',
        priorityRank: 10,
        status: 'active',
        createdAt: '2023-12-05T10:00:00Z',
        updatedAt: '2023-12-25T10:00:00Z',
        componentRiskIds: ['risk-11'],
      },
    ];
    setRisks(mockRisks);
  }, []);

  const categories = Array.from(new Set(risks.map(r => r.category)));
  const filteredRisks = risks.filter(risk => {
    if (filterCategory !== 'all' && risk.category !== filterCategory) return false;
    // Mock appetite breach check - in real app, check against appetite thresholds
    if (filterAppetiteBreach === true && risk.aggregatedExposure <= 12) return false;
    if (filterAppetiteBreach === false && risk.aggregatedExposure > 12) return false;
    return true;
  }).slice(0, 10); // Top 10 only

  const getTrend = (_risk: EnterpriseRisk) => {
    // Mock trend - in real app, compare with historical data
    const trend = Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable';
    return trend;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Enterprise Risk Roll-Up (ERR)</h1>
          <p className="mt-1 text-sm text-gray-600">
            Top 10 prioritized enterprise risks aggregated from system-level risks
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Category:</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Appetite Breach:</label>
            <select
              value={filterAppetiteBreach === null ? 'all' : filterAppetiteBreach ? 'breach' : 'no-breach'}
              onChange={(e) => {
                if (e.target.value === 'all') setFilterAppetiteBreach(null);
                else setFilterAppetiteBreach(e.target.value === 'breach');
              }}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="all">All Risks</option>
              <option value="breach">Breaches Only</option>
              <option value="no-breach">Within Tolerance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Top 10 Ranked List */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-200">
          {filteredRisks.map((risk, index) => {
            const trend = getTrend(risk);
            return (
              <div key={risk.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-700">#{risk.priorityRank || index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{risk.title}</h3>
                        <p className="mt-1 text-sm text-gray-600">{risk.description}</p>
                        <div className="mt-2 flex items-center space-x-4">
                          <span className="text-xs text-gray-500">Category: {risk.category}</span>
                          <span className="text-xs text-gray-500">
                            Components: {risk.componentRiskIds.length} risks
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-6 flex items-center space-x-4">
                    <div className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <RiskExposureBadge exposure={risk.aggregatedExposure} size="lg" />
                        {trend === 'up' && <TrendingUp className="w-5 h-5 text-risk-red" />}
                        {trend === 'down' && <TrendingDown className="w-5 h-5 text-risk-green" />}
                        {trend === 'stable' && <Minus className="w-5 h-5 text-gray-400" />}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        Aggregated Exposure: {risk.aggregatedExposure.toFixed(1)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {filteredRisks.length === 0 && (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No enterprise risks match the selected filters.</p>
        </div>
      )}
    </div>
  );
}

