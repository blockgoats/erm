import { Router } from 'express';
import { RiskRegisterService } from '../services/riskRegister.js';
import { getDatabase } from '../db/index.js';
import { authMiddleware, requirePermission } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware());

// Get all risks for organization
router.get('/', requirePermission('risks', 'read'), async (req, res) => {
  try {
    if (!req.user?.organization_id) {
      return res.status(400).json({ error: 'User has no organization' });
    }

    const service = new RiskRegisterService(getDatabase());
    const filters = {
      status: req.query.status as string,
      category: req.query.category as string,
      business_unit_id: req.query.business_unit_id as string,
      owner_id: req.query.owner_id as string,
      min_exposure: req.query.min_exposure ? Number(req.query.min_exposure) : undefined,
      max_exposure: req.query.max_exposure ? Number(req.query.max_exposure) : undefined,
    };

    const risks = service.listRisks(req.user.organization_id, filters);
    res.json({ risks });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single risk
router.get('/:id', requirePermission('risks', 'read'), async (req, res) => {
  try {
    const service = new RiskRegisterService(getDatabase());
    const risk = service.getRiskById(req.params.id);

    if (!risk) {
      return res.status(404).json({ error: 'Risk not found' });
    }

    if (risk.organization_id !== req.user?.organization_id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json({ risk });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create risk
router.post('/', requirePermission('risks', 'write'), async (req, res) => {
  try {
    if (!req.user?.organization_id || !req.user?.id) {
      return res.status(400).json({ error: 'User has no organization' });
    }

    const service = new RiskRegisterService(getDatabase());
    const risk = service.createRisk(req.user.organization_id, req.user.id, req.body);

    res.status(201).json({ risk });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update risk
router.put('/:id', requirePermission('risks', 'write'), async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(400).json({ error: 'User not authenticated' });
    }

    const service = new RiskRegisterService(getDatabase());
    const existing = service.getRiskById(req.params.id);

    if (!existing) {
      return res.status(404).json({ error: 'Risk not found' });
    }

    if (existing.organization_id !== req.user.organization_id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const risk = service.updateRisk(req.params.id, req.user.id, req.body);
    res.json({ risk });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete risk
router.delete('/:id', requirePermission('risks', 'delete'), async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(400).json({ error: 'User not authenticated' });
    }

    const service = new RiskRegisterService(getDatabase());
    const existing = service.getRiskById(req.params.id);

    if (!existing) {
      return res.status(404).json({ error: 'Risk not found' });
    }

    if (existing.organization_id !== req.user.organization_id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    service.deleteRisk(req.params.id, req.user.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get risk history
router.get('/:id/history', requirePermission('risks', 'read'), async (req, res) => {
  try {
    const service = new RiskRegisterService(getDatabase());
    const risk = service.getRiskById(req.params.id);

    if (!risk) {
      return res.status(404).json({ error: 'Risk not found' });
    }

    if (risk.organization_id !== req.user?.organization_id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const history = service.getRiskHistory(req.params.id);
    res.json({ history });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk import
router.post('/bulk-import', requirePermission('risks', 'write'), async (req, res) => {
  try {
    if (!req.user?.organization_id || !req.user?.id) {
      return res.status(400).json({ error: 'User has no organization' });
    }

    const { risks } = req.body;
    if (!Array.isArray(risks)) {
      return res.status(400).json({ error: 'risks must be an array' });
    }

    const service = new RiskRegisterService(getDatabase());
    const result = service.bulkImportRisks(req.user.organization_id, req.user.id, risks);

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

