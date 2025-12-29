import React, { useState } from 'react';
import { Filter, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { useRiskStore } from '../../store/riskStore';
import { RiskCategory } from '../../types/risk';
import Badge from '../ui/Badge';
import TrendIcon from '../ui/TrendIcon';

export default function EnterpriseRollup() {
  const { risks, getTopRisks, getBreachedAppetites } = useRiskStore();
  const [categoryFilter, setCategoryFilter] = useState<RiskCategory | 'all'>('all');
  const [showBreachesOnly, setShowBreachesOnly] = useState(false);
  
  const breachedAppetites = getBreachedAppetites();
  const topRisks = getTopRisks(10);
  
  const filteredRisks = topRisks.filter(risk => {
    if (categoryFilter !== 'all' && risk.category !== categoryFilter) return false;
    if (showBreachesOnly) {
      const appetite = breachedAppetites.find(a => a.category === risk.category);
      return appetite && risk.exposure > appetite.threshold;
    }
    return true;
  });
  
  const categories: (RiskCategory | 'all')[] = [
    'all', 'Cyber Security', 'Operational', 'Financial', 
    'Compliance', 'Strategic', 'Reputational'
  ];
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Enterprise Risk Roll-Up (ERR)</h2>
            <p className="text-sm text-gray-600">Top 10 enterprise risks requiring prioritized attention</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as RiskCategory | 'all')}
                className="text-sm border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Breach Filter */}
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={showBreachesOnly}
                onChange={(e) => setShowBreachesOnly(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Appetite breaches only</span>
            </label>
          </div>
        </div>
        
        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-bold text-red-600">
                  {filteredRisks.filter(r => r.exposure > 12).length}
                </div>
                <div className="text-sm text-red-800">Action Required</div>
              </div>
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
          </div>
          
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <div className="text-lg font-bold text-amber-600">
              {filteredRisks.filter(r => r.exposure >= 7 && r.exposure <= 12).length}
            </div>
            <div className="text-sm text-amber-800">Monitor</div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-lg font-bold text-green-600">
              {filteredRisks.filter(r => r.exposure <= 6).length}
            </div>
            <div className="text-sm text-green-800">Acceptable</div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="text-lg font-bold text-blue-600">
              {Math.round(filteredRisks.reduce((sum, r) => sum + r.exposure, 0) / filteredRisks.length)}
            </div>
            <div className="text-sm text-blue-800">Avg. Exposure</div>
          </div>
        </div>
      </div>
      
      {/* Risk List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Ranked Risk Scenarios</h3>
          <p className="text-sm text-gray-600">
            Showing {filteredRisks.length} of {topRisks.length} top risks
          </p>
        </div>
        
        <div className="divide-y divide-gray-100">
          {filteredRisks.map((risk, index) => {
            const appetite = breachedAppetites.find(a => a.category === risk.category);
            const isBreached = appetite && risk.exposure > appetite.threshold;
            
            return (
              <div key={risk.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="text-lg font-bold text-gray-400 min-w-[3rem]">
                      #{index + 1}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">{risk.title}</h4>
                        <TrendIcon trend={risk.trend} size={20} />
                        {isBreached && (
                          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                            BREACH
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-3">{risk.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Threat:</span>
                          <div className="text-gray-600">{risk.threat}</div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Vulnerability:</span>
                          <div className="text-gray-600">{risk.vulnerability}</div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Asset:</span>
                          <div className="text-gray-600">{risk.asset}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6 mt-4 text-sm text-gray-600">
                        <span><span className="font-medium">Category:</span> {risk.category}</span>
                        <span><span className="font-medium">Owner:</span> {risk.riskOwner}</span>
                        <span><span className="font-medium">Scoring:</span> L{risk.likelihood} × I{risk.impact}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <Badge exposure={risk.exposure} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {filteredRisks.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No risks match the selected filters
          </div>
        )}
      </div>
    </div>
  );
}