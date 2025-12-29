import express from 'express';
import { DataImportService } from '../services/dataImport.js';

const router = express.Router();

/**
 * POST /api/import/org-structure
 * Import organization structure from CSV/Excel
 */
router.post('/org-structure', (req, res) => {
  try {
    const { rows, organizationId } = req.body;
    
    if (!rows || !Array.isArray(rows)) {
      return res.status(400).json({ error: 'rows must be an array' });
    }
    
    if (!organizationId) {
      return res.status(400).json({ error: 'organizationId is required' });
    }

    const result = DataImportService.importOrgStructure(rows, organizationId);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/import/risks
 * Import risks from CSV/Excel risk register
 */
router.post('/risks', (req, res) => {
  try {
    const { rows, organizationId, createdBy } = req.body;
    
    if (!rows || !Array.isArray(rows)) {
      return res.status(400).json({ error: 'rows must be an array' });
    }
    
    if (!organizationId || !createdBy) {
      return res.status(400).json({ error: 'organizationId and createdBy are required' });
    }

    const result = DataImportService.importRisks(rows, organizationId, createdBy);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/import/appetite
 * Import risk appetite statements
 */
router.post('/appetite', (req, res) => {
  try {
    const { rows, organizationId } = req.body;
    
    if (!rows || !Array.isArray(rows)) {
      return res.status(400).json({ error: 'rows must be an array' });
    }
    
    if (!organizationId) {
      return res.status(400).json({ error: 'organizationId is required' });
    }

    const result = DataImportService.importRiskAppetite(rows, organizationId);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

