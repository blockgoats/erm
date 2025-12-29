import { RiskScenario } from '../types/risk';

export function getRiskLevel(exposure: number): 'low' | 'medium' | 'high' {
  if (exposure <= 6) return 'low';
  if (exposure <= 12) return 'medium';
  return 'high';
}

export function getRiskColor(exposure: number): string {
  const level = getRiskLevel(exposure);
  switch (level) {
    case 'low': return '#10b981'; // Green
    case 'medium': return '#f59e0b'; // Amber
    case 'high': return '#ef4444'; // Red
  }
}

export function getRiskLevelText(exposure: number): string {
  const level = getRiskLevel(exposure);
  switch (level) {
    case 'low': return 'Acceptable';
    case 'medium': return 'Monitor';
    case 'high': return 'Action Required';
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function getBusinessImpactDescription(impact: number): string {
  switch (impact) {
    case 1: return 'Minimal business disruption';
    case 2: return 'Limited operational impact';
    case 3: return 'Moderate business impact';
    case 4: return 'Significant operational disruption';
    case 5: return 'Severe business impact';
    default: return 'Unknown impact';
  }
}

export function getLikelihoodDescription(likelihood: number): string {
  switch (likelihood) {
    case 1: return 'Very unlikely';
    case 2: return 'Unlikely';
    case 3: return 'Possible';
    case 4: return 'Likely';
    case 5: return 'Very likely';
    default: return 'Unknown likelihood';
  }
}

export function calculateTrend(risks: RiskScenario[], period: 'week' | 'month' | 'quarter' = 'month'): number {
  // Mock trend calculation - in real app, would compare historical data
  const totalExposure = risks.reduce((sum, risk) => sum + risk.exposure, 0);
  const avgExposure = totalExposure / risks.length;
  
  // Simulate trend based on recent updates
  const recentlyUpdated = risks.filter(risk => {
    const daysDiff = Math.floor((Date.now() - risk.updatedAt.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff <= 30;
  }).length;
  
  return recentlyUpdated > risks.length * 0.3 ? 1 : -1; // 1 for increasing, -1 for decreasing
}

export function getMatrixPosition(likelihood: number, impact: number): { x: number; y: number } {
  return {
    x: (likelihood - 1) * 20, // 0, 20, 40, 60, 80
    y: (5 - impact) * 20 // Invert Y axis so high impact is at top
  };
}

export function getQuarterOverQuarterChange(current: number, previous: number): {
  change: number;
  percentage: number;
  direction: 'up' | 'down' | 'stable';
} {
  const change = current - previous;
  const percentage = previous === 0 ? 0 : (change / previous) * 100;
  
  let direction: 'up' | 'down' | 'stable';
  if (Math.abs(change) < 0.1) direction = 'stable';
  else if (change > 0) direction = 'up';
  else direction = 'down';
  
  return { change, percentage, direction };
}