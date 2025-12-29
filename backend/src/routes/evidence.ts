import { Router } from 'express';
import multer from 'multer';
import { EvidenceService } from '../services/evidence.js';
import { getDatabase } from '../db/index.js';
import { authMiddleware, requirePermission } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware());

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Get evidence for a risk
router.get('/risk/:riskId', requirePermission('risks', 'read'), async (req, res) => {
  try {
    const service = new EvidenceService(getDatabase());
    const evidence = service.getEvidenceByRiskId(req.params.riskId);
    res.json({ evidence });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Upload evidence
router.post('/', upload.single('file'), requirePermission('risks', 'write'), async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(400).json({ error: 'User not authenticated' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const { risk_id } = req.body;
    if (!risk_id) {
      return res.status(400).json({ error: 'risk_id is required' });
    }

    const service = new EvidenceService(getDatabase());
    const fileContent = req.file.buffer.toString('base64');
    
    const evidence = service.uploadEvidence(req.user.id, {
      risk_id,
      file_name: req.file.originalname,
      file_content: fileContent,
      file_type: req.file.mimetype,
    });

    res.status(201).json({ evidence });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Download evidence
router.get('/:id/download', requirePermission('risks', 'read'), async (req, res) => {
  try {
    const service = new EvidenceService(getDatabase());
    const { file, fileName, fileType } = service.downloadEvidence(req.params.id);

    res.setHeader('Content-Type', fileType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(file);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

// Delete evidence
router.delete('/:id', requirePermission('risks', 'write'), async (req, res) => {
  try {
    const service = new EvidenceService(getDatabase());
    service.deleteEvidence(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

export default router;

