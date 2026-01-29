/**
 * Common Type Definitions
 *
 * Shared utility types used across the application.
 *
 * @module types/common
 */

/**
 * Make all properties optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Make specific properties required
 */
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Extract the type of array elements
 */
export type ArrayElement<T> = T extends readonly (infer E)[] ? E : never;

/**
 * Nullable type helper
 */
export type Nullable<T> = T | null;

/**
 * Generic ID type
 */
export type ID = string | number;

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Sort configuration
 */
export interface SortConfig<T> {
  field: keyof T;
  direction: SortDirection;
}

/**
 * Filter configuration
 */
export interface FilterConfig<T> {
  field: keyof T;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith';
  value: unknown;
}

/**
 * Pagination configuration
 */
export interface PaginationConfig {
  page: number;
  perPage: number;
}

/**
 * Query parameters for list endpoints
 */
export interface ListQueryParams<T = unknown> {
  pagination?: PaginationConfig;
  sort?: SortConfig<T>;
  filters?: FilterConfig<T>[];
  search?: string;
}

/**
 * Form field validation error
 */
export interface FieldError {
  field: string;
  message: string;
}

/**
 * Generic callback function type
 */
export type Callback<T = void> = () => T;

/**
 * Async callback function type
 */
export type AsyncCallback<T = void> = () => Promise<T>;

/**
 * Event handler type
 */
export type EventHandler<E = Event> = (event: E) => void;

/**
 * Value change handler type
 */
export type ChangeHandler<T> = (value: T) => void;
