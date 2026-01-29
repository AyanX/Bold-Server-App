import React from 'react';

/**
 * EmptyState Component
 *
 * Displays empty state messages with optional actions.
 * Used when no data is available to display.
 */
interface EmptyStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action,
  icon
}) => {
  return (
    <div className="text-center py-12">
      {icon && <div className="mb-4">{icon}</div>}
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      {description && <p className="text-gray-500 mb-6">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="bg-[#001733] text-white px-4 py-2 rounded-sm hover:bg-[#002855] transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
