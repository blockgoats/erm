/**
 * Risk Register (CSRR) - Enterprise-Grade
 * 
 * Principles Applied:
 * - Dense table view (not cards)
 * - Inline editing (no modal hell)
 * - Clear risk scenario structure
 * - Explainable exposure calculations
 * - Decision-centric actions
 * - Enterprise language
 */

import { useState, useEffect } from 'react';
import { CyberRisk } from '../types';
import EnterpriseTable, { Column } from '../components/EnterpriseTable';
import ExplainableExposure from '../components/ExplainableExposure';
import StatusBadge from '../components/StatusBadge';
import InlineEditor from '../components/InlineEditor';
import { expandAcronym, StatusLabels } from '../components/EnterpriseLanguage';
import { Plus, Eye, Edit2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export default function RiskRegisterPage() {
  const [risks, setRisks] = useState<CyberRisk[]>([]);
  const [sortColumn, setSortColumn] = useState<string>('exposure');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRisks();
  }, []);

  const fetchRisks = async () => {
    try {
      // Mock data for demo
      const mockRisks: CyberRisk[] = [
        {
          id: '1',
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
        },
        {
          id: '2',
          organizationId: 'org-1',
          title: 'Ransomware Attack on Production Systems',
          description: 'Risk of ransomware encrypting critical business systems',
          threat: 'Cybercriminal group',
          vulnerability: 'Unpatched software vulnerabilities',
          impactDescription: 'Operational disruption for 3-5 days, estimated $2M in lost revenue',
          likelihood: 3,
          impact: 5,
          exposure: 15,
          category: 'Operational Disruption',
          status: 'assessed',
          ownerName: 'Sarah Johnson',
          createdBy: 'user-1',
          createdAt: '2024-01-10T10:00:00Z',
          updatedAt: '2024-01-12T10:00:00Z',
        },
        {
          id: '3',
          organizationId: 'org-1',
          title: 'Third-Party Vendor Data Leak',
          description: 'Risk of vendor compromise leading to supply chain attack',
          threat: 'Compromised vendor',
          vulnerability: 'Insufficient vendor security assessments',
          impactDescription: 'Exposure of shared data, potential regulatory action',
          likelihood: 2,
          impact: 4,
          exposure: 8,
          category: 'Third-Party Risk',
          status: 'monitored',
          ownerName: 'Mike Davis',
          createdBy: 'user-1',
          createdAt: '2024-01-05T10:00:00Z',
          updatedAt: '2024-01-08T10:00:00Z',
        },
      ];
      setRisks(mockRisks);
    } catch (error) {
      console.error('Failed to fetch risks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column: string, direction: 'asc' | 'desc') => {
    setSortColumn(column);
    setSortDirection(direction);
    
    const sorted = [...risks].sort((a, b) => {
      let aVal: any = a[column as keyof CyberRisk];
      let bVal: any = b[column as keyof CyberRisk];
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (direction === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    
    setRisks(sorted);
  };

  const handleSave = async (risk: CyberRisk, field: string, value: any) => {
    try {
      // In real app, call API
      const updated = { ...risk, [field]: value };
      if (field === 'likelihood' || field === 'impact') {
        updated.exposure = updated.likelihood * updated.impact;
      }
      setRisks(risks.map(r => r.id === risk.id ? updated : r));
    } catch (error) {
      console.error('Failed to save risk:', error);
    }
  };

  const getLikelihoodLabel = (value: number) => {
    const labels = ['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'];
    return labels[value - 1] || value.toString();
  };

  const getImpactLabel = (value: number) => {
    const labels = ['Negligible', 'Minor', 'Moderate', 'Major', 'Catastrophic'];
    return labels[value - 1] || value.toString();
  };

  const getStatusType = (status: string): 'critical' | 'warning' | 'acceptable' | 'neutral' => {
    if (status === 'identified' || status === 'assessed') return 'warning';
    if (status === 'treated' || status === 'monitored') return 'acceptable';
    if (status === 'closed') return 'neutral';
    return 'neutral';
  };

  const columns: Column<CyberRisk>[] = [
    {
      key: 'title',
      label: 'Risk Scenario',
      sortable: true,
      width: '30%',
      render: (risk) => (
        <div>
          <div className="font-medium text-gray-900 text-sm">{risk.title}</div>
          <div className="text-xs text-gray-500 mt-0.5 space-y-0.5">
            <div><strong>Threat:</strong> {risk.threat}</div>
            <div><strong>Vulnerability:</strong> {risk.vulnerability}</div>
            <div><strong>Impact:</strong> {risk.impactDescription}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'likelihood',
      label: 'Likelihood',
      sortable: true,
      width: '10%',
      tooltip: 'Probability of the risk occurring. Scale: 1=Rare, 2=Unlikely, 3=Possible, 4=Likely, 5=Almost Certain',
      render: (risk) => (
        <InlineEditor
          value={risk.likelihood}
          onSave={(val) => handleSave(risk, 'likelihood', val)}
          inputType="number"
          renderDisplay={(val, onEdit) => (
            <div className="group flex items-center space-x-1">
              <span className="text-sm text-gray-900">{val}</span>
              <span className="text-xs text-gray-500">({getLikelihoodLabel(val as number)})</span>
              <button
                onClick={onEdit}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </div>
          )}
        />
      ),
    },
    {
      key: 'impact',
      label: 'Impact',
      sortable: true,
      width: '10%',
      tooltip: 'Severity of consequences if risk occurs. Scale: 1=Negligible, 2=Minor, 3=Moderate, 4=Major, 5=Catastrophic',
      render: (risk) => (
        <InlineEditor
          value={risk.impact}
          onSave={(val) => handleSave(risk, 'impact', val)}
          inputType="number"
          renderDisplay={(val, onEdit) => (
            <div className="group flex items-center space-x-1">
              <span className="text-sm text-gray-900">{val}</span>
              <span className="text-xs text-gray-500">({getImpactLabel(val as number)})</span>
              <button
                onClick={onEdit}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </div>
          )}
        />
      ),
    },
    {
      key: 'exposure',
      label: 'Exposure',
      sortable: true,
      width: '12%',
      tooltip: 'Exposure = Likelihood × Impact. Green (≤6): Acceptable, Amber (7-12): Monitor, Red (>12): Action Required',
      render: (risk) => (
        <ExplainableExposure
          likelihood={risk.likelihood}
          impact={risk.impact}
          exposure={risk.exposure}
          size="sm"
        />
      ),
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      width: '12%',
      render: (risk) => (
        <span className="text-sm text-gray-700">{risk.category}</span>
      ),
    },
    {
      key: 'owner',
      label: 'Owner',
      sortable: true,
      width: '12%',
      render: (risk) => (
        <span className="text-sm text-gray-700">{risk.ownerName || 'Unassigned'}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      width: '10%',
      render: (risk) => (
        <StatusBadge
          status={getStatusType(risk.status)}
          label={StatusLabels[risk.status as keyof typeof StatusLabels] || risk.status}
          size="sm"
        />
      ),
    },
    {
      key: 'reviewed',
      label: 'Last Reviewed',
      sortable: false,
      width: '10%',
      render: (risk) => (
        <span className="text-xs text-gray-500">
          {risk.reviewedAt ? format(new Date(risk.reviewedAt), 'MMM d, yyyy') : 'Never'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      sortable: false,
      width: '4%',
      align: 'right',
      render: (risk) => (
        <div className="flex items-center justify-end space-x-2">
          <Link
            to={`/app/risks/${risk.id}`}
            className="text-blue-600 hover:text-blue-700"
            title="Review risk details"
          >
            <Eye className="w-4 h-4" />
          </Link>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-sm text-gray-500">Loading risks...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header - Plain Language */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {expandAcronym('CSRR')}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Identify, assess, and monitor cybersecurity risks
          </p>
        </div>
        <button
          onClick={() => {/* Handle add */}}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Assess New Risk
        </button>
      </div>

      {/* Dense Table View */}
      <EnterpriseTable
        data={risks}
        columns={columns}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
        onRowClick={(risk) => {
          window.location.href = `/app/risks/${risk.id}`;
        }}
        emptyMessage="No risks identified. Click 'Assess New Risk' to begin."
        dense={true}
      />

      {/* Quick Actions - Decision-Centric */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="text-sm font-medium text-gray-700 mb-2">Quick Actions</div>
        <div className="flex items-center space-x-4 text-sm">
          <Link to="/app/scoring" className="text-blue-600 hover:text-blue-700 font-medium">
            Review Risk Scoring Matrix
          </Link>
          <span className="text-gray-300">|</span>
          <Link to="/app/enterprise-risks" className="text-blue-600 hover:text-blue-700 font-medium">
            View Enterprise Risk Roll-Up
          </Link>
          <span className="text-gray-300">|</span>
          <Link to="/app/appetite" className="text-blue-600 hover:text-blue-700 font-medium">
            Check Risk Appetite
          </Link>
        </div>
      </div>
    </div>
  );
}
