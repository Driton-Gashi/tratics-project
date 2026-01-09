import { Router } from 'express';
import { requireAuth } from '../auth/auth.middleware';
import { requireAdmin } from './admin.middleware';
import { adminController } from './admin.controller';

const router = Router();

// All routes require authentication AND admin role
router.use(requireAuth);
router.use(requireAdmin);

// GET /admin/dashboard - Get all dashboard statistics
router.get('/dashboard', adminController.getDashboard.bind(adminController));

// GET /admin/users - Get all users with pagination
router.get('/users', adminController.getUsers.bind(adminController));

// PATCH /admin/users/:id - Update a user
router.patch('/users/:id', adminController.updateUser.bind(adminController));

// DELETE /admin/users/:id - Delete a user
router.delete('/users/:id', adminController.deleteUser.bind(adminController));

// GET /admin/stats/views - Get view statistics
router.get('/stats/views', adminController.getViewStats.bind(adminController));

// GET /admin/stats/users - Get user statistics
router.get('/stats/users', adminController.getUserStats.bind(adminController));

export default router;
