const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const API_PATH = API_URL.includes('/api') ? '' : '/api';

export type UserProfile = {
  id: number;
  email: string;
  username: string | null;
  created_at: string;
};

export type UserListRow = {
  id: number;
  user_id: number;
  list_type: 'watchlist' | 'favorite';
  item_type: 'movie' | 'series' | 'episode';
  wp_post_id: number;
  wp_slug: string;
  created_at: string;
};

export type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  message?: string;
};

async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit & { cookies?: string }
): Promise<ApiResponse<T>> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  // If cookies are provided (from server component), include them
  if (options?.cookies) {
    headers['Cookie'] = options.cookies;
  }

  const response = await fetch(`${API_URL}${API_PATH}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers,
  });

  return response.json();
}

export const meApi = {
  async getProfile(cookieHeader?: string): Promise<UserProfile> {
    const response = await apiRequest<UserProfile>('/me', { cookies: cookieHeader });
    if (!response.ok || !response.data) {
      throw new Error(response.message || 'Failed to fetch profile');
    }
    return response.data;
  },

  async getLists(
    filters?: {
      list_type?: 'watchlist' | 'favorite';
      item_type?: 'movie' | 'series' | 'episode';
    },
    cookieHeader?: string
  ): Promise<UserListRow[]> {
    const params = new URLSearchParams();
    if (filters?.list_type) params.set('list_type', filters.list_type);
    if (filters?.item_type) params.set('item_type', filters.item_type);

    const query = params.toString();
    const endpoint = `/me/lists${query ? `?${query}` : ''}`;

    const response = await apiRequest<UserListRow[]>(endpoint, { cookies: cookieHeader });
    if (!response.ok || !response.data) {
      throw new Error(response.message || 'Failed to fetch lists');
    }
    return response.data;
  },

  async addToList(data: {
    list_type: 'watchlist' | 'favorite';
    item_type: 'movie' | 'series' | 'episode';
    wp_post_id: number;
    wp_slug: string;
  }): Promise<UserListRow> {
    const response = await apiRequest<UserListRow>('/me/lists', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok || !response.data) {
      throw new Error(response.message || 'Failed to add to list');
    }
    return response.data;
  },

  async removeFromList(data: {
    list_type: 'watchlist' | 'favorite';
    item_type: 'movie' | 'series' | 'episode';
    wp_post_id: number;
  }): Promise<void> {
    const response = await apiRequest<void>('/me/lists', {
      method: 'DELETE',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(response.message || 'Failed to remove from list');
    }
  },

  async checkListStatus(
    list_type: 'watchlist' | 'favorite',
    item_type: 'movie' | 'series' | 'episode',
    wp_post_id: number
  ): Promise<boolean> {
    const params = new URLSearchParams({
      list_type,
      item_type,
      wp_post_id: String(wp_post_id),
    });

    const response = await apiRequest<{ isInList: boolean }>(`/me/lists/check?${params}`);
    if (!response.ok || response.data === undefined) {
      return false;
    }
    return response.data.isInList;
  },
};
