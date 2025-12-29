import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { risksApi, CyberRisk } from '../lib/risks';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import RiskHistoryTimeline from '../components/RiskHistoryTimeline';
import EvidencePanel from '../components/EvidencePanel';
import RiskControlMapping from '../components/RiskControlMapping';
import TreatmentPlansPanel from '../components/TreatmentPlansPanel';
import Breadcrumbs from '../components/Breadcrumbs';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { showToast } from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';

export default function RiskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [risk, setRisk] = useState<CyberRisk | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (id) {
      loadRisk();
    }
  }, [id]);

  const loadRisk = async () => {
    try {
      const { risk } = await risksApi.get(id!);
      setRisk(risk);
    } catch (error) {
      console.error('Failed to load risk:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await risksApi.delete(id!);
      showToast({
        type: 'success',
        title: 'Risk deleted',
        message: 'The risk has been removed from the register',
      });
      navigate('/app/risks');
    } catch (error: any) {
      console.error('Failed to delete risk:', error);
      showToast({
        type: 'error',
        title: 'Delete failed',
        message: error.response?.data?.error || 'Failed to delete risk',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!risk) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Risk not found</p>
        <Link to="/risks" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
          Back to Risk Register
        </Link>
      </div>
    );
  }

  const getExposureColor = (exposure: number) => {
    if (exposure >= 20) return 'bg-red-100 text-red-800 border-red-300';
    if (exposure >= 10) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-green-100 text-green-800 border-green-300';
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Risk Register', href: '/app/risks' },
          { label: risk.title },
        ]}
      />

      <div className="flex items-center justify-between">
        <Link
          to="/app/risks"
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Risk Register
        </Link>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/risks?edit=${risk.id}`)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{risk.title}</h1>
            <p className="mt-2 text-sm text-gray-500">
              Created {new Date(risk.created_at).toLocaleDateString()}
            </p>
          </div>
          <span className={`px-4 py-2 text-sm font-semibold rounded-full border ${getExposureColor(risk.exposure)}`}>
            Exposure: {risk.exposure}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-sm font-medium text-gray-500 mb-2">Description</h2>
            <p className="text-gray-900">{risk.description}</p>
          </div>

          <div>
            <h2 className="text-sm font-medium text-gray-500 mb-2">Category</h2>
            <p className="text-gray-900 capitalize">{risk.category}</p>
          </div>

          <div>
            <h2 className="text-sm font-medium text-gray-500 mb-2">Threat</h2>
            <p className="text-gray-900">{risk.threat}</p>
          </div>

          <div>
            <h2 className="text-sm font-medium text-gray-500 mb-2">Vulnerability</h2>
            <p className="text-gray-900">{risk.vulnerability}</p>
          </div>

          <div>
            <h2 className="text-sm font-medium text-gray-500 mb-2">Impact Description</h2>
            <p className="text-gray-900">{risk.impact_description}</p>
          </div>

          <div>
            <h2 className="text-sm font-medium text-gray-500 mb-2">Status</h2>
            <p className="text-gray-900 capitalize">{risk.status}</p>
          </div>

          <div>
            <h2 className="text-sm font-medium text-gray-500 mb-2">Likelihood</h2>
            <p className="text-gray-900">{risk.likelihood}/5</p>
          </div>

          <div>
            <h2 className="text-sm font-medium text-gray-500 mb-2">Impact</h2>
            <p className="text-gray-900">{risk.impact}/5</p>
          </div>
        </div>
      </div>

      {/* Evidence Panel */}
      <div className="bg-white rounded-lg shadow p-6">
        <EvidencePanel riskId={risk.id} />
      </div>

      {/* Treatment Plans */}
      <div className="bg-white rounded-lg shadow p-6">
        <TreatmentPlansPanel riskId={risk.id} />
      </div>

      {/* Control Mappings */}
      <div className="bg-white rounded-lg shadow p-6">
        <RiskControlMapping riskId={risk.id} />
      </div>

      {/* History Timeline */}
      <div className="bg-white rounded-lg shadow p-6">
        <RiskHistoryTimeline riskId={risk.id} />
      </div>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Risk"
        message={`Are you sure you want to delete "${risk.title}"? This action cannot be undone.`}
        confirmText="Delete Risk"
        variant="danger"
      />
    </div>
  );
}

