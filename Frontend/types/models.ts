/**
 * Data Model Types
 *
 * Type definitions for application data models.
 *
 * @module types/models
 */

/**
 * Content category enumeration
 */
export enum Category {
  LATEST = 'Latest News',
  POLITICS = 'Politics',
  CORPORATE = 'Corporate',
  HEALTH = 'Health',
  LAW_ORDER = 'Law & Order',
  STARTUP_TECH = 'Startup & Tech',
  CAREER = 'Career',
  SPORTS = 'Sports',
  OPINION = 'Opinions',
  LIFESTYLE = 'Lifestyle',
}

/**
 * Article status enumeration
 */
export enum ArticleStatus {
  DRAFT = 'Draft',
  PUBLISHED = 'Published',
  SCHEDULED = 'Scheduled',
  ARCHIVED = 'Archived',
}

/**
 * User role enumeration
 */
export enum UserRole {
  ADMIN = 'Admin',
  EDITOR = 'Editor',
  CONTRIBUTOR = 'Contributor',
  VIEWER = 'Viewer',
}

/**
 * User status enumeration
 */
export enum UserStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  PENDING = 'Pending',
  SUSPENDED = 'Suspended',
}

/**
 * Article data model
 */
export interface Article {
  /** Unique identifier */
  id: string;
  /** Article title */
  title: string;
  /** Short excerpt/summary */
  excerpt: string;
  /** Featured image URL */
  image: string;
  /** Primary category */
  category: Category | string;
  /** Author name */
  author: string;
  /** Publication date */
  date: string;
  /** Estimated read time */
  readTime: string;
  /** Premium content flag */
  isPrime: boolean;
  /** Featured/headline flag */
  isHeadline?: boolean;
  /** SEO meta tags */
  metaTags?: string[];
  /** SEO meta description */
  metaDescription?: string;
  /** SEO score (0-100) */
  seoScore?: number;
  /** Full article content */
  content?: string;
  /** Publication status */
  status?: ArticleStatus | string;
  /** Additional categories */
  categories?: string[];
  /** View count */
  views?: number;
  /** Click count */
  clicks?: number;
}

/**
 * User data model
 */
export interface User {
  /** Unique identifier */
  id: string;
  /** Full name */
  name: string;
  /** Email address */
  email: string;
  /** User role */
  role: UserRole | string;
  /** Account status */
  status: UserStatus | string;
  /** Last activity timestamp */
  lastActive: string;
  /** User biography */
  bio?: string;
  /** Profile image URL */
  image?: string;
  /** LinkedIn profile URL */
  linkedin?: string;
}

/**
 * Category data model
 */
export interface CategoryModel {
  /** Unique identifier */
  id: string;
  /** Category name */
  name: string;
  /** URL-friendly slug */
  slug: string;
  /** Category color */
  color: string;
  /** Article count */
  articleCount?: number;
}

/**
 * Campaign/Advertisement data model
 */
export interface Campaign {
  /** Unique identifier */
  id: number;
  /** Campaign name */
  name: string;
  /** Company/advertiser name */
  company: string;
  /** Ad type (Leaderboard, Sidebar, etc.) */
  type: string;
  /** Campaign price */
  price: string;
  /** Invoice number */
  invoice?: string;
  /** Ad image URL */
  image: string;
  /** Target/redirect URL */
  targetUrl: string;
  /** Campaign status */
  status: string;
  /** Start date */
  startDate: string;
  /** End date */
  endDate: string;
  /** Impression count */
  impressions?: number;
  /** Click count */
  clicks?: number;
}

/**
 * Analytics log entry
 */
export interface LogEntry {
  /** Unique identifier */
  id: string;
  /** Event type */
  type: string;
  /** Event description */
  message: string;
  /** Timestamp */
  timestamp: string;
  /** Associated user */
  user?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}
