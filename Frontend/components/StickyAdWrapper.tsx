import React from 'react';
import { useLocation } from 'react-router-dom';
import { StickyFooterAd } from './StickyFooterAd';

/**
 * StickyAdWrapper Component
 *
 * Conditionally renders sticky footer ads based on current route.
 * Hides ads on dashboard and authentication pages for better UX.
 */
const StickyAdWrapper: React.FC = () => {
  const { pathname } = useLocation();
  const hiddenRoutes = ['/dashboard', '/login', '/checkout'];

  const shouldHide = hiddenRoutes.some(route => pathname.startsWith(route));

  if (shouldHide) return null;

  return <StickyFooterAd />;
};

export default StickyAdWrapper;
