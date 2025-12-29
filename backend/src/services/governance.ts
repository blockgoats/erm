import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';

export type CommitteeType = 'Board' | 'Executive' | 'Audit' | 'Risk' | 'Compliance' | 'Other';
export type PolicyType = 'Code of Conduct' | 'Policy' | 'Standard' | 'Procedure' | 'Guideline';
export type PolicyStatus = 'draft' | 'under_review' | 'approved' | 'active' | 'archived';
export type AttestationStatus = 'pending' | 'acknowledged' | 'declined';

export interface GovernanceCommittee {
  id: string;
  organization_id: string;
  committee_id: string;
  name: string;
  description?: string;
  committee_type?: CommitteeType;
  created_at: string;
  updated_at: string;
}

export interface CreateCommitteeDTO {
  committee_id?: string;
  name: string;
  description?: string;
  committee_type?: CommitteeType;
}

export interface RACIMatrix {
  id: string;
  organization_id: string;
  activity: string;
  resource_type: string;
  resource_id?: string;
  responsible?: string;
  accountable?: string;
  consulted?: string;
  informed?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateRACIDTO {
  activity: string;
  resource_type: string;
  resource_id?: string;
  responsible?: string;
  accountable?: string;
  consulted?: string;
  informed?: string;
}

export interface Policy {
  id: string;
  organization_id: string;
  policy_id: string;
  title: string;
  description?: string;
  policy_type: PolicyType;
  parent_policy_id?: string;
  status: PolicyStatus;
  approved_by?: string;
  approved_at?: string;
  version: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePolicyDTO {
  policy_id?: string;
  title: string;
  description?: string;
  policy_type: PolicyType;
  parent_policy_id?: string;
  version?: string;
}

export interface Attestation {
  id: string;
  policy_id: string;
  user_id: string;
  attestation_status: AttestationStatus;
  attested_at?: string;
  comments?: string;
  created_at: string;
}

export class GovernanceService {
  constructor(private db: Database.Database) {}

  // Committees
  createCommittee(orgId: string, dto: CreateCommitteeDTO): GovernanceCommittee {
    const id = uuidv4();
    const committeeId = dto.committee_id || `COMM-${id.substring(0, 8).toUpperCase()}`;

    const stmt = this.db.prepare(`
      INSERT INTO governance_committees (
        id, organization_id, committee_id, name, description, committee_type, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      orgId,
      committeeId,
      dto.name,
      dto.description || null,
      dto.committee_type || null,
      new Date().toISOString(),
      new Date().toISOString()
    );

    return this.getCommitteeById(id)!;
  }

  getCommittees(orgId: string): GovernanceCommittee[] {
    const stmt = this.db.prepare(`
      SELECT * FROM governance_committees 
      WHERE organization_id = ? 
      ORDER BY created_at DESC
    `);
    const rows = stmt.all(orgId) as any[];
    return rows.map(row => this.mapRowToCommittee(row));
  }

  // RACI Matrix
  createRACI(orgId: string, dto: CreateRACIDTO): RACIMatrix {
    const id = uuidv4();
    const stmt = this.db.prepare(`
      INSERT INTO raci_matrix (
        id, organization_id, activity, resource_type, resource_id,
        responsible, accountable, consulted, informed, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      orgId,
      dto.activity,
      dto.resource_type,
      dto.resource_id || null,
      dto.responsible || null,
      dto.accountable || null,
      dto.consulted || null,
      dto.informed || null,
      new Date().toISOString(),
      new Date().toISOString()
    );

    return this.getRACIById(id)!;
  }

  getRACI(orgId: string, resourceType?: string, resourceId?: string): RACIMatrix[] {
    let sql = 'SELECT * FROM raci_matrix WHERE organization_id = ?';
    const params: any[] = [orgId];

    if (resourceType) {
      sql += ' AND resource_type = ?';
      params.push(resourceType);
    }
    if (resourceId) {
      sql += ' AND resource_id = ?';
      params.push(resourceId);
    }

    sql += ' ORDER BY created_at DESC';

    const stmt = this.db.prepare(sql);
    const rows = stmt.all(...params) as any[];
    return rows.map(row => this.mapRowToRACI(row));
  }

  // Policies
  createPolicy(orgId: string, dto: CreatePolicyDTO): Policy {
    const id = uuidv4();
    const policyId = dto.policy_id || `POL-${id.substring(0, 8).toUpperCase()}`;

    const stmt = this.db.prepare(`
      INSERT INTO policy_hierarchy (
        id, organization_id, policy_id, title, description, policy_type,
        parent_policy_id, status, version, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      orgId,
      policyId,
      dto.title,
      dto.description || null,
      dto.policy_type,
      dto.parent_policy_id || null,
      'draft',
      dto.version || '1.0',
      new Date().toISOString(),
      new Date().toISOString()
    );

    return this.getPolicyById(id)!;
  }

  getPolicies(orgId: string, policyType?: PolicyType, status?: PolicyStatus): Policy[] {
    let sql = 'SELECT * FROM policy_hierarchy WHERE organization_id = ?';
    const params: any[] = [orgId];

    if (policyType) {
      sql += ' AND policy_type = ?';
      params.push(policyType);
    }
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY policy_type, created_at DESC';

    const stmt = this.db.prepare(sql);
    const rows = stmt.all(...params) as any[];
    return rows.map(row => this.mapRowToPolicy(row));
  }

  getPolicyHierarchy(orgId: string): Policy[] {
    const stmt = this.db.prepare(`
      SELECT * FROM policy_hierarchy 
      WHERE organization_id = ? 
      ORDER BY 
        CASE policy_type
          WHEN 'Code of Conduct' THEN 1
          WHEN 'Policy' THEN 2
          WHEN 'Standard' THEN 3
          WHEN 'Procedure' THEN 4
          WHEN 'Guideline' THEN 5
        END,
        parent_policy_id NULLS FIRST,
        created_at ASC
    `);
    const rows = stmt.all(orgId) as any[];
    return rows.map(row => this.mapRowToPolicy(row));
  }

  updatePolicy(id: string, dto: Partial<CreatePolicyDTO & { status?: PolicyStatus; approved_by?: string }>): Policy {
    const updates: string[] = [];
    const values: any[] = [];

    if (dto.title !== undefined) {
      updates.push('title = ?');
      values.push(dto.title);
    }
    if (dto.description !== undefined) {
      updates.push('description = ?');
      values.push(dto.description || null);
    }
    if (dto.status !== undefined) {
      updates.push('status = ?');
      values.push(dto.status);
      if (dto.status === 'approved' && dto.approved_by) {
        updates.push('approved_by = ?');
        updates.push('approved_at = ?');
        values.push(dto.approved_by);
        values.push(new Date().toISOString());
      }
    }

    if (updates.length === 0) {
      return this.getPolicyById(id)!;
    }

    updates.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    const sql = `UPDATE policy_hierarchy SET ${updates.join(', ')} WHERE id = ?`;
    this.db.prepare(sql).run(...values);

    return this.getPolicyById(id)!;
  }

  // Attestations
  createAttestation(policyId: string, userId: string): Attestation {
    const id = uuidv4();
    const stmt = this.db.prepare(`
      INSERT INTO attestations (
        id, policy_id, user_id, attestation_status, created_at
      ) VALUES (?, ?, ?, 'pending', ?)
    `);

    stmt.run(id, policyId, userId, new Date().toISOString());

    return this.getAttestationById(id)!;
  }

  processAttestation(id: string, status: 'acknowledged' | 'declined', comments?: string): Attestation {
    this.db.prepare(`
      UPDATE attestations 
      SET attestation_status = ?, attested_at = ?, comments = ?
      WHERE id = ?
    `).run(status, new Date().toISOString(), comments || null, id);

    return this.getAttestationById(id)!;
  }

  getAttestationsForPolicy(policyId: string): Attestation[] {
    const stmt = this.db.prepare(`
      SELECT * FROM attestations 
      WHERE policy_id = ? 
      ORDER BY created_at DESC
    `);
    const rows = stmt.all(policyId) as any[];
    return rows.map(row => this.mapRowToAttestation(row));
  }

  getAttestationsForUser(userId: string): Attestation[] {
    const stmt = this.db.prepare(`
      SELECT * FROM attestations 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `);
    const rows = stmt.all(userId) as any[];
    return rows.map(row => this.mapRowToAttestation(row));
  }

  private getCommitteeById(id: string): GovernanceCommittee | null {
    const stmt = this.db.prepare('SELECT * FROM governance_committees WHERE id = ?');
    const row = stmt.get(id) as any;
    if (!row) return null;
    return this.mapRowToCommittee(row);
  }

  private getRACIById(id: string): RACIMatrix | null {
    const stmt = this.db.prepare('SELECT * FROM raci_matrix WHERE id = ?');
    const row = stmt.get(id) as any;
    if (!row) return null;
    return this.mapRowToRACI(row);
  }

  private getPolicyById(id: string): Policy | null {
    const stmt = this.db.prepare('SELECT * FROM policy_hierarchy WHERE id = ?');
    const row = stmt.get(id) as any;
    if (!row) return null;
    return this.mapRowToPolicy(row);
  }

  private getAttestationById(id: string): Attestation | null {
    const stmt = this.db.prepare('SELECT * FROM attestations WHERE id = ?');
    const row = stmt.get(id) as any;
    if (!row) return null;
    return this.mapRowToAttestation(row);
  }

  private mapRowToCommittee(row: any): GovernanceCommittee {
    return {
      id: row.id,
      organization_id: row.organization_id,
      committee_id: row.committee_id,
      name: row.name,
      description: row.description || undefined,
      committee_type: row.committee_type || undefined,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private mapRowToRACI(row: any): RACIMatrix {
    return {
      id: row.id,
      organization_id: row.organization_id,
      activity: row.activity,
      resource_type: row.resource_type,
      resource_id: row.resource_id || undefined,
      responsible: row.responsible || undefined,
      accountable: row.accountable || undefined,
      consulted: row.consulted || undefined,
      informed: row.informed || undefined,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private mapRowToPolicy(row: any): Policy {
    return {
      id: row.id,
      organization_id: row.organization_id,
      policy_id: row.policy_id,
      title: row.title,
      description: row.description || undefined,
      policy_type: row.policy_type,
      parent_policy_id: row.parent_policy_id || undefined,
      status: row.status,
      approved_by: row.approved_by || undefined,
      approved_at: row.approved_at || undefined,
      version: row.version,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private mapRowToAttestation(row: any): Attestation {
    return {
      id: row.id,
      policy_id: row.policy_id,
      user_id: row.user_id,
      attestation_status: row.attestation_status,
      attested_at: row.attested_at || undefined,
      comments: row.comments || undefined,
      created_at: row.created_at,
    };
  }
}

