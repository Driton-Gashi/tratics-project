import type { Response } from 'express';
import type { AuthRequest } from '../auth/auth.middleware';
import { adminService } from './admin.service';

export class AdminController {
  async getDashboard(_req: AuthRequest, res: Response): Promise<void> {
    const stats = await adminService.getDashboardStats();
    res.status(200).json({ ok: true, data: stats });
  }

  async getUsers(req: AuthRequest, res: Response): Promise<void> {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;

    const result = await adminService.getAllUsers(page, limit);
    res.status(200).json({ ok: true, data: result });
  }

  async updateUser(req: AuthRequest, res: Response): Promise<void> {
    const userId = Number(req.params.id);
    if (!Number.isInteger(userId) || userId <= 0) {
      res.status(400).json({ ok: false, message: 'Invalid user id' });
      return;
    }

    const { email, username, role } = req.body as {
      email?: string;
      username?: string | null;
      role?: 'user' | 'admin';
    };

    const updates: { email?: string; username?: string | null; role?: 'user' | 'admin' } = {};

    if (email !== undefined) {
      if (typeof email !== 'string' || email.trim().length === 0) {
        res.status(400).json({ ok: false, message: 'Email must be a non-empty string' });
        return;
      }
      updates.email = email.trim();
    }

    if (username !== undefined) {
      if (username !== null && typeof username !== 'string') {
        res.status(400).json({ ok: false, message: 'Username must be a string or null' });
        return;
      }
      const trimmed = typeof username === 'string' ? username.trim() : null;
      updates.username = trimmed === '' ? null : trimmed;
    }

    if (role !== undefined) {
      if (role !== 'user' && role !== 'admin') {
        res.status(400).json({ ok: false, message: 'Role must be "user" or "admin"' });
        return;
      }
      updates.role = role;
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ ok: false, message: 'No valid fields to update' });
      return;
    }

    const updatedUser = await adminService.updateUser(userId, updates);
    if (!updatedUser) {
      res.status(404).json({ ok: false, message: 'User not found' });
      return;
    }

    res.status(200).json({ ok: true, data: updatedUser });
  }

  async deleteUser(req: AuthRequest, res: Response): Promise<void> {
    const userId = Number(req.params.id);
    if (!Number.isInteger(userId) || userId <= 0) {
      res.status(400).json({ ok: false, message: 'Invalid user id' });
      return;
    }

    if (req.user && req.user.id === userId) {
      res.status(403).json({ ok: false, message: 'You cannot delete your own account' });
      return;
    }

    const deleted = await adminService.deleteUser(userId);
    if (!deleted) {
      res.status(404).json({ ok: false, message: 'User not found' });
      return;
    }

    res.status(200).json({ ok: true, message: 'User deleted' });
  }

  async getViewStats(_req: AuthRequest, res: Response): Promise<void> {
    const stats = await adminService.getViewStats();
    res.status(200).json({ ok: true, data: stats });
  }

  async getUserStats(_req: AuthRequest, res: Response): Promise<void> {
    const stats = await adminService.getUserStats();
    res.status(200).json({ ok: true, data: stats });
  }
}

export const adminController = new AdminController();
