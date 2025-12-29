import { Router } from 'express';
import { AuditService } from '../services/audit.js';
import { getDatabase } from '../db/index.js';
import { authMiddleware, requirePermission } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware());

// Get audit logs
router.get('/', requirePermission('reports', 'read'), async (req, res) => {
  try {
    if (!req.user?.organization_id) {
      return res.status(400).json({ error: 'User has no organization' });
    }

    const service = new AuditService(getDatabase());
    const filters = {
      user_id: req.query.user_id as string,
      resource_type: req.query.resource_type as string,
      resource_id: req.query.resource_id as string,
      action: req.query.action as string,
      start_date: req.query.start_date as string,
      end_date: req.query.end_date as string,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    };

    const logs = service.getAuditLogs(req.user.organization_id, filters);
    res.json({ logs });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single audit log
router.get('/:id', requirePermission('reports', 'read'), async (req, res) => {
  try {
    const service = new AuditService(getDatabase());
    const log = service.getAuditLogById(req.params.id);

    if (!log) {
      return res.status(404).json({ error: 'Audit log not found' });
    }

    if (log.organization_id !== req.user?.organization_id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json({ log });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

