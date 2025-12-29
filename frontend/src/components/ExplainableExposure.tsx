/**
 * Explainable Exposure Component
 * 
 * Shows exposure value with full explanation of calculation
 * Critical for enterprise trust and defensibility
 */

import Tooltip from './Tooltip';
import StatusBadge from './StatusBadge';

interface ExplainableExposureProps {
  likelihood: number;
  impact: number;
  exposure: number;
  showBadge?: boolean;
  size?: 'sm' | 'md';
}

const likelihoodLabels = ['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'];
const impactLabels = ['Negligible', 'Minor', 'Moderate', 'Major', 'Catastrophic'];

export default function ExplainableExposure({
  likelihood,
  impact,
  exposure,
  showBadge = true,
  size = 'md',
}: ExplainableExposureProps) {
  const getStatus = (): 'critical' | 'warning' | 'acceptable' => {
    if (exposure > 12) return 'critical';
    if (exposure > 6) return 'warning';
    return 'acceptable';
  };

  const explanation = `Exposure Calculation:
  
Likelihood: ${likelihood} (${likelihoodLabels[likelihood - 1]})
Impact: ${impact} (${impactLabels[impact - 1]})

Formula: Exposure = Likelihood × Impact
Result: ${likelihood} × ${impact} = ${exposure}

Interpretation:
${exposure <= 6 ? 'Acceptable: Risk is within tolerance. Continue monitoring.' :
  exposure <= 12 ? 'Monitor: Risk requires periodic review and consideration of mitigation.' :
  'Action Required: Risk exceeds tolerance. Immediate treatment plan and executive escalation required.'}`;

  return (
    <div className="flex items-center space-x-2">
      {showBadge ? (
        <Tooltip content={explanation}>
          <StatusBadge
            status={getStatus()}
            label={`${exposure.toFixed(1)}`}
            size={size}
          />
        </Tooltip>
      ) : (
        <Tooltip content={explanation}>
          <span className={`font-semibold ${
            exposure > 12 ? 'text-red-600' :
            exposure > 6 ? 'text-yellow-600' : 'text-green-600'
          }`}>
            {exposure.toFixed(1)}
          </span>
        </Tooltip>
      )}
      <span className="text-xs text-gray-500">
        ({likelihood} × {impact})
      </span>
    </div>
  );
}

