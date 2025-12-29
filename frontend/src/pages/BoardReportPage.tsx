import { useState, useEffect } from 'react';
import { EnterpriseRisk, AppetiteBreach } from '../types';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

export default function BoardReportPage() {
  const [topRisks, setTopRisks] = useState<EnterpriseRisk[]>([]);
  const [breaches, setBreaches] = useState<AppetiteBreach[]>([]);
  const [quarterComparison, setQuarterComparison] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    // Mock data
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
    
    // Mock quarter comparison (delta from previous quarter)
    setQuarterComparison({
      '1': 2.5, // Increased by 2.5
      '2': 1.2, // Increased by 1.2
      '3': -0.5, // Decreased by 0.5
    });
  }, []);

  const getConclusion = () => {
    if (breaches.length > 0) {
      return {
        status: 'Action Required',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        message: `${breaches.length} appetite breach${breaches.length !== 1 ? 'es' : ''} require immediate board attention and treatment plans.`,
      };
    }
    const increasingRisks = topRisks.filter(r => (quarterComparison[r.id] || 0) > 0).length;
    if (increasingRisks > topRisks.length / 2) {
      return {
        status: 'Risk Increased',
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        message: 'Overall enterprise risk exposure has increased this quarter. Enhanced monitoring recommended.',
      };
    }
    return {
      status: 'Risk Stabilized',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      message: 'Enterprise risk exposure remains within acceptable parameters. Continue current risk management practices.',
    };
  };

  const conclusion = getConclusion();

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header - McKinsey Style */}
      <div className="text-center border-b-2 border-gray-300 pb-8">
        <h1 className="text-4xl font-light text-gray-900 mb-2">Enterprise Cyber Risk Report</h1>
        <p className="text-xl text-gray-600">Q1 2024</p>
        <p className="text-sm text-gray-500 mt-2">
          Prepared: {format(new Date(), 'MMMM d, yyyy')}
        </p>
      </div>

      {/* Executive Summary - Large Fonts */}
      <div className={`${conclusion.bgColor} rounded-lg p-8 border-2 ${conclusion.color.includes('red') ? 'border-red-300' : conclusion.color.includes('amber') ? 'border-amber-300' : 'border-green-300'}`}>
        <h2 className="text-3xl font-semibold text-gray-900 mb-4">Executive Summary</h2>
        <div className="space-y-4">
          <div>
            <div className={`text-2xl font-bold ${conclusion.color} mb-2`}>
              {conclusion.status}
            </div>
            <p className="text-lg text-gray-700 leading-relaxed">{conclusion.message}</p>
          </div>
          <div className="grid grid-cols-3 gap-6 mt-6 pt-6 border-t border-gray-300">
            <div>
              <div className="text-sm font-medium text-gray-600">Total Enterprise Risks</div>
              <div className="text-3xl font-semibold text-gray-900 mt-1">{topRisks.length}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">Appetite Breaches</div>
              <div className="text-3xl font-semibold text-red-600 mt-1">{breaches.length}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">Average Exposure</div>
              <div className="text-3xl font-semibold text-gray-900 mt-1">
                {(topRisks.reduce((sum, r) => sum + r.aggregatedExposure, 0) / topRisks.length).toFixed(1)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Risks - Large, Clear */}
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 mb-6">Top Enterprise Risks</h2>
        <div className="space-y-6">
          {topRisks.map((risk) => {
            const delta = quarterComparison[risk.id] || 0;
            const trend = delta > 0 ? 'up' : delta < 0 ? 'down' : 'stable';
            
            return (
              <div key={risk.id} className="bg-white rounded-lg border-2 border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="text-2xl font-bold text-gray-400">#{risk.priorityRank}</div>
                      <h3 className="text-2xl font-semibold text-gray-900">{risk.title}</h3>
                    </div>
                    <p className="text-lg text-gray-600 mb-4">{risk.description}</p>
                    <div className="flex items-center space-x-6">
                      <div>
                        <div className="text-sm text-gray-500">Category</div>
                        <div className="text-base font-medium text-gray-900">{risk.category}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Exposure</div>
                        <div className="text-2xl font-bold text-gray-900">{risk.aggregatedExposure.toFixed(1)}</div>
                      </div>
                      {delta !== 0 && (
                        <div>
                          <div className="text-sm text-gray-500">QoQ Change</div>
                          <div className="flex items-center space-x-1">
                            {trend === 'up' && <TrendingUp className="w-5 h-5 text-red-600" />}
                            {trend === 'down' && <TrendingDown className="w-5 h-5 text-green-600" />}
                            <span className={`text-xl font-semibold ${trend === 'up' ? 'text-red-600' : 'text-green-600'}`}>
                              {delta > 0 ? '+' : ''}{delta.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Appetite Breaches - Explicit */}
      {breaches.length > 0 && (
        <div className="bg-red-50 border-2 border-red-400 rounded-lg p-8">
          <div className="flex items-start">
            <AlertTriangle className="h-10 w-10 text-red-600 flex-shrink-0" />
            <div className="ml-4 flex-1">
              <h2 className="text-3xl font-semibold text-red-900 mb-4">Appetite Breaches</h2>
              <p className="text-lg text-red-800 mb-6">
                The following risks exceed established tolerance thresholds and require immediate board attention:
              </p>
              <div className="space-y-4">
                {breaches.map((breach) => {
                  const risk = topRisks.find(r => r.id === breach.enterpriseRiskId);
                  return (
                    <div key={breach.id} className="bg-white rounded-lg p-4 border border-red-300">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xl font-semibold text-gray-900">{risk?.title || 'Unknown Risk'}</div>
                          <div className="text-base text-gray-600 mt-1">{risk?.category}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Breach Value</div>
                          <div className="text-2xl font-bold text-red-600">{breach.breachValue.toFixed(1)}</div>
                          <div className="text-sm text-gray-500 mt-1">Threshold: {breach.thresholdValue}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Plain English Summary */}
      <div className="bg-gray-50 rounded-lg p-8 border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Summary</h2>
        <div className="space-y-3 text-lg text-gray-700 leading-relaxed">
          <p>
            Enterprise cyber risk exposure has {breaches.length > 0 ? 'increased' : 'remained stable'} this quarter.
            {breaches.length > 0 && ` ${breaches.length} risk${breaches.length !== 1 ? 's' : ''} currently exceed established appetite thresholds.`}
          </p>
          <p>
            The top three enterprise risks are {topRisks.slice(0, 3).map(r => r.title).join(', ')}.
            {topRisks[0] && ` ${topRisks[0].title} represents the highest exposure at ${topRisks[0].aggregatedExposure.toFixed(1)}.`}
          </p>
          <p>
            {breaches.length > 0 
              ? 'Immediate action is required to address appetite breaches through risk treatment plans and executive escalation.'
              : 'Current risk management practices are effective. Continue monitoring and periodic review.'}
          </p>
        </div>
      </div>
    </div>
  );
}

