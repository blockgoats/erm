import React from 'react';
import { useRiskStore } from '../../store/riskStore';
import { getRiskColor, getBusinessImpactDescription, getLikelihoodDescription } from '../../utils/riskUtils';
import Tooltip from '../ui/Tooltip';

export default function RiskMatrix() {
  const { risks } = useRiskStore();
  
  const matrix = Array.from({ length: 5 }, (_, impact) =>
    Array.from({ length: 5 }, (_, likelihood) => {
      const exposure = (likelihood + 1) * (5 - impact);
      const risksInCell = risks.filter(r => 
        r.likelihood === likelihood + 1 && r.impact === 5 - impact
      );
      
      return {
        likelihood: likelihood + 1,
        impact: 5 - impact,
        exposure,
        count: risksInCell.length,
        risks: risksInCell
      };
    })
  );
  
  return (
    <div className="card-elevated p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-title text-gray-900 mb-2">Risk Assessment Matrix</h3>
          <p className="text-caption">Exposure = Likelihood × Impact</p>
        </div>
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: '#10b981' }}></div>
            <span className="font-medium text-gray-700">Acceptable (≤6)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: '#f59e0b' }}></div>
            <span className="font-medium text-gray-700">Monitor (7-12)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: '#ef4444' }}></div>
            <span className="font-medium text-gray-700">Action Required ({">"}12)</span>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full bg-gray-50 rounded-xl p-4">
          {/* Header */}
          <div className="flex">
            <div className="w-24"></div>
            <div className="flex">
              {[1, 2, 3, 4, 5].map(likelihood => (
                <div key={likelihood} className="w-28 text-center p-2">
                  <div className="text-sm font-bold text-gray-800 mb-1">{likelihood}</div>
                  <div className="text-xs text-gray-600 font-medium">{getLikelihoodDescription(likelihood)}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Matrix */}
          {matrix.map((row, impactIndex) => (
            <div key={impactIndex} className="flex">
              <div className="w-24 flex items-center justify-end pr-4 py-2">
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-800">{5 - impactIndex}</div>
                  <div className="text-xs text-gray-600 font-medium">{getBusinessImpactDescription(5 - impactIndex)}</div>
                </div>
              </div>
              <div className="flex">
                {row.map((cell, likelihoodIndex) => (
                  <Tooltip
                    key={`${impactIndex}-${likelihoodIndex}`}
                    content={
                      <div className="text-center">
                        <div className="font-semibold mb-2">
                          Exposure: {cell.exposure}
                        </div>
                        <div className="text-xs mb-1">
                          Likelihood: {getLikelihoodDescription(cell.likelihood)}
                        </div>
                        <div className="text-xs mb-2">
                          Impact: {getBusinessImpactDescription(cell.impact)}
                        </div>
                        <div className="text-xs">
                          {cell.count} risk{cell.count !== 1 ? 's' : ''} in this category
                        </div>
                        {cell.risks.length > 0 && (
                          <div className="mt-2 text-xs">
                            <div className="font-medium">Risks:</div>
                            {cell.risks.slice(0, 3).map(risk => (
                              <div key={risk.id} className="truncate">{risk.title}</div>
                            ))}
                            {cell.risks.length > 3 && (
                              <div>+{cell.risks.length - 3} more</div>
                            )}
                          </div>
                        )}
                      </div>
                    }
                  >
                    <div
                      className="matrix-cell w-28 h-20 rounded-lg m-1"
                      style={{ 
                        backgroundColor: getRiskColor(cell.exposure) + '15',
                        border: `2px solid ${getRiskColor(cell.exposure)}40`
                      }}
                    >
                      <div className="text-center">
                        <div className="text-lg font-bold" style={{ color: getRiskColor(cell.exposure) }}>{cell.exposure}</div>
                        {cell.count > 0 && (
                          <div className="text-xs font-semibold text-gray-700 mt-1">{cell.count} risk{cell.count !== 1 ? 's' : ''}</div>
                        )}
                      </div>
                    </div>
                  </Tooltip>
                ))}
              </div>
            </div>
          ))}
          
          {/* Y-axis label */}
          <div className="flex justify-start mt-4">
            <div className="w-24 text-center py-4">
              <div className="transform -rotate-90 text-sm font-bold text-gray-800">
                Business Impact
              </div>
            </div>
            <div className="flex-1 text-center">
              <div className="text-sm font-bold text-gray-800">Likelihood of Occurrence</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}