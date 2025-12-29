interface RiskExposureBadgeProps {
  exposure: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function RiskExposureBadge({ exposure, size = 'md' }: RiskExposureBadgeProps) {
  const getColor = () => {
    if (exposure <= 6) return 'bg-risk-green text-white';
    if (exposure <= 12) return 'bg-risk-amber text-white';
    return 'bg-risk-red text-white';
  };

  const getLabel = () => {
    if (exposure <= 6) return 'Acceptable';
    if (exposure <= 12) return 'Monitor';
    return 'Action Required';
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2',
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${getColor()} ${sizeClasses[size]}`}>
      {getLabel()} ({exposure})
    </span>
  );
}

