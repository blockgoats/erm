import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { calculateExposure } from './riskScoring.js';

export type ResponseType = 'avoid' | 'mitigate' | 'transfer' | 'accept';
export type TreatmentStatus = 'draft' | 'submitted' | 'approved' | 'in_progress' | 'completed' | 'cancelled';
export type TaskStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface TreatmentPlan {
  id: string;
  risk_id: string;
  plan_id: string;
  title: string;
  description: string;
  response_type: ResponseType;
  owner_id?: string;
  owner_role?: string;
  status: TreatmentStatus;
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  start_date?: string;
  target_completion_date?: string;
  actual_completion_date?: string;
  budget_allocated?: number;
  residual_likelihood?: number;
  residual_impact?: number;
  residual_exposure?: number;
  decision_justification?: string;
  approved_by?: string;
  approved_at?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTreatmentPlanDTO {
  plan_id?: string;
  title: string;
  description: string;
  response_type: ResponseType;
  owner_id?: string;
  owner_role?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  start_date?: string;
  target_completion_date?: string;
  budget_allocated?: number;
  residual_likelihood?: number;
  residual_impact?: number;
  decision_justification?: string;
}

export interface TreatmentTask {
  id: string;
  treatment_plan_id: string;
  task_id: string;
  title: string;
  description?: string;
  assigned_to?: string;
  status: TaskStatus;
  due_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskDTO {
  task_id?: string;
  title: string;
  description?: string;
  assigned_to?: string;
  due_date?: string;
}

export interface TreatmentApproval {
  id: string;
  treatment_plan_id: string;
  approver_id: string;
  approval_status: ApprovalStatus;
  comments?: string;
  approved_at?: string;
  created_at: string;
}

export class TreatmentService {
  constructor(private db: Database.Database) {}

  /**
   * Create a treatment plan
   */
  createTreatmentPlan(riskId: string, userId: string, dto: CreateTreatmentPlanDTO): TreatmentPlan {
    const id = uuidv4();
    const planId = dto.plan_id || `PLAN-${id.substring(0, 8).toUpperCase()}`;

    // Calculate residual exposure if residual likelihood/impact provided
    let residualExposure: number | undefined;
    if (dto.residual_likelihood && dto.residual_impact) {
      residualExposure = calculateExposure(dto.residual_likelihood, dto.residual_impact);
    }

    const stmt = this.db.prepare(`
      INSERT INTO treatment_plans (
        id, risk_id, plan_id, title, description, response_type,
        owner_id, owner_role, status, priority, start_date, target_completion_date,
        budget_allocated, residual_likelihood, residual_impact, residual_exposure,
        decision_justification, created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      riskId,
      planId,
      dto.title,
      dto.description,
      dto.response_type,
      dto.owner_id || null,
      dto.owner_role || null,
      'draft',
      dto.priority || null,
      dto.start_date || null,
      dto.target_completion_date || null,
      dto.budget_allocated || null,
      dto.residual_likelihood || null,
      dto.residual_impact || null,
      residualExposure || null,
      dto.decision_justification || null,
      userId,
      new Date().toISOString(),
      new Date().toISOString()
    );

    return this.getTreatmentPlanById(id)!;
  }

  /**
   * Get treatment plan by ID
   */
  getTreatmentPlanById(id: string): TreatmentPlan | null {
    const stmt = this.db.prepare('SELECT * FROM treatment_plans WHERE id = ?');
    const row = stmt.get(id) as any;
    if (!row) return null;
    return this.mapRowToTreatmentPlan(row);
  }

  /**
   * Get treatment plans for a risk
   */
  getTreatmentPlansForRisk(riskId: string): TreatmentPlan[] {
    const stmt = this.db.prepare(`
      SELECT * FROM treatment_plans 
      WHERE risk_id = ? 
      ORDER BY created_at DESC
    `);
    const rows = stmt.all(riskId) as any[];
    return rows.map(row => this.mapRowToTreatmentPlan(row));
  }

  /**
   * List treatment plans with filters
   */
  listTreatmentPlans(orgId: string, filters?: {
    risk_id?: string;
    status?: TreatmentStatus;
    response_type?: ResponseType;
    owner_id?: string;
    priority?: string;
  }): TreatmentPlan[] {
    // Get risk IDs for this organization first
    const riskIds = this.db.prepare(`
      SELECT id FROM cyber_risks WHERE organization_id = ?
    `).all(orgId) as { id: string }[];

    if (riskIds.length === 0) return [];

    const riskIdList = riskIds.map(r => r.id);
    const placeholders = riskIdList.map(() => '?').join(',');

    let sql = `SELECT * FROM treatment_plans WHERE risk_id IN (${placeholders})`;
    const params: any[] = [...riskIdList];

    if (filters) {
      if (filters.risk_id) {
        sql += ' AND risk_id = ?';
        params.push(filters.risk_id);
      }
      if (filters.status) {
        sql += ' AND status = ?';
        params.push(filters.status);
      }
      if (filters.response_type) {
        sql += ' AND response_type = ?';
        params.push(filters.response_type);
      }
      if (filters.owner_id) {
        sql += ' AND owner_id = ?';
        params.push(filters.owner_id);
      }
      if (filters.priority) {
        sql += ' AND priority = ?';
        params.push(filters.priority);
      }
    }

    sql += ' ORDER BY created_at DESC';

    const stmt = this.db.prepare(sql);
    const rows = stmt.all(...params) as any[];
    return rows.map(row => this.mapRowToTreatmentPlan(row));
  }

  /**
   * Update treatment plan
   */
  updateTreatmentPlan(id: string, userId: string, dto: Partial<CreateTreatmentPlanDTO & { status?: TreatmentStatus }>): TreatmentPlan {
    const existing = this.getTreatmentPlanById(id);
    if (!existing) {
      throw new Error('Treatment plan not found');
    }

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
    if (dto.response_type !== undefined) {
      updates.push('response_type = ?');
      values.push(dto.response_type);
    }
    if (dto.owner_id !== undefined) {
      updates.push('owner_id = ?');
      values.push(dto.owner_id || null);
    }
    if (dto.owner_role !== undefined) {
      updates.push('owner_role = ?');
      values.push(dto.owner_role || null);
    }
    if (dto.status !== undefined) {
      updates.push('status = ?');
      values.push(dto.status);
      if (dto.status === 'completed') {
        updates.push('actual_completion_date = ?');
        values.push(new Date().toISOString());
      }
    }
    if (dto.priority !== undefined) {
      updates.push('priority = ?');
      values.push(dto.priority || null);
    }
    if (dto.start_date !== undefined) {
      updates.push('start_date = ?');
      values.push(dto.start_date || null);
    }
    if (dto.target_completion_date !== undefined) {
      updates.push('target_completion_date = ?');
      values.push(dto.target_completion_date || null);
    }
    if (dto.budget_allocated !== undefined) {
      updates.push('budget_allocated = ?');
      values.push(dto.budget_allocated || null);
    }
    if (dto.residual_likelihood !== undefined) {
      updates.push('residual_likelihood = ?');
      values.push(dto.residual_likelihood || null);
    }
    if (dto.residual_impact !== undefined) {
      updates.push('residual_impact = ?');
      values.push(dto.residual_impact || null);
    }
    if (dto.decision_justification !== undefined) {
      updates.push('decision_justification = ?');
      values.push(dto.decision_justification || null);
    }

    // Recalculate residual exposure if likelihood/impact changed
    if (dto.residual_likelihood !== undefined || dto.residual_impact !== undefined) {
      const newLikelihood = dto.residual_likelihood ?? existing.residual_likelihood;
      const newImpact = dto.residual_impact ?? existing.residual_impact;
      if (newLikelihood && newImpact) {
        const residualExposure = calculateExposure(newLikelihood, newImpact);
        updates.push('residual_exposure = ?');
        values.push(residualExposure);
      }
    }

    if (updates.length === 0) {
      return existing;
    }

    updates.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    const sql = `UPDATE treatment_plans SET ${updates.join(', ')} WHERE id = ?`;
    this.db.prepare(sql).run(...values);

    return this.getTreatmentPlanById(id)!;
  }

  /**
   * Submit treatment plan for approval
   */
  submitForApproval(planId: string, approverIds: string[]): void {
    // Update plan status
    this.db.prepare(`
      UPDATE treatment_plans 
      SET status = 'submitted', updated_at = ?
      WHERE id = ?
    `).run(new Date().toISOString(), planId);

    // Create approval records
    const stmt = this.db.prepare(`
      INSERT INTO treatment_approvals (
        id, treatment_plan_id, approver_id, approval_status, created_at
      ) VALUES (?, ?, ?, 'pending', ?)
    `);

    for (const approverId of approverIds) {
      stmt.run(uuidv4(), planId, approverId, new Date().toISOString());
    }
  }

  /**
   * Approve or reject treatment plan
   */
  processApproval(planId: string, approverId: string, status: 'approved' | 'rejected', comments?: string): void {
    // Update approval record
    this.db.prepare(`
      UPDATE treatment_approvals 
      SET approval_status = ?, comments = ?, approved_at = ?
      WHERE treatment_plan_id = ? AND approver_id = ?
    `).run(status, comments || null, new Date().toISOString(), planId, approverId);

    // If approved, check if all approvals are complete
    if (status === 'approved') {
      const pendingApprovals = this.db.prepare(`
        SELECT COUNT(*) as count FROM treatment_approvals
        WHERE treatment_plan_id = ? AND approval_status = 'pending'
      `).get(planId) as { count: number };

      if (pendingApprovals.count === 0) {
        // All approvals complete, update plan status
        this.db.prepare(`
          UPDATE treatment_plans 
          SET status = 'approved', approved_by = ?, approved_at = ?, updated_at = ?
          WHERE id = ?
        `).run(approverId, new Date().toISOString(), new Date().toISOString(), planId);
      }
    } else {
      // Rejected, update plan status
      this.db.prepare(`
        UPDATE treatment_plans 
        SET status = 'draft', updated_at = ?
        WHERE id = ?
      `).run(new Date().toISOString(), planId);
    }
  }

  /**
   * Get approvals for a treatment plan
   */
  getApprovalsForPlan(planId: string): TreatmentApproval[] {
    const stmt = this.db.prepare(`
      SELECT * FROM treatment_approvals 
      WHERE treatment_plan_id = ? 
      ORDER BY created_at DESC
    `);
    const rows = stmt.all(planId) as any[];
    return rows.map(row => this.mapRowToApproval(row));
  }

  /**
   * Create a task for a treatment plan
   */
  createTask(planId: string, dto: CreateTaskDTO): TreatmentTask {
    const id = uuidv4();
    const taskId = dto.task_id || `TASK-${id.substring(0, 8).toUpperCase()}`;

    const stmt = this.db.prepare(`
      INSERT INTO treatment_plan_tasks (
        id, treatment_plan_id, task_id, title, description, assigned_to,
        status, due_date, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      planId,
      taskId,
      dto.title,
      dto.description || null,
      dto.assigned_to || null,
      'not_started',
      dto.due_date || null,
      new Date().toISOString(),
      new Date().toISOString()
    );

    return this.getTaskById(id)!;
  }

  /**
   * Get task by ID
   */
  getTaskById(id: string): TreatmentTask | null {
    const stmt = this.db.prepare('SELECT * FROM treatment_plan_tasks WHERE id = ?');
    const row = stmt.get(id) as any;
    if (!row) return null;
    return this.mapRowToTask(row);
  }

  /**
   * Get tasks for a treatment plan
   */
  getTasksForPlan(planId: string): TreatmentTask[] {
    const stmt = this.db.prepare(`
      SELECT * FROM treatment_plan_tasks 
      WHERE treatment_plan_id = ? 
      ORDER BY created_at ASC
    `);
    const rows = stmt.all(planId) as any[];
    return rows.map(row => this.mapRowToTask(row));
  }

  /**
   * Update task
   */
  updateTask(id: string, dto: Partial<CreateTaskDTO & { status?: TaskStatus }>): TreatmentTask {
    const updates: string[] = [];
    const values: any[] = [];

    if (dto.title !== undefined) {
      updates.push('title = ?');
      values.push(dto.title);
    }
    if (dto.description !== undefined) {
      updates.push('description = ?');
      values.push(dto.description || null);
    }
    if (dto.assigned_to !== undefined) {
      updates.push('assigned_to = ?');
      values.push(dto.assigned_to || null);
    }
    if (dto.status !== undefined) {
      updates.push('status = ?');
      values.push(dto.status);
      if (dto.status === 'completed') {
        updates.push('completed_at = ?');
        values.push(new Date().toISOString());
      }
    }
    if (dto.due_date !== undefined) {
      updates.push('due_date = ?');
      values.push(dto.due_date || null);
    }

    if (updates.length === 0) {
      return this.getTaskById(id)!;
    }

    updates.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    const sql = `UPDATE treatment_plan_tasks SET ${updates.join(', ')} WHERE id = ?`;
    this.db.prepare(sql).run(...values);

    return this.getTaskById(id)!;
  }

  /**
   * Delete task
   */
  deleteTask(id: string): void {
    this.db.prepare('DELETE FROM treatment_plan_tasks WHERE id = ?').run(id);
  }

  /**
   * Delete treatment plan
   */
  deleteTreatmentPlan(id: string): void {
    this.db.prepare('DELETE FROM treatment_plans WHERE id = ?').run(id);
  }

  private mapRowToTreatmentPlan(row: any): TreatmentPlan {
    return {
      id: row.id,
      risk_id: row.risk_id,
      plan_id: row.plan_id,
      title: row.title,
      description: row.description,
      response_type: row.response_type,
      owner_id: row.owner_id || undefined,
      owner_role: row.owner_role || undefined,
      status: row.status,
      priority: row.priority || undefined,
      start_date: row.start_date || undefined,
      target_completion_date: row.target_completion_date || undefined,
      actual_completion_date: row.actual_completion_date || undefined,
      budget_allocated: row.budget_allocated || undefined,
      residual_likelihood: row.residual_likelihood || undefined,
      residual_impact: row.residual_impact || undefined,
      residual_exposure: row.residual_exposure || undefined,
      decision_justification: row.decision_justification || undefined,
      approved_by: row.approved_by || undefined,
      approved_at: row.approved_at || undefined,
      created_by: row.created_by,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private mapRowToTask(row: any): TreatmentTask {
    return {
      id: row.id,
      treatment_plan_id: row.treatment_plan_id,
      task_id: row.task_id,
      title: row.title,
      description: row.description || undefined,
      assigned_to: row.assigned_to || undefined,
      status: row.status,
      due_date: row.due_date || undefined,
      completed_at: row.completed_at || undefined,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private mapRowToApproval(row: any): TreatmentApproval {
    return {
      id: row.id,
      treatment_plan_id: row.treatment_plan_id,
      approver_id: row.approver_id,
      approval_status: row.approval_status,
      comments: row.comments || undefined,
      approved_at: row.approved_at || undefined,
      created_at: row.created_at,
    };
  }
}

