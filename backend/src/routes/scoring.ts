import { Router } from 'express';
import { generateRiskMatrix } from '../services/riskScoring.js';
import { RiskRegisterService } from '../services/riskRegister.js';
import { getDatabase } from '../db/index.js';
import { authMiddleware, requirePermission } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware());

// Calculate risk score
router.post('/calculate', requirePermission('risks', 'read'), async (req, res) => {
  try {
    const { likelihood, impact } = req.body;

    if (typeof likelihood !== 'number' || typeof impact !== 'number') {
      return res.status(400).json({ error: 'likelihood and impact must be numbers' });
    }

    const { calculateRiskScore } = await import('../services/riskScoring.js');
    const score = calculateRiskScore(likelihood, impact);

    res.json({ score });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get risk matrix/heatmap data
router.get('/matrix', requirePermission('risks', 'read'), async (req, res) => {
  try {
    if (!req.user?.organization_id) {
      return res.status(400).json({ error: 'User has no organization' });
    }

    const service = new RiskRegisterService(getDatabase());
    const risks = service.listRisks(req.user.organization_id);
    const matrix = generateRiskMatrix(risks);

    res.json({ matrix });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

