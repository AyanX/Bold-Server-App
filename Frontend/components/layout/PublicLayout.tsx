/**
 * PublicLayout Component
 *
 * Standard layout wrapper for public-facing pages.
 * Includes Header, main content area, and Footer.
 *
 * @module components/layout/PublicLayout
 */

import React from 'react';
import { Header } from '../Header';
import { Footer } from '../Footer';

interface PublicLayoutProps {
  /** Page content to render between header and footer */
  children: React.ReactNode;
  /** Optional additional CSS classes */
  className?: string;
  /** Whether to show the header (default: true) */
  showHeader?: boolean;
  /** Whether to show the footer (default: true) */
  showFooter?: boolean;
}

/**
 * PublicLayout provides consistent structure for public pages
 *
 * @example
 * ```tsx
 * <PublicLayout>
 *   <HomePage />
 * </PublicLayout>
 * ```
 */
const PublicLayout: React.FC<PublicLayoutProps> = ({
  children,
  className = '',
  showHeader = true,
  showFooter = true,
}) => {
  return (
    <>
      {showHeader && <Header />}
      <main className={`flex-1 ${className}`}>
        {children}
      </main>
      {showFooter && <Footer />}
    </>
  );
};

export default PublicLayout;
