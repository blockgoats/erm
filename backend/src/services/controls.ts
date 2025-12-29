import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';

export type ControlType = 'Preventive' | 'Detective' | 'Corrective' | 'Compensating';
export type ControlCategory = 'Technical' | 'Administrative' | 'Physical';
export type EffectivenessRating = 'Effective' | 'Partially Effective' | 'Ineffective' | 'Not Assessed';
export type ControlStatus = 'active' | 'inactive' | 'deprecated';
export type MappingType = 'mitigates' | 'monitors' | 'detects';
export type FindingSeverity = 'Critical' | 'High' | 'Medium' | 'Low';
export type FindingStatus = 'open' | 'in_progress' | 'resolved' | 'accepted';

export interface Control {
  id: string;
  organization_id: string;
  control_id: string;
  name: string;
  description?: string;
  control_type: ControlType;
  control_category: ControlCategory;
  framework?: string;
  owner_id?: string;
  owner_role?: string;
  effectiveness_rating?: EffectivenessRating;
  last_assessed_at?: string;
  next_assessment_at?: string;
  status: ControlStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateControlDTO {
  control_id?: string;
  name: string;
  description?: string;
  control_type: ControlType;
  control_category: ControlCategory;
  framework?: string;
  owner_id?: string;
  owner_role?: string;
  next_assessment_at?: string;
}

export interface RiskControlMapping {
  id: string;
  risk_id?: string;
  enterprise_risk_id?: string;
  control_id: string;
  mapping_type: MappingType;
  effectiveness?: 'High' | 'Medium' | 'Low';
  notes?: string;
  created_at: string;
}

export interface CreateMappingDTO {
  risk_id?: string;
  enterprise_risk_id?: string;
  control_id: string;
  mapping_type: MappingType;
  effectiveness?: 'High' | 'Medium' | 'Low';
  notes?: string;
}

export interface AuditFinding {
  id: string;
  organization_id: string;
  control_id?: string;
  finding_id: string;
  title: string;
  description: string;
  severity: FindingSeverity;
  status: FindingStatus;
  assigned_to?: string;
  due_date?: string;
  resolved_at?: string;
  resolution_notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateFindingDTO {
  finding_id?: string;
  control_id?: string;
  title: string;
  description: string;
  severity: FindingSeverity;
  assigned_to?: string;
  due_date?: string;
}

export interface ControlAssessment {
  id: string;
  control_id: string;
  assessed_by: string;
  assessment_date: string;
  effectiveness_rating: 'Effective' | 'Partially Effective' | 'Ineffective';
  design_rating?: 'Well Designed' | 'Adequately Designed' | 'Poorly Designed';
  operating_effectiveness?: 'Effective' | 'Partially Effective' | 'Ineffective';
  notes?: string;
  evidence_attached?: string;
  created_at: string;
}

export interface CreateAssessmentDTO {
  control_id: string;
  effectiveness_rating: 'Effective' | 'Partially Effective' | 'Ineffective';
  design_rating?: 'Well Designed' | 'Adequately Designed' | 'Poorly Designed';
  operating_effectiveness?: 'Effective' | 'Partially Effective' | 'Ineffective';
  notes?: string;
  evidence_attached?: string;
}

export class ControlsService {
  constructor(private db: Database.Database) {}

  /**
   * Create a new control
   */
  createControl(orgId: string, userId: string, dto: CreateControlDTO): Control {
    const id = uuidv4();
    const controlId = dto.control_id || `CTRL-${id.substring(0, 8).toUpperCase()}`;

    const stmt = this.db.prepare(`
      INSERT INTO controls (
        id, organization_id, control_id, name, description, control_type,
        control_category, framework, owner_id, owner_role, next_assessment_at,
        status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      orgId,
      controlId,
      dto.name,
      dto.description || null,
      dto.control_type,
      dto.control_category,
      dto.framework || null,
      dto.owner_id || null,
      dto.owner_role || null,
      dto.next_assessment_at || null,
      'active',
      new Date().toISOString(),
      new Date().toISOString()
    );

    return this.getControlById(id)!;
  }

  /**
   * Get control by ID
   */
  getControlById(id: string): Control | null {
    const stmt = this.db.prepare('SELECT * FROM controls WHERE id = ?');
    const row = stmt.get(id) as any;
    if (!row) return null;
    return this.mapRowToControl(row);
  }

  /**
   * List controls with filters
   */
  listControls(orgId: string, filters?: {
    control_type?: ControlType;
    control_category?: ControlCategory;
    framework?: string;
    owner_id?: string;
    status?: ControlStatus;
    effectiveness_rating?: EffectivenessRating;
  }): Control[] {
    let sql = 'SELECT * FROM controls WHERE organization_id = ?';
    const params: any[] = [orgId];

    if (filters) {
      if (filters.control_type) {
        sql += ' AND control_type = ?';
        params.push(filters.control_type);
      }
      if (filters.control_category) {
        sql += ' AND control_category = ?';
        params.push(filters.control_category);
      }
      if (filters.framework) {
        sql += ' AND framework = ?';
        params.push(filters.framework);
      }
      if (filters.owner_id) {
        sql += ' AND owner_id = ?';
        params.push(filters.owner_id);
      }
      if (filters.status) {
        sql += ' AND status = ?';
        params.push(filters.status);
      }
      if (filters.effectiveness_rating) {
        sql += ' AND effectiveness_rating = ?';
        params.push(filters.effectiveness_rating);
      }
    }

    sql += ' ORDER BY created_at DESC';

    const stmt = this.db.prepare(sql);
    const rows = stmt.all(...params) as any[];
    return rows.map(row => this.mapRowToControl(row));
  }

  /**
   * Update control
   */
  updateControl(id: string, userId: string, dto: Partial<CreateControlDTO>): Control {
    const existing = this.getControlById(id);
    if (!existing) {
      throw new Error('Control not found');
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (dto.name !== undefined) {
      updates.push('name = ?');
      values.push(dto.name);
    }
    if (dto.description !== undefined) {
      updates.push('description = ?');
      values.push(dto.description || null);
    }
    if (dto.control_type !== undefined) {
      updates.push('control_type = ?');
      values.push(dto.control_type);
    }
    if (dto.control_category !== undefined) {
      updates.push('control_category = ?');
      values.push(dto.control_category);
    }
    if (dto.framework !== undefined) {
      updates.push('framework = ?');
      values.push(dto.framework || null);
    }
    if (dto.owner_id !== undefined) {
      updates.push('owner_id = ?');
      values.push(dto.owner_id || null);
    }
    if (dto.owner_role !== undefined) {
      updates.push('owner_role = ?');
      values.push(dto.owner_role || null);
    }
    if (dto.next_assessment_at !== undefined) {
      updates.push('next_assessment_at = ?');
      values.push(dto.next_assessment_at || null);
    }

    if (updates.length === 0) {
      return existing;
    }

    updates.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    const sql = `UPDATE controls SET ${updates.join(', ')} WHERE id = ?`;
    this.db.prepare(sql).run(...values);

    return this.getControlById(id)!;
  }

  /**
   * Update control effectiveness rating
   */
  updateEffectiveness(id: string, rating: EffectivenessRating, assessmentDate?: string): Control {
    const updates: string[] = ['effectiveness_rating = ?', 'last_assessed_at = ?'];
    const values: any[] = [rating, assessmentDate || new Date().toISOString()];
    values.push(id);

    this.db.prepare(`
      UPDATE controls 
      SET effectiveness_rating = ?, last_assessed_at = ?, updated_at = ?
      WHERE id = ?
    `).run(rating, assessmentDate || new Date().toISOString(), new Date().toISOString(), id);

    return this.getControlById(id)!;
  }

  /**
   * Delete control
   */
  deleteControl(id: string): void {
    this.db.prepare('DELETE FROM controls WHERE id = ?').run(id);
  }

  /**
   * Map control to risk
   */
  mapControlToRisk(dto: CreateMappingDTO): RiskControlMapping {
    const id = uuidv4();
    const stmt = this.db.prepare(`
      INSERT INTO risk_control_mappings (
        id, risk_id, enterprise_risk_id, control_id, mapping_type, effectiveness, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      dto.risk_id || null,
      dto.enterprise_risk_id || null,
      dto.control_id,
      dto.mapping_type,
      dto.effectiveness || null,
      dto.notes || null,
      new Date().toISOString()
    );

    return this.getMappingById(id)!;
  }

  /**
   * Get mappings for a risk
   */
  getMappingsForRisk(riskId: string): RiskControlMapping[] {
    const stmt = this.db.prepare(`
      SELECT * FROM risk_control_mappings 
      WHERE risk_id = ? 
      ORDER BY created_at DESC
    `);
    const rows = stmt.all(riskId) as any[];
    return rows.map(row => this.mapRowToMapping(row));
  }

  /**
   * Get mappings for an enterprise risk
   */
  getMappingsForEnterpriseRisk(enterpriseRiskId: string): RiskControlMapping[] {
    const stmt = this.db.prepare(`
      SELECT * FROM risk_control_mappings 
      WHERE enterprise_risk_id = ? 
      ORDER BY created_at DESC
    `);
    const rows = stmt.all(enterpriseRiskId) as any[];
    return rows.map(row => this.mapRowToMapping(row));
  }

  /**
   * Get mappings for a control
   */
  getMappingsForControl(controlId: string): RiskControlMapping[] {
    const stmt = this.db.prepare(`
      SELECT * FROM risk_control_mappings 
      WHERE control_id = ? 
      ORDER BY created_at DESC
    `);
    const rows = stmt.all(controlId) as any[];
    return rows.map(row => this.mapRowToMapping(row));
  }

  /**
   * Delete mapping
   */
  deleteMapping(id: string): void {
    this.db.prepare('DELETE FROM risk_control_mappings WHERE id = ?').run(id);
  }

  /**
   * Create audit finding
   */
  createFinding(orgId: string, userId: string, dto: CreateFindingDTO): AuditFinding {
    const id = uuidv4();
    const findingId = dto.finding_id || `FIND-${id.substring(0, 8).toUpperCase()}`;

    const stmt = this.db.prepare(`
      INSERT INTO audit_findings (
        id, organization_id, control_id, finding_id, title, description,
        severity, status, assigned_to, due_date, created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      orgId,
      dto.control_id || null,
      findingId,
      dto.title,
      dto.description,
      dto.severity,
      'open',
      dto.assigned_to || null,
      dto.due_date || null,
      userId,
      new Date().toISOString(),
      new Date().toISOString()
    );

    return this.getFindingById(id)!;
  }

  /**
   * Get finding by ID
   */
  getFindingById(id: string): AuditFinding | null {
    const stmt = this.db.prepare('SELECT * FROM audit_findings WHERE id = ?');
    const row = stmt.get(id) as any;
    if (!row) return null;
    return this.mapRowToFinding(row);
  }

  /**
   * List findings
   */
  listFindings(orgId: string, filters?: {
    control_id?: string;
    severity?: FindingSeverity;
    status?: FindingStatus;
    assigned_to?: string;
  }): AuditFinding[] {
    let sql = 'SELECT * FROM audit_findings WHERE organization_id = ?';
    const params: any[] = [orgId];

    if (filters) {
      if (filters.control_id) {
        sql += ' AND control_id = ?';
        params.push(filters.control_id);
      }
      if (filters.severity) {
        sql += ' AND severity = ?';
        params.push(filters.severity);
      }
      if (filters.status) {
        sql += ' AND status = ?';
        params.push(filters.status);
      }
      if (filters.assigned_to) {
        sql += ' AND assigned_to = ?';
        params.push(filters.assigned_to);
      }
    }

    sql += ' ORDER BY severity DESC, created_at DESC';

    const stmt = this.db.prepare(sql);
    const rows = stmt.all(...params) as any[];
    return rows.map(row => this.mapRowToFinding(row));
  }

  /**
   * Update finding
   */
  updateFinding(id: string, dto: Partial<CreateFindingDTO & { status?: FindingStatus; resolution_notes?: string }>): AuditFinding {
    const updates: string[] = [];
    const values: any[] = [];

    if (dto.title !== undefined) {
      updates.push('title = ?');
      values.push(dto.title);
    }
    if (dto.description !== undefined) {
      updates.push('description = ?');
      values.push(dto.description);
    }
    if (dto.severity !== undefined) {
      updates.push('severity = ?');
      values.push(dto.severity);
    }
    if (dto.status !== undefined) {
      updates.push('status = ?');
      values.push(dto.status);
      if (dto.status === 'resolved') {
        updates.push('resolved_at = ?');
        values.push(new Date().toISOString());
      }
    }
    if (dto.assigned_to !== undefined) {
      updates.push('assigned_to = ?');
      values.push(dto.assigned_to || null);
    }
    if (dto.due_date !== undefined) {
      updates.push('due_date = ?');
      values.push(dto.due_date || null);
    }
    if (dto.resolution_notes !== undefined) {
      updates.push('resolution_notes = ?');
      values.push(dto.resolution_notes);
    }

    if (updates.length === 0) {
      return this.getFindingById(id)!;
    }

    updates.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    const sql = `UPDATE audit_findings SET ${updates.join(', ')} WHERE id = ?`;
    this.db.prepare(sql).run(...values);

    return this.getFindingById(id)!;
  }

  /**
   * Create control assessment
   */
  createAssessment(userId: string, dto: CreateAssessmentDTO): ControlAssessment {
    const id = uuidv4();
    const stmt = this.db.prepare(`
      INSERT INTO control_assessments (
        id, control_id, assessed_by, assessment_date, effectiveness_rating,
        design_rating, operating_effectiveness, notes, evidence_attached, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      dto.control_id,
      userId,
      new Date().toISOString(),
      dto.effectiveness_rating,
      dto.design_rating || null,
      dto.operating_effectiveness || null,
      dto.notes || null,
      dto.evidence_attached || null,
      new Date().toISOString()
    );

    // Update control's effectiveness rating
    this.updateEffectiveness(dto.control_id, dto.effectiveness_rating);

    return this.getAssessmentById(id)!;
  }

  /**
   * Get assessment by ID
   */
  getAssessmentById(id: string): ControlAssessment | null {
    const stmt = this.db.prepare('SELECT * FROM control_assessments WHERE id = ?');
    const row = stmt.get(id) as any;
    if (!row) return null;
    return this.mapRowToAssessment(row);
  }

  /**
   * Get assessments for a control
   */
  getAssessmentsForControl(controlId: string): ControlAssessment[] {
    const stmt = this.db.prepare(`
      SELECT * FROM control_assessments 
      WHERE control_id = ? 
      ORDER BY assessment_date DESC
    `);
    const rows = stmt.all(controlId) as any[];
    return rows.map(row => this.mapRowToAssessment(row));
  }

  private mapRowToControl(row: any): Control {
    return {
      id: row.id,
      organization_id: row.organization_id,
      control_id: row.control_id,
      name: row.name,
      description: row.description || undefined,
      control_type: row.control_type,
      control_category: row.control_category,
      framework: row.framework || undefined,
      owner_id: row.owner_id || undefined,
      owner_role: row.owner_role || undefined,
      effectiveness_rating: row.effectiveness_rating || undefined,
      last_assessed_at: row.last_assessed_at || undefined,
      next_assessment_at: row.next_assessment_at || undefined,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private mapRowToMapping(row: any): RiskControlMapping {
    return {
      id: row.id,
      risk_id: row.risk_id || undefined,
      enterprise_risk_id: row.enterprise_risk_id || undefined,
      control_id: row.control_id,
      mapping_type: row.mapping_type,
      effectiveness: row.effectiveness || undefined,
      notes: row.notes || undefined,
      created_at: row.created_at,
    };
  }

  private mapRowToFinding(row: any): AuditFinding {
    return {
      id: row.id,
      organization_id: row.organization_id,
      control_id: row.control_id || undefined,
      finding_id: row.finding_id,
      title: row.title,
      description: row.description,
      severity: row.severity,
      status: row.status,
      assigned_to: row.assigned_to || undefined,
      due_date: row.due_date || undefined,
      resolved_at: row.resolved_at || undefined,
      resolution_notes: row.resolution_notes || undefined,
      created_by: row.created_by,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private mapRowToAssessment(row: any): ControlAssessment {
    return {
      id: row.id,
      control_id: row.control_id,
      assessed_by: row.assessed_by,
      assessment_date: row.assessment_date,
      effectiveness_rating: row.effectiveness_rating,
      design_rating: row.design_rating || undefined,
      operating_effectiveness: row.operating_effectiveness || undefined,
      notes: row.notes || undefined,
      evidence_attached: row.evidence_attached || undefined,
      created_at: row.created_at,
    };
  }

  private getMappingById(id: string): RiskControlMapping | null {
    const stmt = this.db.prepare('SELECT * FROM risk_control_mappings WHERE id = ?');
    const row = stmt.get(id) as any;
    if (!row) return null;
    return this.mapRowToMapping(row);
  }
}

