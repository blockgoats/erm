import { Router } from 'express';
import { GovernanceService } from '../services/governance.js';
import { getDatabase } from '../db/index.js';
import { authMiddleware, requirePermission } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware());

// Committees
router.get('/committees', requirePermission('risks', 'read'), async (req, res) => {
  try {
    if (!req.user?.organization_id) {
      return res.status(400).json({ error: 'User has no organization' });
    }

    const service = new GovernanceService(getDatabase());
    const committees = service.getCommittees(req.user.organization_id);
    res.json({ committees });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/committees', requirePermission('risks', 'write'), async (req, res) => {
  try {
    if (!req.user?.organization_id) {
      return res.status(400).json({ error: 'User has no organization' });
    }

    const service = new GovernanceService(getDatabase());
    const committee = service.createCommittee(req.user.organization_id, req.body);
    res.status(201).json({ committee });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// RACI Matrix
router.get('/raci', requirePermission('risks', 'read'), async (req, res) => {
  try {
    if (!req.user?.organization_id) {
      return res.status(400).json({ error: 'User has no organization' });
    }

    const service = new GovernanceService(getDatabase());
    const raci = service.getRACI(
      req.user.organization_id,
      req.query.resource_type as string,
      req.query.resource_id as string
    );
    res.json({ raci });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/raci', requirePermission('risks', 'write'), async (req, res) => {
  try {
    if (!req.user?.organization_id) {
      return res.status(400).json({ error: 'User has no organization' });
    }

    const service = new GovernanceService(getDatabase());
    const raci = service.createRACI(req.user.organization_id, req.body);
    res.status(201).json({ raci });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Policies
router.get('/policies', requirePermission('risks', 'read'), async (req, res) => {
  try {
    if (!req.user?.organization_id) {
      return res.status(400).json({ error: 'User has no organization' });
    }

    const service = new GovernanceService(getDatabase());
    const policies = req.query.hierarchy === 'true'
      ? service.getPolicyHierarchy(req.user.organization_id)
      : service.getPolicies(
          req.user.organization_id,
          req.query.policy_type as any,
          req.query.status as any
        );
    res.json({ policies });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/policies', requirePermission('risks', 'write'), async (req, res) => {
  try {
    if (!req.user?.organization_id) {
      return res.status(400).json({ error: 'User has no organization' });
    }

    const service = new GovernanceService(getDatabase());
    const policy = service.createPolicy(req.user.organization_id, req.body);
    res.status(201).json({ policy });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/policies/:id', requirePermission('risks', 'write'), async (req, res) => {
  try {
    const service = new GovernanceService(getDatabase());
    const policy = service.updatePolicy(req.params.id, {
      ...req.body,
      approved_by: req.body.status === 'approved' ? req.user?.id : undefined,
    });
    res.json({ policy });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Attestations
router.post('/attestations', requirePermission('risks', 'write'), async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(400).json({ error: 'User not authenticated' });
    }

    const { policy_id } = req.body;
    if (!policy_id) {
      return res.status(400).json({ error: 'policy_id is required' });
    }

    const service = new GovernanceService(getDatabase());
    const attestation = service.createAttestation(policy_id, req.user.id);
    res.status(201).json({ attestation });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/attestations/:id/process', requirePermission('risks', 'write'), async (req, res) => {
  try {
    const { status, comments } = req.body;
    if (!status || !['acknowledged', 'declined'].includes(status)) {
      return res.status(400).json({ error: 'status must be "acknowledged" or "declined"' });
    }

    const service = new GovernanceService(getDatabase());
    const attestation = service.processAttestation(req.params.id, status, comments);
    res.json({ attestation });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/attestations/policy/:policyId', requirePermission('risks', 'read'), async (req, res) => {
  try {
    const service = new GovernanceService(getDatabase());
    const attestations = service.getAttestationsForPolicy(req.params.policyId);
    res.json({ attestations });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

