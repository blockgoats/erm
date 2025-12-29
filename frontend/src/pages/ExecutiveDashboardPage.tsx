/**
 * Executive Dashboard - Enterprise-Grade
 * 
 * Principles Applied:
 * - One screen, no scrolling
 * - Clear information hierarchy
 * - Decision-centric layout
 * - Explainable metrics
 * - Calm, professional aesthetic
 * - Semantic color only
 */

import { useState, useEffect } from 'react';
import { EnterpriseRisk, AppetiteBreach } from '../types';
import EnterpriseMetric from '../components/EnterpriseMetric';
import StatusBadge from '../components/StatusBadge';
import Tooltip from '../components/Tooltip';
import { AlertTriangle, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ExecutiveDashboardPage() {
  const [topRisks, setTopRisks] = useState<EnterpriseRisk[]>([]);
  const [breaches, setBreaches] = useState<AppetiteBreach[]>([]);
  const [trends, setTrends] = useState<{ [key: string]: 'up' | 'down' | 'stable' }>({});

  useEffect(() => {
    // Mock data - Top 5 risks only
    const mockTopRisks: EnterpriseRisk[] = [
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
    ];

    const mockBreaches: AppetiteBreach[] = [
      {
        id: '1',
        appetiteId: '1',
        enterpriseRiskId: '1',
        breachValue: 18.5,
        thresholdValue: 12,
        detectedAt: '2024-01-20T10:00:00Z',
      },
      {
        id: '2',
        appetiteId: '2',
        enterpriseRiskId: '2',
        breachValue: 15.2,
        thresholdValue: 10,
        detectedAt: '2024-01-18T10:00:00Z',
      },
    ];

    setTopRisks(mockTopRisks);
    setBreaches(mockBreaches);
    
    // Mock trends
    const mockTrends: { [key: string]: 'up' | 'down' | 'stable' } = {
      '1': 'up',
      '2': 'up',
      '3': 'stable',
      '4': 'down',
      '5': 'stable',
    };
    setTrends(mockTrends);
  }, []);

  // Calculate summary metrics
  const totalExposure = topRisks.reduce((sum, r) => sum + r.aggregatedExposure, 0);
  const avgExposure = topRisks.length > 0 ? totalExposure / topRisks.length : 0;
  const risksIncreasing = Object.values(trends).filter(t => t === 'up').length;
  const risksDecreasing = Object.values(trends).filter(t => t === 'down').length;

  return (
    <div className="space-y-4">
      {/* Header - Clear, Plain Language */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Enterprise Risk Overview</h1>
        <p className="mt-1 text-sm text-gray-600">
          Current risk posture and required actions
        </p>
      </div>

      {/* Key Metrics - Dense, Hierarchical */}
      <div className="grid grid-cols-4 gap-3">
        <EnterpriseMetric
          label="Total Exposure"
          value={totalExposure.toFixed(1)}
          subtext="Across top 5 enterprise risks"
          explanation="Sum of exposure values for the top 5 enterprise risks. Higher values indicate greater overall risk."
          size="md"
        />
        <EnterpriseMetric
          label="Average Exposure"
          value={avgExposure.toFixed(1)}
          subtext="Per enterprise risk"
          explanation="Mean exposure value across all enterprise risks. Used to assess overall risk level."
          size="md"
        />
        <EnterpriseMetric
          label="Appetite Breaches"
          value={breaches.length}
          subtext="Require immediate action"
          status={breaches.length > 0 ? 'critical' : 'acceptable'}
          explanation="Number of risks that exceed established tolerance thresholds. Each breach requires executive review and treatment plan."
          size="md"
          action={
            breaches.length > 0 && (
              <Link
                to="/app/appetite"
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Review
              </Link>
            )
          }
        />
        <EnterpriseMetric
          label="Risk Trends"
          value={`${risksIncreasing}↑ / ${risksDecreasing}↓`}
          subtext="Increasing / Decreasing"
          explanation="Number of risks trending upward (increasing exposure) versus downward (decreasing exposure) compared to last quarter."
          size="md"
        />
      </div>

      {/* Appetite Breaches - Critical Alert, Decision-Centric */}
      {breaches.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-600 p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="ml-3 flex-1">
              <h2 className="text-base font-semibold text-red-900">
                Action Required: {breaches.length} Appetite Breach{breaches.length !== 1 ? 'es' : ''}
              </h2>
              <p className="mt-1 text-sm text-red-700">
                The following risks exceed tolerance thresholds and require immediate review:
              </p>
              <div className="mt-3 space-y-2">
                {breaches.map((breach) => {
                  const risk = topRisks.find(r => r.id === breach.enterpriseRiskId);
                  return (
                    <div key={breach.id} className="bg-white rounded border border-red-200 p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{risk?.title || 'Unknown Risk'}</div>
                          <div className="text-xs text-gray-600 mt-0.5">{risk?.category}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-red-600">
                            Exposure: {breach.breachValue.toFixed(1)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Threshold: {breach.thresholdValue}
                          </div>
                        </div>
                        <Link
                          to="/app/enterprise-risks"
                          className="ml-4 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
                        >
                          Assess <ArrowRight className="w-3 h-3 ml-1" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top 5 Enterprise Risks - Dense Table View */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Top 5 Enterprise Risks</h2>
          <Link
            to="/app/enterprise-risks"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View All
          </Link>
        </div>
        <div className="divide-y divide-gray-200">
          {topRisks.map((risk) => {
            const trend = trends[risk.id] || 'stable';
            const exposureStatus = risk.aggregatedExposure > 12 ? 'critical' :
                                   risk.aggregatedExposure > 6 ? 'warning' : 'acceptable';
            
            return (
              <div key={risk.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
                      <span className="text-xs font-semibold text-gray-700">#{risk.priorityRank}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">{risk.title}</h3>
                        <StatusBadge
                          status={exposureStatus}
                          label={risk.aggregatedExposure.toFixed(1)}
                          size="sm"
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">{risk.category}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 ml-4">
                    {trend === 'up' && (
                      <Tooltip content="Risk exposure has increased compared to last quarter">
                        <TrendingUp className="w-4 h-4 text-red-600" />
                      </Tooltip>
                    )}
                    {trend === 'down' && (
                      <Tooltip content="Risk exposure has decreased compared to last quarter">
                        <TrendingDown className="w-4 h-4 text-green-600" />
                      </Tooltip>
                    )}
                    {trend === 'stable' && (
                      <Tooltip content="Risk exposure has remained stable compared to last quarter">
                        <div className="w-4 h-4 text-gray-400">—</div>
                      </Tooltip>
                    )}
                    <Link
                      to="/app/enterprise-risks"
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Review
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions - Decision-Centric */}
      <div className="grid grid-cols-3 gap-3">
        <Link
          to="/app/board-report"
          className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors"
        >
          <div className="text-sm font-semibold text-gray-900">Generate Board Report</div>
          <div className="text-xs text-gray-500 mt-1">Quarterly risk summary for board review</div>
        </Link>
        <Link
          to="/app/appetite"
          className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors"
        >
          <div className="text-sm font-semibold text-gray-900">Review Risk Appetite</div>
          <div className="text-xs text-gray-500 mt-1">View tolerance thresholds and breaches</div>
        </Link>
        <Link
          to="/app/enterprise-risks"
          className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors"
        >
          <div className="text-sm font-semibold text-gray-900">Assess Enterprise Risks</div>
          <div className="text-xs text-gray-500 mt-1">Full enterprise risk register</div>
        </Link>
      </div>
    </div>
  );
}
