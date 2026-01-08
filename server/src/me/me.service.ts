import type mysql2 from 'mysql2';
import pool from '../db/pool';
import { CustomError } from '../middleware/errorHandler';

export type ListType = 'watchlist' | 'favorite';
export type ItemType = 'movie' | 'series' | 'episode';

export interface UserListRow {
  id: number;
  user_id: number;
  list_type: ListType;
  item_type: ItemType;
  wp_post_id: number;
  wp_slug: string;
  created_at: Date;
}

export interface AddToListRequest {
  list_type: ListType;
  item_type: ItemType;
  wp_post_id: number;
  wp_slug: string;
}

export interface RemoveFromListRequest {
  list_type: ListType;
  item_type: ItemType;
  wp_post_id: number;
}

export class MeService {
  async getUserProfile(userId: number) {
    const [rows] = await pool.execute<mysql2.RowDataPacket[]>(
      'SELECT id, email, username, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (rows.length === 0) {
      throw new CustomError('User not found', 404);
    }

    const user = rows[0];
    if (!user) {
      throw new CustomError('User not found', 404);
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      created_at: user.created_at,
    };
  }

  async getLists(
    userId: number,
    filters?: {
      list_type?: ListType;
      item_type?: ItemType;
    }
  ): Promise<UserListRow[]> {
    let query = 'SELECT * FROM user_lists WHERE user_id = ?';
    const params: (number | string)[] = [userId];

    if (filters?.list_type) {
      query += ' AND list_type = ?';
      params.push(filters.list_type);
    }

    if (filters?.item_type) {
      query += ' AND item_type = ?';
      params.push(filters.item_type);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.execute<mysql2.RowDataPacket[]>(query, params);

    return rows.map(row => ({
      id: row.id,
      user_id: row.user_id,
      list_type: row.list_type,
      item_type: row.item_type,
      wp_post_id: row.wp_post_id,
      wp_slug: row.wp_slug,
      created_at: row.created_at,
    }));
  }

  async addToList(userId: number, data: AddToListRequest): Promise<UserListRow> {
    const { list_type, item_type, wp_post_id, wp_slug } = data;

    // Validate list_type
    if (list_type !== 'watchlist' && list_type !== 'favorite') {
      throw new CustomError('Invalid list_type. Must be "watchlist" or "favorite"', 400);
    }

    // Validate item_type
    if (item_type !== 'movie' && item_type !== 'series' && item_type !== 'episode') {
      throw new CustomError('Invalid item_type. Must be "movie", "series", or "episode"', 400);
    }

    // Validate wp_post_id
    if (!Number.isInteger(wp_post_id) || wp_post_id <= 0) {
      throw new CustomError('Invalid wp_post_id', 400);
    }

    // Validate wp_slug
    if (!wp_slug || typeof wp_slug !== 'string' || wp_slug.trim().length === 0) {
      throw new CustomError('Invalid wp_slug', 400);
    }

    try {
      // Insert (idempotent: if exists, ignore error and fetch existing)
      await pool.execute(
        'INSERT INTO user_lists (user_id, list_type, item_type, wp_post_id, wp_slug) VALUES (?, ?, ?, ?, ?)',
        [userId, list_type, item_type, wp_post_id, wp_slug]
      );
    } catch (error: any) {
      // If duplicate entry, that's fine - fetch existing
      if (error.code !== 'ER_DUP_ENTRY') {
        throw error;
      }
    }

    // Fetch the row (either newly created or existing)
    const [rows] = await pool.execute<mysql2.RowDataPacket[]>(
      'SELECT * FROM user_lists WHERE user_id = ? AND list_type = ? AND item_type = ? AND wp_post_id = ?',
      [userId, list_type, item_type, wp_post_id]
    );

    if (rows.length === 0) {
      throw new CustomError('Failed to add item to list', 500);
    }

    const row = rows[0];
    if (!row) {
      throw new CustomError('Failed to add item to list', 500);
    }

    return {
      id: row.id,
      user_id: row.user_id,
      list_type: row.list_type,
      item_type: row.item_type,
      wp_post_id: row.wp_post_id,
      wp_slug: row.wp_slug,
      created_at: row.created_at,
    };
  }

  async removeFromList(userId: number, data: RemoveFromListRequest): Promise<void> {
    const { list_type, item_type, wp_post_id } = data;

    const [result] = await pool.execute<mysql2.ResultSetHeader>(
      'DELETE FROM user_lists WHERE user_id = ? AND list_type = ? AND item_type = ? AND wp_post_id = ?',
      [userId, list_type, item_type, wp_post_id]
    );

    if (result.affectedRows === 0) {
      throw new CustomError('Item not found in list', 404);
    }
  }

  async isInList(
    userId: number,
    list_type: ListType,
    item_type: ItemType,
    wp_post_id: number
  ): Promise<boolean> {
    const [rows] = await pool.execute<mysql2.RowDataPacket[]>(
      'SELECT id FROM user_lists WHERE user_id = ? AND list_type = ? AND item_type = ? AND wp_post_id = ?',
      [userId, list_type, item_type, wp_post_id]
    );

    return rows.length > 0;
  }
}

export const meService = new MeService();
