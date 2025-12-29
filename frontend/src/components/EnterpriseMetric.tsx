/**
 * Enterprise Metric Component
 * 
 * Principles:
 * - Clear hierarchy (size = importance)
 * - Semantic color only
 * - Explainable values
 * - No decorative elements
 */

import { ReactNode } from 'react';
import Tooltip from './Tooltip';

interface EnterpriseMetricProps {
  label: string;
  value: ReactNode;
  subtext?: string;
  trend?: 'up' | 'down' | 'stable';
  status?: 'critical' | 'warning' | 'acceptable' | 'neutral';
  explanation?: string;
  size?: 'sm' | 'md' | 'lg';
  action?: ReactNode;
}

function EnterpriseMetric({
  label,
  value,
  subtext,
  trend,
  status,
  explanation,
  size = 'md',
  action,
}: EnterpriseMetricProps) {
  const sizeClasses = {
    sm: { value: 'text-lg', label: 'text-xs' },
    md: { value: 'text-2xl', label: 'text-sm' },
    lg: { value: 'text-3xl', label: 'text-base' },
  };

  const statusColors = {
    critical: 'text-red-600',
    warning: 'text-yellow-600',
    acceptable: 'text-green-600',
    neutral: 'text-gray-900',
  };

  const trendIcons = {
    up: '↑',
    down: '↓',
    stable: '→',
  };

  const trendColors = {
    up: 'text-red-600',
    down: 'text-green-600',
    stable: 'text-gray-400',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className={`${sizeClasses[size].label} font-medium text-gray-500 mb-1`}>
            {label}
            {explanation && (
              <span className="ml-1">
                <Tooltip content={explanation} icon />
              </span>
            )}
          </div>
          <div className="flex items-baseline space-x-2">
            <span className={`${sizeClasses[size].value} font-semibold ${
              status ? statusColors[status] : 'text-gray-900'
            }`}>
              {value}
            </span>
            {trend && (
              <span className={`text-sm font-medium ${trendColors[trend]}`}>
                {trendIcons[trend]}
              </span>
            )}
          </div>
          {subtext && (
            <div className="mt-1 text-xs text-gray-500">
              {subtext}
            </div>
          )}
        </div>
        {action && (
          <div className="ml-4">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}

export default EnterpriseMetric;
