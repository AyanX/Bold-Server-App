# Data Types & TypeScript Interfaces Reference

This document provides comprehensive TypeScript interface definitions and data type information for all API endpoints.

## Global Types

### Standard Response Wrapper

```typescript
// Success Response
interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 200 | 201;
}

// Error Response
interface ApiError {
  message: string;
  status: 400 | 401 | 404 | 422 | 500;
  errors?: Record<string, string[]>;  // For validation errors
}
```

### Standard Pagination

```typescript
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
  status: 200;
}
```

---

## Enums & Constants

### User Roles
```typescript
type UserRole = "Admin" | "Editor" | "Contributor" | "Viewer";

enum UserRoleEnum {
  ADMIN = "Admin",
  EDITOR = "Editor",
  CONTRIBUTOR = "Contributor",
  VIEWER = "Viewer"
}
```

### User Status
```typescript
type UserStatus = "Active" | "Inactive" | "Suspended";

enum UserStatusEnum {
  ACTIVE = "Active",
  INACTIVE = "Inactive",
  SUSPENDED = "Suspended"
}
```

### Article Status
```typescript
type ArticleStatus = "Draft" | "Published" | "Scheduled" | "Archived";

enum ArticleStatusEnum {
  DRAFT = "Draft",
  PUBLISHED = "Published",
  SCHEDULED = "Scheduled",
  ARCHIVED = "Archived"
}
```

### Campaign Status
```typescript
type CampaignStatus = "Scheduled" | "Active" | "Paused" | "Expired";

enum CampaignStatusEnum {
  SCHEDULED = "Scheduled",
  ACTIVE = "Active",
  PAUSED = "Paused",
  EXPIRED = "Expired"
}
```

### Invitation Status
```typescript
type InvitationStatus = "pending" | "accepted" | "expired" | "cancelled";

enum InvitationStatusEnum {
  PENDING = "pending",
  ACCEPTED = "accepted",
  EXPIRED = "expired",
  CANCELLED = "cancelled"
}
```

---

## User-Related Types

### User (Core)
```typescript
interface User {
  id: number | string;
  name: string;                        // Max 255 chars
  email: string;                       // Valid email, unique
  password: string;                    // NEVER returned in responses
  role: UserRole;
  status: UserStatus;
  department?: string | null;          // Max 100 chars
  phone?: string | null;               // Max 20 chars
  bio?: string | null;                 // Max 1000 chars
  image?: string | null;               // URL or base64
  linkedin?: string | null;
  last_active?: string | null;         // ISO 8601 datetime
  login_count?: number;                // Default: 0
  last_login_at?: string | null;       // ISO 8601 datetime
  last_login_ip?: string | null;
  invited_via?: string;                // 'direct' | 'invitation'
  invited_by?: number | null;          // User ID of inviter
  invitation_accepted_at?: string | null;
  remember_token?: string;             // NEVER returned
  email_verified_at?: string | null;
  two_factor_secret?: string;          // NEVER returned
  two_factor_recovery_codes?: string[]; // NEVER returned
  created_at: string;                  // ISO 8601 datetime
  updated_at: string;                  // ISO 8601 datetime
}
```

### User with Statistics
```typescript
interface UserWithStats extends User {
  article_count: number;
  published_count: number;
  draft_count: number;
  total_views: number;
  total_clicks?: number;
  avg_seo_score: number;
  articles?: Article[];
  inviter?: User;
}
```

### Login Request
```typescript
interface LoginRequest {
  email: string;                       // Required, valid email
  password: string;                    // Required, min 1 char
}
```

### Create User Request
```typescript
interface CreateUserRequest {
  name: string;                        // Required, max 255
  email: string;                       // Required, email, unique
  password?: string;                   // Optional, min 8 if provided
  role?: UserRole;                     // Optional, default: Contributor
  status?: UserStatus;                 // Optional, default: Active
  department?: string;                 // Optional, max 100
  phone?: string;                      // Optional, max 20
  bio?: string;                        // Optional, max 1000
}
```

### Invite User Request
```typescript
interface InviteUserRequest {
  name: string;                        // Required, max 255
  email: string;                       // Required, email, unique
  role?: UserRole;                     // Optional, default: Contributor
  department?: string;                 // Optional, max 100
  phone?: string;                      // Optional, max 20
  bio?: string;                        // Optional, max 1000
  image?: string;                      // Optional, URL
}
```

### User Invitation
```typescript
interface UserInvitation {
  id: number | string;
  name: string;
  email: string;
  role: UserRole;
  department?: string | null;
  phone?: string | null;
  bio?: string | null;
  image?: string | null;
  otp_code?: string;                   // Only in dev/test
  otp_hash: string;                    // Hashed OTP
  otp_expires_at: string;              // ISO 8601 datetime
  invited_by?: number | null;
  status: InvitationStatus;
  created_at: string;
  updated_at: string;
}
```

### Accept Invitation Request
```typescript
interface AcceptInvitationRequest {
  email: string;                       // Required, valid email
  otp: string;                         // Required, 6 digits
  password: string;                    // Required, min 8
  password_confirmation: string;       // Required, same as password
}
```

### Update User Status Request
```typescript
interface UpdateUserStatusRequest {
  status: UserStatus;                  // Required
}
```

### Bulk Update Status Request
```typescript
interface BulkUpdateStatusRequest {
  user_ids: number[];                  // Required, array of user IDs
  status: UserStatus;                  // Required
}
```

---

## Article-Related Types

### Article (Core)
```typescript
interface Article {
  id: number | string;
  title: string;                       // Required, max 500
  slug: string;                        // Unique, auto-generated if empty
  excerpt: string;                     // Required
  content?: string | null;             // HTML content
  image?: string | null;               // URL, base64, or file
  category: string;                    // Required
  categories?: string[] | null;        // Array of categories
  author?: string | null;
  read_time?: string | null;           // e.g., "5 min"
  is_prime: boolean;                   // Default: false
  is_headline: boolean;                // Default: false
  status?: ArticleStatus | null;
  meta_tags?: string[] | null;         // Array of tags
  meta_description?: string | null;
  seo_score?: number | null;           // 0-100
  views: number;                       // Default: 0
  clicks: number;                      // Default: 0
  created_at: string;
  updated_at: string;
}
```

### Create Article Request
```typescript
interface CreateArticleRequest {
  title: string;                       // Required, max 500
  slug?: string;                       // Optional, unique
  excerpt: string;                     // Required
  content?: string;                    // Optional, HTML
  image?: string | File;               // Optional, URL/base64/file
  category: string;                    // Required
  categories?: string[];               // Optional array
  author?: string;
  read_time?: string;
  is_prime?: boolean | string;         // Handle string "true"/"false"
  is_headline?: boolean | string;
  status?: ArticleStatus;
  meta_tags?: string[] | string;       // Array or CSV string
  meta_description?: string;
  seo_score?: number;
}
```

### Update Article Request
```typescript
interface UpdateArticleRequest {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  image?: string | File;
  category?: string;
  categories?: string[];
  author?: string;
  read_time?: string;
  is_prime?: boolean | string;
  is_headline?: boolean | string;
  status?: ArticleStatus;
  meta_tags?: string[] | string;
  meta_description?: string;
  seo_score?: number;
}
```

### Track View/Click Request
```typescript
interface TrackingRequest {
  session_id: string;                  // Required, unique session identifier
}
```

---

## Campaign/Ad Types

### Campaign (Core)
```typescript
interface Campaign {
  id: number | string;
  name: string;                        // Required, max 255
  company?: string | null;             // Max 255
  type: string;                        // e.g., "Banner", "Sidebar"
  status?: CampaignStatus | null;      // Default: Scheduled
  price?: number | null;
  invoice?: string | null;
  image?: string | null;               // URL or base64
  target_url?: string | null;
  start_date?: string | null;          // ISO 8601 datetime
  end_date?: string | null;            // ISO 8601 datetime
  impressions: number;                 // Default: 0
  clicks: number;                      // Default: 0
  created_at: string;
  updated_at: string;
}
```

### Create Campaign Request
```typescript
interface CreateCampaignRequest {
  name: string;                        // Required, max 255
  company?: string;                    // Optional, max 255
  type: string;                        // Required
  status?: CampaignStatus;
  price?: number;
  invoice?: string;
  image?: string;                      // URL or base64
  targetUrl?: string;                  // camelCase in request
  startDate?: string;                  // ISO date
  endDate?: string;                    // ISO date
  impressions?: number;
  clicks?: number;
}
```

### Get Active Ads Query
```typescript
interface GetActiveAdsQuery {
  type?: string;                       // Optional filter by type
}
```

---

## Category Types

### Category (Core)
```typescript
interface Category {
  id: number | string;
  name: string;                        // Required, max 255
  slug: string;                        // Required, unique
  article_count?: number;              // Default: 0
  color?: string | null;               // Hex color, e.g., "#FF6B6B"
  created_at: string;
  updated_at: string;
}
```

### Create Category Request
```typescript
interface CreateCategoryRequest {
  name: string;                        // Required, max 255
  slug: string;                        // Required, unique
  article_count?: number;
  color?: string;                      // Hex color code
}
```

### Update Category Request
```typescript
interface UpdateCategoryRequest {
  name?: string;
  slug?: string;
  article_count?: number;
  color?: string;
}
```

---

## Analytics Types

### Page View Tracking Request
```typescript
interface TrackPageViewRequest {
  session_id: string;                  // Required
  page_url?: string;                   // Optional
  page_title?: string;                 // Optional
  referrer?: string;                   // Optional
  device_type?: "mobile" | "tablet" | "desktop";
  browser?: string;
  os?: string;
  screen_width?: number;
}
```

### Page View
```typescript
interface PageView {
  id: number | string;
  session_id: string;
  ip_address?: string;
  country?: string | null;
  country_code?: string | null;        // 2-letter code
  region?: string | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  device_type?: string | null;
  browser?: string | null;
  os?: string | null;
  page_url?: string | null;
  page_title?: string | null;
  referrer?: string | null;
  created_at: string;
}
```

### Dashboard Metrics
```typescript
interface DashboardMetrics {
  stats: {
    totalArticles: number;
    totalUsers: number;
    totalCategories: number;
    activeCampaigns: number;
    primeArticles: number;
    headlineArticles: number;
    recentActivity: number;
    totalPageViews: number;
    todayPageViews: number;
    uniqueVisitors: number;
  };
  audienceGrowth: Array<{
    date: string;
    visitors: number;
  }>;
  dailyPageViews: Array<{
    date: string;
    views: number;
  }>;
  monthlyPageViews: Array<{
    month: string;
    views: number;
  }>;
  deviceBreakdown: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  topLocations: Array<{
    country: string;
    code: string;
    visitors: number;
  }>;
  kenyaCounties: Array<{
    county: string;
    visitors: number;
  }>;
  articlesByCategory: Array<{
    category: string;
    count: number;
    color?: string;
  }>;
  usersByRole: Record<UserRole, number>;
  liveTraffic: Array<{
    page_title: string;
    visitors: number;
  }>;
}
```

---

## Settings Types

### Setting
```typescript
interface Setting {
  id: number | string;
  key: string;                         // Unique key, max 255
  value: any;                          // Can be string, number, boolean, or JSON
  type: "string" | "integer" | "boolean" | "json";
  group: string;                       // Grouping category
  created_at: string;
  updated_at: string;
}
```

### Update Settings Request (Bulk)
```typescript
interface UpdateSettingsRequest {
  [key: string]: any;                  // Key-value pairs
}
```

### Update Single Setting Request
```typescript
interface UpdateSingleSettingRequest {
  value: any;                          // Required, any type
}
```

### Update Password Request
```typescript
interface UpdatePasswordRequest {
  current_password: string;            // Required
  password: string;                    // Required, min 8
  password_confirmation: string;       // Required, same as password
}
```

### Password Reset Request
```typescript
interface ForgotPasswordRequest {
  email: string;                       // Required, valid email
}
```

### Reset Password Request
```typescript
interface ResetPasswordRequest {
  email: string;                       // Required, valid email
  otp: string;                         // Required, 6 digits
  password: string;                    // Required, min 8
  password_confirmation: string;       // Required, same as password
}
```

---

## File Upload Types

### Image Upload Response
```typescript
interface ImageUploadResponse {
  path: string;                        // Relative path
  url: string;                         // Full URL
}
```

### File Upload Request
```typescript
interface FileUploadRequest {
  image: File;                         // Required, max 5048 KB
                                       // Allowed: jpeg, png, jpg, gif, webp
}
```

---

## Activity Log Types

### Activity Log
```typescript
interface ActivityLog {
  id: number | string;
  user_id?: number | null;
  user_name?: string | null;
  action: string;                      // e.g., "login", "create", "update"
  resource: string;                    // e.g., "Article", "User"
  resource_id?: number | null;
  description?: string;
  changes?: Record<string, any> | null;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}
```

### Get Logs Query
```typescript
interface GetLogsQuery {
  page?: number;                       // Default: 1
  limit?: number;                      // Default: 50
  type?: string;                       // Optional filter by action
  days?: number;                       // Default: 30
}
```

---

## Common Validation Errors

### Validation Error Response
```typescript
interface ValidationErrorResponse {
  message: "Validation failed";
  errors: {
    fieldName: [
      "The field is required.",
      "The field must be a valid email.",
      "The field has already been taken."
    ];
  };
  status: 422;
}
```

### Common Field Validation Rules
```typescript
// Email fields
email: "required|email|unique"

// String fields with max length
name: "required|string|max:255"
bio: "nullable|string|max:1000"

// Password fields
password: "required|string|min:8"
password_confirmation: "required|string|same:password"

// Enum fields
role: "required|in:Admin,Editor,Contributor,Viewer"
status: "required|in:Active,Inactive,Suspended"

// Numeric fields
seo_score: "nullable|integer|min:0|max:100"
login_count: "nullable|integer|min:0"

// File fields
image: "nullable|file|mimes:jpeg,png,jpg,gif,webp|max:5048"

// URL fields
image: "nullable|url"
targetUrl: "nullable|url"
```

---

## Frontend Integration Example

```typescript
// Complete example of using these types
import {
  LoginRequest,
  User,
  ApiResponse,
  CreateArticleRequest,
  Article,
  ValidationErrorResponse
} from './types';

// Login
const loginUser = async (credentials: LoginRequest): Promise<User> => {
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(credentials)
  });

  if (!response.ok) {
    const error = await response.json() as ValidationErrorResponse;
    throw new Error(error.message);
  }

  const result = await response.json() as ApiResponse<User>;
  return result.data;
};

// Create Article
const createArticle = async (
  data: CreateArticleRequest,
  token: string
): Promise<Article> => {
  const formData = new FormData();
  
  // Add fields
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (key === 'meta_tags' && Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value as any);
      }
    }
  });

  const response = await fetch('/api/articles', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    credentials: 'include',
    body: formData
  });

  const result = await response.json() as ApiResponse<Article>;
  return result.data;
};
```

---

## Quick Type Reference Table

| Entity | Create | Read | Update | Delete |
|--------|--------|------|--------|--------|
| User | CreateUserRequest | User | Partial<User> | N/A |
| Article | CreateArticleRequest | Article | Partial<Article> | N/A |
| Category | CreateCategoryRequest | Category | Partial<Category> | N/A |
| Campaign | CreateCampaignRequest | Campaign | Partial<Campaign> | N/A |
| Setting | UpdateSettingsRequest | Setting | UpdateSettingsRequest | N/A |

---

This reference guide covers all data types and interfaces used across the API. Use this as a supplement to the specific endpoint documentation in other files.
