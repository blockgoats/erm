import api from './api';

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

export interface TreatmentApproval {
  id: string;
  treatment_plan_id: string;
  approver_id: string;
  approval_status: ApprovalStatus;
  comments?: string;
  approved_at?: string;
  created_at: string;
}

export const treatmentApi = {
  // Treatment Plans
  async list(filters?: any): Promise<{ plans: TreatmentPlan[] }> {
    const { data } = await api.get('/treatment/plans', { params: filters });
    return data;
  },

  async get(id: string): Promise<{ plan: TreatmentPlan }> {
    const { data } = await api.get(`/treatment/plans/${id}`);
    return data;
  },

  async getForRisk(riskId: string): Promise<{ plans: TreatmentPlan[] }> {
    const { data } = await api.get(`/treatment/plans/risk/${riskId}`);
    return data;
  },

  async create(riskId: string, plan: CreateTreatmentPlanDTO): Promise<{ plan: TreatmentPlan }> {
    const { data } = await api.post('/treatment/plans', { risk_id: riskId, ...plan });
    return data;
  },

  async update(id: string, plan: Partial<CreateTreatmentPlanDTO & { status?: TreatmentStatus }>): Promise<{ plan: TreatmentPlan }> {
    const { data } = await api.put(`/treatment/plans/${id}`, plan);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/treatment/plans/${id}`);
  },

  async submitForApproval(id: string, approverIds: string[]): Promise<void> {
    await api.post(`/treatment/plans/${id}/submit`, { approver_ids: approverIds });
  },

  async processApproval(id: string, status: 'approved' | 'rejected', comments?: string): Promise<void> {
    await api.post(`/treatment/plans/${id}/approve`, { status, comments });
  },

  async getApprovals(id: string): Promise<{ approvals: TreatmentApproval[] }> {
    const { data } = await api.get(`/treatment/plans/${id}/approvals`);
    return data;
  },

  // Tasks
  async getTasks(planId: string): Promise<{ tasks: TreatmentTask[] }> {
    const { data } = await api.get(`/treatment/tasks/plan/${planId}`);
    return data;
  },

  async createTask(planId: string, task: { title: string; description?: string; assigned_to?: string; due_date?: string }): Promise<{ task: TreatmentTask }> {
    const { data } = await api.post('/treatment/tasks', { treatment_plan_id: planId, ...task });
    return data;
  },

  async updateTask(id: string, task: Partial<{ title: string; description?: string; assigned_to?: string; status?: TaskStatus; due_date?: string }>): Promise<{ task: TreatmentTask }> {
    const { data } = await api.put(`/treatment/tasks/${id}`, task);
    return data;
  },

  async deleteTask(id: string): Promise<void> {
    await api.delete(`/treatment/tasks/${id}`);
  },
};

