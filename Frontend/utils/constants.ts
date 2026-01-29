/**
 * Application Constants
 *
 * Centralized constants used across the application.
 * Includes pagination settings, default values, and configuration options.
 */

// Pagination
export const ITEMS_PER_PAGE = 10;

// Default data structures
export const DEFAULT_ARTICLE_DATA = {
  id: '',
  title: '',
  content: '',
  excerpt: '',
  category: '',
  author: '',
  date: '',
  image: '',
  status: 'Draft',
  views: 0,
  tags: []
};

export const DEFAULT_USER_DATA = {
  id: '',
  name: '',
  email: '',
  role: 'user',
  avatar: '',
  bio: '',
  joinedDate: ''
};

// Dashboard tabs configuration
export const DASHBOARD_TABS = [
  { id: 'overview', label: 'Overview', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { id: 'articles', label: 'Articles', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z' },
  { id: 'categories', label: 'Categories', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
  { id: 'users', label: 'Users', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' }
];

// Status options
export const ARTICLE_STATUSES = ['Draft', 'Scheduled', 'Published', 'Archived'];
export const CAMPAIGN_STATUSES = ['Active', 'Paused', 'Completed', 'Cancelled'];

// API endpoints (if needed for configuration)
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Analytics configuration
export const ANALYTICS_CONFIG = {
  trackingId: process.env.REACT_APP_ANALYTICS_ID || '',
  debug: process.env.NODE_ENV === 'development'
};

// Theme configuration
export const THEME_CONFIG = {
  primaryColor: '#001733',
  secondaryColor: '#e5002b',
  accentColor: '#94a3b8'
};
