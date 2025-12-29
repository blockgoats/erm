import React from 'react';
import { getRiskLevel, getRiskColor } from '../../utils/riskUtils';

interface BadgeProps {
  exposure: number;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  animated?: boolean;
}

export default function Badge({ exposure, size = 'md', showText = true, animated = false }: BadgeProps) {
  const level = getRiskLevel(exposure);
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs font-semibold',
    md: 'px-4 py-2 text-sm font-semibold',
    lg: 'px-5 py-2.5 text-base font-semibold'
  };
  
  const textMap = {
    low: 'Acceptable',
    medium: 'Monitor',
    high: 'Action Required'
  };
  
  const badgeClasses = {
    low: 'risk-badge-low',
    medium: 'risk-badge-medium',
    high: 'risk-badge-high'
  };
  
  return (
    <span
      className={`
        inline-flex items-center rounded-full transition-all duration-300
        ${sizeClasses[size]} 
        ${badgeClasses[level]}
        ${animated ? 'hover:scale-105 hover:shadow-lg' : ''}
        ${animated && level === 'high' ? 'animate-pulse-soft' : ''}
      `}
    >
      {showText ? textMap[level] : exposure}
    </span>
  );
}