import { Router } from 'express';
import { ReportingService } from '../services/reporting.js';
import { EnterpriseRiskService } from '../services/enterpriseRisk.js';
import { AppetiteService } from '../services/appetite.js';
import { RiskRegisterService } from '../services/riskRegister.js';
import { getDatabase } from '../db/index.js';
import { authMiddleware, requirePermission } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware());

// Generate board report data
router.get('/board', requirePermission('reports', 'read'), async (req, res) => {
  try {
    if (!req.user?.organization_id) {
      return res.status(400).json({ error: 'User has no organization' });
    }

    const enterpriseRiskService = new EnterpriseRiskService(getDatabase());
    const riskRegisterService = new RiskRegisterService(getDatabase());
    const appetiteService = new AppetiteService(
      getDatabase(),
      enterpriseRiskService,
      riskRegisterService
    );

    const reportingService = new ReportingService(
      getDatabase(),
      enterpriseRiskService,
      appetiteService,
      riskRegisterService
    );

    const period = req.query.period as string | undefined;
    const reportData = await reportingService.generateBoardReport(
      req.user.organization_id,
      period
    );

    res.json({ report: reportData });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

