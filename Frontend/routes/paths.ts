/**
 * Route Paths
 *
 * Centralized route path constants for the application.
 * Using constants prevents typos and makes refactoring easier.
 *
 * @module routes/paths
 */

/**
 * Public route paths accessible without authentication
 */
export const PUBLIC_PATHS = {
  HOME: '/',
  CATEGORY: '/category/:slug',
  ARTICLE: '/article/:id',
  AUTHOR: '/author/:name',
  LOGIN: '/login',
  SUBSCRIBE: '/subscribe',
  CHECKOUT: '/checkout/:planId',
  FORGOT_PASSWORD: '/forgot-password',
} as const;

/**
 * Protected route paths requiring authentication
 */
export const PROTECTED_PATHS = {
  DASHBOARD: '/dashboard',
} as const;

/**
 * All application route paths
 */
export const ROUTES = {
  ...PUBLIC_PATHS,
  ...PROTECTED_PATHS,
} as const;

/**
 * Helper functions to generate dynamic routes
 */
export const routeHelpers = {
  /**
   * Generate category page URL
   * @param slug - Category slug
   */
  category: (slug: string): string => `/category/${slug}`,

  /**
   * Generate article detail URL
   * @param id - Article ID
   */
  article: (id: string): string => `/article/${id}`,

  /**
   * Generate author profile URL
   * @param name - Author name (will be URL encoded)
   */
  author: (name: string): string => `/author/${encodeURIComponent(name)}`,

  /**
   * Generate checkout URL
   * @param planId - Subscription plan ID
   */
  checkout: (planId: string): string => `/checkout/${planId}`,
};

export default ROUTES;
