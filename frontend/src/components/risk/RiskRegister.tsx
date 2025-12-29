import React, { useState } from 'react';
import { CreditCard as Edit2, Save, X, ExternalLink, Calendar } from 'lucide-react';
import { useRiskStore } from '../../store/riskStore';
import { RiskScenario } from '../../types/risk';
import Badge from '../ui/Badge';
import TrendIcon from '../ui/TrendIcon';
import Tooltip from '../ui/Tooltip';
import { format } from 'date-fns';

export default function RiskRegister() {
  const { risks, updateRisk } = useRiskStore();
  const [editingRisk, setEditingRisk] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<RiskScenario>>({});
  
  const handleEdit = (risk: RiskScenario) => {
    setEditingRisk(risk.id);
    setEditValues({
      title: risk.title,
      description: risk.description,
      threat: risk.threat,
      vulnerability: risk.vulnerability,
      asset: risk.asset,
      likelihood: risk.likelihood,
      impact: risk.impact,
      riskOwner: risk.riskOwner
    });
  };
  
  const handleSave = () => {
    if (editingRisk && editValues) {
      updateRisk(editingRisk, editValues);
      setEditingRisk(null);
      setEditValues({});
    }
  };
  
  const handleCancel = () => {
    setEditingRisk(null);
    setEditValues({});
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Cyber Security Risk Register (CSRR)</h2>
            <p className="text-sm text-gray-600">Comprehensive enterprise risk scenarios with inline editing</p>
          </div>
          <div className="text-sm text-gray-500">
            {risks.length} total risks
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Scenario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Threat</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vulnerability</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">L×I</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exposure</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Review</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {risks.map(risk => (
              <tr key={risk.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <TrendIcon trend={risk.trend} />
                    <div>
                      {editingRisk === risk.id ? (
                        <input
                          type="text"
                          value={editValues.title || ''}
                          onChange={(e) => setEditValues({ ...editValues, title: e.target.value })}
                          className="text-sm font-medium text-gray-900 bg-transparent border-b border-blue-300 focus:outline-none focus:border-blue-500"
                        />
                      ) : (
                        <div className="text-sm font-medium text-gray-900">{risk.title}</div>
                      )}
                      <div className="text-xs text-gray-500">{risk.category}</div>
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4">
                  {editingRisk === risk.id ? (
                    <input
                      type="text"
                      value={editValues.threat || ''}
                      onChange={(e) => setEditValues({ ...editValues, threat: e.target.value })}
                      className="text-sm text-gray-900 bg-transparent border-b border-blue-300 focus:outline-none focus:border-blue-500 w-full"
                    />
                  ) : (
                    <div className="text-sm text-gray-900">{risk.threat}</div>
                  )}
                </td>
                
                <td className="px-6 py-4">
                  {editingRisk === risk.id ? (
                    <input
                      type="text"
                      value={editValues.vulnerability || ''}
                      onChange={(e) => setEditValues({ ...editValues, vulnerability: e.target.value })}
                      className="text-sm text-gray-900 bg-transparent border-b border-blue-300 focus:outline-none focus:border-blue-500 w-full"
                    />
                  ) : (
                    <div className="text-sm text-gray-900">{risk.vulnerability}</div>
                  )}
                </td>
                
                <td className="px-6 py-4">
                  {editingRisk === risk.id ? (
                    <input
                      type="text"
                      value={editValues.asset || ''}
                      onChange={(e) => setEditValues({ ...editValues, asset: e.target.value })}
                      className="text-sm text-gray-900 bg-transparent border-b border-blue-300 focus:outline-none focus:border-blue-500 w-full"
                    />
                  ) : (
                    <div className="text-sm text-gray-900">{risk.asset}</div>
                  )}
                </td>
                
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-1">
                    {editingRisk === risk.id ? (
                      <>
                        <select
                          value={editValues.likelihood || risk.likelihood}
                          onChange={(e) => setEditValues({ ...editValues, likelihood: parseInt(e.target.value) })}
                          className="text-sm bg-transparent border-b border-blue-300 focus:outline-none focus:border-blue-500"
                        >
                          {[1, 2, 3, 4, 5].map(val => (
                            <option key={val} value={val}>{val}</option>
                          ))}
                        </select>
                        <span>×</span>
                        <select
                          value={editValues.impact || risk.impact}
                          onChange={(e) => setEditValues({ ...editValues, impact: parseInt(e.target.value) })}
                          className="text-sm bg-transparent border-b border-blue-300 focus:outline-none focus:border-blue-500"
                        >
                          {[1, 2, 3, 4, 5].map(val => (
                            <option key={val} value={val}>{val}</option>
                          ))}
                        </select>
                      </>
                    ) : (
                      <Tooltip content={`Likelihood: ${risk.likelihood}/5, Impact: ${risk.impact}/5`}>
                        <span className="text-sm text-gray-900">{risk.likelihood}×{risk.impact}</span>
                      </Tooltip>
                    )}
                  </div>
                </td>
                
                <td className="px-6 py-4">
                  <Badge exposure={risk.exposure} size="sm" />
                </td>
                
                <td className="px-6 py-4">
                  {editingRisk === risk.id ? (
                    <input
                      type="text"
                      value={editValues.riskOwner || ''}
                      onChange={(e) => setEditValues({ ...editValues, riskOwner: e.target.value })}
                      className="text-sm text-gray-900 bg-transparent border-b border-blue-300 focus:outline-none focus:border-blue-500 w-full"
                    />
                  ) : (
                    <div className="text-sm text-gray-900">{risk.riskOwner}</div>
                  )}
                </td>
                
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{format(risk.lastReviewed, 'MMM d, yyyy')}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Next: {format(risk.nextReview, 'MMM d, yyyy')}
                  </div>
                </td>
                
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    {editingRisk === risk.id ? (
                      <>
                        <button
                          onClick={handleSave}
                          className="p-1 text-green-600 hover:text-green-800"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCancel}
                          className="p-1 text-gray-600 hover:text-gray-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleEdit(risk)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    {risk.evidenceLinks.length > 0 && (
                      <Tooltip content="View evidence">
                        <button className="p-1 text-gray-600 hover:text-gray-800">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </Tooltip>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}