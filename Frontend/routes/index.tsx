/**
 * Application Routes Configuration
 *
 * Centralized route configuration using React Router v6.
 * Separates public and protected routes for better organization.
 *
 * @module routes
 */

import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PUBLIC_PATHS, PROTECTED_PATHS } from './paths';

// Layout Components
import PublicLayout from '../components/layout/PublicLayout';

// Loading Component for Suspense
import { LoadingSpinner } from '../components/common/LoadingSpinner';

// Eagerly loaded components (critical path)
import HomeView from '../components/views/HomeView';
import { CategoryView } from '../components/CategoryView';

// Lazily loaded components (code splitting)
const ArticleDetailView = lazy(() => import('../components/views/ArticleDetailView'));
const AuthorProfileView = lazy(() => import('../components/views/AuthorProfileView'));
const LoginView = lazy(() => import('../components/LoginView'));
const SubscribeView = lazy(() => import('../components/views/SubscribeView'));
const CheckoutView = lazy(() => import('../components/views/CheckoutView'));
const DashboardView = lazy(() => import('../components/dashboard/DashboardView'));
const ForgotPasswordView = lazy(() => import('../components/ForgotPasswordView'));

/**
 * Suspense wrapper for lazy-loaded components
 */
const LazyWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={<LoadingSpinner fullScreen message="Loading..." />}>
    {children}
  </Suspense>
);

/**
 * Public routes configuration
 * Routes accessible without authentication
 */
const publicRoutes = [
  {
    path: PUBLIC_PATHS.HOME,
    element: <HomeView />,
  },
  {
    path: PUBLIC_PATHS.CATEGORY,
    element: <CategoryView />,
  },
  {
    path: PUBLIC_PATHS.ARTICLE,
    element: (
      <LazyWrapper>
        <ArticleDetailView />
      </LazyWrapper>
    ),
  },
  {
    path: PUBLIC_PATHS.AUTHOR,
    element: (
      <LazyWrapper>
        <AuthorProfileView />
      </LazyWrapper>
    ),
  },
  {
    path: PUBLIC_PATHS.LOGIN,
    element: (
      <LazyWrapper>
        <LoginView />
      </LazyWrapper>
    ),
  },
  {
    path: PUBLIC_PATHS.SUBSCRIBE,
    element: (
      <LazyWrapper>
        <SubscribeView />
      </LazyWrapper>
    ),
  },
  {
    path: PUBLIC_PATHS.CHECKOUT,
    element: (
      <LazyWrapper>
        <CheckoutView />
      </LazyWrapper>
    ),
  },
  {
    path: PUBLIC_PATHS.FORGOT_PASSWORD,
    element: (
      <LazyWrapper>
        <ForgotPasswordView />
      </LazyWrapper>
    ),
  },
];

/**
 * Protected routes configuration
 * Routes requiring authentication
 */
const protectedRoutes = [
  {
    path: PROTECTED_PATHS.DASHBOARD,
    element: (
      <LazyWrapper>
        <DashboardView />
      </LazyWrapper>
    ),
    usePublicLayout: false,
  },
];

/**
 * AppRoutes Component
 *
 * Renders all application routes with appropriate layouts.
 * Public routes use PublicLayout, dashboard has its own layout.
 */
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes with Header/Footer */}
      {publicRoutes.map(({ path, element }) => (
        <Route
          key={path}
          path={path}
          element={<PublicLayout>{element}</PublicLayout>}
        />
      ))}

      {/* Protected/Special Routes */}
      {protectedRoutes.map(({ path, element }) => (
        <Route key={path} path={path} element={element} />
      ))}

      {/* Fallback - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
