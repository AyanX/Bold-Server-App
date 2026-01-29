/**
 * Category Constants
 *
 * Category definitions and configurations.
 *
 * @module constants/categories
 */

/**
 * Category definition with name and URL slug
 */
export interface CategoryDefinition {
  /** Display name */
  name: string;
  /** URL-friendly slug */
  slug: string;
  /** Optional icon identifier */
  icon?: string;
  /** Optional description */
  description?: string;
}

/**
 * All content categories
 */
export const CATEGORIES: CategoryDefinition[] = [
  { name: 'Latest News', slug: 'latest', description: 'Breaking news and latest updates' },
  { name: 'Politics', slug: 'politics', description: 'Political news and analysis' },
  { name: 'Corporate', slug: 'corporate', description: 'Business and corporate news' },
  { name: 'Health', slug: 'health', description: 'Health and wellness news' },
  { name: 'Law & Order', slug: 'law-order', description: 'Legal news and crime reports' },
  { name: 'Startup & Tech', slug: 'startup-tech', description: 'Technology and startup news' },
  { name: 'Career', slug: 'career', description: 'Career advice and job market news' },
  { name: 'Sports', slug: 'sports', description: 'Sports news and updates' },
  { name: 'Opinions', slug: 'opinion', description: 'Opinion pieces and editorials' },
  { name: 'Lifestyle', slug: 'lifestyle', description: 'Lifestyle, culture, and entertainment' },
];

/**
 * Get category by slug
 */
export const getCategoryBySlug = (slug: string): CategoryDefinition | undefined => {
  return CATEGORIES.find((cat) => cat.slug === slug);
};

/**
 * Get category by name
 */
export const getCategoryByName = (name: string): CategoryDefinition | undefined => {
  return CATEGORIES.find((cat) => cat.name === name);
};

/**
 * Category name to slug map
 */
export const CATEGORY_SLUG_MAP: Record<string, string> = CATEGORIES.reduce(
  (acc, cat) => ({ ...acc, [cat.name]: cat.slug }),
  {}
);

/**
 * Category slug to name map
 */
export const SLUG_CATEGORY_MAP: Record<string, string> = CATEGORIES.reduce(
  (acc, cat) => ({ ...acc, [cat.slug]: cat.name }),
  {}
);
