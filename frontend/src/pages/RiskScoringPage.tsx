import React, { useState } from 'react';

const likelihoodLabels = ['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'];
const impactLabels = ['Negligible', 'Minor', 'Moderate', 'Major', 'Catastrophic'];

const getCellColor = (likelihood: number, impact: number) => {
  const exposure = likelihood * impact;
  if (exposure <= 6) return 'bg-risk-green';
  if (exposure <= 12) return 'bg-risk-amber';
  return 'bg-risk-red';
};

const getCellTextColor = (likelihood: number, impact: number) => {
  const exposure = likelihood * impact;
  if (exposure <= 6) return 'text-white';
  if (exposure <= 12) return 'text-white';
  return 'text-white';
};

export default function RiskScoringPage() {
  const [hoveredCell, setHoveredCell] = useState<{ likelihood: number; impact: number } | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Risk Scoring Matrix</h1>
        <p className="mt-1 text-sm text-gray-600">
          Deterministic risk scoring: <strong>Exposure = Likelihood × Impact</strong>
        </p>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <div className="flex items-start space-x-8">
          {/* Matrix */}
          <div className="flex-1">
            <div className="grid grid-cols-6 gap-1">
              {/* Header row */}
              <div className="text-xs font-medium text-gray-700 text-center py-2"></div>
              {[1, 2, 3, 4, 5].map((impact) => (
                <div key={impact} className="text-xs font-medium text-gray-700 text-center py-2">
                  <div>Impact {impact}</div>
                  <div className="text-gray-500">{impactLabels[impact - 1]}</div>
                </div>
              ))}

              {/* Data rows */}
              {[5, 4, 3, 2, 1].map((likelihood) => (
                <React.Fragment key={likelihood}>
                  <div className="text-xs font-medium text-gray-700 py-2 pr-2 text-right">
                    <div>Likelihood {likelihood}</div>
                    <div className="text-gray-500">{likelihoodLabels[likelihood - 1]}</div>
                  </div>
                  {[1, 2, 3, 4, 5].map((impact) => {
                    const exposure = likelihood * impact;
                    const isHovered = hoveredCell?.likelihood === likelihood && hoveredCell?.impact === impact;
                    return (
                      <div
                        key={`${likelihood}-${impact}`}
                        className={`${getCellColor(likelihood, impact)} ${getCellTextColor(likelihood, impact)} rounded p-3 text-center cursor-pointer transition-all ${
                          isHovered ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                        }`}
                        onMouseEnter={() => setHoveredCell({ likelihood, impact })}
                        onMouseLeave={() => setHoveredCell(null)}
                      >
                        <div className="text-lg font-bold">{exposure}</div>
                        <div className="text-xs opacity-90 mt-1">
                          {exposure <= 6 ? 'Acceptable' : exposure <= 12 ? 'Monitor' : 'Action Required'}
                        </div>
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Legend & Explanation */}
          <div className="w-64 space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Exposure Levels</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-risk-green rounded mr-2"></div>
                  <span className="text-sm text-gray-700">Acceptable (≤6)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-risk-amber rounded mr-2"></div>
                  <span className="text-sm text-gray-700">Monitor (7-12)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-risk-red rounded mr-2"></div>
                  <span className="text-sm text-gray-700">Action Required (&gt;12)</span>
                </div>
              </div>
            </div>

            {hoveredCell && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Cell Details</h3>
                <div className="text-sm text-gray-700 space-y-1">
                  <div><strong>Likelihood:</strong> {hoveredCell.likelihood} - {likelihoodLabels[hoveredCell.likelihood - 1]}</div>
                  <div><strong>Impact:</strong> {hoveredCell.impact} - {impactLabels[hoveredCell.impact - 1]}</div>
                  <div><strong>Exposure:</strong> {hoveredCell.likelihood * hoveredCell.impact}</div>
                  <div className="mt-2 text-xs text-gray-600">
                    {hoveredCell.likelihood * hoveredCell.impact <= 6
                      ? 'This risk level is within acceptable tolerance.'
                      : hoveredCell.likelihood * hoveredCell.impact <= 12
                      ? 'This risk requires monitoring and periodic review.'
                      : 'This risk requires immediate action and treatment.'}
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Scoring Formula</h3>
              <div className="text-sm text-gray-700">
                <div className="font-mono bg-white p-2 rounded border">
                  Exposure = Likelihood × Impact
                </div>
                <p className="mt-2 text-xs text-gray-600">
                  Each risk is scored using a 5×5 matrix. The exposure value determines the risk level and required response.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Meaning</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Likelihood Scale</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              {likelihoodLabels.map((label, idx) => (
                <li key={idx} className="flex items-center">
                  <span className="w-8 text-gray-500">{idx + 1}</span>
                  <span>{label}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Impact Scale</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              {impactLabels.map((label, idx) => (
                <li key={idx} className="flex items-center">
                  <span className="w-8 text-gray-500">{idx + 1}</span>
                  <span>{label}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Response Actions</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>
                <strong className="text-risk-green">Acceptable:</strong> Continue monitoring, no immediate action required.
              </li>
              <li>
                <strong className="text-risk-amber">Monitor:</strong> Review quarterly, consider mitigation if trend increases.
              </li>
              <li>
                <strong className="text-risk-red">Action Required:</strong> Immediate treatment plan, executive escalation.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

