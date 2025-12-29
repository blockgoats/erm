import { Router } from 'express';
import { WorkflowService } from '../services/workflow.js';
import { getDatabase } from '../db/index.js';
import { authMiddleware, requirePermission } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware());

// Workflows CRUD
router.post('/', requirePermission('risks', 'write'), async (req, res) => {
  try {
    if (!req.user?.organization_id) {
      return res.status(400).json({ error: 'User has no organization' });
    }

    const service = new WorkflowService(getDatabase());
    const workflow = service.createWorkflow(req.user.organization_id, req.body);
    res.status(201).json({ workflow });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/', requirePermission('risks', 'read'), async (req, res) => {
  try {
    if (!req.user?.organization_id) {
      return res.status(400).json({ error: 'User has no organization' });
    }

    const service = new WorkflowService(getDatabase());
    const workflows = service.listWorkflows(req.user.organization_id, req.query);
    res.json({ workflows });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', requirePermission('risks', 'read'), async (req, res) => {
  try {
    const service = new WorkflowService(getDatabase());
    const workflow = service.getWorkflowById(req.params.id);

    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    if (workflow.organization_id !== req.user?.organization_id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Include steps and approvers
    const steps = service.getStepsForWorkflow(req.params.id);
    const stepsWithApprovers = steps.map(step => ({
      ...step,
      approvers: service.getApproversForStep(step.id),
    }));

    res.json({ workflow, steps: stepsWithApprovers });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', requirePermission('risks', 'write'), async (req, res) => {
  try {
    const service = new WorkflowService(getDatabase());
    const workflow = service.updateWorkflow(req.params.id, req.body);
    res.json({ workflow });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/:id/enable', requirePermission('risks', 'write'), async (req, res) => {
  try {
    const { enabled } = req.body;
    const service = new WorkflowService(getDatabase());
    service.setWorkflowEnabled(req.params.id, enabled);
    res.json({ message: `Workflow ${enabled ? 'enabled' : 'disabled'}` });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Workflow instances
router.post('/:id/start', requirePermission('risks', 'write'), async (req, res) => {
  try {
    const { resource_type, resource_id } = req.body;
    if (!resource_type || !resource_id) {
      return res.status(400).json({ error: 'resource_type and resource_id are required' });
    }

    const service = new WorkflowService(getDatabase());
    const instance = service.startWorkflowInstance(req.params.id, resource_type, resource_id);
    res.status(201).json({ instance });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/instances/:resourceType/:resourceId', requirePermission('risks', 'read'), async (req, res) => {
  try {
    const service = new WorkflowService(getDatabase());
    const instances = service.getInstancesForResource(req.params.resourceType, req.params.resourceId);
    res.json({ instances });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Step executions
router.get('/executions/:instanceId', requirePermission('risks', 'read'), async (req, res) => {
  try {
    const service = new WorkflowService(getDatabase());
    const executions = service.getStepExecutionsForInstance(req.params.instanceId);
    res.json({ executions });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Process approval
router.post('/executions/:stepExecutionId/approve', requirePermission('risks', 'write'), async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(400).json({ error: 'User not authenticated' });
    }

    const { status, comments } = req.body;
    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'status must be "approved" or "rejected"' });
    }

    const service = new WorkflowService(getDatabase());
    service.processApproval(req.params.stepExecutionId, req.user.id, status, comments);
    res.json({ message: `Approval ${status}` });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

