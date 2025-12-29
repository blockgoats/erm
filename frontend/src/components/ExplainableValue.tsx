import { ReactNode } from 'react';
import Tooltip from './Tooltip';

interface ExplainableValueProps {
  value: ReactNode;
  explanation: string;
  label?: string;
  showIcon?: boolean;
}

export default function ExplainableValue({ value, explanation, label, showIcon = true }: ExplainableValueProps) {
  return (
    <div className="flex items-center space-x-1">
      {label && <span className="text-sm text-gray-600">{label}:</span>}
      <span className="font-medium">{value}</span>
      {showIcon && <Tooltip content={explanation} icon />}
    </div>
  );
}

