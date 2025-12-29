import { Router } from 'express';
import { AppetiteService } from '../services/appetite.js';
import { EnterpriseRiskService } from '../services/enterpriseRisk.js';
import { RiskRegisterService } from '../services/riskRegister.js';
import { getDatabase } from '../db/index.js';
import { authMiddleware, requirePermission } from '../middleware/auth.js';
import { RiskCategory } from '../models/types.js';

const router = Router();
router.use(authMiddleware());

// List appetites
router.get('/', requirePermission('appetite', 'read'), async (req, res) => {
  try {
    if (!req.user?.organization_id) {
      return res.status(400).json({ error: 'User has no organization' });
    }

    const enterpriseRiskService = new EnterpriseRiskService(getDatabase());
    const riskRegisterService = new RiskRegisterService(getDatabase());
    const service = new AppetiteService(
      getDatabase(),
      enterpriseRiskService,
      riskRegisterService
    );

    const category = req.query.category as RiskCategory | undefined;
    const appetites = service.listAppetites(req.user.organization_id, category);

    res.json({ appetites });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single appetite
router.get('/:id', requirePermission('appetite', 'read'), async (req, res) => {
  try {
    const enterpriseRiskService = new EnterpriseRiskService(getDatabase());
    const riskRegisterService = new RiskRegisterService(getDatabase());
    const service = new AppetiteService(
      getDatabase(),
      enterpriseRiskService,
      riskRegisterService
    );

    const appetite = service.getAppetiteById(req.params.id);

    if (!appetite) {
      return res.status(404).json({ error: 'Risk appetite not found' });
    }

    if (appetite.organization_id !== req.user?.organization_id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json({ appetite });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create appetite
router.post('/', requirePermission('appetite', 'write'), async (req, res) => {
  try {
    if (!req.user?.organization_id) {
      return res.status(400).json({ error: 'User has no organization' });
    }

    const enterpriseRiskService = new EnterpriseRiskService(getDatabase());
    const riskRegisterService = new RiskRegisterService(getDatabase());
    const service = new AppetiteService(
      getDatabase(),
      enterpriseRiskService,
      riskRegisterService
    );

    const appetite = service.createAppetite(req.user.organization_id, req.body);

    res.status(201).json({ appetite });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update appetite
router.put('/:id', requirePermission('appetite', 'write'), async (req, res) => {
  try {
    const enterpriseRiskService = new EnterpriseRiskService(getDatabase());
    const riskRegisterService = new RiskRegisterService(getDatabase());
    const service = new AppetiteService(
      getDatabase(),
      enterpriseRiskService,
      riskRegisterService
    );

    const existing = service.getAppetiteById(req.params.id);

    if (!existing) {
      return res.status(404).json({ error: 'Risk appetite not found' });
    }

    if (existing.organization_id !== req.user?.organization_id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const appetite = service.updateAppetite(req.params.id, req.body);

    res.json({ appetite });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete appetite
router.delete('/:id', requirePermission('appetite', 'write'), async (req, res) => {
  try {
    const enterpriseRiskService = new EnterpriseRiskService(getDatabase());
    const riskRegisterService = new RiskRegisterService(getDatabase());
    const service = new AppetiteService(
      getDatabase(),
      enterpriseRiskService,
      riskRegisterService
    );

    const existing = service.getAppetiteById(req.params.id);

    if (!existing) {
      return res.status(404).json({ error: 'Risk appetite not found' });
    }

    if (existing.organization_id !== req.user?.organization_id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    service.deleteAppetite(req.params.id);

    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get active breaches
router.get('/breaches/active', requirePermission('appetite', 'read'), async (req, res) => {
  try {
    if (!req.user?.organization_id) {
      return res.status(400).json({ error: 'User has no organization' });
    }

    const enterpriseRiskService = new EnterpriseRiskService(getDatabase());
    const riskRegisterService = new RiskRegisterService(getDatabase());
    const service = new AppetiteService(
      getDatabase(),
      enterpriseRiskService,
      riskRegisterService
    );

    const breaches = service.getActiveBreaches(req.user.organization_id);

    res.json({ breaches });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Check for breaches
router.post('/breaches/check', requirePermission('appetite', 'read'), async (req, res) => {
  try {
    if (!req.user?.organization_id) {
      return res.status(400).json({ error: 'User has no organization' });
    }

    const enterpriseRiskService = new EnterpriseRiskService(getDatabase());
    const riskRegisterService = new RiskRegisterService(getDatabase());
    const service = new AppetiteService(
      getDatabase(),
      enterpriseRiskService,
      riskRegisterService
    );

    const category = req.body.category;
    const breaches = service.checkBreaches(req.user.organization_id, category);

    res.json({ breaches });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Acknowledge breach
router.post('/breaches/:id/acknowledge', requirePermission('appetite', 'write'), async (req, res) => {
  try {
    const enterpriseRiskService = new EnterpriseRiskService(getDatabase());
    const riskRegisterService = new RiskRegisterService(getDatabase());
    const service = new AppetiteService(
      getDatabase(),
      enterpriseRiskService,
      riskRegisterService
    );

    service.acknowledgeBreach(req.params.id);

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Resolve breach
router.post('/breaches/:id/resolve', requirePermission('appetite', 'write'), async (req, res) => {
  try {
    const enterpriseRiskService = new EnterpriseRiskService(getDatabase());
    const riskRegisterService = new RiskRegisterService(getDatabase());
    const service = new AppetiteService(
      getDatabase(),
      enterpriseRiskService,
      riskRegisterService
    );

    service.resolveBreach(req.params.id);

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

