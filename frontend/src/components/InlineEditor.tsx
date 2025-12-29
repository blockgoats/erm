/**
 * Inline Editor Component
 * 
 * Principles:
 * - No modal hell
 * - Immediate feedback
 * - Reversible actions
 * - Keyboard navigable
 */

import React, { useState, ReactNode } from 'react';
import { Edit2, Check, X } from 'lucide-react';

interface InlineEditorProps {
  value: string | number;
  onSave: (value: string | number) => void;
  onCancel?: () => void;
  renderDisplay?: (value: string | number, onEdit: () => void) => ReactNode;
  inputType?: 'text' | 'number' | 'textarea' | 'select';
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
  className?: string;
}

export default function InlineEditor({
  value,
  onSave,
  onCancel,
  renderDisplay,
  inputType = 'text',
  options,
  placeholder,
  className = '',
}: InlineEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState<string | number>(value);

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
    onCancel?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {inputType === 'select' && options ? (
          <select
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : inputType === 'textarea' ? (
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
            autoFocus
          />
        ) : (
          <input
            type={inputType}
            value={editValue}
            onChange={(e) => setEditValue(inputType === 'number' ? Number(e.target.value) : e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={placeholder}
            autoFocus
          />
        )}
        <button
          onClick={handleSave}
          className="text-green-600 hover:text-green-700 transition-colors"
          aria-label="Save"
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          onClick={handleCancel}
          className="text-gray-600 hover:text-gray-700 transition-colors"
          aria-label="Cancel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  if (renderDisplay) {
    return <>{renderDisplay(value, () => setIsEditing(true))}</>;
  }

  return (
    <div className={`flex items-center space-x-2 group ${className}`}>
      <span className="text-gray-900">{value}</span>
      <button
        onClick={() => setIsEditing(true)}
        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-all"
        aria-label="Edit"
      >
        <Edit2 className="w-3 h-3" />
      </button>
    </div>
  );
}

