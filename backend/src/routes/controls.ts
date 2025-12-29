import { Router } from 'express';
import { ControlsService } from '../services/controls.js';
import { getDatabase } from '../db/index.js';
import { authMiddleware, requirePermission } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware());

// Controls CRUD
router.post('/', requirePermission('controls', 'write'), async (req, res) => {
  try {
    if (!req.user?.organization_id) {
      return res.status(400).json({ error: 'User has no organization' });
    }

    const service = new ControlsService(getDatabase());
    const control = service.createControl(
      req.user.organization_id,
      req.user.id,
      req.body
    );
    res.status(201).json({ control });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/', requirePermission('controls', 'read'), async (req, res) => {
  try {
    if (!req.user?.organization_id) {
      return res.status(400).json({ error: 'User has no organization' });
    }

    const service = new ControlsService(getDatabase());
    const controls = service.listControls(req.user.organization_id, req.query);
    res.json({ controls });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', requirePermission('controls', 'read'), async (req, res) => {
  try {
    const service = new ControlsService(getDatabase());
    const control = service.getControlById(req.params.id);

    if (!control) {
      return res.status(404).json({ error: 'Control not found' });
    }

    if (control.organization_id !== req.user?.organization_id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json({ control });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', requirePermission('controls', 'write'), async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(400).json({ error: 'User not authenticated' });
    }

    const service = new ControlsService(getDatabase());
    const control = service.updateControl(req.params.id, req.user.id, req.body);
    res.json({ control });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', requirePermission('controls', 'write'), async (req, res) => {
  try {
    const service = new ControlsService(getDatabase());
    service.deleteControl(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Control mappings
router.post('/mappings', requirePermission('controls', 'write'), async (req, res) => {
  try {
    const service = new ControlsService(getDatabase());
    const mapping = service.mapControlToRisk(req.body);
    res.status(201).json({ mapping });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/mappings/risk/:riskId', requirePermission('controls', 'read'), async (req, res) => {
  try {
    const service = new ControlsService(getDatabase());
    const mappings = service.getMappingsForRisk(req.params.riskId);
    res.json({ mappings });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/mappings/enterprise-risk/:enterpriseRiskId', requirePermission('controls', 'read'), async (req, res) => {
  try {
    const service = new ControlsService(getDatabase());
    const mappings = service.getMappingsForEnterpriseRisk(req.params.enterpriseRiskId);
    res.json({ mappings });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/mappings/control/:controlId', requirePermission('controls', 'read'), async (req, res) => {
  try {
    const service = new ControlsService(getDatabase());
    const mappings = service.getMappingsForControl(req.params.controlId);
    res.json({ mappings });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/mappings/:id', requirePermission('controls', 'write'), async (req, res) => {
  try {
    const service = new ControlsService(getDatabase());
    service.deleteMapping(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Audit findings
router.post('/findings', requirePermission('controls', 'write'), async (req, res) => {
  try {
    if (!req.user?.organization_id || !req.user?.id) {
      return res.status(400).json({ error: 'User not authenticated' });
    }

    const service = new ControlsService(getDatabase());
    const finding = service.createFinding(req.user.organization_id, req.user.id, req.body);
    res.status(201).json({ finding });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/findings', requirePermission('controls', 'read'), async (req, res) => {
  try {
    if (!req.user?.organization_id) {
      return res.status(400).json({ error: 'User has no organization' });
    }

    const service = new ControlsService(getDatabase());
    const findings = service.listFindings(req.user.organization_id, req.query);
    res.json({ findings });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/findings/:id', requirePermission('controls', 'read'), async (req, res) => {
  try {
    const service = new ControlsService(getDatabase());
    const finding = service.getFindingById(req.params.id);

    if (!finding) {
      return res.status(404).json({ error: 'Finding not found' });
    }

    if (finding.organization_id !== req.user?.organization_id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json({ finding });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/findings/:id', requirePermission('controls', 'write'), async (req, res) => {
  try {
    const service = new ControlsService(getDatabase());
    const finding = service.updateFinding(req.params.id, req.body);
    res.json({ finding });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Control assessments
router.post('/assessments', requirePermission('controls', 'write'), async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(400).json({ error: 'User not authenticated' });
    }

    const service = new ControlsService(getDatabase());
    const assessment = service.createAssessment(req.user.id, req.body);
    res.status(201).json({ assessment });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/assessments/control/:controlId', requirePermission('controls', 'read'), async (req, res) => {
  try {
    const service = new ControlsService(getDatabase());
    const assessments = service.getAssessmentsForControl(req.params.controlId);
    res.json({ assessments });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

