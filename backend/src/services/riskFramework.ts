import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';

export interface RiskScoringScale {
  id: string;
  organization_id: string;
  scale_type: 'likelihood' | 'impact';
  level: number;
  label: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateScaleDTO {
  scale_type: 'likelihood' | 'impact';
  level: number;
  label: string;
  description?: string;
}

export interface RiskTaxonomy {
  id: string;
  organization_id: string;
  taxonomy_id: string;
  name: string;
  description?: string;
  parent_id?: string;
  level: number;
  created_at: string;
  updated_at: string;
}

export interface CreateTaxonomyDTO {
  taxonomy_id?: string;
  name: string;
  description?: string;
  parent_id?: string;
}

export interface RiskFramework {
  id: string;
  organization_id: string;
  framework_id: string;
  name: string;
  description?: string;
  version: string;
  is_active: boolean;
  scoring_formula: string;
  created_at: string;
  updated_at: string;
}

export interface CreateFrameworkDTO {
  framework_id?: string;
  name: string;
  description?: string;
  scoring_formula?: string;
}

export class RiskFrameworkService {
  constructor(private db: Database.Database) {}

  // Scoring Scales
  createScale(orgId: string, dto: CreateScaleDTO): RiskScoringScale {
    const id = uuidv4();
    const stmt = this.db.prepare(`
      INSERT INTO risk_scoring_scales (
        id, organization_id, scale_type, level, label, description, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      orgId,
      dto.scale_type,
      dto.level,
      dto.label,
      dto.description || null,
      new Date().toISOString(),
      new Date().toISOString()
    );

    return this.getScaleById(id)!;
  }

  getScales(orgId: string, scaleType?: 'likelihood' | 'impact'): RiskScoringScale[] {
    let sql = 'SELECT * FROM risk_scoring_scales WHERE organization_id = ?';
    const params: any[] = [orgId];

    if (scaleType) {
      sql += ' AND scale_type = ?';
      params.push(scaleType);
    }

    sql += ' ORDER BY scale_type, level ASC';

    const stmt = this.db.prepare(sql);
    const rows = stmt.all(...params) as any[];
    return rows.map(row => this.mapRowToScale(row));
  }

  updateScale(id: string, dto: Partial<CreateScaleDTO>): RiskScoringScale {
    const updates: string[] = [];
    const values: any[] = [];

    if (dto.label !== undefined) {
      updates.push('label = ?');
      values.push(dto.label);
    }
    if (dto.description !== undefined) {
      updates.push('description = ?');
      values.push(dto.description || null);
    }

    if (updates.length === 0) {
      return this.getScaleById(id)!;
    }

    updates.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    const sql = `UPDATE risk_scoring_scales SET ${updates.join(', ')} WHERE id = ?`;
    this.db.prepare(sql).run(...values);

    return this.getScaleById(id)!;
  }

  deleteScale(id: string): void {
    this.db.prepare('DELETE FROM risk_scoring_scales WHERE id = ?').run(id);
  }

  // Risk Taxonomies
  createTaxonomy(orgId: string, dto: CreateTaxonomyDTO): RiskTaxonomy {
    const id = uuidv4();
    const taxonomyId = dto.taxonomy_id || `TAX-${id.substring(0, 8).toUpperCase()}`;

    // Calculate level
    let level = 0;
    if (dto.parent_id) {
      const parent = this.getTaxonomyById(dto.parent_id);
      if (parent) {
        level = parent.level + 1;
      }
    }

    const stmt = this.db.prepare(`
      INSERT INTO risk_taxonomies (
        id, organization_id, taxonomy_id, name, description, parent_id, level, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      orgId,
      taxonomyId,
      dto.name,
      dto.description || null,
      dto.parent_id || null,
      level,
      new Date().toISOString(),
      new Date().toISOString()
    );

    return this.getTaxonomyById(id)!;
  }

  getTaxonomies(orgId: string, parentId?: string): RiskTaxonomy[] {
    let sql = 'SELECT * FROM risk_taxonomies WHERE organization_id = ?';
    const params: any[] = [orgId];

    if (parentId) {
      sql += ' AND parent_id = ?';
      params.push(parentId);
    } else {
      sql += ' AND parent_id IS NULL';
    }

    sql += ' ORDER BY name ASC';

    const stmt = this.db.prepare(sql);
    const rows = stmt.all(...params) as any[];
    return rows.map(row => this.mapRowToTaxonomy(row));
  }

  getTaxonomyTree(orgId: string): RiskTaxonomy[] {
    const all = this.db.prepare(`
      SELECT * FROM risk_taxonomies 
      WHERE organization_id = ? 
      ORDER BY level ASC, name ASC
    `).all(orgId) as any[];

    return all.map(row => this.mapRowToTaxonomy(row));
  }

  updateTaxonomy(id: string, dto: Partial<CreateTaxonomyDTO>): RiskTaxonomy {
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
    if (dto.parent_id !== undefined) {
      updates.push('parent_id = ?');
      values.push(dto.parent_id || null);
      
      // Recalculate level
      let level = 0;
      if (dto.parent_id) {
        const parent = this.getTaxonomyById(dto.parent_id);
        if (parent) {
          level = parent.level + 1;
        }
      }
      updates.push('level = ?');
      values.push(level);
    }

    if (updates.length === 0) {
      return this.getTaxonomyById(id)!;
    }

    updates.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    const sql = `UPDATE risk_taxonomies SET ${updates.join(', ')} WHERE id = ?`;
    this.db.prepare(sql).run(...values);

    return this.getTaxonomyById(id)!;
  }

  deleteTaxonomy(id: string): void {
    this.db.prepare('DELETE FROM risk_taxonomies WHERE id = ?').run(id);
  }

  // Risk Frameworks
  createFramework(orgId: string, userId: string, dto: CreateFrameworkDTO): RiskFramework {
    const id = uuidv4();
    const frameworkId = dto.framework_id || `FW-${id.substring(0, 8).toUpperCase()}`;

    // Deactivate other frameworks if this is set as active
    if (dto.framework_id === undefined) {
      this.db.prepare(`
        UPDATE risk_frameworks 
        SET is_active = 0 
        WHERE organization_id = ?
      `).run(orgId);
    }

    const stmt = this.db.prepare(`
      INSERT INTO risk_frameworks (
        id, organization_id, framework_id, name, description, version, is_active, scoring_formula, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      orgId,
      frameworkId,
      dto.name,
      dto.description || null,
      '1.0',
      1,
      dto.scoring_formula || 'likelihood * impact',
      new Date().toISOString(),
      new Date().toISOString()
    );

    // Log framework creation
    this.logFrameworkChange(id, userId, '1.0', 'Framework created');

    return this.getFrameworkById(id)!;
  }

  getFrameworks(orgId: string, activeOnly?: boolean): RiskFramework[] {
    let sql = 'SELECT * FROM risk_frameworks WHERE organization_id = ?';
    const params: any[] = [orgId];

    if (activeOnly) {
      sql += ' AND is_active = 1';
    }

    sql += ' ORDER BY created_at DESC';

    const stmt = this.db.prepare(sql);
    const rows = stmt.all(...params) as any[];
    return rows.map(row => this.mapRowToFramework(row));
  }

  getActiveFramework(orgId: string): RiskFramework | null {
    const stmt = this.db.prepare(`
      SELECT * FROM risk_frameworks 
      WHERE organization_id = ? AND is_active = 1 
      ORDER BY created_at DESC 
      LIMIT 1
    `);
    const row = stmt.get(orgId) as any;
    if (!row) return null;
    return this.mapRowToFramework(row);
  }

  updateFramework(id: string, userId: string, dto: Partial<CreateFrameworkDTO & { version?: string; is_active?: boolean }>): RiskFramework {
    const existing = this.getFrameworkById(id);
    if (!existing) {
      throw new Error('Framework not found');
    }

    const updates: string[] = [];
    const values: any[] = [];
    let newVersion = existing.version;

    if (dto.name !== undefined) {
      updates.push('name = ?');
      values.push(dto.name);
    }
    if (dto.description !== undefined) {
      updates.push('description = ?');
      values.push(dto.description || null);
    }
    if (dto.scoring_formula !== undefined) {
      updates.push('scoring_formula = ?');
      values.push(dto.scoring_formula);
      // Increment version if formula changes
      const versionParts = newVersion.split('.');
      versionParts[1] = (parseInt(versionParts[1]) + 1).toString();
      newVersion = versionParts.join('.');
      updates.push('version = ?');
      values.push(newVersion);
    }
    if (dto.is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(dto.is_active ? 1 : 0);
      
      // If activating, deactivate others
      if (dto.is_active) {
        this.db.prepare(`
          UPDATE risk_frameworks 
          SET is_active = 0 
          WHERE organization_id = ? AND id != ?
        `).run(existing.organization_id, id);
      }
    }

    if (updates.length === 0) {
      return existing;
    }

    updates.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    const sql = `UPDATE risk_frameworks SET ${updates.join(', ')} WHERE id = ?`;
    this.db.prepare(sql).run(...values);

    // Log change
    this.logFrameworkChange(id, userId, newVersion, JSON.stringify(dto));

    return this.getFrameworkById(id)!;
  }

  getFrameworkHistory(frameworkId: string): any[] {
    const stmt = this.db.prepare(`
      SELECT * FROM risk_framework_history 
      WHERE framework_id = ? 
      ORDER BY created_at DESC
    `);
    return stmt.all(frameworkId) as any[];
  }

  private logFrameworkChange(frameworkId: string, userId: string, version: string, changes: string): void {
    const id = uuidv4();
    this.db.prepare(`
      INSERT INTO risk_framework_history (
        id, framework_id, version, changes, changed_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, frameworkId, version, changes, userId, new Date().toISOString());
  }

  private getScaleById(id: string): RiskScoringScale | null {
    const stmt = this.db.prepare('SELECT * FROM risk_scoring_scales WHERE id = ?');
    const row = stmt.get(id) as any;
    if (!row) return null;
    return this.mapRowToScale(row);
  }

  private getTaxonomyById(id: string): RiskTaxonomy | null {
    const stmt = this.db.prepare('SELECT * FROM risk_taxonomies WHERE id = ?');
    const row = stmt.get(id) as any;
    if (!row) return null;
    return this.mapRowToTaxonomy(row);
  }

  private getFrameworkById(id: string): RiskFramework | null {
    const stmt = this.db.prepare('SELECT * FROM risk_frameworks WHERE id = ?');
    const row = stmt.get(id) as any;
    if (!row) return null;
    return this.mapRowToFramework(row);
  }

  private mapRowToScale(row: any): RiskScoringScale {
    return {
      id: row.id,
      organization_id: row.organization_id,
      scale_type: row.scale_type,
      level: row.level,
      label: row.label,
      description: row.description || undefined,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private mapRowToTaxonomy(row: any): RiskTaxonomy {
    return {
      id: row.id,
      organization_id: row.organization_id,
      taxonomy_id: row.taxonomy_id,
      name: row.name,
      description: row.description || undefined,
      parent_id: row.parent_id || undefined,
      level: row.level,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private mapRowToFramework(row: any): RiskFramework {
    return {
      id: row.id,
      organization_id: row.organization_id,
      framework_id: row.framework_id,
      name: row.name,
      description: row.description || undefined,
      version: row.version,
      is_active: row.is_active === 1,
      scoring_formula: row.scoring_formula,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }
}

