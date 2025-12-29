import Database from 'better-sqlite3';
import { AuditLog } from '../models/types.js';

export interface CreateAuditLogDTO {
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: string;
  ip_address?: string;
  user_agent?: string;
}

export class AuditService {
  constructor(private db: Database.Database) {}

  /**
   * Create audit log entry
   */
  logAction(
    orgId: string | undefined,
    userId: string | undefined,
    dto: CreateAuditLogDTO
  ): void {
    const { v4: uuidv4 } = require('uuid');
    const id = uuidv4();

    const stmt = this.db.prepare(`
      INSERT INTO audit_logs (
        id, organization_id, user_id, action, resource_type,
        resource_id, details, ip_address, user_agent, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      orgId || null,
      userId || null,
      dto.action,
      dto.resource_type,
      dto.resource_id || null,
      dto.details || null,
      dto.ip_address || null,
      dto.user_agent || null,
      new Date().toISOString()
    );
  }

  /**
   * Get audit logs with filters
   */
  getAuditLogs(orgId: string, filters?: {
    user_id?: string;
    resource_type?: string;
    resource_id?: string;
    action?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
  }): AuditLog[] {
    let sql = 'SELECT * FROM audit_logs WHERE organization_id = ?';
    const params: any[] = [orgId];

    if (filters) {
      if (filters.user_id) {
        sql += ' AND user_id = ?';
        params.push(filters.user_id);
      }
      if (filters.resource_type) {
        sql += ' AND resource_type = ?';
        params.push(filters.resource_type);
      }
      if (filters.resource_id) {
        sql += ' AND resource_id = ?';
        params.push(filters.resource_id);
      }
      if (filters.action) {
        sql += ' AND action = ?';
        params.push(filters.action);
      }
      if (filters.start_date) {
        sql += ' AND created_at >= ?';
        params.push(filters.start_date);
      }
      if (filters.end_date) {
        sql += ' AND created_at <= ?';
        params.push(filters.end_date);
      }
    }

    sql += ' ORDER BY created_at DESC';

    if (filters?.limit) {
      sql += ' LIMIT ?';
      params.push(filters.limit);
    } else {
      sql += ' LIMIT 1000'; // Default limit
    }

    const stmt = this.db.prepare(sql);
    const rows = stmt.all(...params) as any[];
    return rows.map(row => this.mapRowToAuditLog(row));
  }

  /**
   * Get audit log by ID
   */
  getAuditLogById(id: string): AuditLog | null {
    const stmt = this.db.prepare('SELECT * FROM audit_logs WHERE id = ?');
    const row = stmt.get(id) as any;
    if (!row) return null;
    return this.mapRowToAuditLog(row);
  }

  private mapRowToAuditLog(row: any): AuditLog {
    return {
      id: row.id,
      organization_id: row.organization_id || undefined,
      user_id: row.user_id || undefined,
      action: row.action,
      resource_type: row.resource_type,
      resource_id: row.resource_id || undefined,
      details: row.details || undefined,
      ip_address: row.ip_address || undefined,
      user_agent: row.user_agent || undefined,
      created_at: row.created_at,
    };
  }
}

