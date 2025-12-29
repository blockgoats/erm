import { Router } from 'express';
import { MaturityService } from '../services/maturity.js';
import { getDatabase } from '../db/index.js';
import { authMiddleware, requirePermission } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware());

// Maturity Assessments
router.get('/assessments', requirePermission('risks', 'read'), async (req, res) => {
  try {
    if (!req.user?.organization_id) {
      return res.status(400).json({ error: 'User has no organization' });
    }

    const service = new MaturityService(getDatabase());
    const assessments = service.getAssessments(req.user.organization_id);
    res.json({ assessments });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/assessments', requirePermission('risks', 'write'), async (req, res) => {
  try {
    if (!req.user?.organization_id || !req.user?.id) {
      return res.status(400).json({ error: 'User not authenticated' });
    }

    const service = new MaturityService(getDatabase());
    const assessment = service.createAssessment(req.user.organization_id, req.user.id, req.body);
    res.status(201).json({ assessment });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/assessments/:id/domains', requirePermission('risks', 'read'), async (req, res) => {
  try {
    const service = new MaturityService(getDatabase());
    const domainScores = service.getDomainScores(req.params.id);
    res.json({ domain_scores: domainScores });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Risk Reduction Metrics
router.get('/risk-reduction', requirePermission('risks', 'read'), async (req, res) => {
  try {
    if (!req.user?.organization_id) {
      return res.status(400).json({ error: 'User has no organization' });
    }

    const service = new MaturityService(getDatabase());
    const metrics = service.getRiskReductionMetrics(req.user.organization_id);
    res.json({ metrics });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/risk-reduction/calculate', requirePermission('risks', 'write'), async (req, res) => {
  try {
    if (!req.user?.organization_id) {
      return res.status(400).json({ error: 'User has no organization' });
    }

    const { period_start, period_end } = req.body;
    if (!period_start || !period_end) {
      return res.status(400).json({ error: 'period_start and period_end are required' });
    }

    const service = new MaturityService(getDatabase());
    const metric = service.calculateRiskReduction(req.user.organization_id, period_start, period_end);
    res.status(201).json({ metric });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Appetite Adherence Metrics
router.get('/appetite-adherence', requirePermission('risks', 'read'), async (req, res) => {
  try {
    if (!req.user?.organization_id) {
      return res.status(400).json({ error: 'User has no organization' });
    }

    const service = new MaturityService(getDatabase());
    const metrics = service.getAppetiteAdherenceMetrics(req.user.organization_id);
    res.json({ metrics });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/appetite-adherence/calculate', requirePermission('risks', 'write'), async (req, res) => {
  try {
    if (!req.user?.organization_id) {
      return res.status(400).json({ error: 'User has no organization' });
    }

    const { category, period_start, period_end } = req.body;
    if (!category || !period_start || !period_end) {
      return res.status(400).json({ error: 'category, period_start, and period_end are required' });
    }

    const service = new MaturityService(getDatabase());
    const metric = service.calculateAppetiteAdherence(req.user.organization_id, category, period_start, period_end);
    res.status(201).json({ metric });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

