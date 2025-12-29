import api from './api';

export type TriggerType = 'risk_created' | 'risk_updated' | 'treatment_submitted' | 'finding_created' | 'appetite_breach' | 'manual';
export type StepType = 'approval' | 'notification' | 'escalation' | 'sla_timer' | 'action';
export type ApproverType = 'user' | 'role' | 'dynamic';
export type ApprovalType = 'any' | 'all' | 'sequential';
export type InstanceStatus = 'running' | 'completed' | 'cancelled' | 'failed';
export type StepExecutionStatus = 'pending' | 'in_progress' | 'completed' | 'skipped' | 'failed';

export interface Workflow {
  id: string;
  organization_id: string;
  workflow_id: string;
  name: string;
  description?: string;
  trigger_type: TriggerType;
  trigger_conditions?: any;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateWorkflowDTO {
  workflow_id?: string;
  name: string;
  description?: string;
  trigger_type: TriggerType;
  trigger_conditions?: any;
  steps: CreateWorkflowStepDTO[];
}

export interface WorkflowStep {
  id: string;
  workflow_id: string;
  step_order: number;
  step_type: StepType;
  name: string;
  config?: any;
  created_at: string;
  approvers?: WorkflowApprover[];
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

export const workflowApi = {
  async list(filters?: any): Promise<{ workflows: Workflow[] }> {
    const { data } = await api.get('/workflow', { params: filters });
    return data;
  },

  async get(id: string): Promise<{ workflow: Workflow; steps: WorkflowStep[] }> {
    const { data } = await api.get(`/workflow/${id}`);
    return data;
  },

  async create(workflow: CreateWorkflowDTO): Promise<{ workflow: Workflow }> {
    const { data } = await api.post('/workflow', workflow);
    return data;
  },

  async update(id: string, workflow: Partial<CreateWorkflowDTO>): Promise<{ workflow: Workflow }> {
    const { data } = await api.put(`/workflow/${id}`, workflow);
    return data;
  },

  async setEnabled(id: string, enabled: boolean): Promise<void> {
    await api.post(`/workflow/${id}/enable`, { enabled });
  },

  async start(workflowId: string, resourceType: string, resourceId: string): Promise<{ instance: WorkflowInstance }> {
    const { data } = await api.post(`/workflow/${workflowId}/start`, { resource_type: resourceType, resource_id: resourceId });
    return data;
  },

  async getInstances(resourceType: string, resourceId: string): Promise<{ instances: WorkflowInstance[] }> {
    const { data } = await api.get(`/workflow/instances/${resourceType}/${resourceId}`);
    return data;
  },

  async getExecutions(instanceId: string): Promise<{ executions: WorkflowStepExecution[] }> {
    const { data } = await api.get(`/workflow/executions/${instanceId}`);
    return data;
  },

  async processApproval(stepExecutionId: string, status: 'approved' | 'rejected', comments?: string): Promise<void> {
    await api.post(`/workflow/executions/${stepExecutionId}/approve`, { status, comments });
  },
};

