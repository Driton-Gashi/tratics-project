const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const API_PATH = API_URL.includes('/api') ? '' : '/api';

export type DashboardStats = {
  users: {
    total_users: number;
    users_today: number;
    users_this_week: number;
    users_this_month: number;
    users_with_lists: number;
    users_with_ratings: number;
  };
  views: {
    total_views: number;
    views_today: number;
    views_this_week: number;
    views_this_month: number;
    views_by_type: Array<{ page_type: string; count: number }>;
    top_movies: Array<{ wp_post_id: number; page_slug: string; view_count: number }>;
    top_series: Array<{ wp_post_id: number; page_slug: string; view_count: number }>;
  };
  lists: {
    total_watchlist_items: number;
    total_favorite_items: number;
    watchlist_by_type: Array<{ item_type: string; count: number }>;
    favorites_by_type: Array<{ item_type: string; count: number }>;
  };
  recent_users: Array<{
    id: number;
    email: string;
    username: string | null;
    created_at: string;
  }>;
};

export type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  message?: string;
};

export type AdminUser = {
  id: number;
  email: string;
  username: string | null;
  role: 'user' | 'admin';
  created_at: string;
};

async function adminRequest<T>(
  endpoint: string,
  options?: RequestInit & { cookies?: string }
): Promise<ApiResponse<T>> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  if (options?.cookies) {
    if (headers instanceof Headers) {
      headers.append('Cookie', options.cookies);
    } else if (Array.isArray(headers)) {
      headers.push(['Cookie', options.cookies]);
    } else {
      (headers as Record<string, string>)['Cookie'] = options.cookies;
    }
  }

  const response = await fetch(`${API_URL}${API_PATH}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers,
  });

  return response.json();
}

export const adminApi = {
  async getDashboard(cookieHeader?: string): Promise<DashboardStats> {
    const response = await adminRequest<DashboardStats>('/admin/dashboard', {
      cookies: cookieHeader,
    });
    if (!response.ok || !response.data) {
      throw new Error(response.message || 'Failed to fetch dashboard stats');
    }
    return response.data;
  },

  async getUsers(page: number = 1, limit: number = 50, cookieHeader?: string) {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    const response = await adminRequest<{
      users: AdminUser[];
      total: number;
      page: number;
      limit: number;
      total_pages: number;
    }>(`/admin/users?${params}`, { cookies: cookieHeader });
    if (!response.ok || !response.data) {
      throw new Error(response.message || 'Failed to fetch users');
    }
    return response.data;
  },

  async updateUser(
    userId: number,
    updates: { email?: string; username?: string | null; role?: 'user' | 'admin' }
  ): Promise<AdminUser> {
    const response = await adminRequest<AdminUser>(`/admin/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });

    if (!response.ok || !response.data) {
      throw new Error(response.message || 'Failed to update user');
    }

    return response.data;
  },

  async deleteUser(userId: number): Promise<void> {
    const response = await adminRequest<null>(`/admin/users/${userId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(response.message || 'Failed to delete user');
    }
  },
};
