import { useEffect, useState } from 'react';
import { workflowApi, Workflow, TriggerType, CreateWorkflowStepDTO, StepType, ApproverType, ApprovalType } from '../lib/workflow';
import { Plus, Workflow as WorkflowIcon, Play, Pause, Settings, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    setLoading(true);
    try {
      const { workflows } = await workflowApi.list();
      setWorkflows(workflows);
    } catch (error) {
      console.error('Failed to load workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEnabled = async (id: string, enabled: boolean) => {
    try {
      await workflowApi.setEnabled(id, !enabled);
      await loadWorkflows();
    } catch (error: any) {
      alert('Failed to toggle workflow: ' + (error.response?.data?.error || error.message));
    }
  };

  const getTriggerLabel = (trigger: TriggerType) => {
    const labels: Record<TriggerType, string> = {
      risk_created: 'Risk Created',
      risk_updated: 'Risk Updated',
      treatment_submitted: 'Treatment Submitted',
      finding_created: 'Finding Created',
      appetite_breach: 'Appetite Breach',
      manual: 'Manual',
    };
    return labels[trigger] || trigger;
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading workflows...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Workflow Engine</h1>
          <p className="mt-2 text-sm text-gray-600">
            Configure automated approval workflows, escalations, and SLA timers
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Workflow
        </button>
      </div>

      {workflows.length === 0 ? (
        <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
          <WorkflowIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>No workflows configured</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Create your first workflow
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Workflow
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trigger
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {workflows.map((workflow) => (
                <tr key={workflow.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{workflow.name}</div>
                      {workflow.description && (
                        <div className="text-sm text-gray-500">{workflow.description}</div>
                      )}
                      <div className="text-xs text-gray-400 mt-1">{workflow.workflow_id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                      {getTriggerLabel(workflow.trigger_type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      workflow.enabled
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {workflow.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleEnabled(workflow.id, workflow.enabled)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title={workflow.enabled ? 'Disable' : 'Enable'}
                      >
                        {workflow.enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <Link
                        to={`/app/workflows/${workflow.id}`}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Settings"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreateModal && (
        <CreateWorkflowModal
          onClose={() => setShowCreateModal(false)}
          onSave={async (data) => {
            try {
              await workflowApi.create(data);
              await loadWorkflows();
              setShowCreateModal(false);
            } catch (error: any) {
              alert('Failed to create workflow: ' + (error.response?.data?.error || error.message));
            }
          }}
        />
      )}
    </div>
  );
}

interface CreateWorkflowModalProps {
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

function CreateWorkflowModal({ onClose, onSave }: CreateWorkflowModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trigger_type: 'treatment_submitted' as TriggerType,
    steps: [
      {
        step_order: 1,
        step_type: 'approval' as StepType,
        name: 'Initial Approval',
        approvers: [
          {
            approver_type: 'role' as ApproverType,
            approver_role: 'Risk Manager',
            approval_type: 'any' as ApprovalType,
          },
        ],
      },
    ] as CreateWorkflowStepDTO[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  const addStep = () => {
    setFormData({
      ...formData,
      steps: [
        ...formData.steps,
        {
          step_order: formData.steps.length + 1,
          step_type: 'approval' as StepType,
          name: `Step ${formData.steps.length + 1}`,
          approvers: [],
        },
      ],
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Workflow</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Workflow Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trigger Type *
              </label>
              <select
                required
                value={formData.trigger_type}
                onChange={(e) => setFormData({ ...formData, trigger_type: e.target.value as TriggerType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="treatment_submitted">Treatment Plan Submitted</option>
                <option value="risk_created">Risk Created</option>
                <option value="risk_updated">Risk Updated</option>
                <option value="finding_created">Finding Created</option>
                <option value="appetite_breach">Appetite Breach</option>
                <option value="manual">Manual</option>
              </select>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Workflow Steps</h3>
                <button
                  type="button"
                  onClick={addStep}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  + Add Step
                </button>
              </div>

              <div className="space-y-3">
                {formData.steps.map((step, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Step {step.step_order}</span>
                    </div>
                    <input
                      type="text"
                      value={step.name}
                      onChange={(e) => {
                        const newSteps = [...formData.steps];
                        newSteps[index].name = e.target.value;
                        setFormData({ ...formData, steps: newSteps });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Step name"
                    />
                    <select
                      value={step.step_type}
                      onChange={(e) => {
                        const newSteps = [...formData.steps];
                        newSteps[index].step_type = e.target.value as StepType;
                        setFormData({ ...formData, steps: newSteps });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="approval">Approval</option>
                      <option value="notification">Notification</option>
                      <option value="escalation">Escalation</option>
                      <option value="sla_timer">SLA Timer</option>
                      <option value="action">Action</option>
                    </select>
                  </div>
                ))}
              </div>
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
                Create Workflow
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

