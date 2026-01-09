import type mysql2 from 'mysql2';
import pool from '../db/pool';

export interface UserStats {
  total_users: number;
  users_today: number;
  users_this_week: number;
  users_this_month: number;
  users_with_lists: number;
  users_with_ratings: number;
}

export interface ViewStats {
  total_views: number;
  views_today: number;
  views_this_week: number;
  views_this_month: number;
  views_by_type: Array<{
    page_type: string;
    count: number;
  }>;
  top_movies: Array<{
    wp_post_id: number;
    page_slug: string;
    view_count: number;
  }>;
  top_series: Array<{
    wp_post_id: number;
    page_slug: string;
    view_count: number;
  }>;
}

export interface DashboardStats {
  users: UserStats;
  views: ViewStats;
  lists: {
    total_watchlist_items: number;
    total_favorite_items: number;
    watchlist_by_type: Array<{
      item_type: string;
      count: number;
    }>;
    favorites_by_type: Array<{
      item_type: string;
      count: number;
    }>;
  };
  recent_users: Array<{
    id: number;
    email: string;
    username: string | null;
    created_at: Date;
  }>;
}

export class AdminService {
  async getUserStats(): Promise<UserStats> {
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const weekStart = new Date(now.setDate(now.getDate() - 7));
    const monthStart = new Date(now.setMonth(now.getMonth() - 1));

    const [totalUsers] = await pool.execute<mysql2.RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM users'
    );

    const [usersToday] = await pool.execute<mysql2.RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM users WHERE created_at >= ?',
      [todayStart]
    );

    const [usersThisWeek] = await pool.execute<mysql2.RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM users WHERE created_at >= ?',
      [weekStart]
    );

    const [usersThisMonth] = await pool.execute<mysql2.RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM users WHERE created_at >= ?',
      [monthStart]
    );

    const [usersWithLists] = await pool.execute<mysql2.RowDataPacket[]>(
      'SELECT COUNT(DISTINCT user_id) as count FROM user_lists'
    );

    const [usersWithRatings] = await pool.execute<mysql2.RowDataPacket[]>(
      'SELECT COUNT(DISTINCT user_id) as count FROM user_ratings'
    );

    return {
      total_users: totalUsers[0]?.count ?? 0,
      users_today: usersToday[0]?.count ?? 0,
      users_this_week: usersThisWeek[0]?.count ?? 0,
      users_this_month: usersThisMonth[0]?.count ?? 0,
      users_with_lists: usersWithLists[0]?.count ?? 0,
      users_with_ratings: usersWithRatings[0]?.count ?? 0,
    };
  }

  async getViewStats(): Promise<ViewStats> {
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const weekStart = new Date(now.setDate(now.getDate() - 7));
    const monthStart = new Date(now.setMonth(now.getMonth() - 1));

    const [totalViews] = await pool.execute<mysql2.RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM page_views'
    );

    const [viewsToday] = await pool.execute<mysql2.RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM page_views WHERE created_at >= ?',
      [todayStart]
    );

    const [viewsThisWeek] = await pool.execute<mysql2.RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM page_views WHERE created_at >= ?',
      [weekStart]
    );

    const [viewsThisMonth] = await pool.execute<mysql2.RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM page_views WHERE created_at >= ?',
      [monthStart]
    );

    const [viewsByType] = await pool.execute<mysql2.RowDataPacket[]>(
      'SELECT page_type, COUNT(*) as count FROM page_views GROUP BY page_type ORDER BY count DESC'
    );

    const [topMovies] = await pool.execute<mysql2.RowDataPacket[]>(
      `SELECT wp_post_id, page_slug, COUNT(*) as view_count 
       FROM page_views 
       WHERE page_type = 'movie' AND wp_post_id IS NOT NULL 
       GROUP BY wp_post_id, page_slug 
       ORDER BY view_count DESC 
       LIMIT 10`
    );

    const [topSeries] = await pool.execute<mysql2.RowDataPacket[]>(
      `SELECT wp_post_id, page_slug, COUNT(*) as view_count 
       FROM page_views 
       WHERE page_type = 'series' AND wp_post_id IS NOT NULL 
       GROUP BY wp_post_id, page_slug 
       ORDER BY view_count DESC 
       LIMIT 10`
    );

    return {
      total_views: totalViews[0]?.count ?? 0,
      views_today: viewsToday[0]?.count ?? 0,
      views_this_week: viewsThisWeek[0]?.count ?? 0,
      views_this_month: viewsThisMonth[0]?.count ?? 0,
      views_by_type: viewsByType.map((row: any) => ({
        page_type: row.page_type,
        count: row.count,
      })),
      top_movies: topMovies.map((row: any) => ({
        wp_post_id: row.wp_post_id,
        page_slug: row.page_slug,
        view_count: row.view_count,
      })),
      top_series: topSeries.map((row: any) => ({
        wp_post_id: row.wp_post_id,
        page_slug: row.page_slug,
        view_count: row.view_count,
      })),
    };
  }

  async getAllUsers(page: number = 1, limit: number = 50) {
    const offset = (page - 1) * limit;

    const [users] = await pool.execute<mysql2.RowDataPacket[]>(
      `SELECT id, email, username, role, created_at 
       FROM users 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const [total] = await pool.execute<mysql2.RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM users'
    );

    return {
      users: users.map((user: any) => ({
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        created_at: user.created_at,
      })),
      total: total[0]?.count ?? 0,
      page,
      limit,
      total_pages: Math.ceil((total[0]?.count ?? 0) / limit),
    };
  }

  async updateUser(
    userId: number,
    updates: { email?: string; username?: string | null; role?: 'user' | 'admin' }
  ) {
    const fields: string[] = [];
    const values: Array<string | null> = [];

    if (updates.email !== undefined) {
      fields.push('email = ?');
      values.push(updates.email);
    }

    if (updates.username !== undefined) {
      fields.push('username = ?');
      values.push(updates.username);
    }

    if (updates.role !== undefined) {
      fields.push('role = ?');
      values.push(updates.role);
    }

    if (fields.length === 0) {
      return null;
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');

    const [result] = await pool.execute<mysql2.ResultSetHeader>(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      [...values, userId]
    );

    if (result.affectedRows === 0) {
      return null;
    }

    const [users] = await pool.execute<mysql2.RowDataPacket[]>(
      'SELECT id, email, username, role, created_at FROM users WHERE id = ?',
      [userId]
    );

    const user = users[0];
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      created_at: user.created_at,
    };
  }

  async deleteUser(userId: number): Promise<boolean> {
    const [result] = await pool.execute<mysql2.ResultSetHeader>(
      'DELETE FROM users WHERE id = ?',
      [userId]
    );

    return result.affectedRows > 0;
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const [userStats, viewStats] = await Promise.all([
      this.getUserStats(),
      this.getViewStats(),
    ]);

    const [listStats] = await pool.execute<mysql2.RowDataPacket[]>(
      `SELECT 
        list_type,
        item_type,
        COUNT(*) as count
       FROM user_lists
       GROUP BY list_type, item_type`
    );

    const [totalWatchlist] = await pool.execute<mysql2.RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM user_lists WHERE list_type = 'watchlist'"
    );

    const [totalFavorites] = await pool.execute<mysql2.RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM user_lists WHERE list_type = 'favorite'"
    );

    const watchlistByType = listStats
      .filter((row: any) => row.list_type === 'watchlist')
      .map((row: any) => ({
        item_type: row.item_type,
        count: row.count,
      }));

    const favoritesByType = listStats
      .filter((row: any) => row.list_type === 'favorite')
      .map((row: any) => ({
        item_type: row.item_type,
        count: row.count,
      }));

    const [recentUsers] = await pool.execute<mysql2.RowDataPacket[]>(
      `SELECT id, email, username, created_at 
       FROM users 
       ORDER BY created_at DESC 
       LIMIT 10`
    );

    return {
      users: userStats,
      views: viewStats,
      lists: {
        total_watchlist_items: totalWatchlist[0]?.count ?? 0,
        total_favorite_items: totalFavorites[0]?.count ?? 0,
        watchlist_by_type: watchlistByType,
        favorites_by_type: favoritesByType,
      },
      recent_users: recentUsers.map((user: any) => ({
        id: user.id,
        email: user.email,
        username: user.username,
        created_at: user.created_at,
      })),
    };
  }

  async trackPageView(data: {
    user_id?: number;
    page_type: string;
    page_slug?: string;
    wp_post_id?: number;
    user_agent?: string;
    ip_address?: string;
    referer?: string;
  }): Promise<void> {
    await pool.execute(
      `INSERT INTO page_views 
       (user_id, page_type, page_slug, wp_post_id, user_agent, ip_address, referer) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        data.user_id || null,
        data.page_type,
        data.page_slug || null,
        data.wp_post_id || null,
        data.user_agent || null,
        data.ip_address || null,
        data.referer || null,
      ]
    );
  }
}

export const adminService = new AdminService();
