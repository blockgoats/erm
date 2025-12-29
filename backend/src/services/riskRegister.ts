import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { CyberRisk, CreateRiskDTO, UpdateRiskDTO, RiskHistory, RiskStatus } from '../models/types.js';
import { calculateExposure, validateRiskInputs } from './riskScoring.js';

export class RiskRegisterService {
  constructor(private db: Database.Database) {}

  /**
   * Create a new cybersecurity risk
   */
  createRisk(orgId: string, userId: string, dto: CreateRiskDTO): CyberRisk {
    // Validate scoring inputs
    const validation = validateRiskInputs(dto.likelihood, dto.impact);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const exposure = calculateExposure(dto.likelihood, dto.impact);
    const id = uuidv4();
    const now = new Date().toISOString();

    const riskId = dto.risk_id || `RISK-${id.substring(0, 8).toUpperCase()}`;
    
    const stmt = this.db.prepare(`
      INSERT INTO cyber_risks (
        id, organization_id, business_unit_id, system_id, asset_id, risk_id,
        title, description, threat, vulnerability, impact_description, impact_type,
        likelihood, impact, exposure, category, response_type, owner_role, status, owner_id, created_by,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      orgId,
      dto.business_unit_id || null,
      dto.system_id || null,
      dto.asset_id || null,
      riskId,
      dto.title,
      dto.description,
      dto.threat,
      dto.vulnerability,
      dto.impact_description,
      dto.impact_type,
      dto.likelihood,
      dto.impact,
      exposure,
      dto.category,
      dto.response_type || null,
      dto.owner_role || null,
      'identified',
      dto.owner_id || null,
      userId,
      now,
      now
    );

    // Log creation in history
    this.logRiskChange(id, userId, 'created', null, JSON.stringify(dto));

    return this.getRiskById(id)!;
  }

  /**
   * Update an existing risk
   */
  updateRisk(riskId: string, userId: string, dto: UpdateRiskDTO): CyberRisk {
    const existing = this.getRiskById(riskId);
    if (!existing) {
      throw new Error('Risk not found');
    }

    // Recalculate exposure if likelihood or impact changed
    let exposure = existing.exposure;
    let likelihood = dto.likelihood ?? existing.likelihood;
    let impact = dto.impact ?? existing.impact;

    if (dto.likelihood !== undefined || dto.impact !== undefined) {
      const validation = validateRiskInputs(likelihood, impact);
      if (!validation.valid) {
        throw new Error(validation.error);
      }
      exposure = calculateExposure(likelihood, impact);
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (dto.title !== undefined) {
      updates.push('title = ?');
      values.push(dto.title);
      this.logRiskChange(riskId, userId, 'title_changed', existing.title, dto.title);
    }
    if (dto.description !== undefined) {
      updates.push('description = ?');
      values.push(dto.description);
    }
    if (dto.threat !== undefined) {
      updates.push('threat = ?');
      values.push(dto.threat);
    }
    if (dto.vulnerability !== undefined) {
      updates.push('vulnerability = ?');
      values.push(dto.vulnerability);
    }
    if (dto.impact_description !== undefined) {
      updates.push('impact_description = ?');
      values.push(dto.impact_description);
    }
    if (dto.impact_type !== undefined) {
      updates.push('impact_type = ?');
      values.push(dto.impact_type);
    }
    if (dto.likelihood !== undefined) {
      updates.push('likelihood = ?');
      values.push(dto.likelihood);
      this.logRiskChange(riskId, userId, 'likelihood_changed', existing.likelihood.toString(), dto.likelihood.toString());
    }
    if (dto.impact !== undefined) {
      updates.push('impact = ?');
      values.push(dto.impact);
      this.logRiskChange(riskId, userId, 'impact_changed', existing.impact.toString(), dto.impact.toString());
    }
    if (dto.category !== undefined) {
      updates.push('category = ?');
      values.push(dto.category);
    }
    if (dto.status !== undefined) {
      updates.push('status = ?');
      values.push(dto.status);
      this.logRiskChange(riskId, userId, 'status_changed', existing.status as string, dto.status as string);
    }
    if (dto.business_unit_id !== undefined) {
      updates.push('business_unit_id = ?');
      values.push(dto.business_unit_id || null);
    }
    if (dto.system_id !== undefined) {
      updates.push('system_id = ?');
      values.push(dto.system_id || null);
    }
    if (dto.asset_id !== undefined) {
      updates.push('asset_id = ?');
      values.push(dto.asset_id || null);
    }
    if (dto.response_type !== undefined) {
      updates.push('response_type = ?');
      values.push(dto.response_type || null);
    }
    if (dto.owner_role !== undefined) {
      updates.push('owner_role = ?');
      values.push(dto.owner_role || null);
    }
    if (dto.owner_id !== undefined) {
      updates.push('owner_id = ?');
      values.push(dto.owner_id || null);
      this.logRiskChange(riskId, userId, 'owner_changed', existing.owner_id || null, dto.owner_id || null);
    }

    if (exposure !== existing.exposure) {
      updates.push('exposure = ?');
      values.push(exposure);
    }

    if (updates.length === 0) {
      return existing;
    }

    updates.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(riskId);

    const sql = `UPDATE cyber_risks SET ${updates.join(', ')} WHERE id = ?`;
    this.db.prepare(sql).run(...values);

    return this.getRiskById(riskId)!;
  }

  /**
   * Get risk by ID
   */
  getRiskById(riskId: string): CyberRisk | null {
    const stmt = this.db.prepare('SELECT * FROM cyber_risks WHERE id = ?');
    const row = stmt.get(riskId) as any;
    if (!row) return null;
    return this.mapRowToRisk(row);
  }

  /**
   * List risks with filters
   */
  listRisks(orgId: string, filters?: {
    status?: string;
    category?: string;
    business_unit_id?: string;
    owner_id?: string;
    min_exposure?: number;
    max_exposure?: number;
  }): CyberRisk[] {
    let sql = 'SELECT * FROM cyber_risks WHERE organization_id = ?';
    const params: any[] = [orgId];

    if (filters) {
      if (filters.status) {
        sql += ' AND status = ?';
        params.push(filters.status);
      }
      if (filters.category) {
        sql += ' AND category = ?';
        params.push(filters.category);
      }
      if (filters.business_unit_id) {
        sql += ' AND business_unit_id = ?';
        params.push(filters.business_unit_id);
      }
      if (filters.owner_id) {
        sql += ' AND owner_id = ?';
        params.push(filters.owner_id);
      }
      if (filters.min_exposure !== undefined) {
        sql += ' AND exposure >= ?';
        params.push(filters.min_exposure);
      }
      if (filters.max_exposure !== undefined) {
        sql += ' AND exposure <= ?';
        params.push(filters.max_exposure);
      }
    }

    sql += ' ORDER BY exposure DESC, created_at DESC';

    const stmt = this.db.prepare(sql);
    const rows = stmt.all(...params) as any[];
    return rows.map(row => this.mapRowToRisk(row));
  }

  /**
   * Delete a risk
   */
  deleteRisk(riskId: string, userId: string): void {
    const risk = this.getRiskById(riskId);
    if (!risk) {
      throw new Error('Risk not found');
    }

    this.logRiskChange(riskId, userId, 'deleted', JSON.stringify(risk), null);
    const stmt = this.db.prepare('DELETE FROM cyber_risks WHERE id = ?');
    stmt.run(riskId);
  }

  /**
   * Get risk history
   */
  getRiskHistory(riskId: string): RiskHistory[] {
    const stmt = this.db.prepare(`
      SELECT * FROM risk_history 
      WHERE risk_id = ? 
      ORDER BY created_at DESC
    `);
    return stmt.all(riskId) as RiskHistory[];
  }

  /**
   * Bulk import risks from CSV-like data
   */
  bulkImportRisks(orgId: string, userId: string, risks: CreateRiskDTO[]): { created: number; errors: string[] } {
    const errors: string[] = [];
    let created = 0;

    for (let i = 0; i < risks.length; i++) {
      try {
        this.createRisk(orgId, userId, risks[i]);
        created++;
      } catch (error: any) {
        errors.push(`Row ${i + 1}: ${error.message}`);
      }
    }

    return { created, errors };
  }

  private logRiskChange(riskId: string, userId: string, changeType: string, oldValue: string | null, newValue: string | null): void {
    const id = uuidv4();
    const stmt = this.db.prepare(`
      INSERT INTO risk_history (id, risk_id, changed_by, change_type, old_value, new_value, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, riskId, userId, changeType, oldValue, newValue, new Date().toISOString());
  }

  private mapRowToRisk(row: any): CyberRisk {
    return {
      id: row.id,
      organization_id: row.organization_id,
      business_unit_id: row.business_unit_id || undefined,
      system_id: row.system_id || undefined,
      asset_id: row.asset_id || undefined,
      risk_id: row.risk_id || `RISK-${row.id.substring(0, 8).toUpperCase()}`,
      title: row.title,
      description: row.description,
      threat: row.threat,
      vulnerability: row.vulnerability,
      impact_description: row.impact_description,
      impact_type: row.impact_type || 'Operational',
      likelihood: row.likelihood,
      impact: row.impact,
      exposure: row.exposure,
      category: row.category,
      response_type: row.response_type || undefined,
      owner_role: row.owner_role || undefined,
      status: row.status as RiskStatus,
      owner_id: row.owner_id || undefined,
      created_by: row.created_by,
      created_at: row.created_at,
      updated_at: row.updated_at,
      reviewed_at: row.reviewed_at || undefined,
      next_review_at: row.next_review_at || undefined,
    };
  }
}

