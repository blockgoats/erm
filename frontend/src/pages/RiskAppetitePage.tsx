import { useState, useEffect } from 'react';
import { RiskAppetite, AppetiteBreach } from '../types';
import { AlertTriangle, CheckCircle } from 'lucide-react';

export default function RiskAppetitePage() {
  const [appetites, setAppetites] = useState<RiskAppetite[]>([]);
  const [breaches, setBreaches] = useState<AppetiteBreach[]>([]);

  useEffect(() => {
    // Mock data
    const mockAppetites: RiskAppetite[] = [
      {
        id: '1',
        organizationId: 'org-1',
        category: 'Data Breach',
        statement: 'The organization has zero tolerance for data breaches involving customer PII. Any risk with exposure greater than 12 requires immediate executive escalation and treatment plan.',
        toleranceThreshold: 12,
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z',
      },
      {
        id: '2',
        organizationId: 'org-1',
        category: 'Operational Disruption',
        statement: 'The organization accepts moderate operational disruption risks (exposure ≤ 10) for non-critical systems. Critical systems must maintain exposure below 8.',
        toleranceThreshold: 10,
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z',
      },
      {
        id: '3',
        organizationId: 'org-1',
        category: 'Third-Party Risk',
        statement: 'Third-party risks are acceptable up to exposure level 8. Risks above this threshold require vendor security assessment and contractual controls.',
        toleranceThreshold: 8,
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z',
      },
      {
        id: '4',
        organizationId: 'org-1',
        category: 'Compliance',
        statement: 'Regulatory compliance risks must remain below exposure level 10. Any breach requires immediate legal and compliance team notification.',
        toleranceThreshold: 10,
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z',
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

    setAppetites(mockAppetites);
    setBreaches(mockBreaches);
  }, []);

  const getBreachesForCategory = (category: string) => {
    return breaches.filter(b => {
      const appetite = appetites.find(a => a.id === b.appetiteId);
      return appetite?.category === category;
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Risk Appetite & Tolerance</h1>
        <p className="mt-1 text-sm text-gray-600">
          Governance statements defining acceptable risk levels by category
        </p>
      </div>

      {/* Active Breaches Alert */}
      {breaches.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {breaches.length} Active Appetite Breach{breaches.length !== 1 ? 'es' : ''}
              </h3>
              <p className="mt-1 text-sm text-red-700">
                Immediate action required. Review breach details below.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Appetite Statements */}
      <div className="space-y-4">
        {appetites.map((appetite) => {
          const categoryBreaches = getBreachesForCategory(appetite.category);
          const hasBreach = categoryBreaches.length > 0;

          return (
            <div
              key={appetite.id}
              className={`bg-white shadow-sm rounded-lg border-2 ${
                hasBreach ? 'border-red-300' : 'border-gray-200'
              } p-6`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h2 className="text-lg font-semibold text-gray-900">{appetite.category}</h2>
                    {hasBreach ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Breach
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Within Tolerance
                      </span>
                    )}
                  </div>

                  {/* Natural Language Statement */}
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-700 leading-relaxed">{appetite.statement}</p>
                  </div>

                  {/* Threshold Display */}
                  <div className="mt-4 flex items-center space-x-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500">Tolerance Threshold</label>
                      <div className="mt-1 flex items-center space-x-2">
                        <div className="w-64 bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{ width: `${(appetite.toleranceThreshold / 25) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {appetite.toleranceThreshold}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Maximum acceptable exposure for this category
                    </div>
                  </div>

                  {/* Breach Details */}
                  {hasBreach && (
                    <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                      <h3 className="text-sm font-semibold text-red-900 mb-2">Active Breaches</h3>
                      {categoryBreaches.map((breach) => (
                        <div key={breach.id} className="flex items-center justify-between py-2">
                          <div>
                            <span className="text-sm text-red-800">
                              Breach Value: <strong>{breach.breachValue.toFixed(1)}</strong>
                            </span>
                            <span className="text-sm text-red-600 ml-4">
                              Threshold: {breach.thresholdValue}
                            </span>
                          </div>
                          <div className="text-xs text-red-600">
                            Detected: {new Date(breach.detectedAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{appetites.length}</div>
            <div className="text-sm text-gray-600">Risk Categories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{breaches.length}</div>
            <div className="text-sm text-gray-600">Active Breaches</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {appetites.length - breaches.length}
            </div>
            <div className="text-sm text-gray-600">Within Tolerance</div>
          </div>
        </div>
      </div>
    </div>
  );
}

