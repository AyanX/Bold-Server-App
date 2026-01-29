import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../services/analytics';

/**
 * ScrollToTop Component
 *
 * Automatically scrolls to top on route changes and tracks page views.
 * Ensures smooth navigation experience and analytics tracking.
 *
 * @module components/ScrollToTop
 */
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    trackPageView(); // Track page view on route change
  }, [pathname]);

  return null;
};

export default ScrollToTop;
