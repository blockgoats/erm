import { useEffect, useState } from 'react';
import { controlsApi, Control, RiskControlMapping as RiskControlMappingType, MappingType } from '../lib/controls';
import { Plus, Shield, Trash2, Link as LinkIcon } from 'lucide-react';

interface RiskControlMappingProps {
  riskId: string;
  enterpriseRiskId?: string;
}

export default function RiskControlMapping({ riskId, enterpriseRiskId }: RiskControlMappingProps) {
  const [mappings, setMappings] = useState<RiskControlMappingType[]>([]);
  const [controls, setControls] = useState<Control[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [riskId, enterpriseRiskId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [mappingsResult, controlsResult] = await Promise.all([
        enterpriseRiskId
          ? controlsApi.getMappingsForEnterpriseRisk(enterpriseRiskId)
          : controlsApi.getMappingsForRisk(riskId),
        controlsApi.list({ status: 'active' }),
      ]);

      setMappings(mappingsResult.mappings);
      setControls(controlsResult.controls);
    } catch (error) {
      console.error('Failed to load mappings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMapping = async (data: { control_id: string; mapping_type: MappingType; effectiveness?: string }) => {
    try {
      await controlsApi.createMapping({
        risk_id: enterpriseRiskId ? undefined : riskId,
        enterprise_risk_id: enterpriseRiskId,
        ...data,
      });
      await loadData();
      setShowAddModal(false);
    } catch (error: any) {
      alert('Failed to add mapping: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDeleteMapping = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this control mapping?')) {
      return;
    }
    try {
      await controlsApi.deleteMapping(id);
      await loadData();
    } catch (error: any) {
      alert('Failed to delete mapping: ' + (error.response?.data?.error || error.message));
    }
  };

  const getControlName = (controlId: string) => {
    const control = controls.find(c => c.id === controlId);
    return control?.name || controlId;
  };

  if (loading) {
    return <div className="text-center py-4 text-gray-500">Loading control mappings...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Control Mappings</h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Map Control
        </button>
      </div>

      {mappings.length === 0 ? (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
          <LinkIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p>No controls mapped to this risk</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
          >
            Map a control
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {mappings.map((mapping) => (
            <div
              key={mapping.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-center gap-3 flex-1">
                <Shield className="w-5 h-5 text-blue-600" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {getControlName(mapping.control_id)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {mapping.mapping_type} • {mapping.effectiveness || 'Not rated'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleDeleteMapping(mapping.id)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <AddMappingModal
          controls={controls}
          onClose={() => setShowAddModal(false)}
          onSave={handleAddMapping}
        />
      )}
    </div>
  );
}

interface AddMappingModalProps {
  controls: Control[];
  onClose: () => void;
  onSave: (data: { control_id: string; mapping_type: MappingType; effectiveness?: string }) => Promise<void>;
}

function AddMappingModal({ controls, onClose, onSave }: AddMappingModalProps) {
  const [formData, setFormData] = useState({
    control_id: '',
    mapping_type: 'mitigates' as MappingType,
    effectiveness: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.control_id) {
      alert('Please select a control');
      return;
    }
    await onSave({
      control_id: formData.control_id,
      mapping_type: formData.mapping_type,
      effectiveness: formData.effectiveness || undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Map Control to Risk</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Control *
              </label>
              <select
                required
                value={formData.control_id}
                onChange={(e) => setFormData({ ...formData, control_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a control</option>
                {controls.map((control) => (
                  <option key={control.id} value={control.id}>
                    {control.control_id} - {control.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mapping Type *
              </label>
              <select
                required
                value={formData.mapping_type}
                onChange={(e) => setFormData({ ...formData, mapping_type: e.target.value as MappingType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="mitigates">Mitigates</option>
                <option value="monitors">Monitors</option>
                <option value="detects">Detects</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Effectiveness
              </label>
              <select
                value={formData.effectiveness}
                onChange={(e) => setFormData({ ...formData, effectiveness: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Not rated</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
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
                Add Mapping
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

