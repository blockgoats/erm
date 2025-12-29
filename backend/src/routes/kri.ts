import { Router } from 'express';
import { KRIService } from '../services/kri.js';
import { getDatabase } from '../db/index.js';
import { authMiddleware, requirePermission } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware());

// List KRIs
router.get('/', requirePermission('kri', 'read'), async (req, res) => {
  try {
    if (!req.user?.organization_id) {
      return res.status(400).json({ error: 'User has no organization' });
    }

    const service = new KRIService(getDatabase());
    const filters = {
      status: req.query.status as 'green' | 'yellow' | 'red' | undefined,
      linked_appetite_id: req.query.linked_appetite_id as string | undefined,
    };

    const kris = service.listKRIs(req.user.organization_id, filters);
    res.json({ kris });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single KRI
router.get('/:id', requirePermission('kri', 'read'), async (req, res) => {
  try {
    const service = new KRIService(getDatabase());
    const kri = service.getKRIById(req.params.id);

    if (!kri) {
      return res.status(404).json({ error: 'KRI not found' });
    }

    if (kri.organization_id !== req.user?.organization_id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json({ kri });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create KRI
router.post('/', requirePermission('kri', 'write'), async (req, res) => {
  try {
    if (!req.user?.organization_id) {
      return res.status(400).json({ error: 'User has no organization' });
    }

    const service = new KRIService(getDatabase());
    const kri = service.createKRI(req.user.organization_id, req.body);

    res.status(201).json({ kri });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update KRI
router.put('/:id', requirePermission('kri', 'write'), async (req, res) => {
  try {
    const service = new KRIService(getDatabase());
    const existing = service.getKRIById(req.params.id);

    if (!existing) {
      return res.status(404).json({ error: 'KRI not found' });
    }

    if (existing.organization_id !== req.user?.organization_id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const kri = service.updateKRI(req.params.id, req.body);
    res.json({ kri });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update KRI value (convenience endpoint)
router.post('/:id/value', requirePermission('kri', 'write'), async (req, res) => {
  try {
    const { value } = req.body;

    if (typeof value !== 'number') {
      return res.status(400).json({ error: 'value must be a number' });
    }

    const service = new KRIService(getDatabase());
    const existing = service.getKRIById(req.params.id);

    if (!existing) {
      return res.status(404).json({ error: 'KRI not found' });
    }

    if (existing.organization_id !== req.user?.organization_id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const kri = service.updateKRIValue(req.params.id, value);
    res.json({ kri });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete KRI
router.delete('/:id', requirePermission('kri', 'write'), async (req, res) => {
  try {
    const service = new KRIService(getDatabase());
    const existing = service.getKRIById(req.params.id);

    if (!existing) {
      return res.status(404).json({ error: 'KRI not found' });
    }

    if (existing.organization_id !== req.user?.organization_id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    service.deleteKRI(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get KRI history
router.get('/:id/history', requirePermission('kri', 'read'), async (req, res) => {
  try {
    const service = new KRIService(getDatabase());
    const existing = service.getKRIById(req.params.id);

    if (!existing) {
      return res.status(404).json({ error: 'KRI not found' });
    }

    if (existing.organization_id !== req.user?.organization_id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const history = service.getKRIHistory(req.params.id, limit);

    res.json({ history });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get breaching KRIs
router.get('/breaches/active', requirePermission('kri', 'read'), async (req, res) => {
  try {
    if (!req.user?.organization_id) {
      return res.status(400).json({ error: 'User has no organization' });
    }

    const service = new KRIService(getDatabase());
    const kris = service.getBreachingKRIs(req.user.organization_id);

    res.json({ kris });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

