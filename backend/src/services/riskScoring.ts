import { CyberRisk } from '../models/types.js';

/**
 * Risk Scoring Engine
 * Implements NIST 8286-aligned risk scoring methodology
 */

export interface RiskScore {
  likelihood: number;
  impact: number;
  exposure: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Calculate risk exposure from likelihood and impact
 * Exposure = Likelihood × Impact (standard 1-5 scale)
 */
export function calculateExposure(likelihood: number, impact: number): number {
  if (likelihood < 1 || likelihood > 5 || impact < 1 || impact > 5) {
    throw new Error('Likelihood and impact must be between 1 and 5');
  }
  return likelihood * impact;
}

/**
 * Determine risk level from exposure
 */
export function getRiskLevel(exposure: number): 'low' | 'medium' | 'high' | 'critical' {
  if (exposure <= 5) return 'low';
  if (exposure <= 10) return 'medium';
  if (exposure <= 20) return 'high';
  return 'critical';
}

/**
 * Calculate full risk score
 */
export function calculateRiskScore(likelihood: number, impact: number): RiskScore {
  const exposure = calculateExposure(likelihood, impact);
  const riskLevel = getRiskLevel(exposure);
  
  return {
    likelihood,
    impact,
    exposure,
    riskLevel,
  };
}

/**
 * Normalize exposure for aggregation (0-1 scale)
 */
export function normalizeExposure(exposure: number): number {
  // Max exposure is 25 (5 × 5), normalize to 0-1
  return Math.min(exposure / 25, 1);
}

/**
 * Generate risk matrix data for heatmap visualization
 */
export function generateRiskMatrix(risks: CyberRisk[]): {
  matrix: number[][];
  maxExposure: number;
} {
  const matrix: number[][] = Array(5).fill(null).map(() => Array(5).fill(0));
  let maxExposure = 0;

  for (const risk of risks) {
    const likelihood = risk.likelihood - 1; // Convert to 0-4 index
    const impact = risk.impact - 1;
    matrix[likelihood][impact] += risk.exposure;
    maxExposure = Math.max(maxExposure, risk.exposure);
  }

  return { matrix, maxExposure };
}

/**
 * Validate risk scoring inputs
 */
export function validateRiskInputs(likelihood: number, impact: number): { valid: boolean; error?: string } {
  if (likelihood < 1 || likelihood > 5) {
    return { valid: false, error: 'Likelihood must be between 1 and 5' };
  }
  if (impact < 1 || impact > 5) {
    return { valid: false, error: 'Impact must be between 1 and 5' };
  }
  return { valid: true };
}

