import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';

export type MaturityLevel = 'Initial' | 'Managed' | 'Defined' | 'Quantitatively Managed' | 'Optimizing';
export type AssessmentType = 'Self-Assessment' | 'Internal Audit' | 'External Audit' | 'Peer Review';

export interface MaturityAssessment {
  id: string;
  organization_id: string;
  assessment_id: string;
  assessment_type: AssessmentType;
  assessed_by: string;
  assessment_date: string;
  overall_score: number;
  maturity_level: MaturityLevel;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAssessmentDTO {
  assessment_id?: string;
  assessment_type: AssessmentType;
  assessment_date: string;
  overall_score: number;
  maturity_level: MaturityLevel;
  notes?: string;
  domain_scores?: DomainScoreDTO[];
}

export interface DomainScore {
  id: string;
  assessment_id: string;
  domain: string;
  score: number;
  maturity_level: MaturityLevel;
  notes?: string;
  created_at: string;
}

export interface DomainScoreDTO {
  domain: string;
  score: number;
  maturity_level: MaturityLevel;
  notes?: string;
}

export interface RiskReductionMetric {
  id: string;
  organization_id: string;
  metric_id: string;
  period_start: string;
  period_end: string;
  baseline_exposure: number;
  current_exposure: number;
  risk_reduction_percentage: number;
  risks_addressed: number;
  risks_mitigated: number;
  risks_accepted: number;
  created_at: string;
}

export interface AppetiteAdherenceMetric {
  id: string;
  organization_id: string;
  category: string;
  period_start: string;
  period_end: string;
  total_breaches: number;
  breaches_acknowledged: number;
  breaches_resolved: number;
  adherence_percentage: number;
  created_at: string;
}

export class MaturityService {
  constructor(private db: Database.Database) {}

  // Maturity Assessments
  createAssessment(orgId: string, userId: string, dto: CreateAssessmentDTO): MaturityAssessment {
    const id = uuidv4();
    const assessmentId = dto.assessment_id || `MAT-${id.substring(0, 8).toUpperCase()}`;

    const stmt = this.db.prepare(`
      INSERT INTO maturity_assessments (
        id, organization_id, assessment_id, assessment_type, assessed_by,
        assessment_date, overall_score, maturity_level, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      orgId,
      assessmentId,
      dto.assessment_type,
      userId,
      dto.assessment_date,
      dto.overall_score,
      dto.maturity_level,
      dto.notes || null,
      new Date().toISOString(),
      new Date().toISOString()
    );

    // Create domain scores
    if (dto.domain_scores) {
      for (const domainScore of dto.domain_scores) {
        this.createDomainScore(id, domainScore);
      }
    }

    return this.getAssessmentById(id)!;
  }

  getAssessments(orgId: string): MaturityAssessment[] {
    const stmt = this.db.prepare(`
      SELECT * FROM maturity_assessments 
      WHERE organization_id = ? 
      ORDER BY assessment_date DESC
    `);
    const rows = stmt.all(orgId) as any[];
    return rows.map(row => this.mapRowToAssessment(row));
  }

  getDomainScores(assessmentId: string): DomainScore[] {
    const stmt = this.db.prepare(`
      SELECT * FROM domain_scores 
      WHERE assessment_id = ? 
      ORDER BY domain ASC
    `);
    const rows = stmt.all(assessmentId) as any[];
    return rows.map(row => this.mapRowToDomainScore(row));
  }

  // Risk Reduction Metrics
  calculateRiskReduction(orgId: string, periodStart: string, periodEnd: string): RiskReductionMetric {
    // Get baseline exposure (from period start)
    const baselineRisks = this.db.prepare(`
      SELECT SUM(exposure) as total_exposure, COUNT(*) as count
      FROM cyber_risks
      WHERE organization_id = ? AND created_at <= ?
    `).get(orgId, periodStart) as { total_exposure: number; count: number };

    // Get current exposure
    const currentRisks = this.db.prepare(`
      SELECT SUM(exposure) as total_exposure, COUNT(*) as count
      FROM cyber_risks
      WHERE organization_id = ? AND created_at <= ?
    `).get(orgId, periodEnd) as { total_exposure: number; count: number };

    const baselineExposure = baselineRisks.total_exposure || 0;
    const currentExposure = currentRisks.total_exposure || 0;
    const riskReduction = baselineExposure > 0 
      ? ((baselineExposure - currentExposure) / baselineExposure) * 100 
      : 0;

    // Count risks by status
    const risksMitigated = this.db.prepare(`
      SELECT COUNT(*) as count FROM cyber_risks
      WHERE organization_id = ? AND status = 'treated' AND updated_at BETWEEN ? AND ?
    `).get(orgId, periodStart, periodEnd) as { count: number };

    const risksAccepted = this.db.prepare(`
      SELECT COUNT(*) as count FROM cyber_risks
      WHERE organization_id = ? AND status = 'accepted' AND updated_at BETWEEN ? AND ?
    `).get(orgId, periodStart, periodEnd) as { count: number };

    const id = uuidv4();
    const metricId = `RRM-${id.substring(0, 8).toUpperCase()}`;

    this.db.prepare(`
      INSERT INTO risk_reduction_metrics (
        id, organization_id, metric_id, period_start, period_end,
        baseline_exposure, current_exposure, risk_reduction_percentage,
        risks_addressed, risks_mitigated, risks_accepted, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      orgId,
      metricId,
      periodStart,
      periodEnd,
      baselineExposure,
      currentExposure,
      riskReduction,
      currentRisks.count || 0,
      risksMitigated.count || 0,
      risksAccepted.count || 0,
      new Date().toISOString()
    );

    return this.getRiskReductionMetricById(id)!;
  }

  getRiskReductionMetrics(orgId: string): RiskReductionMetric[] {
    const stmt = this.db.prepare(`
      SELECT * FROM risk_reduction_metrics 
      WHERE organization_id = ? 
      ORDER BY period_end DESC
    `);
    const rows = stmt.all(orgId) as any[];
    return rows.map(row => this.mapRowToRiskReduction(row));
  }

  // Appetite Adherence Metrics
  calculateAppetiteAdherence(orgId: string, category: string, periodStart: string, periodEnd: string): AppetiteAdherenceMetric {
    const breaches = this.db.prepare(`
      SELECT COUNT(*) as total,
             SUM(CASE WHEN acknowledged_at IS NOT NULL THEN 1 ELSE 0 END) as acknowledged,
             SUM(CASE WHEN resolved_at IS NOT NULL THEN 1 ELSE 0 END) as resolved
      FROM appetite_breaches ab
      JOIN risk_appetite ra ON ab.appetite_id = ra.id
      WHERE ra.organization_id = ? AND ra.category = ? 
        AND ab.detected_at BETWEEN ? AND ?
    `).get(orgId, category, periodStart, periodEnd) as { total: number; acknowledged: number; resolved: number };

    const totalBreaches = breaches.total || 0;
    const acknowledged = breaches.acknowledged || 0;
    const resolved = breaches.resolved || 0;
    const adherencePercentage = totalBreaches > 0 
      ? ((totalBreaches - (totalBreaches - resolved)) / totalBreaches) * 100 
      : 100;

    const id = uuidv4();
    const metricId = `AAM-${id.substring(0, 8).toUpperCase()}`;

    this.db.prepare(`
      INSERT INTO appetite_adherence_metrics (
        id, organization_id, category, period_start, period_end,
        total_breaches, breaches_acknowledged, breaches_resolved,
        adherence_percentage, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      orgId,
      category,
      periodStart,
      periodEnd,
      totalBreaches,
      acknowledged,
      resolved,
      adherencePercentage,
      new Date().toISOString()
    );

    return this.getAppetiteAdherenceMetricById(id)!;
  }

  getAppetiteAdherenceMetrics(orgId: string): AppetiteAdherenceMetric[] {
    const stmt = this.db.prepare(`
      SELECT * FROM appetite_adherence_metrics 
      WHERE organization_id = ? 
      ORDER BY period_end DESC
    `);
    const rows = stmt.all(orgId) as any[];
    return rows.map(row => this.mapRowToAppetiteAdherence(row));
  }

  private createDomainScore(assessmentId: string, dto: DomainScoreDTO): DomainScore {
    const id = uuidv4();
    this.db.prepare(`
      INSERT INTO domain_scores (
        id, assessment_id, domain, score, maturity_level, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      assessmentId,
      dto.domain,
      dto.score,
      dto.maturity_level,
      dto.notes || null,
      new Date().toISOString()
    );

    return this.getDomainScoreById(id)!;
  }

  private getAssessmentById(id: string): MaturityAssessment | null {
    const stmt = this.db.prepare('SELECT * FROM maturity_assessments WHERE id = ?');
    const row = stmt.get(id) as any;
    if (!row) return null;
    return this.mapRowToAssessment(row);
  }

  private getDomainScoreById(id: string): DomainScore | null {
    const stmt = this.db.prepare('SELECT * FROM domain_scores WHERE id = ?');
    const row = stmt.get(id) as any;
    if (!row) return null;
    return this.mapRowToDomainScore(row);
  }

  private getRiskReductionMetricById(id: string): RiskReductionMetric | null {
    const stmt = this.db.prepare('SELECT * FROM risk_reduction_metrics WHERE id = ?');
    const row = stmt.get(id) as any;
    if (!row) return null;
    return this.mapRowToRiskReduction(row);
  }

  private getAppetiteAdherenceMetricById(id: string): AppetiteAdherenceMetric | null {
    const stmt = this.db.prepare('SELECT * FROM appetite_adherence_metrics WHERE id = ?');
    const row = stmt.get(id) as any;
    if (!row) return null;
    return this.mapRowToAppetiteAdherence(row);
  }

  private mapRowToAssessment(row: any): MaturityAssessment {
    return {
      id: row.id,
      organization_id: row.organization_id,
      assessment_id: row.assessment_id,
      assessment_type: row.assessment_type,
      assessed_by: row.assessed_by,
      assessment_date: row.assessment_date,
      overall_score: row.overall_score,
      maturity_level: row.maturity_level,
      notes: row.notes || undefined,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private mapRowToDomainScore(row: any): DomainScore {
    return {
      id: row.id,
      assessment_id: row.assessment_id,
      domain: row.domain,
      score: row.score,
      maturity_level: row.maturity_level,
      notes: row.notes || undefined,
      created_at: row.created_at,
    };
  }

  private mapRowToRiskReduction(row: any): RiskReductionMetric {
    return {
      id: row.id,
      organization_id: row.organization_id,
      metric_id: row.metric_id,
      period_start: row.period_start,
      period_end: row.period_end,
      baseline_exposure: row.baseline_exposure,
      current_exposure: row.current_exposure,
      risk_reduction_percentage: row.risk_reduction_percentage,
      risks_addressed: row.risks_addressed,
      risks_mitigated: row.risks_mitigated,
      risks_accepted: row.risks_accepted,
      created_at: row.created_at,
    };
  }

  private mapRowToAppetiteAdherence(row: any): AppetiteAdherenceMetric {
    return {
      id: row.id,
      organization_id: row.organization_id,
      category: row.category,
      period_start: row.period_start,
      period_end: row.period_end,
      total_breaches: row.total_breaches,
      breaches_acknowledged: row.breaches_acknowledged,
      breaches_resolved: row.breaches_resolved,
      adherence_percentage: row.adherence_percentage,
      created_at: row.created_at,
    };
  }
}

