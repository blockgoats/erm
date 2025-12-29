import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';

export type TriggerType = 'risk_created' | 'risk_updated' | 'treatment_submitted' | 'finding_created' | 'appetite_breach' | 'manual';
export type StepType = 'approval' | 'notification' | 'escalation' | 'sla_timer' | 'action';
export type ApproverType = 'user' | 'role' | 'dynamic';
export type ApprovalType = 'any' | 'all' | 'sequential';
export type InstanceStatus = 'running' | 'completed' | 'cancelled' | 'failed';
export type StepExecutionStatus = 'pending' | 'in_progress' | 'completed' | 'skipped' | 'failed';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type SLATimerStatus = 'active' | 'expired' | 'completed';

export interface Workflow {
  id: string;
  organization_id: string;
  workflow_id: string;
  name: string;
  description?: string;
  trigger_type: TriggerType;
  trigger_conditions?: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateWorkflowDTO {
  workflow_id?: string;
  name: string;
  description?: string;
  trigger_type: TriggerType;
  trigger_conditions?: string;
  steps: CreateWorkflowStepDTO[];
}

export interface WorkflowStep {
  id: string;
  workflow_id: string;
  step_order: number;
  step_type: StepType;
  name: string;
  config?: string;
  created_at: string;
}

export interface CreateWorkflowStepDTO {
  step_order: number;
  step_type: StepType;
  name: string;
  config?: any;
  approvers?: CreateApproverDTO[];
}

export interface WorkflowApprover {
  id: string;
  workflow_step_id: string;
  approver_type: ApproverType;
  approver_id?: string;
  approver_role?: string;
  approval_type: ApprovalType;
  created_at: string;
}

export interface CreateApproverDTO {
  approver_type: ApproverType;
  approver_id?: string;
  approver_role?: string;
  approval_type: ApprovalType;
}

export interface WorkflowInstance {
  id: string;
  workflow_id: string;
  resource_type: string;
  resource_id: string;
  status: InstanceStatus;
  current_step_id?: string;
  started_at: string;
  completed_at?: string;
  created_at: string;
}

export interface WorkflowStepExecution {
  id: string;
  workflow_instance_id: string;
  workflow_step_id: string;
  status: StepExecutionStatus;
  started_at?: string;
  completed_at?: string;
  result_data?: string;
  error_message?: string;
  created_at: string;
}

export class WorkflowService {
  constructor(private db: Database.Database) {}

  /**
   * Create a workflow with steps
   */
  createWorkflow(orgId: string, dto: CreateWorkflowDTO): Workflow {
    const id = uuidv4();
    const workflowId = dto.workflow_id || `WF-${id.substring(0, 8).toUpperCase()}`;

    // Create workflow
    const workflowStmt = this.db.prepare(`
      INSERT INTO workflows (
        id, organization_id, workflow_id, name, description,
        trigger_type, trigger_conditions, enabled, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    workflowStmt.run(
      id,
      orgId,
      workflowId,
      dto.name,
      dto.description || null,
      dto.trigger_type,
      dto.trigger_conditions ? JSON.stringify(dto.trigger_conditions) : null,
      1,
      new Date().toISOString(),
      new Date().toISOString()
    );

    // Create steps
    for (const stepDto of dto.steps) {
      this.createWorkflowStep(id, stepDto);
    }

    return this.getWorkflowById(id)!;
  }

  /**
   * Create a workflow step
   */
  createWorkflowStep(workflowId: string, dto: CreateWorkflowStepDTO): WorkflowStep {
    const id = uuidv4();
    const stepStmt = this.db.prepare(`
      INSERT INTO workflow_steps (
        id, workflow_id, step_order, step_type, name, config, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stepStmt.run(
      id,
      workflowId,
      dto.step_order,
      dto.step_type,
      dto.name,
      dto.config ? JSON.stringify(dto.config) : null,
      new Date().toISOString()
    );

    // Create approvers if this is an approval step
    if (dto.step_type === 'approval' && dto.approvers) {
      for (const approverDto of dto.approvers) {
        this.createApprover(id, approverDto);
      }
    }

    return this.getStepById(id)!;
  }

  /**
   * Create an approver for a step
   */
  createApprover(stepId: string, dto: CreateApproverDTO): WorkflowApprover {
    const id = uuidv4();
    const stmt = this.db.prepare(`
      INSERT INTO workflow_approvers (
        id, workflow_step_id, approver_type, approver_id, approver_role, approval_type, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      stepId,
      dto.approver_type,
      dto.approver_id || null,
      dto.approver_role || null,
      dto.approval_type,
      new Date().toISOString()
    );

    return this.getApproverById(id)!;
  }

  /**
   * Get workflow by ID
   */
  getWorkflowById(id: string): Workflow | null {
    const stmt = this.db.prepare('SELECT * FROM workflows WHERE id = ?');
    const row = stmt.get(id) as any;
    if (!row) return null;
    return this.mapRowToWorkflow(row);
  }

  /**
   * List workflows
   */
  listWorkflows(orgId: string, filters?: { enabled?: boolean; trigger_type?: TriggerType }): Workflow[] {
    let sql = 'SELECT * FROM workflows WHERE organization_id = ?';
    const params: any[] = [orgId];

    if (filters) {
      if (filters.enabled !== undefined) {
        sql += ' AND enabled = ?';
        params.push(filters.enabled ? 1 : 0);
      }
      if (filters.trigger_type) {
        sql += ' AND trigger_type = ?';
        params.push(filters.trigger_type);
      }
    }

    sql += ' ORDER BY created_at DESC';

    const stmt = this.db.prepare(sql);
    const rows = stmt.all(...params) as any[];
    return rows.map(row => this.mapRowToWorkflow(row));
  }

  /**
   * Get steps for a workflow
   */
  getStepsForWorkflow(workflowId: string): WorkflowStep[] {
    const stmt = this.db.prepare(`
      SELECT * FROM workflow_steps 
      WHERE workflow_id = ? 
      ORDER BY step_order ASC
    `);
    const rows = stmt.all(workflowId) as any[];
    return rows.map(row => this.mapRowToStep(row));
  }

  /**
   * Get approvers for a step
   */
  getApproversForStep(stepId: string): WorkflowApprover[] {
    const stmt = this.db.prepare(`
      SELECT * FROM workflow_approvers 
      WHERE workflow_step_id = ? 
      ORDER BY created_at ASC
    `);
    const rows = stmt.all(stepId) as any[];
    return rows.map(row => this.mapRowToApprover(row));
  }

  /**
   * Update workflow
   */
  updateWorkflow(id: string, dto: Partial<CreateWorkflowDTO>): Workflow {
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
    if (dto.trigger_type !== undefined) {
      updates.push('trigger_type = ?');
      values.push(dto.trigger_type);
    }
    if (dto.trigger_conditions !== undefined) {
      updates.push('trigger_conditions = ?');
      values.push(dto.trigger_conditions ? JSON.stringify(dto.trigger_conditions) : null);
    }

    if (updates.length === 0) {
      return this.getWorkflowById(id)!;
    }

    updates.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    const sql = `UPDATE workflows SET ${updates.join(', ')} WHERE id = ?`;
    this.db.prepare(sql).run(...values);

    return this.getWorkflowById(id)!;
  }

  /**
   * Enable/disable workflow
   */
  setWorkflowEnabled(id: string, enabled: boolean): void {
    this.db.prepare(`
      UPDATE workflows 
      SET enabled = ?, updated_at = ?
      WHERE id = ?
    `).run(enabled ? 1 : 0, new Date().toISOString(), id);
  }

  /**
   * Start a workflow instance
   */
  startWorkflowInstance(workflowId: string, resourceType: string, resourceId: string): WorkflowInstance {
    const id = uuidv4();
    const workflow = this.getWorkflowById(workflowId);
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    // Get first step
    const steps = this.getStepsForWorkflow(workflowId);
    if (steps.length === 0) {
      throw new Error('Workflow has no steps');
    }

    const firstStep = steps[0];

    // Create instance
    const instanceStmt = this.db.prepare(`
      INSERT INTO workflow_instances (
        id, workflow_id, resource_type, resource_id, status, current_step_id, started_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    instanceStmt.run(
      id,
      workflowId,
      resourceType,
      resourceId,
      'running',
      firstStep.id,
      new Date().toISOString(),
      new Date().toISOString()
    );

    // Create step execution for first step
    this.createStepExecution(id, firstStep.id);

    return this.getInstanceById(id)!;
  }

  /**
   * Create step execution
   */
  createStepExecution(instanceId: string, stepId: string): WorkflowStepExecution {
    const id = uuidv4();
    const step = this.getStepById(stepId);
    if (!step) {
      throw new Error('Step not found');
    }

    const stmt = this.db.prepare(`
      INSERT INTO workflow_step_executions (
        id, workflow_instance_id, workflow_step_id, status, created_at
      ) VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      instanceId,
      stepId,
      'pending',
      new Date().toISOString()
    );

    // If this is an approval step, create approval records
    if (step.step_type === 'approval') {
      const approvers = this.getApproversForStep(stepId);
      for (const approver of approvers) {
        this.createApprovalRecord(id, approver);
      }
    }

    // If this is an SLA timer step, create timer
    if (step.step_type === 'sla_timer') {
      const config = step.config ? JSON.parse(step.config) : {};
      const durationHours = config.duration_hours || 24;
      this.createSLATimer(id, durationHours);
    }

    return this.getStepExecutionById(id)!;
  }

  /**
   * Process approval
   */
  processApproval(stepExecutionId: string, approverId: string, status: 'approved' | 'rejected', comments?: string): void {
    // Update approval record
    this.db.prepare(`
      UPDATE workflow_approvals 
      SET approval_status = ?, comments = ?, approved_at = ?
      WHERE workflow_step_execution_id = ? AND approver_id = ?
    `).run(status, comments || null, new Date().toISOString(), stepExecutionId, approverId);

    const stepExecution = this.getStepExecutionById(stepExecutionId);
    if (!stepExecution) return;

    const step = this.getStepById(stepExecution.workflow_step_id);
    if (!step) return;

    const approvers = this.getApproversForStep(step.workflow_step_id);
    const approvals = this.getApprovalsForStepExecution(stepExecutionId);

    // Check if step is complete based on approval type
    let stepComplete = false;
    if (approvers.length > 0) {
      const approver = approvers[0];
      if (approver.approval_type === 'any') {
        stepComplete = approvals.some(a => a.approval_status === 'approved');
      } else if (approver.approval_type === 'all') {
        stepComplete = approvals.every(a => a.approval_status === 'approved' || a.approval_status === 'rejected');
        stepComplete = stepComplete && approvals.some(a => a.approval_status === 'approved');
      }
    }

    if (stepComplete || status === 'rejected') {
      // Mark step execution as completed
      this.db.prepare(`
        UPDATE workflow_step_executions 
        SET status = ?, completed_at = ?
        WHERE id = ?
      `).run(status === 'rejected' ? 'failed' : 'completed', new Date().toISOString(), stepExecutionId);

      // Move to next step or complete workflow
      if (status === 'approved') {
        this.advanceWorkflowInstance(stepExecution.workflow_instance_id);
      } else {
        // Rejected - cancel workflow
        this.cancelWorkflowInstance(stepExecution.workflow_instance_id);
      }
    }
  }

  /**
   * Advance workflow instance to next step
   */
  advanceWorkflowInstance(instanceId: string): void {
    const instance = this.getInstanceById(instanceId);
    if (!instance) return;

    const steps = this.getStepsForWorkflow(instance.workflow_id);
    const currentStepIndex = steps.findIndex(s => s.id === instance.current_step_id);

    if (currentStepIndex === -1 || currentStepIndex === steps.length - 1) {
      // Complete workflow
      this.db.prepare(`
        UPDATE workflow_instances 
        SET status = 'completed', completed_at = ?, current_step_id = NULL
        WHERE id = ?
      `).run(new Date().toISOString(), instanceId);
    } else {
      // Move to next step
      const nextStep = steps[currentStepIndex + 1];
      this.db.prepare(`
        UPDATE workflow_instances 
        SET current_step_id = ?
        WHERE id = ?
      `).run(nextStep.id, instanceId);

      // Create step execution for next step
      this.createStepExecution(instanceId, nextStep.id);
    }
  }

  /**
   * Cancel workflow instance
   */
  cancelWorkflowInstance(instanceId: string): void {
    this.db.prepare(`
      UPDATE workflow_instances 
      SET status = 'cancelled', completed_at = ?
      WHERE id = ?
    `).run(new Date().toISOString(), instanceId);
  }

  /**
   * Get instances for a resource
   */
  getInstancesForResource(resourceType: string, resourceId: string): WorkflowInstance[] {
    const stmt = this.db.prepare(`
      SELECT * FROM workflow_instances 
      WHERE resource_type = ? AND resource_id = ?
      ORDER BY created_at DESC
    `);
    const rows = stmt.all(resourceType, resourceId) as any[];
    return rows.map(row => this.mapRowToInstance(row));
  }

  /**
   * Get step executions for an instance
   */
  getStepExecutionsForInstance(instanceId: string): WorkflowStepExecution[] {
    const stmt = this.db.prepare(`
      SELECT * FROM workflow_step_executions 
      WHERE workflow_instance_id = ? 
      ORDER BY created_at ASC
    `);
    const rows = stmt.all(instanceId) as any[];
    return rows.map(row => this.mapRowToStepExecution(row));
  }

  /**
   * Create approval record
   */
  createApprovalRecord(stepExecutionId: string, approver: WorkflowApprover): void {
    // For now, we'll create a placeholder - in real implementation,
    // we'd resolve dynamic approvers based on resource context
    if (approver.approver_type === 'user' && approver.approver_id) {
      const id = uuidv4();
      this.db.prepare(`
        INSERT INTO workflow_approvals (
          id, workflow_step_execution_id, approver_id, approval_status, created_at
        ) VALUES (?, ?, ?, 'pending', ?)
      `).run(id, stepExecutionId, approver.approver_id, new Date().toISOString());
    }
  }

  /**
   * Create SLA timer
   */
  createSLATimer(stepExecutionId: string, durationHours: number): void {
    const id = uuidv4();
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + durationHours * 60 * 60 * 1000);

    this.db.prepare(`
      INSERT INTO sla_timers (
        id, workflow_step_execution_id, duration_hours, start_time, end_time, status, created_at
      ) VALUES (?, ?, ?, ?, ?, 'active', ?)
    `).run(
      id,
      stepExecutionId,
      durationHours,
      startTime.toISOString(),
      endTime.toISOString(),
      new Date().toISOString()
    );
  }

  // Helper methods
  private getStepById(id: string): WorkflowStep | null {
    const stmt = this.db.prepare('SELECT * FROM workflow_steps WHERE id = ?');
    const row = stmt.get(id) as any;
    if (!row) return null;
    return this.mapRowToStep(row);
  }

  private getApproverById(id: string): WorkflowApprover | null {
    const stmt = this.db.prepare('SELECT * FROM workflow_approvers WHERE id = ?');
    const row = stmt.get(id) as any;
    if (!row) return null;
    return this.mapRowToApprover(row);
  }

  private getInstanceById(id: string): WorkflowInstance | null {
    const stmt = this.db.prepare('SELECT * FROM workflow_instances WHERE id = ?');
    const row = stmt.get(id) as any;
    if (!row) return null;
    return this.mapRowToInstance(row);
  }

  private getStepExecutionById(id: string): WorkflowStepExecution | null {
    const stmt = this.db.prepare('SELECT * FROM workflow_step_executions WHERE id = ?');
    const row = stmt.get(id) as any;
    if (!row) return null;
    return this.mapRowToStepExecution(row);
  }

  private getApprovalsForStepExecution(stepExecutionId: string): any[] {
    const stmt = this.db.prepare('SELECT * FROM workflow_approvals WHERE workflow_step_execution_id = ?');
    return stmt.all(stepExecutionId) as any[];
  }

  private mapRowToWorkflow(row: any): Workflow {
    return {
      id: row.id,
      organization_id: row.organization_id,
      workflow_id: row.workflow_id,
      name: row.name,
      description: row.description || undefined,
      trigger_type: row.trigger_type,
      trigger_conditions: row.trigger_conditions ? JSON.parse(row.trigger_conditions) : undefined,
      enabled: row.enabled === 1,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private mapRowToStep(row: any): WorkflowStep {
    return {
      id: row.id,
      workflow_id: row.workflow_id,
      step_order: row.step_order,
      step_type: row.step_type,
      name: row.name,
      config: row.config ? JSON.parse(row.config) : undefined,
      created_at: row.created_at,
    };
  }

  private mapRowToApprover(row: any): WorkflowApprover {
    return {
      id: row.id,
      workflow_step_id: row.workflow_step_id,
      approver_type: row.approver_type,
      approver_id: row.approver_id || undefined,
      approver_role: row.approver_role || undefined,
      approval_type: row.approval_type,
      created_at: row.created_at,
    };
  }

  private mapRowToInstance(row: any): WorkflowInstance {
    return {
      id: row.id,
      workflow_id: row.workflow_id,
      resource_type: row.resource_type,
      resource_id: row.resource_id,
      status: row.status,
      current_step_id: row.current_step_id || undefined,
      started_at: row.started_at,
      completed_at: row.completed_at || undefined,
      created_at: row.created_at,
    };
  }

  private mapRowToStepExecution(row: any): WorkflowStepExecution {
    return {
      id: row.id,
      workflow_instance_id: row.workflow_instance_id,
      workflow_step_id: row.workflow_step_id,
      status: row.status,
      started_at: row.started_at || undefined,
      completed_at: row.completed_at || undefined,
      result_data: row.result_data || undefined,
      error_message: row.error_message || undefined,
      created_at: row.created_at,
    };
  }
}

