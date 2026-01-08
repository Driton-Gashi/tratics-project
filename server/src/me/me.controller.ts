import type { Response } from 'express';
import type { AuthRequest } from '../auth/auth.middleware';
import { meService, type AddToListRequest, type RemoveFromListRequest } from './me.service';

export class MeController {
  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ ok: false, message: 'Unauthorized' });
      return;
    }

    const profile = await meService.getUserProfile(req.user.id);
    res.status(200).json({ ok: true, data: profile });
  }

  async getLists(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ ok: false, message: 'Unauthorized' });
      return;
    }

    const list_type = req.query.list_type as string | undefined;
    const item_type = req.query.item_type as string | undefined;

    // Validate query params
    if (list_type && list_type !== 'watchlist' && list_type !== 'favorite') {
      res.status(400).json({
        ok: false,
        message: 'Invalid list_type. Must be "watchlist" or "favorite"',
      });
      return;
    }

    if (item_type && item_type !== 'movie' && item_type !== 'series' && item_type !== 'episode') {
      res.status(400).json({
        ok: false,
        message: 'Invalid item_type. Must be "movie", "series", or "episode"',
      });
      return;
    }

    const lists = await meService.getLists(req.user.id, {
      list_type: list_type as 'watchlist' | 'favorite' | undefined,
      item_type: item_type as 'movie' | 'series' | 'episode' | undefined,
    });

    res.status(200).json({ ok: true, data: lists });
  }

  async addToList(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ ok: false, message: 'Unauthorized' });
      return;
    }

    const data = req.body as AddToListRequest;

    if (!data.list_type || !data.item_type || !data.wp_post_id || !data.wp_slug) {
      res.status(400).json({
        ok: false,
        message: 'Missing required fields: list_type, item_type, wp_post_id, wp_slug',
      });
      return;
    }

    const listItem = await meService.addToList(req.user.id, data);
    res.status(200).json({ ok: true, data: listItem });
  }

  async removeFromList(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ ok: false, message: 'Unauthorized' });
      return;
    }

    const data = req.body as RemoveFromListRequest;

    if (!data.list_type || !data.item_type || !data.wp_post_id) {
      res.status(400).json({
        ok: false,
        message: 'Missing required fields: list_type, item_type, wp_post_id',
      });
      return;
    }

    await meService.removeFromList(req.user.id, data);
    res.status(200).json({ ok: true, message: 'Item removed from list' });
  }

  async checkListStatus(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ ok: false, message: 'Unauthorized' });
      return;
    }

    const { list_type, item_type, wp_post_id } = req.query;

    if (!list_type || !item_type || !wp_post_id) {
      res.status(400).json({
        ok: false,
        message: 'Missing required query params: list_type, item_type, wp_post_id',
      });
      return;
    }

    const wpId = Number(wp_post_id);
    if (!Number.isInteger(wpId) || wpId <= 0) {
      res.status(400).json({ ok: false, message: 'Invalid wp_post_id' });
      return;
    }

    if (list_type !== 'watchlist' && list_type !== 'favorite') {
      res.status(400).json({
        ok: false,
        message: 'Invalid list_type. Must be "watchlist" or "favorite"',
      });
      return;
    }

    if (item_type !== 'movie' && item_type !== 'series' && item_type !== 'episode') {
      res.status(400).json({
        ok: false,
        message: 'Invalid item_type. Must be "movie", "series", or "episode"',
      });
      return;
    }

    const isInList = await meService.isInList(
      req.user.id,
      list_type as 'watchlist' | 'favorite',
      item_type as 'movie' | 'series' | 'episode',
      wpId
    );

    res.status(200).json({ ok: true, data: { isInList } });
  }
}

export const meController = new MeController();
