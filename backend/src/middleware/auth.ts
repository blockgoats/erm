import { Request, Response, NextFunction } from 'express';
import { AuthService, AuthUser } from '../services/auth.js';
import { getDatabase } from '../db/index.js';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function authMiddleware() {
  const authService = new AuthService(getDatabase());

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const token = authHeader.substring(7);
      const user = authService.verifyToken(token);
      req.user = user;
      next();
    } catch (error: any) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}

export function requirePermission(resource: string, action: string) {
  const authService = new AuthService(getDatabase());

  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!authService.hasPermission(req.user, resource, action)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  };
}

