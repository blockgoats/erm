import { RiskScenario, RiskAppetite, RiskCategory } from '../types/risk';

const riskCategories: RiskCategory[] = [
  'Cyber Security',
  'Operational',
  'Financial',
  'Compliance',
  'Strategic',
  'Reputational'
];

const mockThreats = [
  'Advanced Persistent Threat',
  'Insider Threat',
  'Ransomware Attack',
  'Supply Chain Compromise',
  'Cloud Misconfiguration',
  'Social Engineering',
  'Zero-day Exploit',
  'DDoS Attack'
];

const mockVulnerabilities = [
  'Unpatched Systems',
  'Weak Access Controls',
  'Insufficient Monitoring',
  'Legacy Infrastructure',
  'Inadequate Training',
  'Poor Data Classification',
  'Weak Encryption',
  'Missing Backups'
];

const mockAssets = [
  'Customer Database',
  'Payment Systems',
  'Intellectual Property',
  'Manufacturing Systems',
  'Cloud Infrastructure',
  'Employee Data',
  'Financial Records',
  'Strategic Plans'
];

const mockOwners = [
  'Sarah Chen (CISO)',
  'Mike Rodriguez (CFO)',
  'David Park (CTO)',
  'Lisa Wang (COO)',
  'Tom Johnson (CHRO)',
  'Anna Smith (CPO)',
  'Robert Brown (CRO)'
];

export function generateMockRisks(): RiskScenario[] {
  const risks: RiskScenario[] = [];
  
  for (let i = 0; i < 25; i++) {
    const likelihood = Math.floor(Math.random() * 5) + 1;
    const impact = Math.floor(Math.random() * 5) + 1;
    const category = riskCategories[Math.floor(Math.random() * riskCategories.length)];
    
    const baseDate = new Date();
    const lastReviewed = new Date(baseDate.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000);
    const nextReview = new Date(lastReviewed.getTime() + 90 * 24 * 60 * 60 * 1000);
    
    risks.push({
      id: `risk-${i + 1}`,
      title: `${category} Risk ${i + 1}`,
      description: `Comprehensive risk scenario involving ${mockThreats[Math.floor(Math.random() * mockThreats.length)]} targeting ${mockAssets[Math.floor(Math.random() * mockAssets.length)]}.`,
      threat: mockThreats[Math.floor(Math.random() * mockThreats.length)],
      vulnerability: mockVulnerabilities[Math.floor(Math.random() * mockVulnerabilities.length)],
      asset: mockAssets[Math.floor(Math.random() * mockAssets.length)],
      category,
      likelihood,
      impact,
      exposure: likelihood * impact,
      riskOwner: mockOwners[Math.floor(Math.random() * mockOwners.length)],
      lastReviewed,
      nextReview,
      status: Math.random() > 0.8 ? 'mitigated' : 'active',
      evidenceLinks: [`evidence-${i + 1}-1`, `evidence-${i + 1}-2`],
      mitigationActions: [],
      trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as any,
      version: Math.floor(Math.random() * 5) + 1,
      createdAt: new Date(baseDate.getTime() - Math.random() * 180 * 24 * 60 * 60 * 1000),
      updatedAt: lastReviewed
    });
  }
  
  return risks.sort((a, b) => b.exposure - a.exposure);
}

export function generateMockAppetites(): RiskAppetite[] {
  return riskCategories.map(category => ({
    category,
    threshold: Math.floor(Math.random() * 3) + 8, // 8-10 threshold
    statement: `The organization maintains a ${category.toLowerCase()} risk appetite that prioritizes ${
      category === 'Cyber Security' ? 'data protection and system availability' :
      category === 'Financial' ? 'financial stability and growth' :
      category === 'Operational' ? 'business continuity and efficiency' :
      category === 'Compliance' ? 'regulatory adherence and ethical conduct' :
      category === 'Strategic' ? 'competitive advantage and innovation' :
      'brand reputation and stakeholder trust'
    }.`,
    breached: Math.random() > 0.7
  }));
}