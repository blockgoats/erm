import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TrendIconProps {
  trend: 'up' | 'down' | 'stable';
  size?: number;
  animated?: boolean;
}

export default function TrendIcon({ trend, size = 16, animated = true }: TrendIconProps) {
  const iconProps = { size };
  
  const baseClasses = animated ? 'transition-all duration-300 hover:scale-110' : '';
  
  switch (trend) {
    case 'up':
      return <TrendingUp {...iconProps} className={`trend-up ${baseClasses}`} />;
    case 'down':
      return <TrendingDown {...iconProps} className={`trend-down ${baseClasses}`} />;
    case 'stable':
      return <Minus {...iconProps} className={`trend-stable ${baseClasses}`} />;
  }
}