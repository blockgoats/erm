import Database from 'better-sqlite3';
import { EnterpriseRiskService } from './enterpriseRisk.js';
import { AppetiteService } from './appetite.js';
import { RiskRegisterService } from './riskRegister.js';
import { getDatabase } from '../db/index.js';

export interface BoardReportData {
  generated_at: string;
  organization_name: string;
  period: string;
  top_risks: Array<{
    rank: number;
    title: string;
    category: string;
    exposure: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  appetite_breaches: Array<{
    category: string;
    breach_value: number;
    threshold: number;
    risk_title: string;
  }>;
  summary: {
    total_risks: number;
    critical_risks: number;
    total_exposure: number;
    breaches_count: number;
  };
  conclusions: string[];
}

export class ReportingService {
  constructor(
    private db: Database.Database,
    private enterpriseRiskService: EnterpriseRiskService,
    private appetiteService: AppetiteService,
    private riskRegisterService: RiskRegisterService
  ) {}

  /**
   * Generate board report data
   */
  async generateBoardReport(orgId: string, period?: string): Promise<BoardReportData> {
    // Get organization name
    const org = this.db.prepare('SELECT name FROM organizations WHERE id = ?').get(orgId) as any;
    const orgName = org?.name || 'Organization';

    // Get top 5 enterprise risks
    const enterpriseRisks = this.enterpriseRiskService.listEnterpriseRisks(orgId).slice(0, 5);

    // Get active breaches
    const breaches = this.appetiteService.getActiveBreaches(orgId);

    // Get all risks for summary
    const allRisks = this.riskRegisterService.listRisks(orgId);
    const criticalRisks = allRisks.filter(r => r.exposure >= 20);
    const totalExposure = allRisks.reduce((sum, r) => sum + r.exposure, 0);

    // Generate conclusions
    const conclusions = this.generateConclusions(enterpriseRisks, breaches, criticalRisks);

    return {
      generated_at: new Date().toISOString(),
      organization_name: orgName,
      period: period || this.getCurrentQuarter(),
      top_risks: enterpriseRisks.map((risk, index) => ({
        rank: risk.priority_rank || index + 1,
        title: risk.title,
        category: risk.category,
        exposure: risk.aggregated_exposure,
        trend: this.calculateTrend(risk), // Simplified - would compare with historical
      })),
      appetite_breaches: breaches.map(breach => {
        const risk = enterpriseRisks.find(r => r.id === breach.enterprise_risk_id);
        return {
          category: risk?.category || 'Unknown',
          breach_value: breach.breach_value,
          threshold: breach.threshold_value,
          risk_title: risk?.title || 'Unknown Risk',
        };
      }),
      summary: {
        total_risks: allRisks.length,
        critical_risks: criticalRisks.length,
        total_exposure: totalExposure,
        breaches_count: breaches.length,
      },
      conclusions,
    };
  }

  /**
   * Generate plain-English conclusions
   */
  private generateConclusions(
    topRisks: any[],
    breaches: any[],
    criticalRisks: any[]
  ): string[] {
    const conclusions: string[] = [];

    if (breaches.length > 0) {
      conclusions.push(`Action Required: ${breaches.length} risk${breaches.length > 1 ? 's' : ''} exceed established tolerance thresholds.`);
    }

    if (criticalRisks.length > 0) {
      conclusions.push(`Risk Increased: ${criticalRisks.length} critical risk${criticalRisks.length > 1 ? 's' : ''} require immediate attention.`);
    } else if (topRisks.length > 0 && topRisks[0].aggregated_exposure < 15) {
      conclusions.push('Risk Stabilized: Enterprise risk exposure remains within acceptable parameters.');
    }

    if (topRisks.length > 0) {
      const avgExposure = topRisks.reduce((sum, r) => sum + r.aggregated_exposure, 0) / topRisks.length;
      if (avgExposure > 15) {
        conclusions.push('Elevated Risk Profile: Average enterprise risk exposure is above historical baseline.');
      }
    }

    if (conclusions.length === 0) {
      conclusions.push('Risk Profile Normal: All enterprise risks are within acceptable tolerance levels.');
    }

    return conclusions;
  }

  /**
   * Calculate trend (simplified - would compare with historical data)
   */
  private calculateTrend(risk: any): 'up' | 'down' | 'stable' {
    // In real implementation, compare with previous period
    // For MVP, return stable
    return 'stable';
  }

  /**
   * Get current quarter string
   */
  private getCurrentQuarter(): string {
    const now = new Date();
    const quarter = Math.floor(now.getMonth() / 3) + 1;
    const year = now.getFullYear();
    return `Q${quarter} ${year}`;
  }
}

