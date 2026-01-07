import { Router } from 'express';
import { docsController } from '../controllers/docs.controller';

const router = Router();

router.get('/', docsController.getDocs);
router.get('/auth', docsController.getAuthDocs);
router.get('/health', docsController.getHealthDocs);

export default router;
