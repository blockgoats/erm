import { Router } from 'express';
import { TreatmentService } from '../services/treatment.js';
import { getDatabase } from '../db/index.js';
import { authMiddleware, requirePermission } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware());

// Treatment Plans
router.post('/plans', requirePermission('risks', 'write'), async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(400).json({ error: 'User not authenticated' });
    }

    const { risk_id, ...planData } = req.body;
    if (!risk_id) {
      return res.status(400).json({ error: 'risk_id is required' });
    }

    const service = new TreatmentService(getDatabase());
    const plan = service.createTreatmentPlan(risk_id, req.user.id, planData);
    res.status(201).json({ plan });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/plans', requirePermission('risks', 'read'), async (req, res) => {
  try {
    if (!req.user?.organization_id) {
      return res.status(400).json({ error: 'User has no organization' });
    }

    const service = new TreatmentService(getDatabase());
    const plans = service.listTreatmentPlans(req.user.organization_id, req.query);
    res.json({ plans });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/plans/risk/:riskId', requirePermission('risks', 'read'), async (req, res) => {
  try {
    const service = new TreatmentService(getDatabase());
    const plans = service.getTreatmentPlansForRisk(req.params.riskId);
    res.json({ plans });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/plans/:id', requirePermission('risks', 'read'), async (req, res) => {
  try {
    const service = new TreatmentService(getDatabase());
    const plan = service.getTreatmentPlanById(req.params.id);

    if (!plan) {
      return res.status(404).json({ error: 'Treatment plan not found' });
    }

    res.json({ plan });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/plans/:id', requirePermission('risks', 'write'), async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(400).json({ error: 'User not authenticated' });
    }

    const service = new TreatmentService(getDatabase());
    const plan = service.updateTreatmentPlan(req.params.id, req.user.id, req.body);
    res.json({ plan });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/plans/:id', requirePermission('risks', 'write'), async (req, res) => {
  try {
    const service = new TreatmentService(getDatabase());
    service.deleteTreatmentPlan(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Submit for approval
router.post('/plans/:id/submit', requirePermission('risks', 'write'), async (req, res) => {
  try {
    const { approver_ids } = req.body;
    if (!approver_ids || !Array.isArray(approver_ids) || approver_ids.length === 0) {
      return res.status(400).json({ error: 'approver_ids array is required' });
    }

    const service = new TreatmentService(getDatabase());
    service.submitForApproval(req.params.id, approver_ids);
    res.json({ message: 'Treatment plan submitted for approval' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Process approval
router.post('/plans/:id/approve', requirePermission('risks', 'write'), async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(400).json({ error: 'User not authenticated' });
    }

    const { status, comments } = req.body;
    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'status must be "approved" or "rejected"' });
    }

    const service = new TreatmentService(getDatabase());
    service.processApproval(req.params.id, req.user.id, status, comments);
    res.json({ message: `Treatment plan ${status}` });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get approvals
router.get('/plans/:id/approvals', requirePermission('risks', 'read'), async (req, res) => {
  try {
    const service = new TreatmentService(getDatabase());
    const approvals = service.getApprovalsForPlan(req.params.id);
    res.json({ approvals });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Tasks
router.post('/tasks', requirePermission('risks', 'write'), async (req, res) => {
  try {
    const { treatment_plan_id, ...taskData } = req.body;
    if (!treatment_plan_id) {
      return res.status(400).json({ error: 'treatment_plan_id is required' });
    }

    const service = new TreatmentService(getDatabase());
    const task = service.createTask(treatment_plan_id, taskData);
    res.status(201).json({ task });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/tasks/plan/:planId', requirePermission('risks', 'read'), async (req, res) => {
  try {
    const service = new TreatmentService(getDatabase());
    const tasks = service.getTasksForPlan(req.params.planId);
    res.json({ tasks });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/tasks/:id', requirePermission('risks', 'write'), async (req, res) => {
  try {
    const service = new TreatmentService(getDatabase());
    const task = service.updateTask(req.params.id, req.body);
    res.json({ task });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/tasks/:id', requirePermission('risks', 'write'), async (req, res) => {
  try {
    const service = new TreatmentService(getDatabase());
    service.deleteTask(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

