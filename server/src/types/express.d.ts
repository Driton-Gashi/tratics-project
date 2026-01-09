import type { Request } from 'express';

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface Request {
      // Add custom properties to Request here if needed in the future
      // Example: userId?: string;
    }
  }
}

export {};
