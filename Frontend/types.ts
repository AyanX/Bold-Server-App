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

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  category: Category | string;
  author: string;
  date: string;
  readTime: string;
  isPrime: boolean;
  isHeadline?: boolean;
  metaTags?: string[];
  metaDescription?: string;
  seoScore?: number;
  content?: string;
  status?: string;
  categories?: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastActive: string;
  bio?: string;
  image?: string;
}

