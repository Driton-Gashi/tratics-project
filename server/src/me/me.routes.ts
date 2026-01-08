import { Router } from 'express';
import { requireAuth } from '../auth/auth.middleware';
import { meController } from './me.controller';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// GET /me - Get user profile
router.get('/', meController.getProfile.bind(meController));

// GET /me/lists - Get user lists (with optional filters)
router.get('/lists', meController.getLists.bind(meController));

// GET /me/lists/check - Check if item is in list
router.get('/lists/check', meController.checkListStatus.bind(meController));

// POST /me/lists - Add item to list
router.post('/lists', meController.addToList.bind(meController));

// DELETE /me/lists - Remove item from list
router.delete('/lists', meController.removeFromList.bind(meController));

export default router;
