/**
 * Card Component
 *
 * Flexible card container with header, body, and footer sections.
 * Used for grouping related content throughout the application.
 *
 * @module components/ui/Card
 */

import React from 'react';

type CardVariant = 'default' | 'elevated' | 'outlined' | 'filled';

interface CardProps {
  /** Card content */
  children: React.ReactNode;
  /** Card title displayed in header */
  title?: string;
  /** Subtitle or description below title */
  subtitle?: string;
  /** Actions displayed in header (right side) */
  headerActions?: React.ReactNode;
  /** Footer content */
  footer?: React.ReactNode;
  /** Card visual variant */
  variant?: CardVariant;
  /** Remove default padding */
  noPadding?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Click handler for interactive cards */
  onClick?: () => void;
}

/**
 * Variant styles mapping
 */
const VARIANT_STYLES: Record<CardVariant, string> = {
  default: 'bg-white border border-gray-100 shadow-sm',
  elevated: 'bg-white shadow-lg',
  outlined: 'bg-white border-2 border-gray-200',
  filled: 'bg-gray-50 border border-gray-100',
};

/**
 * Card component for content grouping
 *
 * @example
 * ```tsx
 * // Basic card
 * <Card title="Recent Articles">
 *   <ArticleList articles={articles} />
 * </Card>
 *
 * // Card with actions
 * <Card
 *   title="User Settings"
 *   headerActions={<Button size="sm">Save</Button>}
 * >
 *   <SettingsForm />
 * </Card>
 *
 * // Interactive card
 * <Card variant="outlined" onClick={() => navigate('/details')}>
 *   <ItemPreview item={item} />
 * </Card>
 * ```
 */
const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  headerActions,
  footer,
  variant = 'default',
  noPadding = false,
  className = '',
  onClick,
}) => {
  const isInteractive = !!onClick;
  const hasHeader = title || subtitle || headerActions;
  const hasFooter = !!footer;

  const cardClasses = [
    'rounded-sm overflow-hidden',
    VARIANT_STYLES[variant],
    isInteractive ? 'cursor-pointer hover:shadow-md transition-shadow' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div
      className={cardClasses}
      onClick={onClick}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
    >
      {hasHeader && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            {title && (
              <h3 className="text-lg font-bold text-[#001733]">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>
            )}
          </div>
          {headerActions && (
            <div className="flex items-center gap-2">{headerActions}</div>
          )}
        </div>
      )}

      <div className={noPadding ? '' : 'p-6'}>
        {children}
      </div>

      {hasFooter && (
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          {footer}
        </div>
      )}
    </div>
  );
};

/**
 * Card.Header - Standalone header component for custom layouts
 */
const CardHeader: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-b border-gray-100 ${className}`}>
    {children}
  </div>
);

/**
 * Card.Body - Standalone body component for custom layouts
 */
const CardBody: React.FC<{
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}> = ({ children, className = '', noPadding = false }) => (
  <div className={`${noPadding ? '' : 'p-6'} ${className}`}>
    {children}
  </div>
);

/**
 * Card.Footer - Standalone footer component for custom layouts
 */
const CardFooter: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-t border-gray-100 bg-gray-50/50 ${className}`}>
    {children}
  </div>
);

export default Object.assign(Card, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
});
