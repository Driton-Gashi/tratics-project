import express from 'express';
import {
   getAllCimersController,
   getCimerByEmailController,
   getCimerByIdController,
} from '../controllers/controller-example';

const router = express.Router();

router.get('/', getAllCimersController);

router.get('/by-email', getCimerByEmailController);

router.get('/:id', getCimerByIdController);

export default router;
