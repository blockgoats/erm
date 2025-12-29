import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { EnterpriseRisk, CyberRisk, RiskCategory, RiskStatus } from '../models/types.js';
import { normalizeExposure } from './riskScoring.js';

export interface EnterpriseRiskComponent {
  enterprise_risk_id: string;
  cyber_risk_id: string;
}

export class EnterpriseRiskService {
  constructor(private db: Database.Database) {}

  /**
   * Aggregate cybersecurity risks into enterprise risks
   * Groups by category and normalizes exposure for comparison
   */
  aggregateRisks(orgId: string): EnterpriseRisk[] {
    // Get all active cybersecurity risks
    const cyberRisks = this.db.prepare(`
      SELECT * FROM cyber_risks 
      WHERE organization_id = ? AND status != 'closed'
      ORDER BY exposure DESC
    `).all(orgId) as any[];

    // Group by category
    const risksByCategory = new Map<RiskCategory, CyberRisk[]>();
    
    for (const riskRow of cyberRisks) {
      const risk = this.mapRowToRisk(riskRow);
      const category = risk.category;
      
      if (!risksByCategory.has(category)) {
        risksByCategory.set(category, []);
      }
      risksByCategory.get(category)!.push(risk);
    }

    // Create enterprise risks from categories
    const enterpriseRisks: EnterpriseRisk[] = [];
    const now = new Date().toISOString();

    for (const [category, risks] of risksByCategory.entries()) {
      // Calculate aggregated exposure (sum of normalized exposures)
      const aggregatedExposure = risks.reduce((sum, risk) => {
        return sum + normalizeExposure(risk.exposure);
      }, 0) * 25; // Denormalize back to 0-25 scale for display

      // Deduplicate similar risks (same threat + vulnerability pattern)
      const uniqueRisks = this.deduplicateRisks(risks);

      // Create enterprise risk
      const enterpriseRisk: EnterpriseRisk = {
        id: uuidv4(),
        organization_id: orgId,
        title: `${category.charAt(0).toUpperCase() + category.slice(1)} Risk`,
        description: `Aggregated ${category} risks affecting the enterprise`,
        aggregated_exposure: aggregatedExposure,
        category,
        priority_rank: undefined, // Will be set by prioritizeRisks
        status: 'active',
        created_at: now,
        updated_at: now,
      };

      // Save enterprise risk
      this.saveEnterpriseRisk(enterpriseRisk, uniqueRisks);
      enterpriseRisks.push(enterpriseRisk);
    }

    // Prioritize and update ranks
    const prioritized = this.prioritizeRisks(enterpriseRisks);
    for (const risk of prioritized) {
      this.updatePriorityRank(risk.id, risk.priority_rank!);
    }

    return prioritized;
  }

  /**
   * Deduplicate risks with similar threat/vulnerability patterns
   */
  private deduplicateRisks(risks: CyberRisk[]): CyberRisk[] {
    const seen = new Map<string, CyberRisk>();
    
    for (const risk of risks) {
      // Create a key from threat + vulnerability (normalized)
      const key = `${risk.threat.toLowerCase().trim()}:${risk.vulnerability.toLowerCase().trim()}`;
      
      if (!seen.has(key)) {
        seen.set(key, risk);
      } else {
        // Keep the one with higher exposure
        const existing = seen.get(key)!;
        if (risk.exposure > existing.exposure) {
          seen.set(key, risk);
        }
      }
    }
    
    return Array.from(seen.values());
  }

  /**
   * Prioritize enterprise risks by aggregated exposure
   */
  private prioritizeRisks(risks: EnterpriseRisk[]): EnterpriseRisk[] {
    const sorted = [...risks].sort((a, b) => b.aggregated_exposure - a.aggregated_exposure);
    sorted.forEach((risk, index) => {
      risk.priority_rank = index + 1;
    });
    return sorted;
  }

  /**
   * Save enterprise risk and link to component cyber risks
   */
  private saveEnterpriseRisk(enterpriseRisk: EnterpriseRisk, componentRisks: CyberRisk[]): void {
    // Check if enterprise risk already exists for this category
    const existing = this.db.prepare(`
      SELECT * FROM enterprise_risks 
      WHERE organization_id = ? AND category = ?
    `).get(enterpriseRisk.organization_id, enterpriseRisk.category) as any;

    let enterpriseRiskId: string;

    if (existing) {
      // Update existing
      enterpriseRiskId = existing.id;
      this.db.prepare(`
        UPDATE enterprise_risks 
        SET title = ?, description = ?, aggregated_exposure = ?, updated_at = ?
        WHERE id = ?
      `).run(
        enterpriseRisk.title,
        enterpriseRisk.description,
        enterpriseRisk.aggregated_exposure,
        enterpriseRisk.updated_at,
        enterpriseRiskId
      );

      // Clear existing components
      this.db.prepare('DELETE FROM enterprise_risk_components WHERE enterprise_risk_id = ?')
        .run(enterpriseRiskId);
    } else {
      // Create new
      enterpriseRiskId = enterpriseRisk.id;
      this.db.prepare(`
        INSERT INTO enterprise_risks (
          id, organization_id, title, description, aggregated_exposure, 
          category, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        enterpriseRiskId,
        enterpriseRisk.organization_id,
        enterpriseRisk.title,
        enterpriseRisk.description,
        enterpriseRisk.aggregated_exposure,
        enterpriseRisk.category,
        enterpriseRisk.status,
        enterpriseRisk.created_at,
        enterpriseRisk.updated_at
      );
    }

    // Link component risks
    const linkStmt = this.db.prepare(`
      INSERT OR IGNORE INTO enterprise_risk_components (enterprise_risk_id, cyber_risk_id)
      VALUES (?, ?)
    `);

    for (const componentRisk of componentRisks) {
      linkStmt.run(enterpriseRiskId, componentRisk.id);
    }
  }

  /**
   * Update priority rank
   */
  private updatePriorityRank(enterpriseRiskId: string, rank: number): void {
    this.db.prepare(`
      UPDATE enterprise_risks SET priority_rank = ? WHERE id = ?
    `).run(rank, enterpriseRiskId);
  }

  /**
   * Get all enterprise risks for organization
   */
  listEnterpriseRisks(orgId: string, filters?: {
    category?: RiskCategory;
    min_exposure?: number;
    max_exposure?: number;
  }): EnterpriseRisk[] {
    let sql = 'SELECT * FROM enterprise_risks WHERE organization_id = ?';
    const params: any[] = [orgId];

    if (filters) {
      if (filters.category) {
        sql += ' AND category = ?';
        params.push(filters.category);
      }
      if (filters.min_exposure !== undefined) {
        sql += ' AND aggregated_exposure >= ?';
        params.push(filters.min_exposure);
      }
      if (filters.max_exposure !== undefined) {
        sql += ' AND aggregated_exposure <= ?';
        params.push(filters.max_exposure);
      }
    }

    sql += ' ORDER BY priority_rank ASC, aggregated_exposure DESC';

    const stmt = this.db.prepare(sql);
    const rows = stmt.all(...params) as any[];
    return rows.map(row => this.mapRowToEnterpriseRisk(row));
  }

  /**
   * Get enterprise risk by ID
   */
  getEnterpriseRiskById(id: string): EnterpriseRisk | null {
    const stmt = this.db.prepare('SELECT * FROM enterprise_risks WHERE id = ?');
    const row = stmt.get(id) as any;
    if (!row) return null;
    return this.mapRowToEnterpriseRisk(row);
  }

  /**
   * Get component cyber risks for an enterprise risk
   */
  getComponentRisks(enterpriseRiskId: string): CyberRisk[] {
    const stmt = this.db.prepare(`
      SELECT cr.* FROM cyber_risks cr
      INNER JOIN enterprise_risk_components erc ON cr.id = erc.cyber_risk_id
      WHERE erc.enterprise_risk_id = ?
      ORDER BY cr.exposure DESC
    `);
    const rows = stmt.all(enterpriseRiskId) as any[];
    return rows.map(row => this.mapRowToRisk(row));
  }

  /**
   * Refresh enterprise risks (re-aggregate)
   */
  refreshEnterpriseRisks(orgId: string): EnterpriseRisk[] {
    return this.aggregateRisks(orgId);
  }

  private mapRowToEnterpriseRisk(row: any): EnterpriseRisk {
    return {
      id: row.id,
      organization_id: row.organization_id,
      title: row.title,
      description: row.description,
      aggregated_exposure: row.aggregated_exposure,
      category: row.category,
      priority_rank: row.priority_rank || undefined,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private mapRowToRisk(row: any): CyberRisk {
    return {
      id: row.id,
      organization_id: row.organization_id,
      business_unit_id: row.business_unit_id || undefined,
      system_id: row.system_id || undefined,
      asset_id: row.asset_id || undefined,
      risk_id: row.risk_id || `RISK-${row.id.substring(0, 8)}`,
      title: row.title,
      description: row.description,
      threat: row.threat,
      vulnerability: row.vulnerability,
      impact_description: row.impact_description,
      impact_type: row.impact_type || 'Operational',
      likelihood: row.likelihood,
      impact: row.impact,
      exposure: row.exposure,
      category: row.category,
      response_type: row.response_type || undefined,
      owner_role: row.owner_role || undefined,
      status: row.status as RiskStatus,
      owner_id: row.owner_id || undefined,
      created_by: row.created_by,
      created_at: row.created_at,
      updated_at: row.updated_at,
      reviewed_at: row.reviewed_at || undefined,
      next_review_at: row.next_review_at || undefined,
    };
  }
}

