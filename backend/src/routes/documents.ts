import { Router } from 'express';
import multer from 'multer';
import { DocumentIntelligenceService } from '../services/documentIntelligence.js';
import { getDatabase } from '../db/index.js';
import { authMiddleware, requirePermission } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware());

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for documents
});

// List documents for organization
router.get('/', requirePermission('risks', 'read'), async (req, res) => {
  try {
    if (!req.user?.organization_id) {
      return res.status(400).json({ error: 'User organization not found' });
    }

    const service = new DocumentIntelligenceService(getDatabase());
    const documents = service.listDocuments(req.user.organization_id);
    res.json({ documents });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get document by ID
router.get('/:id', requirePermission('risks', 'read'), async (req, res) => {
  try {
    const service = new DocumentIntelligenceService(getDatabase());
    const document = service.getDocumentById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({ document });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Upload and process document
router.post('/', upload.single('file'), requirePermission('risks', 'write'), async (req, res) => {
  try {
    if (!req.user?.id || !req.user?.organization_id) {
      return res.status(400).json({ error: 'User not authenticated' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const { document_type } = req.body;

    const service = new DocumentIntelligenceService(getDatabase());
    const fileContent = req.file.buffer.toString('base64');
    
    const document = await service.uploadDocument(req.user.id, {
      file_name: req.file.originalname,
      file_content: fileContent,
      file_type: req.file.mimetype,
      document_type: document_type || undefined,
      organization_id: req.user.organization_id,
    });

    // Process document (this will extract risks and clauses)
    const processingResult = await service.processDocument(document.id);

    res.status(201).json({
      document,
      processing_result: {
        extracted_risks_count: processingResult.extracted_risks.length,
        extracted_clauses_count: processingResult.extracted_clauses.length,
        created_risks: processingResult.created_risks,
        review_queue_count: processingResult.review_queue_count,
      },
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get review queue
router.get('/review/queue', requirePermission('risks', 'read'), async (req, res) => {
  try {
    if (!req.user?.organization_id) {
      return res.status(400).json({ error: 'User organization not found' });
    }

    const service = new DocumentIntelligenceService(getDatabase());
    const reviewQueue = service.getReviewQueue(req.user.organization_id);
    res.json({ review_queue: reviewQueue });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get processing result for a document
router.get('/:id/processing-result', requirePermission('risks', 'read'), async (req, res) => {
  try {
    const service = new DocumentIntelligenceService(getDatabase());
    const document = service.getDocumentById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Re-process to get results (in production, store results separately)
    const processingResult = await service.processDocument(req.params.id);
    
    res.json({ processing_result: processingResult });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

