import { useEffect, useState } from 'react';
import { controlsApi, Control, CreateControlDTO, ControlType, ControlCategory } from '../lib/controls';
import { Plus, Search, Filter, Shield, Edit, Trash2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function ControlsLibraryPage() {
  const [controls, setControls] = useState<Control[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingControl, setEditingControl] = useState<Control | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<ControlType | ''>('');
  const [filterCategory, setFilterCategory] = useState<ControlCategory | ''>('');

  useEffect(() => {
    loadControls();
  }, [filterType, filterCategory]);

  const loadControls = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (filterType) filters.control_type = filterType;
      if (filterCategory) filters.control_category = filterCategory;
      
      const { controls } = await controlsApi.list(filters);
      setControls(controls);
    } catch (error) {
      console.error('Failed to load controls:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: CreateControlDTO) => {
    try {
      await controlsApi.create(data);
      await loadControls();
      setShowCreateModal(false);
    } catch (error: any) {
      alert('Failed to create control: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleUpdate = async (id: string, data: Partial<CreateControlDTO>) => {
    try {
      await controlsApi.update(id, data);
      await loadControls();
      setEditingControl(null);
    } catch (error: any) {
      alert('Failed to update control: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this control?')) {
      return;
    }
    try {
      await controlsApi.delete(id);
      await loadControls();
    } catch (error: any) {
      alert('Failed to delete control: ' + (error.response?.data?.error || error.message));
    }
  };

  const getEffectivenessIcon = (rating?: string) => {
    switch (rating) {
      case 'Effective':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Partially Effective':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'Ineffective':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const filteredControls = controls.filter(control => {
    const matchesSearch = 
      control.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      control.control_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      control.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Controls Library</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your control library and map controls to risks
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Control
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search controls..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as ControlType | '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              <option value="Preventive">Preventive</option>
              <option value="Detective">Detective</option>
              <option value="Corrective">Corrective</option>
              <option value="Compensating">Compensating</option>
            </select>
          </div>
          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as ControlCategory | '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              <option value="Technical">Technical</option>
              <option value="Administrative">Administrative</option>
              <option value="Physical">Physical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Controls List */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading controls...</div>
      ) : filteredControls.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Shield className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>No controls found</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Create your first control
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredControls.map((control) => (
            <div
              key={control.id}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">{control.name}</h3>
                  </div>
                  <p className="text-sm text-gray-500">{control.control_id}</p>
                </div>
                <div className="flex items-center gap-2">
                  {getEffectivenessIcon(control.effectiveness_rating)}
                  <button
                    onClick={() => setEditingControl(control)}
                    className="p-1 text-gray-400 hover:text-blue-600"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(control.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {control.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{control.description}</p>
              )}

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                  {control.control_type}
                </span>
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                  {control.control_category}
                </span>
                {control.framework && (
                  <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                    {control.framework}
                  </span>
                )}
              </div>

              <div className="text-xs text-gray-500">
                {control.effectiveness_rating ? (
                  <span>Effectiveness: {control.effectiveness_rating}</span>
                ) : (
                  <span>Not assessed</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingControl) && (
        <ControlModal
          control={editingControl}
          onClose={() => {
            setShowCreateModal(false);
            setEditingControl(null);
          }}
          onSave={editingControl 
            ? (data) => handleUpdate(editingControl.id, data)
            : handleCreate
          }
        />
      )}
    </div>
  );
}

interface ControlModalProps {
  control: Control | null;
  onClose: () => void;
  onSave: (data: CreateControlDTO | Partial<CreateControlDTO>) => Promise<void>;
}

function ControlModal({ control, onClose, onSave }: ControlModalProps) {
  const [formData, setFormData] = useState<CreateControlDTO>({
    name: control?.name || '',
    description: control?.description || '',
    control_type: control?.control_type || 'Preventive',
    control_category: control?.control_category || 'Technical',
    framework: control?.framework || '',
    owner_role: control?.owner_role || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {control ? 'Edit Control' : 'Create New Control'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Control Name *
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Control Type *
                </label>
                <select
                  required
                  value={formData.control_type}
                  onChange={(e) => setFormData({ ...formData, control_type: e.target.value as ControlType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Preventive">Preventive</option>
                  <option value="Detective">Detective</option>
                  <option value="Corrective">Corrective</option>
                  <option value="Compensating">Compensating</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Control Category *
                </label>
                <select
                  required
                  value={formData.control_category}
                  onChange={(e) => setFormData({ ...formData, control_category: e.target.value as ControlCategory })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Technical">Technical</option>
                  <option value="Administrative">Administrative</option>
                  <option value="Physical">Physical</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Framework (e.g., NIST, ISO, COSO)
              </label>
              <input
                type="text"
                value={formData.framework}
                onChange={(e) => setFormData({ ...formData, framework: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Owner Role
              </label>
              <input
                type="text"
                value={formData.owner_role}
                onChange={(e) => setFormData({ ...formData, owner_role: e.target.value })}
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
                {control ? 'Update' : 'Create'} Control
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

