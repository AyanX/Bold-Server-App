import React from 'react';

/**
 * PageLayout Component
 *
 * Provides consistent page layout structure with header, content, and footer.
 * Used for public pages that require standard layout.
 */
interface PageLayoutProps {
  header?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  header,
  children,
  footer,
  className = ''
}) => {
  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      {header}
      <main className="flex-1">
        {children}
      </main>
      {footer}
    </div>
  );
};

export default PageLayout;
