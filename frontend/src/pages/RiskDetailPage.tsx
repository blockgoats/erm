import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CyberRisk, RiskHistory as RiskHistoryType, Evidence } from '../types';
import RiskExposureBadge from '../components/RiskExposureBadge';
import RiskHistory from '../components/RiskHistory';
import EvidenceLink from '../components/EvidenceLink';
import ExplainableValue from '../components/ExplainableValue';
import { ArrowLeft, Upload, FileText } from 'lucide-react';

export default function RiskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [risk, setRisk] = useState<CyberRisk | null>(null);
  const [history, setHistory] = useState<RiskHistoryType[]>([]);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchRiskDetail(id);
    }
  }, [id]);

  const fetchRiskDetail = async (riskId: string) => {
    try {
      // Mock data
      const mockRisk: CyberRisk = {
        id: riskId,
        organizationId: 'org-1',
        title: 'Unauthorized Access to Customer Database',
        description: 'Risk of unauthorized access leading to data breach',
        threat: 'External attacker',
        vulnerability: 'Weak authentication mechanisms',
        impactDescription: 'Customer PII exposure, regulatory fines up to $5M, reputation damage',
        likelihood: 4,
        impact: 5,
        exposure: 20,
        category: 'Data Breach',
        status: 'identified',
        ownerName: 'John Smith',
        createdBy: 'user-1',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        reviewedAt: '2024-01-20T10:00:00Z',
        nextReviewAt: '2024-04-20T10:00:00Z',
      };

      const mockHistory: RiskHistoryType[] = [
        {
          id: '1',
          riskId: riskId,
          changedBy: 'John Smith',
          changeType: 'CREATED',
          newValue: 'Risk identified',
          createdAt: '2024-01-15T10:00:00Z',
        },
        {
          id: '2',
          riskId: riskId,
          changedBy: 'Sarah Johnson',
          changeType: 'LIKELIHOOD_UPDATED',
          oldValue: '3',
          newValue: '4',
          createdAt: '2024-01-18T10:00:00Z',
        },
        {
          id: '3',
          riskId: riskId,
          changedBy: 'John Smith',
          changeType: 'OWNER_ASSIGNED',
          newValue: 'John Smith',
          createdAt: '2024-01-19T10:00:00Z',
        },
      ];

      const mockEvidence: Evidence[] = [
        {
          id: '1',
          riskId: riskId,
          fileName: 'Security Assessment Report.pdf',
          filePath: '/evidence/1.pdf',
          fileType: 'application/pdf',
          uploadedBy: 'John Smith',
          createdAt: '2024-01-16T10:00:00Z',
        },
        {
          id: '2',
          riskId: riskId,
          fileName: 'Penetration Test Results.xlsx',
          filePath: '/evidence/2.xlsx',
          fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          uploadedBy: 'Sarah Johnson',
          createdAt: '2024-01-17T10:00:00Z',
        },
      ];

      setRisk(mockRisk);
      setHistory(mockHistory);
      setEvidence(mockEvidence);
    } catch (error) {
      console.error('Failed to fetch risk detail:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading risk details...</div>;
  }

  if (!risk) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Risk not found</p>
        <Link to="/app/risks" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
          Back to Risk Register
        </Link>
      </div>
    );
  }

  const getLikelihoodLabel = (value: number) => {
    const labels = ['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'];
    return labels[value - 1] || value.toString();
  };

  const getImpactLabel = (value: number) => {
    const labels = ['Negligible', 'Minor', 'Moderate', 'Major', 'Catastrophic'];
    return labels[value - 1] || value.toString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/app/risks" className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-gray-900">{risk.title}</h1>
          <p className="mt-1 text-sm text-gray-600">Risk ID: {risk.id}</p>
        </div>
        <RiskExposureBadge exposure={risk.exposure} size="lg" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Left Column - Risk Details */}
        <div className="space-y-6">
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Risk Scenario</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Threat</label>
                <p className="mt-1 text-sm text-gray-900">{risk.threat}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Vulnerability</label>
                <p className="mt-1 text-sm text-gray-900">{risk.vulnerability}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Impact Description</label>
                <p className="mt-1 text-sm text-gray-900">{risk.impactDescription}</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Risk Scoring</h2>
            <div className="space-y-3">
              <ExplainableValue
                value={`${risk.likelihood} - ${getLikelihoodLabel(risk.likelihood)}`}
                explanation="Likelihood represents the probability of this risk occurring. Scale: 1=Rare, 2=Unlikely, 3=Possible, 4=Likely, 5=Almost Certain"
                label="Likelihood"
              />
              <ExplainableValue
                value={`${risk.impact} - ${getImpactLabel(risk.impact)}`}
                explanation="Impact represents the severity of consequences if this risk occurs. Scale: 1=Negligible, 2=Minor, 3=Moderate, 4=Major, 5=Catastrophic"
                label="Impact"
              />
              <ExplainableValue
                value={risk.exposure}
                explanation={`Exposure = Likelihood × Impact = ${risk.likelihood} × ${risk.impact} = ${risk.exposure}. This value determines the risk level and required response.`}
                label="Exposure"
              />
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Risk Information</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Category</label>
                <p className="mt-1 text-sm text-gray-900">{risk.category}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <p className="mt-1 text-sm text-gray-900 capitalize">{risk.status}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Owner</label>
                <p className="mt-1 text-sm text-gray-900">{risk.ownerName || 'Unassigned'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Last Reviewed</label>
                <p className="mt-1 text-sm text-gray-900">
                  {risk.reviewedAt ? new Date(risk.reviewedAt).toLocaleDateString() : 'Never'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Next Review Due</label>
                <p className="mt-1 text-sm text-gray-900">
                  {risk.nextReviewAt ? new Date(risk.nextReviewAt).toLocaleDateString() : 'Not scheduled'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Audit Trail & Evidence */}
        <div className="space-y-6">
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Version History</h2>
            </div>
            <RiskHistory history={history} />
          </div>

          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Evidence</h2>
              <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </button>
            </div>
            {evidence.length > 0 ? (
              <div className="space-y-2">
                {evidence.map((ev) => (
                  <EvidenceLink key={ev.id} evidence={ev} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>No evidence attached</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

