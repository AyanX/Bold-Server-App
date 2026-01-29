/**
 * Application Configuration Constants
 *
 * Configuration values and environment settings.
 *
 * @module constants/config
 */

/**
 * Application metadata
 */
export const APP_CONFIG = {
  /** Application name */
  NAME: 'The Bold East Africa',
  /** Application tagline */
  TAGLINE: 'Bold Stories. Bold Perspectives.',
  /** Application description */
  DESCRIPTION: "East Africa's leading news and analysis platform",
  /** Application version */
  VERSION: '1.0.0',
} as const;

/**
 * API configuration
 */
export const API_CONFIG = {
  /** Base API URL */
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  /** Request timeout in milliseconds */
  TIMEOUT: 30000,
  /** Cache TTL in milliseconds */
  CACHE_TTL: 60000,
} as const;

/**
 * Pagination defaults
 */
export const PAGINATION_CONFIG = {
  /** Default items per page */
  DEFAULT_PAGE_SIZE: 10,
  /** Dashboard items per page */
  DASHBOARD_PAGE_SIZE: 5,
  /** Ads per page */
  ADS_PAGE_SIZE: 4,
  /** Maximum page size */
  MAX_PAGE_SIZE: 100,
} as const;

/**
 * UI configuration
 */
export const UI_CONFIG = {
  /** Debounce delay for search inputs (ms) */
  SEARCH_DEBOUNCE: 300,
  /** Toast/notification duration (ms) */
  TOAST_DURATION: 5000,
  /** Modal animation duration (ms) */
  MODAL_ANIMATION: 200,
  /** Sidebar collapse breakpoint (px) */
  SIDEBAR_BREAKPOINT: 1024,
} as const;

/**
 * Color palette
 */
export const COLORS = {
  /** Primary brand color */
  PRIMARY: '#001733',
  /** Accent/highlight color */
  ACCENT: '#e5002b',
  /** Success color */
  SUCCESS: '#10b981',
  /** Warning color */
  WARNING: '#f59e0b',
  /** Error/danger color */
  ERROR: '#ef4444',
  /** Info color */
  INFO: '#3b82f6',
} as const;

/**
 * Date format configurations
 */
export const DATE_FORMATS = {
  /** Display format */
  DISPLAY: 'MMM d, yyyy',
  /** Input format */
  INPUT: 'yyyy-MM-dd',
  /** Full datetime format */
  DATETIME: 'MMM d, yyyy h:mm a',
  /** Short format */
  SHORT: 'MM/dd/yy',
} as const;

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  /** Authentication token */
  AUTH_TOKEN: 'token',
  /** User data */
  USER: 'user',
  /** Login status */
  IS_LOGGED_IN: 'isLoggedIn',
  /** Theme preferences */
  THEME: 'theme',
  /** Session ID */
  SESSION_ID: 'session_id',
} as const;

/**
 * Social media links
 */
export const SOCIAL_LINKS = {
  TWITTER: 'https://twitter.com/theboldea',
  FACEBOOK: 'https://facebook.com/theboldeastafrica',
  LINKEDIN: 'https://linkedin.com/company/theboldeastafrica',
  INSTAGRAM: 'https://instagram.com/theboldeastafrica',
} as const;
