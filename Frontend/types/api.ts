/**
 * API Type Definitions
 *
 * Type definitions for API requests and responses.
 *
 * @module types/api
 */

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  /** Response data */
  data: T;
  /** Optional message */
  message?: string;
  /** HTTP status code */
  status: number;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  /** Response data array */
  data: T[];
  /** Pagination metadata */
  pagination: {
    /** Current page number */
    page: number;
    /** Items per page */
    perPage: number;
    /** Total items count */
    total: number;
    /** Total pages count */
    totalPages: number;
  };
}

/**
 * API error response
 */
export interface ApiError {
  /** Error message */
  message: string;
  /** Error code */
  code?: string;
  /** Field-specific errors */
  errors?: Record<string, string[]>;
  /** HTTP status code */
  status: number;
}

/**
 * Analytics dashboard metrics
 */
export interface DashboardMetrics {
  /** Total page views */
  totalViews: number;
  /** Unique visitors */
  uniqueVisitors: number;
  /** Active users (last 5 minutes) */
  activeUsers: number;
  /** Bounce rate percentage */
  bounceRate: number;
  /** Average session duration */
  avgSessionDuration: string;
  /** Views by date */
  viewsByDate: Array<{ date: string; views: number }>;
  /** Top articles */
  topArticles: Array<{ id: string; title: string; views: number }>;
  /** Traffic by source */
  trafficBySource: Array<{ source: string; visits: number }>;
  /** Articles by category */
  articlesByCategory: Array<{ category: string; count: number }>;
}

/**
 * Settings data grouped by category
 */
export interface SettingsData {
  general?: Record<string, string | number | boolean>;
  appearance?: Record<string, string | number | boolean>;
  notifications?: Record<string, string | number | boolean>;
  seo?: Record<string, string | number | boolean>;
  content?: Record<string, string | number | boolean>;
  security?: Record<string, string | number | boolean>;
}

/**
 * System statistics
 */
export interface SystemStats {
  database: {
    articles: number;
    users: number;
    categories: number;
    page_views: number;
  };
  storage: {
    database_size: string;
  };
  system: {
    php_version: string;
    laravel_version: string;
    timezone: string;
  };
}

/**
 * Page view tracking data
 */
export interface PageViewData {
  /** Session identifier */
  session_id: string;
  /** Page URL */
  page_url?: string;
  /** Page title */
  page_title?: string;
  /** Referrer URL */
  referrer?: string;
  /** Device type */
  device_type?: string;
  /** Browser name */
  browser?: string;
  /** Operating system */
  os?: string;
  /** Screen width */
  screen_width?: number;
}
