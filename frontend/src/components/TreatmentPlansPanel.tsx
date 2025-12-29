import { useEffect, useState } from 'react';
import { treatmentApi, TreatmentPlan, TreatmentTask, TreatmentApproval, ResponseType } from '../lib/treatment';
import { Plus, FileText, CheckCircle, Clock, XCircle, AlertCircle, User, Calendar, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

interface TreatmentPlansPanelProps {
  riskId: string;
}

export default function TreatmentPlansPanel({ riskId }: TreatmentPlansPanelProps) {
  const [plans, setPlans] = useState<TreatmentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<TreatmentPlan | null>(null);

  useEffect(() => {
    loadPlans();
  }, [riskId]);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const { plans } = await treatmentApi.getForRisk(riskId);
      setPlans(plans);
    } catch (error) {
      console.error('Failed to load treatment plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: any) => {
    try {
      await treatmentApi.create(riskId, data);
      await loadPlans();
      setShowCreateModal(false);
    } catch (error: any) {
      alert('Failed to create treatment plan: ' + (error.response?.data?.error || error.message));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'approved':
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'approved':
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'submitted':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  if (loading) {
    return <div className="text-center py-4 text-gray-500">Loading treatment plans...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Treatment Plans</h3>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Treatment Plan
        </button>
      </div>

      {plans.length === 0 ? (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
          <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p>No treatment plans for this risk</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
          >
            Create a treatment plan
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedPlan(plan)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(plan.status)}
                    <h4 className="text-lg font-semibold text-gray-900">{plan.title}</h4>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(plan.status)}`}>
                      {plan.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{plan.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-gray-500 mb-1">Response Type</div>
                  <div className="font-medium text-gray-900 capitalize">{plan.response_type}</div>
                </div>
                {plan.priority && (
                  <div>
                    <div className="text-gray-500 mb-1">Priority</div>
                    <div className="font-medium text-gray-900">{plan.priority}</div>
                  </div>
                )}
                {plan.target_completion_date && (
                  <div>
                    <div className="text-gray-500 mb-1">Target Date</div>
                    <div className="font-medium text-gray-900">
                      {format(new Date(plan.target_completion_date), 'MMM dd, yyyy')}
                    </div>
                  </div>
                )}
                {plan.residual_exposure && (
                  <div>
                    <div className="text-gray-500 mb-1">Residual Exposure</div>
                    <div className="font-medium text-gray-900">{plan.residual_exposure}</div>
                  </div>
                )}
              </div>

              {plan.residual_likelihood && plan.residual_impact && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Residual Risk: Likelihood {plan.residual_likelihood}/5 × Impact {plan.residual_impact}/5 = {plan.residual_exposure}
                  </div>
                </div>
              )}

              {plan.budget_allocated && (
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                  <DollarSign className="w-4 h-4" />
                  <span>Budget: ${plan.budget_allocated.toLocaleString()}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <TreatmentPlanModal
          riskId={riskId}
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreate}
        />
      )}

      {selectedPlan && (
        <TreatmentPlanDetailModal
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
          onUpdate={async (data) => {
            await treatmentApi.update(selectedPlan.id, data);
            await loadPlans();
            setSelectedPlan(null);
          }}
        />
      )}
    </div>
  );
}

interface TreatmentPlanModalProps {
  riskId: string;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

function TreatmentPlanModal({ riskId, onClose, onSave }: TreatmentPlanModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    response_type: 'mitigate' as ResponseType,
    owner_role: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High' | 'Critical',
    start_date: '',
    target_completion_date: '',
    budget_allocated: '',
    residual_likelihood: '',
    residual_impact: '',
    decision_justification: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      ...formData,
      budget_allocated: formData.budget_allocated ? parseFloat(formData.budget_allocated) : undefined,
      residual_likelihood: formData.residual_likelihood ? parseInt(formData.residual_likelihood) : undefined,
      residual_impact: formData.residual_impact ? parseInt(formData.residual_impact) : undefined,
      start_date: formData.start_date || undefined,
      target_completion_date: formData.target_completion_date || undefined,
    });
  };

  const calculateResidualExposure = () => {
    if (formData.residual_likelihood && formData.residual_impact) {
      const likelihood = parseInt(formData.residual_likelihood);
      const impact = parseInt(formData.residual_impact);
      if (likelihood >= 1 && likelihood <= 5 && impact >= 1 && impact <= 5) {
        return likelihood * impact;
      }
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Treatment Plan</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Response Type *
                </label>
                <select
                  required
                  value={formData.response_type}
                  onChange={(e) => setFormData({ ...formData, response_type: e.target.value as ResponseType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="mitigate">Mitigate</option>
                  <option value="avoid">Avoid</option>
                  <option value="transfer">Transfer</option>
                  <option value="accept">Accept</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Completion Date
                </label>
                <input
                  type="date"
                  value={formData.target_completion_date}
                  onChange={(e) => setFormData({ ...formData, target_completion_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Budget Allocated ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.budget_allocated}
                onChange={(e) => setFormData({ ...formData, budget_allocated: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Residual Risk Assessment</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Residual Likelihood (1-5)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={formData.residual_likelihood}
                    onChange={(e) => setFormData({ ...formData, residual_likelihood: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Residual Impact (1-5)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={formData.residual_impact}
                    onChange={(e) => setFormData({ ...formData, residual_impact: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              {calculateResidualExposure() && (
                <div className="mt-2 text-sm text-gray-600">
                  Calculated Residual Exposure: <span className="font-semibold">{calculateResidualExposure()}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Decision Justification
              </label>
              <textarea
                value={formData.decision_justification}
                onChange={(e) => setFormData({ ...formData, decision_justification: e.target.value })}
                rows={3}
                placeholder="Explain why this treatment approach was chosen..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Treatment Plan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

interface TreatmentPlanDetailModalProps {
  plan: TreatmentPlan;
  onClose: () => void;
  onUpdate: (data: any) => Promise<void>;
}

function TreatmentPlanDetailModal({ plan, onUpdate }: TreatmentPlanDetailModalProps) {
  const [tasks, setTasks] = useState<TreatmentTask[]>([]);
  const [approvals, setApprovals] = useState<TreatmentApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);

  useEffect(() => {
    loadDetails();
  }, [plan.id]);

  const loadDetails = async () => {
    setLoading(true);
    try {
      const [tasksResult, approvalsResult] = await Promise.all([
        treatmentApi.getTasks(plan.id),
        treatmentApi.getApprovals(plan.id),
      ]);
      setTasks(tasksResult.tasks);
      setApprovals(approvalsResult.approvals);
    } catch (error) {
      console.error('Failed to load plan details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskCreate = async (data: any) => {
    try {
      await treatmentApi.createTask(plan.id, data);
      await loadDetails();
      setShowTaskModal(false);
    } catch (error: any) {
      alert('Failed to create task: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{plan.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Plan Details</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Response Type:</span>
                    <span className="ml-2 font-medium capitalize">{plan.response_type}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <span className="ml-2 font-medium capitalize">{plan.status.replace('_', ' ')}</span>
                  </div>
                  {plan.priority && (
                    <div>
                      <span className="text-gray-500">Priority:</span>
                      <span className="ml-2 font-medium">{plan.priority}</span>
                    </div>
                  )}
                  {plan.residual_exposure && (
                    <div>
                      <span className="text-gray-500">Residual Exposure:</span>
                      <span className="ml-2 font-medium">{plan.residual_exposure}</span>
                    </div>
                  )}
                </div>
                {plan.decision_justification && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500 mb-1">Decision Justification:</div>
                    <div className="text-sm text-gray-900">{plan.decision_justification}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Tasks Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Tasks</h3>
                <button
                  onClick={() => setShowTaskModal(true)}
                  className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </button>
              </div>
              {loading ? (
                <div className="text-center py-4 text-gray-500">Loading tasks...</div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                  <p>No tasks yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <div key={task.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{task.title}</div>
                          {task.description && (
                            <div className="text-sm text-gray-600 mt-1">{task.description}</div>
                          )}
                          <div className="text-xs text-gray-500 mt-2">
                            Status: <span className="capitalize">{task.status.replace('_', ' ')}</span>
                            {task.due_date && (
                              <> • Due: {format(new Date(task.due_date), 'MMM dd, yyyy')}</>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Approvals Section */}
            {approvals.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Approvals</h3>
                <div className="space-y-2">
                  {approvals.map((approval) => (
                    <div key={approval.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">
                            Approver: {approval.approver_id.substring(0, 8)}...
                          </div>
                          <div className="text-sm text-gray-600 capitalize mt-1">
                            Status: {approval.approval_status}
                          </div>
                          {approval.comments && (
                            <div className="text-sm text-gray-600 mt-2">{approval.comments}</div>
                          )}
                        </div>
                        {approval.approved_at && (
                          <div className="text-xs text-gray-500">
                            {format(new Date(approval.approved_at), 'MMM dd, yyyy')}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {showTaskModal && (
        <TaskModal
          onClose={() => setShowTaskModal(false)}
          onSave={handleTaskCreate}
        />
      )}
    </div>
  );
}

interface TaskModalProps {
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

function TaskModal({ onClose, onSave }: TaskModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigned_to: '',
    due_date: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      ...formData,
      assigned_to: formData.assigned_to || undefined,
      due_date: formData.due_date || undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Task</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Task
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

