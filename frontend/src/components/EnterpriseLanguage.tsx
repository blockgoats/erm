/**
 * Enterprise Language Utilities
 * 
 * Ensures consistent use of enterprise-grade language throughout the UI
 */

export const EnterpriseVerbs = {
  assess: 'Assess',
  review: 'Review',
  approve: 'Approve',
  escalate: 'Escalate',
  monitor: 'Monitor',
  accept: 'Accept',
  mitigate: 'Mitigate',
  reassess: 'Reassess',
  acknowledge: 'Acknowledge',
  resolve: 'Resolve',
} as const;

export const RiskActions = {
  assess: 'Assess risk',
  review: 'Review risk',
  approve: 'Approve risk treatment',
  escalate: 'Escalate to executive',
  monitor: 'Monitor risk',
  accept: 'Accept risk',
  mitigate: 'Mitigate risk',
  reassess: 'Reassess risk',
} as const;

export const StatusLabels = {
  identified: 'Identified',
  assessed: 'Assessed',
  treated: 'Treated',
  accepted: 'Accepted',
  monitored: 'Monitored',
  closed: 'Closed',
} as const;

export const ImpactTypeLabels = {
  Financial: 'Financial Impact',
  Operational: 'Operational Impact',
  Reputational: 'Reputational Impact',
  Compliance: 'Compliance Impact',
  Strategic: 'Strategic Impact',
} as const;

export const ResponseTypeLabels = {
  avoid: 'Avoid',
  mitigate: 'Mitigate',
  transfer: 'Transfer',
  accept: 'Accept',
} as const;

/**
 * Expand acronyms for clarity
 */
export function expandAcronym(acronym: string): string {
  const expansions: Record<string, string> = {
    CSRR: 'Cybersecurity Risk Register',
    ERR: 'Enterprise Risk Register',
    KRI: 'Key Risk Indicator',
    PII: 'Personally Identifiable Information',
    GDPR: 'General Data Protection Regulation',
    NIST: 'National Institute of Standards and Technology',
    ERM: 'Enterprise Risk Management',
  };
  return expansions[acronym] || acronym;
}

/**
 * Format business-friendly risk descriptions
 */
export function formatRiskDescription(risk: {
  threat: string;
  vulnerability: string;
  impactDescription: string;
}): string {
  return `If ${risk.threat} exploits ${risk.vulnerability}, the impact would be: ${risk.impactDescription}`;
}

