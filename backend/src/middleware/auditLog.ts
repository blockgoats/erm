import { Request, Response, NextFunction } from 'express';
import { AuditService } from '../services/audit.js';
import { getDatabase } from '../db/index.js';

/**
 * Middleware to automatically log API actions to audit log
 */
export function auditLogMiddleware(req: Request, res: Response, next: NextFunction) {
  const originalSend = res.send;

  res.send = function (body: any) {
    // Only log successful requests (2xx status codes)
    if (res.statusCode >= 200 && res.statusCode < 300) {
      try {
        const auditService = new AuditService(getDatabase());
        const action = getActionFromRequest(req);
        
        if (action) {
          auditService.logAction(
            req.user?.organization_id,
            req.user?.id,
            {
              action,
              resource_type: getResourceTypeFromPath(req.path),
              resource_id: req.params.id || req.params.riskId || undefined,
              details: JSON.stringify({
                method: req.method,
                path: req.path,
                query: req.query,
              }),
              ip_address: req.ip || req.socket.remoteAddress,
              user_agent: req.get('user-agent'),
            }
          );
        }
      } catch (error) {
        // Don't fail the request if audit logging fails
        console.error('Failed to log audit entry:', error);
      }
    }

    return originalSend.call(this, body);
  };

  next();
}

function getActionFromRequest(req: Request): string | null {
  const method = req.method.toLowerCase();
  const path = req.path.toLowerCase();

  if (method === 'post') {
    if (path.includes('login')) return 'user.login';
    if (path.includes('create') || path.includes('import')) return 'create';
    return 'create';
  }

  if (method === 'put' || method === 'patch') {
    return 'update';
  }

  if (method === 'delete') {
    return 'delete';
  }

  // GET requests are not logged by default (too noisy)
  return null;
}

function getResourceTypeFromPath(path: string): string {
  if (path.includes('/risks')) return 'risk';
  if (path.includes('/enterprise-risks')) return 'enterprise_risk';
  if (path.includes('/appetite')) return 'risk_appetite';
  if (path.includes('/kri')) return 'kri';
  if (path.includes('/evidence')) return 'evidence';
  if (path.includes('/audit')) return 'audit_log';
  if (path.includes('/reports')) return 'report';
  if (path.includes('/auth')) return 'user';
  return 'unknown';
}

