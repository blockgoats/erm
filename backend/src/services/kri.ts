import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { KRI } from '../models/types.js';

export interface CreateKRIDTO {
  name: string;
  description?: string;
  metric_type: string;
  threshold_min?: number;
  threshold_max?: number;
  target_value?: number;
  linked_appetite_id?: string;
}

export interface UpdateKRIDTO {
  name?: string;
  description?: string;
  metric_type?: string;
  threshold_min?: number;
  threshold_max?: number;
  target_value?: number;
  current_value?: number;
  linked_appetite_id?: string;
}

export interface KRIHistory {
  id: string;
  kri_id: string;
  value: number;
  status: 'green' | 'yellow' | 'red';
  recorded_at: string;
}

export class KRIService {
  constructor(private db: Database.Database) {}

  /**
   * Create a new KRI
   */
  createKRI(orgId: string, dto: CreateKRIDTO): KRI {
    const id = uuidv4();
    const now = new Date().toISOString();

    // Determine initial status based on current value (if provided) or default to green
    let status: 'green' | 'yellow' | 'red' = 'green';
    if (dto.target_value !== undefined) {
      status = this.calculateStatus(dto.target_value, dto.threshold_min, dto.threshold_max);
    }

    const stmt = this.db.prepare(`
      INSERT INTO kris (
        id, organization_id, name, description, metric_type,
        threshold_min, threshold_max, target_value, current_value,
        status, linked_appetite_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      orgId,
      dto.name,
      dto.description || null,
      dto.metric_type,
      dto.threshold_min || null,
      dto.threshold_max || null,
      dto.target_value || null,
      dto.target_value || null, // Initialize current_value with target_value
      status,
      dto.linked_appetite_id || null,
      now,
      now
    );

    // Record initial value in history
    if (dto.target_value !== undefined) {
      this.recordKRIValue(id, dto.target_value, status);
    }

    return this.getKRIById(id)!;
  }

  /**
   * Update KRI
   */
  updateKRI(id: string, dto: UpdateKRIDTO): KRI {
    const existing = this.getKRIById(id);
    if (!existing) {
      throw new Error('KRI not found');
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (dto.name !== undefined) {
      updates.push('name = ?');
      values.push(dto.name);
    }
    if (dto.description !== undefined) {
      updates.push('description = ?');
      values.push(dto.description);
    }
    if (dto.metric_type !== undefined) {
      updates.push('metric_type = ?');
      values.push(dto.metric_type);
    }
    if (dto.threshold_min !== undefined) {
      updates.push('threshold_min = ?');
      values.push(dto.threshold_min || null);
    }
    if (dto.threshold_max !== undefined) {
      updates.push('threshold_max = ?');
      values.push(dto.threshold_max || null);
    }
    if (dto.target_value !== undefined) {
      updates.push('target_value = ?');
      values.push(dto.target_value || null);
    }
    if (dto.linked_appetite_id !== undefined) {
      updates.push('linked_appetite_id = ?');
      values.push(dto.linked_appetite_id || null);
    }

    // If current_value is being updated, recalculate status and record in history
    if (dto.current_value !== undefined) {
      const newStatus = this.calculateStatus(
        dto.current_value,
        dto.threshold_min ?? existing.threshold_min,
        dto.threshold_max ?? existing.threshold_max
      );
      updates.push('current_value = ?');
      updates.push('status = ?');
      values.push(dto.current_value);
      values.push(newStatus);

      // Record in history if value changed
      if (dto.current_value !== existing.current_value) {
        this.recordKRIValue(id, dto.current_value, newStatus);
      }
    }

    if (updates.length === 0) {
      return existing;
    }

    updates.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    const sql = `UPDATE kris SET ${updates.join(', ')} WHERE id = ?`;
    this.db.prepare(sql).run(...values);

    return this.getKRIById(id)!;
  }

  /**
   * Update KRI current value (convenience method)
   */
  updateKRIValue(kriId: string, value: number): KRI {
    const existing = this.getKRIById(kriId);
    if (!existing) {
      throw new Error('KRI not found');
    }

    const status = this.calculateStatus(value, existing.threshold_min, existing.threshold_max);
    
    this.db.prepare(`
      UPDATE kris 
      SET current_value = ?, status = ?, updated_at = ?
      WHERE id = ?
    `).run(value, status, new Date().toISOString(), kriId);

    // Record in history
    this.recordKRIValue(kriId, value, status);

    return this.getKRIById(kriId)!;
  }

  /**
   * Calculate KRI status based on value and thresholds
   */
  private calculateStatus(
    value: number,
    thresholdMin?: number,
    thresholdMax?: number
  ): 'green' | 'yellow' | 'red' {
    // If no thresholds defined, default to green
    if (thresholdMin === undefined && thresholdMax === undefined) {
      return 'green';
    }

    // Red if outside acceptable range
    if (thresholdMin !== undefined && value < thresholdMin) {
      return 'red';
    }
    if (thresholdMax !== undefined && value > thresholdMax) {
      return 'red';
    }

    // Yellow if near boundaries (within 10% of threshold)
    if (thresholdMin !== undefined) {
      const range = thresholdMax !== undefined ? thresholdMax - thresholdMin : thresholdMin * 0.2;
      if (value < thresholdMin + range * 0.1) {
        return 'yellow';
      }
    }
    if (thresholdMax !== undefined) {
      const range = thresholdMin !== undefined ? thresholdMax - thresholdMin : thresholdMax * 0.2;
      if (value > thresholdMax - range * 0.1) {
        return 'yellow';
      }
    }

    return 'green';
  }

  /**
   * Record KRI value in history
   */
  private recordKRIValue(kriId: string, value: number, status: 'green' | 'yellow' | 'red'): void {
    const id = uuidv4();
    const stmt = this.db.prepare(`
      INSERT INTO kri_history (id, kri_id, value, status, recorded_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(id, kriId, value, status, new Date().toISOString());
  }

  /**
   * Get KRI by ID
   */
  getKRIById(id: string): KRI | null {
    const stmt = this.db.prepare('SELECT * FROM kris WHERE id = ?');
    const row = stmt.get(id) as any;
    if (!row) return null;
    return this.mapRowToKRI(row);
  }

  /**
   * List KRIs for organization
   */
  listKRIs(orgId: string, filters?: {
    status?: 'green' | 'yellow' | 'red';
    linked_appetite_id?: string;
  }): KRI[] {
    let sql = 'SELECT * FROM kris WHERE organization_id = ?';
    const params: any[] = [orgId];

    if (filters) {
      if (filters.status) {
        sql += ' AND status = ?';
        params.push(filters.status);
      }
      if (filters.linked_appetite_id) {
        sql += ' AND linked_appetite_id = ?';
        params.push(filters.linked_appetite_id);
      }
    }

    sql += ' ORDER BY status DESC, name ASC';

    const stmt = this.db.prepare(sql);
    const rows = stmt.all(...params) as any[];
    return rows.map(row => this.mapRowToKRI(row));
  }

  /**
   * Get KRI history
   */
  getKRIHistory(kriId: string, limit?: number): KRIHistory[] {
    let sql = `
      SELECT * FROM kri_history 
      WHERE kri_id = ? 
      ORDER BY recorded_at DESC
    `;
    const params: any[] = [kriId];

    if (limit) {
      sql += ' LIMIT ?';
      params.push(limit);
    }

    const stmt = this.db.prepare(sql);
    const rows = stmt.all(...params) as any[];
    return rows.map(row => ({
      id: row.id,
      kri_id: row.kri_id,
      value: row.value,
      status: row.status,
      recorded_at: row.recorded_at,
    }));
  }

  /**
   * Delete KRI
   */
  deleteKRI(id: string): void {
    // Delete history first (cascade should handle this, but being explicit)
    this.db.prepare('DELETE FROM kri_history WHERE kri_id = ?').run(id);
    // Delete KRI
    this.db.prepare('DELETE FROM kris WHERE id = ?').run(id);
  }

  /**
   * Get KRIs with breach status (red status)
   */
  getBreachingKRIs(orgId: string): KRI[] {
    return this.listKRIs(orgId, { status: 'red' });
  }

  private mapRowToKRI(row: any): KRI {
    return {
      id: row.id,
      organization_id: row.organization_id,
      name: row.name,
      description: row.description || undefined,
      metric_type: row.metric_type,
      threshold_min: row.threshold_min || undefined,
      threshold_max: row.threshold_max || undefined,
      target_value: row.target_value || undefined,
      current_value: row.current_value || undefined,
      status: row.status,
      linked_appetite_id: row.linked_appetite_id || undefined,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }
}

