import type { Request, Response } from 'express';
import { authService } from './auth.service';
import { CustomError } from '../middleware/errorHandler';
import type { RegisterRequest, LoginRequest, AuthResponse } from './auth.types';

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const data: RegisterRequest = req.body;
      const email = data.email?.trim();
      const username = data.username?.trim();

      if (!email || !username || !data.password) {
        throw new CustomError('Email, username, and password are required', 400);
      }

      const user = await authService.register({
        ...data,
        email,
        username,
      });

      const response: AuthResponse = {
        ok: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
          },
        },
      };

      res.status(201).json(response);
    } catch (error) {
      // Log the actual error for debugging
      console.error('Registration error:', error);

      if (error instanceof CustomError) {
        const response: AuthResponse = {
          ok: false,
          message: error.message,
        };
        res.status(error.statusCode).json(response);
      } else {
        // Log full error details in development
        const errorMessage = error instanceof Error ? error.message : 'Internal server error';
        const errorStack = error instanceof Error ? error.stack : undefined;

        console.error('Registration error details:', {
          message: errorMessage,
          stack: errorStack,
          error,
        });

        const response: AuthResponse = {
          ok: false,
          message: process.env.NODE_ENV === 'development' ? errorMessage : 'Internal server error',
          ...(process.env.NODE_ENV === 'development' && { details: errorStack }),
        };
        res.status(500).json(response);
      }
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const data: LoginRequest = req.body;

      if (!data.email || !data.password) {
        throw new CustomError('Email and password are required', 400);
      }

      const userAgent = req.get('user-agent');
      const ipAddress = req.ip || req.socket.remoteAddress || undefined;

      const { user, accessToken, refreshToken } = await authService.login(
        data,
        userAgent,
        ipAddress
      );

      // Set cookies
      const isSecure =
        process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production';

      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      const response: AuthResponse = {
        ok: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
          },
        },
      };

      res.status(200).json(response);
    } catch (error) {
      if (error instanceof CustomError) {
        const response: AuthResponse = {
          ok: false,
          message: error.message,
        };
        res.status(error.statusCode).json(response);
      } else {
        const response: AuthResponse = {
          ok: false,
          message: 'Internal server error',
        };
        res.status(500).json(response);
      }
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies.refresh_token;

      if (refreshToken) {
        await authService.logout(refreshToken);
      }

      // Clear cookies
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');

      const response: AuthResponse = {
        ok: true,
        message: 'Logged out successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      // Logout should be idempotent, so we always return 200
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');

      const response: AuthResponse = {
        ok: true,
        message: 'Logged out successfully',
      };

      res.status(200).json(response);
    }
  }

  async getMe(req: Request, res: Response): Promise<void> {
    try {
      // User is attached by requireAuth middleware
      const user = (req as any).user;

      if (!user) {
        throw new CustomError('Unauthorized', 401);
      }

      const response: AuthResponse = {
        ok: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
          },
        },
      };

      res.status(200).json(response);
    } catch (error) {
      if (error instanceof CustomError) {
        const response: AuthResponse = {
          ok: false,
          message: error.message,
        };
        res.status(error.statusCode).json(response);
      } else {
        const response: AuthResponse = {
          ok: false,
          message: 'Internal server error',
        };
        res.status(500).json(response);
      }
    }
  }
}

export const authController = new AuthController();
