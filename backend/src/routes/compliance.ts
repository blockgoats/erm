import { Router } from 'express';
import { ComplianceService } from '../services/compliance.js';
import { getDatabase } from '../db/index.js';
import { authMiddleware, requirePermission } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware());

// Frameworks
router.get('/frameworks', requirePermission('risks', 'read'), async (req, res) => {
  try {
    if (!req.user?.organization_id) {
      return res.status(400).json({ error: 'User has no organization' });
    }

    const service = new ComplianceService(getDatabase());
    const frameworks = service.getFrameworks(req.user.organization_id);
    res.json({ frameworks });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/frameworks', requirePermission('risks', 'write'), async (req, res) => {
  try {
    if (!req.user?.organization_id) {
      return res.status(400).json({ error: 'User has no organization' });
    }

    const service = new ComplianceService(getDatabase());
    const framework = service.createFramework(req.user.organization_id, req.body);
    res.status(201).json({ framework });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Requirements
router.get('/frameworks/:frameworkId/requirements', requirePermission('risks', 'read'), async (req, res) => {
  try {
    const service = new ComplianceService(getDatabase());
    const requirements = service.getRequirements(req.params.frameworkId);
    res.json({ requirements });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/frameworks/:frameworkId/requirements', requirePermission('risks', 'write'), async (req, res) => {
  try {
    const service = new ComplianceService(getDatabase());
    const requirement = service.createRequirement(req.params.frameworkId, req.body);
    res.status(201).json({ requirement });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Control Mappings
router.post('/mappings', requirePermission('risks', 'write'), async (req, res) => {
  try {
    const { requirement_id, control_id, mapping_type, notes } = req.body;
    if (!requirement_id || !control_id || !mapping_type) {
      return res.status(400).json({ error: 'requirement_id, control_id, and mapping_type are required' });
    }

    const service = new ComplianceService(getDatabase());
    const mapping = service.mapControlToRequirement(requirement_id, control_id, mapping_type, notes);
    res.status(201).json({ mapping });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/mappings/requirement/:requirementId', requirePermission('risks', 'read'), async (req, res) => {
  try {
    const service = new ComplianceService(getDatabase());
    const mappings = service.getControlMappingsForRequirement(req.params.requirementId);
    res.json({ mappings });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/mappings/control/:controlId', requirePermission('risks', 'read'), async (req, res) => {
  try {
    const service = new ComplianceService(getDatabase());
    const mappings = service.getControlMappingsForControl(req.params.controlId);
    res.json({ mappings });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/mappings/:id', requirePermission('risks', 'write'), async (req, res) => {
  try {
    const service = new ComplianceService(getDatabase());
    service.deleteControlMapping(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Coverage
router.get('/coverage', requirePermission('risks', 'read'), async (req, res) => {
  try {
    if (!req.user?.organization_id) {
      return res.status(400).json({ error: 'User has no organization' });
    }

    const service = new ComplianceService(getDatabase());
    const coverage = service.getAllCoverage(req.user.organization_id);
    res.json({ coverage });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/coverage/calculate/:frameworkId', requirePermission('risks', 'write'), async (req, res) => {
  try {
    if (!req.user?.organization_id) {
      return res.status(400).json({ error: 'User has no organization' });
    }

    const service = new ComplianceService(getDatabase());
    const coverage = service.calculateCoverage(req.user.organization_id, req.params.frameworkId);
    res.json({ coverage });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

