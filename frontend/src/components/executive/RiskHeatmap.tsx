import React from 'react';
import { useRiskStore } from '../../store/riskStore';
import { getRiskColor } from '../../utils/riskUtils';

export default function RiskHeatmap() {
  const { risks } = useRiskStore();
  
  // Create a simplified heatmap matrix
  const matrix = Array.from({ length: 5 }, (_, impactIndex) =>
    Array.from({ length: 5 }, (_, likelihoodIndex) => {
      const likelihood = likelihoodIndex + 1;
      const impact = 5 - impactIndex;
      const exposure = likelihood * impact;
      const count = risks.filter(r => r.likelihood === likelihood && r.impact === impact).length;
      
      return {
        exposure,
        count,
        intensity: count > 0 ? Math.min(count / 3, 1) : 0 // Normalize intensity
      };
    })
  );
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-1">
        {matrix.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className="aspect-square flex items-center justify-center text-xs font-medium border rounded"
              style={{
                backgroundColor: cell.count > 0 
                  ? getRiskColor(cell.exposure) + Math.floor(cell.intensity * 255).toString(16).padStart(2, '0')
                  : '#f9fafb',
                color: cell.intensity > 0.5 ? 'white' : '#374151'
              }}
            >
              {cell.count || ''}
            </div>
          ))
        )}
      </div>
      
      <div className="flex items-center justify-between text-xs text-gray-600">
        <span>Low Likelihood</span>
        <span>High Likelihood</span>
      </div>
      
      <div className="flex flex-col items-end text-xs text-gray-600">
        <span>High Impact</span>
        <div className="h-16 flex items-center">
          <span className="transform -rotate-90">Low Impact</span>
        </div>
      </div>
    </div>
  );
}