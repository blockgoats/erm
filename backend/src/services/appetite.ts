import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { RiskAppetite, AppetiteBreach, RiskCategory } from '../models/types.js';
import { EnterpriseRiskService } from './enterpriseRisk.js';
import { RiskRegisterService } from './riskRegister.js';

export interface CreateAppetiteDTO {
  category: RiskCategory;
  statement: string;
  tolerance_threshold: number;
}

export interface UpdateAppetiteDTO {
  statement?: string;
  tolerance_threshold?: number;
}

export class AppetiteService {
  constructor(
    private db: Database.Database,
    private enterpriseRiskService: EnterpriseRiskService,
    private riskRegisterService: RiskRegisterService
  ) {}

  /**
   * Create risk appetite statement
   */
  createAppetite(orgId: string, dto: CreateAppetiteDTO): RiskAppetite {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO risk_appetite (
        id, organization_id, category, statement, tolerance_threshold,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      orgId,
      dto.category,
      dto.statement,
      dto.tolerance_threshold,
      now,
      now
    );

    // Check for breaches immediately
    this.checkBreaches(orgId, dto.category);

    return this.getAppetiteById(id)!;
  }

  /**
   * Update risk appetite
   */
  updateAppetite(id: string, dto: UpdateAppetiteDTO): RiskAppetite {
    const existing = this.getAppetiteById(id);
    if (!existing) {
      throw new Error('Risk appetite not found');
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (dto.statement !== undefined) {
      updates.push('statement = ?');
      values.push(dto.statement);
    }
    if (dto.tolerance_threshold !== undefined) {
      updates.push('tolerance_threshold = ?');
      values.push(dto.tolerance_threshold);
    }

    if (updates.length === 0) {
      return existing;
    }

    updates.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    const sql = `UPDATE risk_appetite SET ${updates.join(', ')} WHERE id = ?`;
    this.db.prepare(sql).run(...values);

    // Recheck breaches
    this.checkBreaches(existing.organization_id, existing.category);

    return this.getAppetiteById(id)!;
  }

  /**
   * Get appetite by ID
   */
  getAppetiteById(id: string): RiskAppetite | null {
    const stmt = this.db.prepare('SELECT * FROM risk_appetite WHERE id = ?');
    const row = stmt.get(id) as any;
    if (!row) return null;
    return this.mapRowToAppetite(row);
  }

  /**
   * List appetites for organization
   */
  listAppetites(orgId: string, category?: RiskCategory): RiskAppetite[] {
    let sql = 'SELECT * FROM risk_appetite WHERE organization_id = ?';
    const params: any[] = [orgId];

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }

    sql += ' ORDER BY category';

    const stmt = this.db.prepare(sql);
    const rows = stmt.all(...params) as any[];
    return rows.map(row => this.mapRowToAppetite(row));
  }

  /**
   * Delete appetite
   */
  deleteAppetite(id: string): void {
    const stmt = this.db.prepare('DELETE FROM risk_appetite WHERE id = ?');
    stmt.run(id);
  }

  /**
   * Check for appetite breaches
   * Compares enterprise risk exposure against tolerance thresholds
   */
  checkBreaches(orgId: string, category?: RiskCategory): AppetiteBreach[] {
    const appetites = this.listAppetites(orgId, category);
    const breaches: AppetiteBreach[] = [];

    for (const appetite of appetites) {
      // Get enterprise risk for this category
      const enterpriseRisks = this.enterpriseRiskService.listEnterpriseRisks(orgId, {
        category: appetite.category,
      });

      for (const enterpriseRisk of enterpriseRisks) {
        if (enterpriseRisk.aggregated_exposure > appetite.tolerance_threshold) {
          // Check if breach already exists
          const existing = this.db.prepare(`
            SELECT * FROM appetite_breaches 
            WHERE appetite_id = ? AND enterprise_risk_id = ? AND resolved_at IS NULL
          `).get(appetite.id, enterpriseRisk.id) as any;

          if (!existing) {
            // Create new breach record
            const breachId = uuidv4();
            this.db.prepare(`
              INSERT INTO appetite_breaches (
                id, appetite_id, enterprise_risk_id, breach_value, threshold_value, detected_at
              ) VALUES (?, ?, ?, ?, ?, ?)
            `).run(
              breachId,
              appetite.id,
              enterpriseRisk.id,
              enterpriseRisk.aggregated_exposure,
              appetite.tolerance_threshold,
              new Date().toISOString()
            );

            breaches.push({
              id: breachId,
              appetite_id: appetite.id,
              risk_id: undefined,
              enterprise_risk_id: enterpriseRisk.id,
              breach_value: enterpriseRisk.aggregated_exposure,
              threshold_value: appetite.tolerance_threshold,
              detected_at: new Date().toISOString(),
              acknowledged_at: undefined,
              resolved_at: undefined,
            });
          }
        }
      }

      // Also check individual cyber risks
      const cyberRisks = this.riskRegisterService.listRisks(orgId, {
        category: appetite.category,
      });

      for (const risk of cyberRisks) {
        if (risk.exposure > appetite.tolerance_threshold) {
          const existing = this.db.prepare(`
            SELECT * FROM appetite_breaches 
            WHERE appetite_id = ? AND risk_id = ? AND resolved_at IS NULL
          `).get(appetite.id, risk.id) as any;

          if (!existing) {
            const breachId = uuidv4();
            this.db.prepare(`
              INSERT INTO appetite_breaches (
                id, appetite_id, risk_id, breach_value, threshold_value, detected_at
              ) VALUES (?, ?, ?, ?, ?, ?)
            `).run(
              breachId,
              appetite.id,
              risk.id,
              risk.exposure,
              appetite.tolerance_threshold,
              new Date().toISOString()
            );

            breaches.push({
              id: breachId,
              appetite_id: appetite.id,
              risk_id: risk.id,
              enterprise_risk_id: undefined,
              breach_value: risk.exposure,
              threshold_value: appetite.tolerance_threshold,
              detected_at: new Date().toISOString(),
              acknowledged_at: undefined,
              resolved_at: undefined,
            });
          }
        }
      }
    }

    return breaches;
  }

  /**
   * Get active breaches for organization
   */
  getActiveBreaches(orgId: string): AppetiteBreach[] {
    const stmt = this.db.prepare(`
      SELECT ab.* FROM appetite_breaches ab
      INNER JOIN risk_appetite ra ON ab.appetite_id = ra.id
      WHERE ra.organization_id = ? AND ab.resolved_at IS NULL
      ORDER BY ab.detected_at DESC
    `);
    const rows = stmt.all(orgId) as any[];
    return rows.map(row => this.mapRowToBreach(row));
  }

  /**
   * Acknowledge breach
   */
  acknowledgeBreach(breachId: string): void {
    this.db.prepare(`
      UPDATE appetite_breaches 
      SET acknowledged_at = ? 
      WHERE id = ?
    `).run(new Date().toISOString(), breachId);
  }

  /**
   * Resolve breach
   */
  resolveBreach(breachId: string): void {
    this.db.prepare(`
      UPDATE appetite_breaches 
      SET resolved_at = ? 
      WHERE id = ?
    `).run(new Date().toISOString(), breachId);
  }

  private mapRowToAppetite(row: any): RiskAppetite {
    return {
      id: row.id,
      organization_id: row.organization_id,
      objective: row.objective || 'Risk Management',
      category: row.category,
      statement: row.statement,
      tolerance_threshold: row.tolerance_threshold,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private mapRowToBreach(row: any): AppetiteBreach {
    return {
      id: row.id,
      appetite_id: row.appetite_id,
      risk_id: row.risk_id || undefined,
      enterprise_risk_id: row.enterprise_risk_id || undefined,
      breach_value: row.breach_value,
      threshold_value: row.threshold_value,
      detected_at: row.detected_at,
      acknowledged_at: row.acknowledged_at || undefined,
      resolved_at: row.resolved_at || undefined,
    };
  }
}

