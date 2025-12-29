/**
 * Status Badge Component
 * 
 * Principles:
 * - Semantic color only
 * - Status-driven
 * - Minimal design
 * - No decorative elements
 */


export type StatusType = 'critical' | 'warning' | 'acceptable' | 'neutral' | 'active' | 'inactive';

interface StatusBadgeProps {
  status: StatusType;
  label: string;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, label, size = 'md' }: StatusBadgeProps) {
  const statusStyles = {
    critical: 'bg-red-50 text-red-700 border-red-200',
    warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    acceptable: 'bg-green-50 text-green-700 border-green-200',
    neutral: 'bg-gray-50 text-gray-700 border-gray-200',
    active: 'bg-blue-50 text-blue-700 border-blue-200',
    inactive: 'bg-gray-50 text-gray-500 border-gray-200',
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  };

  return (
    <span
      className={`inline-flex items-center rounded border font-medium ${statusStyles[status]} ${sizeClasses[size]}`}
    >
      {label}
    </span>
  );
}

