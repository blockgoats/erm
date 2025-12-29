import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';

export type FrameworkType = 'NIST' | 'ISO' | 'COSO' | 'SOX' | 'GDPR' | 'HIPAA' | 'PCI-DSS' | 'Other';
export type RequirementType = 'Control' | 'Policy' | 'Standard' | 'Procedure';
export type MappingType = 'fully_implements' | 'partially_implements' | 'supports';
export type EvidenceType = 'document' | 'test_result' | 'audit_finding' | 'certification';

export interface ComplianceFramework {
  id: string;
  organization_id: string;
  framework_id: string;
  name: string;
  description?: string;
  framework_type: FrameworkType;
  version?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateFrameworkDTO {
  framework_id?: string;
  name: string;
  description?: string;
  framework_type: FrameworkType;
  version?: string;
}

export interface ComplianceRequirement {
  id: string;
  framework_id: string;
  requirement_id: string;
  title: string;
  description?: string;
  requirement_type?: RequirementType;
  parent_requirement_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateRequirementDTO {
  requirement_id?: string;
  title: string;
  description?: string;
  requirement_type?: RequirementType;
  parent_requirement_id?: string;
}

export interface ComplianceControlMapping {
  id: string;
  requirement_id: string;
  control_id: string;
  mapping_type: MappingType;
  notes?: string;
  created_at: string;
}

export interface ComplianceCoverage {
  id: string;
  organization_id: string;
  framework_id: string;
  total_requirements: number;
  mapped_requirements: number;
  fully_covered: number;
  partially_covered: number;
  uncovered: number;
  coverage_percentage: number;
  last_calculated_at: string;
}

export class ComplianceService {
  constructor(private db: Database.Database) {}

  // Frameworks
  createFramework(orgId: string, dto: CreateFrameworkDTO): ComplianceFramework {
    const id = uuidv4();
    const frameworkId = dto.framework_id || `${dto.framework_type}-${id.substring(0, 8).toUpperCase()}`;

    const stmt = this.db.prepare(`
      INSERT INTO compliance_frameworks (
        id, organization_id, framework_id, name, description, framework_type, version, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      orgId,
      frameworkId,
      dto.name,
      dto.description || null,
      dto.framework_type,
      dto.version || null,
      new Date().toISOString(),
      new Date().toISOString()
    );

    return this.getFrameworkById(id)!;
  }

  getFrameworks(orgId: string): ComplianceFramework[] {
    const stmt = this.db.prepare(`
      SELECT * FROM compliance_frameworks 
      WHERE organization_id = ? 
      ORDER BY created_at DESC
    `);
    const rows = stmt.all(orgId) as any[];
    return rows.map(row => this.mapRowToFramework(row));
  }

  getFrameworkById(id: string): ComplianceFramework | null {
    const stmt = this.db.prepare('SELECT * FROM compliance_frameworks WHERE id = ?');
    const row = stmt.get(id) as any;
    if (!row) return null;
    return this.mapRowToFramework(row);
  }

  // Requirements
  createRequirement(frameworkId: string, dto: CreateRequirementDTO): ComplianceRequirement {
    const id = uuidv4();
    const requirementId = dto.requirement_id || `REQ-${id.substring(0, 8).toUpperCase()}`;

    const stmt = this.db.prepare(`
      INSERT INTO compliance_requirements (
        id, framework_id, requirement_id, title, description, requirement_type, parent_requirement_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      frameworkId,
      requirementId,
      dto.title,
      dto.description || null,
      dto.requirement_type || null,
      dto.parent_requirement_id || null,
      new Date().toISOString(),
      new Date().toISOString()
    );

    return this.getRequirementById(id)!;
  }

  getRequirements(frameworkId: string): ComplianceRequirement[] {
    const stmt = this.db.prepare(`
      SELECT * FROM compliance_requirements 
      WHERE framework_id = ? 
      ORDER BY requirement_id ASC
    `);
    const rows = stmt.all(frameworkId) as any[];
    return rows.map(row => this.mapRowToRequirement(row));
  }

  // Control Mappings
  mapControlToRequirement(requirementId: string, controlId: string, mappingType: MappingType, notes?: string): ComplianceControlMapping {
    const id = uuidv4();
    const stmt = this.db.prepare(`
      INSERT INTO compliance_control_mappings (
        id, requirement_id, control_id, mapping_type, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      requirementId,
      controlId,
      mappingType,
      notes || null,
      new Date().toISOString()
    );

    return this.getControlMappingById(id)!;
  }

  getControlMappingsForRequirement(requirementId: string): ComplianceControlMapping[] {
    const stmt = this.db.prepare(`
      SELECT * FROM compliance_control_mappings 
      WHERE requirement_id = ? 
      ORDER BY created_at DESC
    `);
    const rows = stmt.all(requirementId) as any[];
    return rows.map(row => this.mapRowToControlMapping(row));
  }

  getControlMappingsForControl(controlId: string): ComplianceControlMapping[] {
    const stmt = this.db.prepare(`
      SELECT * FROM compliance_control_mappings 
      WHERE control_id = ? 
      ORDER BY created_at DESC
    `);
    const rows = stmt.all(controlId) as any[];
    return rows.map(row => this.mapRowToControlMapping(row));
  }

  deleteControlMapping(id: string): void {
    this.db.prepare('DELETE FROM compliance_control_mappings WHERE id = ?').run(id);
  }

  // Coverage Calculation
  calculateCoverage(orgId: string, frameworkId: string): ComplianceCoverage {
    const requirements = this.getRequirements(frameworkId);
    const totalRequirements = requirements.length;

    let mappedRequirements = 0;
    let fullyCovered = 0;
    let partiallyCovered = 0;

    for (const req of requirements) {
      const mappings = this.getControlMappingsForRequirement(req.id);
      if (mappings.length > 0) {
        mappedRequirements++;
        const hasFull = mappings.some(m => m.mapping_type === 'fully_implements');
        if (hasFull) {
          fullyCovered++;
        } else {
          partiallyCovered++;
        }
      }
    }

    const uncovered = totalRequirements - mappedRequirements;
    const coveragePercentage = totalRequirements > 0 
      ? ((fullyCovered + partiallyCovered * 0.5) / totalRequirements) * 100 
      : 0;

    // Update or create coverage record
    const existing = this.getCoverage(orgId, frameworkId);
    if (existing) {
      this.db.prepare(`
        UPDATE compliance_coverage 
        SET total_requirements = ?, mapped_requirements = ?, fully_covered = ?,
            partially_covered = ?, uncovered = ?, coverage_percentage = ?,
            last_calculated_at = ?
        WHERE id = ?
      `).run(
        totalRequirements,
        mappedRequirements,
        fullyCovered,
        partiallyCovered,
        uncovered,
        coveragePercentage,
        new Date().toISOString(),
        existing.id
      );
      return this.getCoverage(orgId, frameworkId)!;
    } else {
      const id = uuidv4();
      this.db.prepare(`
        INSERT INTO compliance_coverage (
          id, organization_id, framework_id, total_requirements, mapped_requirements,
          fully_covered, partially_covered, uncovered, coverage_percentage, last_calculated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        orgId,
        frameworkId,
        totalRequirements,
        mappedRequirements,
        fullyCovered,
        partiallyCovered,
        uncovered,
        coveragePercentage,
        new Date().toISOString()
      );
      return this.getCoverage(orgId, frameworkId)!;
    }
  }

  getCoverage(orgId: string, frameworkId: string): ComplianceCoverage | null {
    const stmt = this.db.prepare(`
      SELECT * FROM compliance_coverage 
      WHERE organization_id = ? AND framework_id = ?
    `);
    const row = stmt.get(orgId, frameworkId) as any;
    if (!row) return null;
    return this.mapRowToCoverage(row);
  }

  getAllCoverage(orgId: string): ComplianceCoverage[] {
    const stmt = this.db.prepare(`
      SELECT * FROM compliance_coverage 
      WHERE organization_id = ? 
      ORDER BY coverage_percentage DESC
    `);
    const rows = stmt.all(orgId) as any[];
    return rows.map(row => this.mapRowToCoverage(row));
  }

  private getRequirementById(id: string): ComplianceRequirement | null {
    const stmt = this.db.prepare('SELECT * FROM compliance_requirements WHERE id = ?');
    const row = stmt.get(id) as any;
    if (!row) return null;
    return this.mapRowToRequirement(row);
  }

  private getControlMappingById(id: string): ComplianceControlMapping | null {
    const stmt = this.db.prepare('SELECT * FROM compliance_control_mappings WHERE id = ?');
    const row = stmt.get(id) as any;
    if (!row) return null;
    return this.mapRowToControlMapping(row);
  }

  private mapRowToFramework(row: any): ComplianceFramework {
    return {
      id: row.id,
      organization_id: row.organization_id,
      framework_id: row.framework_id,
      name: row.name,
      description: row.description || undefined,
      framework_type: row.framework_type,
      version: row.version || undefined,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private mapRowToRequirement(row: any): ComplianceRequirement {
    return {
      id: row.id,
      framework_id: row.framework_id,
      requirement_id: row.requirement_id,
      title: row.title,
      description: row.description || undefined,
      requirement_type: row.requirement_type || undefined,
      parent_requirement_id: row.parent_requirement_id || undefined,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private mapRowToControlMapping(row: any): ComplianceControlMapping {
    return {
      id: row.id,
      requirement_id: row.requirement_id,
      control_id: row.control_id,
      mapping_type: row.mapping_type,
      notes: row.notes || undefined,
      created_at: row.created_at,
    };
  }

  private mapRowToCoverage(row: any): ComplianceCoverage {
    return {
      id: row.id,
      organization_id: row.organization_id,
      framework_id: row.framework_id,
      total_requirements: row.total_requirements,
      mapped_requirements: row.mapped_requirements,
      fully_covered: row.fully_covered,
      partially_covered: row.partially_covered,
      uncovered: row.uncovered,
      coverage_percentage: row.coverage_percentage,
      last_calculated_at: row.last_calculated_at,
    };
  }
}

