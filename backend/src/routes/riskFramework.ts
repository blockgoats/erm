import { Router } from 'express';
import { RiskFrameworkService } from '../services/riskFramework.js';
import { getDatabase } from '../db/index.js';
import { authMiddleware, requirePermission } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware());

// Scoring Scales
router.get('/scales', requirePermission('risks', 'read'), async (req, res) => {
  try {
    if (!req.user?.organization_id) {
      return res.status(400).json({ error: 'User has no organization' });
    }

    const service = new RiskFrameworkService(getDatabase());
    const scales = service.getScales(req.user.organization_id, req.query.scale_type as any);
    res.json({ scales });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/scales', requirePermission('risks', 'write'), async (req, res) => {
  try {
    if (!req.user?.organization_id) {
      return res.status(400).json({ error: 'User has no organization' });
    }

    const service = new RiskFrameworkService(getDatabase());
    const scale = service.createScale(req.user.organization_id, req.body);
    res.status(201).json({ scale });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/scales/:id', requirePermission('risks', 'write'), async (req, res) => {
  try {
    const service = new RiskFrameworkService(getDatabase());
    const scale = service.updateScale(req.params.id, req.body);
    res.json({ scale });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/scales/:id', requirePermission('risks', 'write'), async (req, res) => {
  try {
    const service = new RiskFrameworkService(getDatabase());
    service.deleteScale(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Risk Taxonomies
router.get('/taxonomies', requirePermission('risks', 'read'), async (req, res) => {
  try {
    if (!req.user?.organization_id) {
      return res.status(400).json({ error: 'User has no organization' });
    }

    const service = new RiskFrameworkService(getDatabase());
    const taxonomies = req.query.tree 
      ? service.getTaxonomyTree(req.user.organization_id)
      : service.getTaxonomies(req.user.organization_id, req.query.parent_id as string);
    res.json({ taxonomies });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/taxonomies', requirePermission('risks', 'write'), async (req, res) => {
  try {
    if (!req.user?.organization_id) {
      return res.status(400).json({ error: 'User has no organization' });
    }

    const service = new RiskFrameworkService(getDatabase());
    const taxonomy = service.createTaxonomy(req.user.organization_id, req.body);
    res.status(201).json({ taxonomy });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/taxonomies/:id', requirePermission('risks', 'write'), async (req, res) => {
  try {
    const service = new RiskFrameworkService(getDatabase());
    const taxonomy = service.updateTaxonomy(req.params.id, req.body);
    res.json({ taxonomy });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/taxonomies/:id', requirePermission('risks', 'write'), async (req, res) => {
  try {
    const service = new RiskFrameworkService(getDatabase());
    service.deleteTaxonomy(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Risk Frameworks
router.get('/frameworks', requirePermission('risks', 'read'), async (req, res) => {
  try {
    if (!req.user?.organization_id) {
      return res.status(400).json({ error: 'User has no organization' });
    }

    const service = new RiskFrameworkService(getDatabase());
    const frameworks = service.getFrameworks(req.user.organization_id, req.query.active_only === 'true');
    res.json({ frameworks });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/frameworks/active', requirePermission('risks', 'read'), async (req, res) => {
  try {
    if (!req.user?.organization_id) {
      return res.status(400).json({ error: 'User has no organization' });
    }

    const service = new RiskFrameworkService(getDatabase());
    const framework = service.getActiveFramework(req.user.organization_id);
    if (!framework) {
      return res.status(404).json({ error: 'No active framework found' });
    }
    res.json({ framework });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/frameworks', requirePermission('risks', 'write'), async (req, res) => {
  try {
    if (!req.user?.organization_id || !req.user?.id) {
      return res.status(400).json({ error: 'User not authenticated' });
    }

    const service = new RiskFrameworkService(getDatabase());
    const framework = service.createFramework(req.user.organization_id, req.user.id, req.body);
    res.status(201).json({ framework });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/frameworks/:id', requirePermission('risks', 'write'), async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(400).json({ error: 'User not authenticated' });
    }

    const service = new RiskFrameworkService(getDatabase());
    const framework = service.updateFramework(req.params.id, req.user.id, req.body);
    res.json({ framework });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/frameworks/:id/history', requirePermission('risks', 'read'), async (req, res) => {
  try {
    const service = new RiskFrameworkService(getDatabase());
    const history = service.getFrameworkHistory(req.params.id);
    res.json({ history });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

