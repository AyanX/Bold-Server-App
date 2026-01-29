/**
 * App Component
 *
 * Root application component that sets up:
 * - React Router for navigation
 * - Context providers (Auth, Theme)
 * - Global components (ScrollToTop, StickyAd)
 * - Route configuration
 *
 * @module App
 */

import React, { useEffect } from 'react';
import { HashRouter as Router } from 'react-router-dom';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Routes
import AppRoutes from './routes';

// Global Components
import ScrollToTop from './components/ScrollToTop';
import StickyAdWrapper from './components/StickyAdWrapper';

// Analytics
import { initAnalytics } from './services/analytics';

/**
 * App Component
 *
 * Main application entry point that composes all providers and global components.
 *
 * @example
 * ```tsx
 * // In index.tsx
 * ReactDOM.render(<App />, document.getElementById('root'));
 * ```
 */
const App: React.FC = () => {
  // Initialize analytics on app load
  useEffect(() => {
    initAnalytics();
  }, []);

  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          {/* Scroll restoration on route changes */}
          <ScrollToTop />

          {/* Main application container */}
          <div className="min-h-screen flex flex-col w-full pb-24">
            <AppRoutes />
          </div>

          {/* Global sticky advertisement */}
          <StickyAdWrapper />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
