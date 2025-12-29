import React from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, Shield, Eye, FileText } from 'lucide-react';
import { useRiskStore } from '../../store/riskStore';
import Badge from '../ui/Badge';
import TrendIcon from '../ui/TrendIcon';
import RiskHeatmap from './RiskHeatmap';
import { calculateTrend } from '../../utils/riskUtils';

export default function ExecutiveDashboard() {
  const { risks, getTopRisks, getBreachedAppetites, getExposureDistribution } = useRiskStore();
  
  const topRisks = getTopRisks(5);
  const breachedAppetites = getBreachedAppetites();
  const distribution = getExposureDistribution();
  const overallTrend = calculateTrend(risks);
  
  const totalExposure = risks.reduce((sum, risk) => sum + risk.exposure, 0);
  const avgExposure = Math.round(totalExposure / risks.length);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-elevated p-8 animate-slide-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-headline gradient-text mb-2">Enterprise Risk Overview</h1>
            <p className="text-caption">Real-time risk posture and appetite monitoring</p>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-right p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <div className="text-3xl font-bold text-blue-600">{avgExposure}</div>
              <div className="text-sm text-blue-700 font-medium">Avg. Exposure</div>
            </div>
            <div className="p-3 bg-white rounded-xl shadow-md border border-gray-100">
              <TrendIcon trend={overallTrend > 0 ? 'up' : 'down'} size={32} animated />
            </div>
          </div>
        </div>
        
        {/* Breach Alerts */}
        {breachedAppetites.length > 0 && (
          <div className="mt-6 alert-breach animate-slide-up">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-6 h-6 text-red-600 animate-pulse-soft" />
              <span className="font-bold text-red-900 text-lg">Risk Appetite Breached</span>
            </div>
            <div className="mt-3 text-sm text-red-800 font-medium">
              {breachedAppetites.map(appetite => appetite.category).join(', ')} categories exceed acceptable thresholds
            </div>
          </div>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-slide-up">
        <div className="metric-card hover-lift click-scale">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-red-600 mb-1">{distribution.high}</div>
              <div className="text-sm font-semibold text-red-700">High Risk</div>
            </div>
            <div className="p-3 bg-red-100 rounded-xl">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>
        
        <div className="metric-card hover-lift click-scale">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-amber-600 mb-1">{distribution.medium}</div>
              <div className="text-sm font-semibold text-amber-700">Monitor</div>
            </div>
            <div className="p-3 bg-amber-100 rounded-xl">
              <Eye className="w-8 h-8 text-amber-600" />
            </div>
          </div>
        </div>
        
        <div className="metric-card hover-lift click-scale">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-green-600 mb-1">{distribution.low}</div>
              <div className="text-sm font-semibold text-green-700">Acceptable</div>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="metric-card hover-lift click-scale">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{risks.length}</div>
              <div className="text-sm font-semibold text-gray-700">Total Risks</div>
            </div>
            <div className="p-3 bg-gray-100 rounded-xl">
              <FileText className="w-8 h-8 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Risks */}
        <div className="card-elevated animate-slide-up">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-title text-gray-900 mb-2">Top Enterprise Risks</h3>
            <p className="text-caption">Highest exposure scenarios requiring attention</p>
          </div>
          <div className="divide-y divide-gray-50">
            {topRisks.map((risk, index) => (
              <div key={risk.id} className="p-5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 cursor-pointer group">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                      <h4 className="font-medium text-gray-900">{risk.title}</h4>
                      <TrendIcon trend={risk.trend} />
                    </div>
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">{risk.description}</p>
                    <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
                      <span>{risk.category}</span>
                      <span>{risk.riskOwner}</span>
                      <span>L:{risk.likelihood} × I:{risk.impact}</span>
                    </div>
                  </div>
                  <Badge exposure={risk.exposure} size="sm" animated />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Heatmap */}
        <div className="card-elevated animate-slide-up">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-title text-gray-900 mb-2">Risk Distribution</h3>
            <p className="text-caption">Visual representation of risk exposure</p>
          </div>
          <div className="p-6">
            <RiskHeatmap />
          </div>
        </div>
      </div>

      {/* Risk Appetite Status */}
      <div className="card-elevated animate-slide-up">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-title text-gray-900 mb-2">Risk Appetite Status</h3>
          <p className="text-caption">Current position relative to organizational risk tolerance</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {useRiskStore.getState().appetites.map(appetite => (
              <div 
                key={appetite.category} 
                className={`p-4 rounded-lg border-2 ${
                  appetite.breached 
                    ? 'border-red-300 bg-gradient-to-br from-red-50 to-red-100' 
                    : 'border-green-300 bg-gradient-to-br from-green-50 to-green-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{appetite.category}</h4>
                  {appetite.breached ? (
                    <span className="text-red-600 font-medium">BREACH</span>
                  ) : (
                    <span className="text-green-600 font-medium">WITHIN</span>
                  )}
                </div>
                <div className="text-sm font-medium text-gray-700 mb-2">
                  Threshold: {appetite.threshold}
                </div>
                <p className="text-xs text-gray-600">{appetite.statement}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}