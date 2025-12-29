import { Router } from 'express';
import { EnterpriseRiskService } from '../services/enterpriseRisk.js';
import { getDatabase } from '../db/index.js';
import { authMiddleware, requirePermission } from '../middleware/auth.js';
import { RiskCategory } from '../models/types.js';

const router = Router();
router.use(authMiddleware());

// Refresh/aggregate enterprise risks
router.post('/refresh', requirePermission('enterprise_risks', 'write'), async (req, res) => {
  try {
    if (!req.user?.organization_id) {
      return res.status(400).json({ error: 'User has no organization' });
    }

    const service = new EnterpriseRiskService(getDatabase());
    const risks = service.refreshEnterpriseRisks(req.user.organization_id);

    res.json({ risks });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// List enterprise risks
router.get('/', requirePermission('enterprise_risks', 'read'), async (req, res) => {
  try {
    if (!req.user?.organization_id) {
      return res.status(400).json({ error: 'User has no organization' });
    }

    const service = new EnterpriseRiskService(getDatabase());
    const filters = {
      category: req.query.category as RiskCategory | undefined,
      min_exposure: req.query.min_exposure ? Number(req.query.min_exposure) : undefined,
      max_exposure: req.query.max_exposure ? Number(req.query.max_exposure) : undefined,
    };

    const risks = service.listEnterpriseRisks(req.user.organization_id, filters);
    res.json({ risks });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single enterprise risk
router.get('/:id', requirePermission('enterprise_risks', 'read'), async (req, res) => {
  try {
    const service = new EnterpriseRiskService(getDatabase());
    const risk = service.getEnterpriseRiskById(req.params.id);

    if (!risk) {
      return res.status(404).json({ error: 'Enterprise risk not found' });
    }

    if (risk.organization_id !== req.user?.organization_id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Get component risks
    const components = service.getComponentRisks(req.params.id);

    res.json({ risk, components });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

