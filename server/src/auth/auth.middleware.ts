import type { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { CustomError } from '../middleware/errorHandler';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    username: string | null;
    role: 'user' | 'admin';
  };
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const accessToken = req.cookies.access_token;

    if (!accessToken) {
      throw new CustomError('Unauthorized', 401);
    }

    const payload = authService.verifyAccessToken(accessToken);
    const user = await authService.getUserById(payload.userId);

    if (!user) {
      throw new CustomError('Unauthorized', 401);
    }

    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({
        ok: false,
        message: error.message,
      });
    } else {
      res.status(401).json({
        ok: false,
        message: 'Unauthorized',
      });
    }
  }
};
