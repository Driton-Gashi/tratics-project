import type { Request, Response } from 'express';

export class DocsController {
  getDocs(req: Request, res: Response): void {
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    res.status(200).json({
      title: 'Tratics API Documentation',
      version: '1.0.0',
      description: 'RESTful API for Tratics movie tracking application',
      baseUrl,
      endpoints: {
        auth: `${baseUrl}/docs/auth`,
        health: `${baseUrl}/docs/health`,
      },
      sections: [
        {
          name: 'Authentication',
          path: '/docs/auth',
          description: 'User registration, login, logout, and session management',
        },
        {
          name: 'Health Check',
          path: '/docs/health',
          description: 'Server health and status endpoints',
        },
      ],
    });
  }

  getAuthDocs(req: Request, res: Response): void {
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    res.status(200).json({
      section: 'Authentication API',
      baseUrl: `${baseUrl}/api/auth`,
      endpoints: [
        {
          method: 'POST',
          path: '/register',
          description: 'Register a new user account',
          authentication: false,
          requestBody: {
            email: 'string (required) - Valid email address',
            username: 'string (optional) - Username (max 50 chars)',
            password: 'string (required) - Minimum 8 characters',
          },
          responses: {
            '201': {
              description: 'User created successfully',
              body: {
                ok: true,
                data: {
                  user: {
                    id: 'number',
                    email: 'string',
                    username: 'string | null',
                    role: "'user' | 'admin'",
                  },
                },
              },
            },
            '400': {
              description: 'Invalid request (missing email/password or password too short)',
              body: {
                ok: false,
                message: 'string',
              },
            },
            '409': {
              description: 'Email already exists',
              body: {
                ok: false,
                message: 'Email already exists',
              },
            },
            '500': {
              description: 'Internal server error',
              body: {
                ok: false,
                message: 'string',
              },
            },
          },
          example: {
            request: {
              url: `${baseUrl}/api/auth/register`,
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: {
                email: 'user@example.com',
                username: 'johndoe',
                password: 'securepassword123',
              },
            },
            response: {
              status: 201,
              body: {
                ok: true,
                data: {
                  user: {
                    id: 1,
                    email: 'user@example.com',
                    username: 'johndoe',
                    role: 'user',
                  },
                },
              },
            },
          },
        },
        {
          method: 'POST',
          path: '/login',
          description: 'Authenticate user and create session',
          authentication: false,
          requestBody: {
            email: 'string (required) - User email address',
            password: 'string (required) - User password',
          },
          cookies: {
            access_token: 'JWT access token (15 min expiry, httpOnly)',
            refresh_token: 'JWT refresh token (30 days expiry, httpOnly)',
          },
          responses: {
            '200': {
              description: 'Login successful',
              body: {
                ok: true,
                data: {
                  user: {
                    id: 'number',
                    email: 'string',
                    username: 'string | null',
                    role: "'user' | 'admin'",
                  },
                },
              },
            },
            '400': {
              description: 'Invalid request (missing email/password)',
              body: {
                ok: false,
                message: 'Email and password are required',
              },
            },
            '401': {
              description: 'Invalid credentials or user inactive',
              body: {
                ok: false,
                message: 'Invalid credentials',
              },
            },
            '500': {
              description: 'Internal server error',
              body: {
                ok: false,
                message: 'string',
              },
            },
          },
          example: {
            request: {
              url: `${baseUrl}/api/auth/login`,
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: {
                email: 'user@example.com',
                password: 'securepassword123',
              },
            },
            response: {
              status: 200,
              headers: {
                'Set-Cookie': ['access_token=...', 'refresh_token=...'],
              },
              body: {
                ok: true,
                data: {
                  user: {
                    id: 1,
                    email: 'user@example.com',
                    username: 'johndoe',
                    role: 'user',
                  },
                },
              },
            },
          },
        },
        {
          method: 'POST',
          path: '/logout',
          description: 'Logout user and revoke session',
          authentication: false,
          cookies: {
            refresh_token: 'string (optional) - Refresh token to revoke',
          },
          responses: {
            '200': {
              description: 'Logout successful (always returns 200, idempotent)',
              body: {
                ok: true,
                message: 'Logged out successfully',
              },
            },
          },
          example: {
            request: {
              url: `${baseUrl}/api/auth/logout`,
              method: 'POST',
              headers: {
                Cookie: 'refresh_token=...',
              },
            },
            response: {
              status: 200,
              headers: {
                'Set-Cookie': [
                  'access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
                  'refresh_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
                ],
              },
              body: {
                ok: true,
                message: 'Logged out successfully',
              },
            },
          },
        },
        {
          method: 'GET',
          path: '/me',
          description: 'Get current authenticated user information',
          authentication: true,
          cookies: {
            access_token: 'JWT access token (required)',
          },
          responses: {
            '200': {
              description: 'User information retrieved successfully',
              body: {
                ok: true,
                data: {
                  user: {
                    id: 'number',
                    email: 'string',
                    username: 'string | null',
                    role: "'user' | 'admin'",
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized (missing or invalid token)',
              body: {
                ok: false,
                message: 'Unauthorized',
              },
            },
          },
          example: {
            request: {
              url: `${baseUrl}/api/auth/me`,
              method: 'GET',
              headers: {
                Cookie: 'access_token=...',
              },
            },
            response: {
              status: 200,
              body: {
                ok: true,
                data: {
                  user: {
                    id: 1,
                    email: 'user@example.com',
                    username: 'johndoe',
                    role: 'user',
                  },
                },
              },
            },
          },
        },
      ],
      authentication: {
        type: 'JWT with httpOnly cookies',
        accessToken: {
          expiry: '15 minutes',
          storage: 'httpOnly cookie (access_token)',
          usage: 'Include in Cookie header for authenticated requests',
        },
        refreshToken: {
          expiry: '30 days',
          storage: 'httpOnly cookie (refresh_token)',
          usage: 'Automatically used to refresh access token',
        },
      },
      security: {
        passwordHashing: 'bcrypt (10 rounds)',
        tokenStorage: 'httpOnly cookies (prevents XSS)',
        csrfProtection: 'SameSite=Lax cookies',
        passwordRequirements: 'Minimum 8 characters',
      },
    });
  }

  getHealthDocs(req: Request, res: Response): void {
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    res.status(200).json({
      section: 'Health Check API',
      baseUrl: `${baseUrl}/health`,
      endpoints: [
        {
          method: 'GET',
          path: '/health',
          description: 'Check server health and status',
          authentication: false,
          responses: {
            '200': {
              description: 'Server is healthy',
              body: {
                success: true,
                message: 'Server is healthy',
                timestamp: 'ISO 8601 timestamp',
              },
            },
          },
          example: {
            request: {
              url: `${baseUrl}/health`,
              method: 'GET',
            },
            response: {
              status: 200,
              body: {
                success: true,
                message: 'Server is healthy',
                timestamp: '2024-01-07T23:45:00.000Z',
              },
            },
          },
        },
        {
          method: 'GET',
          path: '/health/check',
          description: 'Verify database connectivity and route availability',
          authentication: false,
          responses: {
            '200': {
              description: 'Database connected and routes available',
              body: {
                success: true,
                message: 'Database connected and API routes available',
                timestamp: 'ISO 8601 timestamp',
                checks: {
                  database: {
                    ok: true,
                    latencyMs: 'number',
                  },
                  endpoints: {
                    ok: true,
                    routes: 'object',
                  },
                },
              },
            },
            '503': {
              description: 'Database connection failed',
              body: {
                success: false,
                message: 'Database connection failed',
                timestamp: 'ISO 8601 timestamp',
                checks: {
                  database: {
                    ok: false,
                    error: 'string',
                  },
                  endpoints: {
                    ok: true,
                    routes: 'object',
                  },
                },
              },
            },
          },
          example: {
            request: {
              url: `${baseUrl}/health/check`,
              method: 'GET',
            },
            response: {
              status: 200,
              body: {
                success: true,
                message: 'Database connected and API routes available',
                timestamp: '2024-01-07T23:45:00.000Z',
                checks: {
                  database: {
                    ok: true,
                    latencyMs: 12,
                  },
                  endpoints: {
                    ok: true,
                    routes: {
                      auth: '/api/auth',
                      me: '/api/me',
                      admin: '/api/admin',
                      analytics: '/api/analytics',
                      cimerat: '/api/cimerat',
                      docs: '/docs',
                      health: '/health',
                    },
                  },
                },
              },
            },
          },
        },
      ],
    });
  }
}

export const docsController = new DocsController();
