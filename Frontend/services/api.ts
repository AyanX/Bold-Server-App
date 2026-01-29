/// <reference types="vite/client" />
// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

// Simple in-memory cache with TTL
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();
const CACHE_TTL = 60000; // 1 minute cache
const pendingRequests = new Map<string, Promise<any>>(); // Dedup in-flight requests

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data;
  }
  cache.delete(key);
  return null;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

export function clearCache(pattern?: string): void {
  if (pattern) {
    for (const key of cache.keys()) {
      if (key.includes(pattern)) cache.delete(key);
    }
  } else {
    cache.clear();
  }
}

// HTTP client helper with caching
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  useCache: boolean = false
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  const cacheKey = `${options.method || 'GET'}:${endpoint}`;

  // Only cache GET requests
  if (useCache && (!options.method || options.method === 'GET')) {
    const cached = getCached<ApiResponse<T>>(cacheKey);
    if (cached) return cached;

    // Deduplicate in-flight requests
    if (pendingRequests.has(cacheKey)) {
      return pendingRequests.get(cacheKey);
    }
  }

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const fetchPromise = (async () => {
    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        let errorMessage = `HTTP Error ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || JSON.stringify(errorData);
        } catch (e) {
          // If response is not JSON, use the status text
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Cache successful GET responses
      if (useCache && (!options.method || options.method === 'GET')) {
        setCache(cacheKey, data);
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    } finally {
      pendingRequests.delete(cacheKey);
    }
  })();

  if (useCache && (!options.method || options.method === 'GET')) {
    pendingRequests.set(cacheKey, fetchPromise);
  }

  return fetchPromise;
}

export const api = {
  // --- Articles (Resource: /api/articles) ---
  articles: {
    async getAll() {
      return request<any[]>('/articles', {}, true); // Enable caching
    },
    async get(id: string) {
      return request<any>(`/articles/${id}`, {}, true); // Enable caching
    },
    async create(article: any) {
      return request<any>('/articles', {
        method: 'POST',
        body: JSON.stringify(article),
      });
    },
    async update(id: string, article: any) {
      return request<any>(`/articles/${id}`, {
        method: 'PUT',
        body: JSON.stringify(article),
      });
    },
    async delete(id: string) {
      return request<void>(`/articles/${id}`, {
        method: 'DELETE',
      });
    },
    async trackView(id: string | number) {
      return request<any>(`/articles/${id}/view`, {
        method: 'POST',
      });
    },
    async trackClick(id: string | number) {
      return request<any>(`/articles/${id}/click`, {
        method: 'POST',
      });
    }
  },

  // --- Users (Resource: /api/users) ---
  users: {
    async getAll(params?: { search?: string; role?: string; status?: string }) {
      const queryParams = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
      return request<any[]>(`/users${queryParams}`, {}, false);
    },
    async get(id: string) {
      return request<any>(`/users/${id}`, {}, false);
    },
    async create(user: any) {
      return request<any>('/users', {
        method: 'POST',
        body: JSON.stringify(user),
      });
    },
    async invite(user: any) {
      return request<any>('/users/invite', {
        method: 'POST',
        body: JSON.stringify(user),
      });
    },
    async uploadInviteImage(file: File) {
      const formData = new FormData();
      formData.append('image', file);

      const url = `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/users/invite/image`;
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload image');
      }

      return response.json();
    },
    async acceptInvitation(data: { email: string; otp: string; password: string; password_confirmation: string }) {
      return request<any>('/users/accept-invitation', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    async getInvitations(status?: string) {
      const params = status ? `?status=${status}` : '';
      return request<any[]>(`/users/invitations/list${params}`, {});
    },
    async resendInvitation(id: string) {
      return request<any>(`/users/invitations/${id}/resend`, {
        method: 'POST',
      });
    },
    async cancelInvitation(id: string) {
      return request<void>(`/users/invitations/${id}`, {
        method: 'DELETE',
      });
    },
    async update(id: string, data: any) {
      return request<any>(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    async uploadImage(id: string, file: File) {
      const formData = new FormData();
      formData.append('image', file);

      const url = `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/users/${id}/image`;
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload image');
      }

      return response.json();
    },
    async updateStatus(id: string, status: string) {
      return request<any>(`/users/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },
    async bulkUpdateStatus(userIds: string[], status: string) {
      return request<any>('/users/bulk-status', {
        method: 'POST',
        body: JSON.stringify({ user_ids: userIds, status }),
      });
    },
    async delete(id: string) {
      return request<void>(`/users/${id}`, {
        method: 'DELETE',
      });
    },
    async getStatistics() {
      return request<any>('/users/statistics/overview', {});
    }
  },

  // --- Categories (Resource: /api/categories) ---
  categories: {
    async getAll() {
      return request<any[]>('/categories', {}, true); // Enable caching
    },
    async get(id: string) {
      return request<any>(`/categories/${id}`, {}, true); // Enable caching
    },
    async create(category: any) {
      return request<any>('/categories', {
        method: 'POST',
        body: JSON.stringify(category),
      });
    },
    async update(id: string, category: any) {
      return request<any>(`/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(category),
      });
    },
    async delete(id: string) {
      return request<void>(`/categories/${id}`, {
        method: 'DELETE',
      });
    }
  },

  // --- Analytics & Metrics (Resource: /api/analytics) ---
  analytics: {
    async getDashboardMetrics() {
      return request<any>('/analytics/dashboard', {}, true); // Enable caching
    },
    async getLogs() {
      return request<any>('/analytics/logs', {}, true); // Enable caching
    },
    async getActiveVisitors() {
      return request<any>('/analytics/active-visitors', {});
    },
    async trackPageView(data: {
      session_id: string;
      page_url?: string;
      page_title?: string;
      referrer?: string;
      device_type?: string;
      browser?: string;
      os?: string;
      screen_width?: number;
    }) {
      return request<any>('/analytics/track', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    }
  },

  // --- Ads/Campaigns (Resource: /api/campaigns) ---
  campaigns: {
    async getAll() {
      return request<any[]>('/campaigns', {}, true); // Enable caching
    },
    async get(id: number) {
      return request<any>(`/campaigns/${id}`, {}, true); // Enable caching
    },
    async getActive(type?: string) {
      const params = type ? `?type=${type}` : '';
      return request<any[]>(`/ads/active${params}`, {}, true); // Enable caching
    },
    async create(campaign: any) {
      return request<any>('/campaigns', {
        method: 'POST',
        body: JSON.stringify(campaign),
      });
    },
    async update(id: number, campaign: any) {
      return request<any>(`/campaigns/${id}`, {
        method: 'PUT',
        body: JSON.stringify(campaign),
      });
    },
    async delete(id: number) {
      return request<void>(`/campaigns/${id}`, {
        method: 'DELETE',
      });
    },
    async trackImpression(id: number) {
      return request<any>(`/ads/${id}/impression`, {
        method: 'POST',
      });
    },
    async trackClick(id: number) {
      return request<any>(`/ads/${id}/click`, {
        method: 'POST',
      });
    }
  },

  // --- Settings (Resource: /api/settings) ---
  settings: {
    async getAll() {
      return request<any>('/settings', {}, true);
    },
    async getByGroup(group: string) {
      return request<any>(`/settings/group/${group}`, {}, true);
    },
    async update(settings: Record<string, any>) {
      return request<any>('/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
    },
    async updateSingle(key: string, value: any) {
      return request<any>(`/settings/${key}`, {
        method: 'PUT',
        body: JSON.stringify({ value }),
      });
    },
    async updatePassword(data: { current_password: string; new_password: string; confirm_password: string }) {
      return request<any>('/settings/password', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    async exportData() {
      return request<any>('/settings/export', {});
    },
    async getSystemStats() {
      return request<any>('/settings/system-stats', {});
    },
    async clearCache() {
      return request<any>('/settings/clear-cache', {
        method: 'POST',
      });
    },
    async resetToDefaults(group?: string) {
      return request<any>(`/settings/reset${group ? `/${group}` : ''}`, {
        method: 'POST',
      });
    },
    // Profile endpoints
    async getProfile() {
      return request<any>('/settings/profile', {});
    },
    async updateProfile(data: { name?: string; email?: string; bio?: string }) {
      return request<any>('/settings/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    async uploadProfileImage(file: File) {
      const formData = new FormData();
      formData.append('image', file);

      const url = `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/settings/profile/image`;
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload image');
      }

      return response.json();
    },
    // Performance metrics
    async getPerformanceMetrics() {
      return request<any>('/settings/performance', {});
    }
  }
};
