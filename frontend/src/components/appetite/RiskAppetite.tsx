import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Settings } from 'lucide-react';
import { useRiskStore } from '../../store/riskStore';
import { RiskCategory } from '../../types/risk';

export default function RiskAppetite() {
  const { appetites, updateAppetite, getRisksByCategory } = useRiskStore();
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  
  const handleThresholdChange = (category: RiskCategory, newThreshold: number) => {
    const categoryRisks = getRisksByCategory(category);
    const breached = categoryRisks.some(risk => risk.exposure > newThreshold);
    
    updateAppetite(category, { 
      threshold: newThreshold,
      breached 
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Risk Appetite & Tolerance</h2>
              <p className="text-sm text-gray-600">Define and monitor organizational risk boundaries</p>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-gray-600">Breached categories:</span>
              <span className="font-semibold text-red-600">
                {appetites.filter(a => a.breached).length}
              </span>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid gap-6">
            {appetites.map(appetite => {
              const categoryRisks = getRisksByCategory(appetite.category);
              const highestRisk = categoryRisks.reduce((max, risk) => 
                risk.exposure > max ? risk.exposure : max, 0
              );
              
              return (
                <div 
                  key={appetite.category}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    appetite.breached 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-green-300 bg-green-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {appetite.breached ? (
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                      ) : (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {appetite.category}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>Threshold: {appetite.threshold}</span>
                          <span>Highest Risk: {highestRisk}</span>
                          <span>{categoryRisks.length} risk{categoryRisks.length !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setEditingCategory(
                        editingCategory === appetite.category ? null : appetite.category
                      )}
                      className="p-2 text-gray-600 hover:text-gray-800 hover:bg-white rounded"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Threshold Slider */}
                  {editingCategory === appetite.category && (
                    <div className="mb-4 p-4 bg-white rounded border">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Risk Threshold
                      </label>
                      <div className="flex items-center space-x-4">
                        <input
                          type="range"
                          min="5"
                          max="20"
                          value={appetite.threshold}
                          onChange={(e) => handleThresholdChange(
                            appetite.category, 
                            parseInt(e.target.value)
                          )}
                          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-sm font-medium text-gray-900 min-w-[3rem]">
                          {appetite.threshold}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Conservative (5)</span>
                        <span>Aggressive (20)</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Policy Statement */}
                  <div className="bg-white p-4 rounded border">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Policy Statement</h4>
                    <p className="text-sm text-gray-700">{appetite.statement}</p>
                  </div>
                  
                  {/* Live Preview */}
                  {appetite.breached && (
                    <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded">
                      <div className="text-sm font-medium text-red-900">BREACH DETECTED</div>
                      <div className="text-sm text-red-800">
                        One or more risks in this category exceed the defined threshold of {appetite.threshold}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}