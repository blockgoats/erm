import { getDatabase } from '../db/index.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Data Import Service
 * Imports Day-1 data from Excel/CSV risk registers, GRC spreadsheets, etc.
 * 
 * Sources:
 * - Existing Excel risk registers
 * - GRC spreadsheets
 * - Security review documents
 * - Risk committee notes
 * - Interviews with CISO / ERM officer
 */

export interface ExcelRiskRow {
  riskId?: string;
  title: string;
  description: string;
  threat: string;
  vulnerability: string;
  impactDescription: string;
  impactType: 'Financial' | 'Operational' | 'Reputational' | 'Compliance' | 'Strategic';
  likelihood: number; // 1-5
  impact: number; // 1-5
  category: string;
  businessUnit?: string;
  system?: string;
  asset?: string;
  ownerRole?: string;
  responseType?: 'avoid' | 'mitigate' | 'transfer' | 'accept';
  status?: string;
}

export interface ExcelOrgStructureRow {
  organization: string;
  businessUnit: string;
  system?: string;
  systemOwnerRole?: string;
  asset?: string;
  assetType?: 'Application' | 'Database' | 'Cloud Service' | 'Infrastructure' | 'Network' | 'Other';
  assetCriticality?: 'Low' | 'Medium' | 'High';
  businessFunction?: string;
}

export class DataImportService {
  /**
   * Import organization structure from CSV/Excel
   * Expected format: organization, businessUnit, system, systemOwnerRole, asset, assetType, assetCriticality, businessFunction
   */
  static importOrgStructure(rows: ExcelOrgStructureRow[], organizationId: string) {
    const db = getDatabase();
    const buMap = new Map<string, string>();
    const systemMap = new Map<string, string>();
    const assetMap = new Map<string, string>();

    for (const row of rows) {
      // Create/Get Business Unit
      let buId = buMap.get(row.businessUnit);
      if (!buId) {
        buId = uuidv4();
        db.prepare(`
          INSERT INTO business_units (id, organization_id, name)
          VALUES (?, ?, ?)
        `).run(buId, organizationId, row.businessUnit);
        buMap.set(row.businessUnit, buId);
      }

      // Create/Get System
      if (row.system) {
        let systemId = systemMap.get(`${row.businessUnit}:${row.system}`);
        if (!systemId) {
          systemId = uuidv4();
          db.prepare(`
            INSERT INTO systems (id, business_unit_id, name, owner_role)
            VALUES (?, ?, ?, ?)
          `).run(systemId, buId, row.system, row.systemOwnerRole || 'System Owner');
          systemMap.set(`${row.businessUnit}:${row.system}`, systemId);
        }

        // Create Asset if provided
        if (row.asset) {
          let assetId = assetMap.get(row.asset);
          if (!assetId) {
            assetId = uuidv4();
            db.prepare(`
              INSERT INTO assets (id, system_id, organization_id, name, asset_type, criticality, business_function)
              VALUES (?, ?, ?, ?, ?, ?, ?)
            `).run(
              assetId,
              systemId,
              organizationId,
              row.asset,
              row.assetType || 'Other',
              row.assetCriticality || 'Medium',
              row.businessFunction || 'Business function not specified'
            );
            assetMap.set(row.asset, assetId);
          }
        }
      }
    }

    return {
      businessUnits: buMap.size,
      systems: systemMap.size,
      assets: assetMap.size,
    };
  }

  /**
   * Import risks from CSV/Excel risk register
   * Expected format matches ExcelRiskRow interface
   */
  static importRisks(rows: ExcelRiskRow[], organizationId: string, createdBy: string) {
    const db = getDatabase();
    const results = {
      imported: 0,
      errors: [] as string[],
    };

    // Get mappings for business units, systems, assets
    const buMap = new Map<string, string>();
    const systemMap = new Map<string, string>();
    const assetMap = new Map<string, string>();

    // Build lookup maps
    const bus = db.prepare(`
      SELECT id, name FROM business_units WHERE organization_id = ?
    `).all(organizationId) as Array<{ id: string; name: string }>;
    bus.forEach(bu => buMap.set(bu.name.toLowerCase(), bu.id));

    const systems = db.prepare(`
      SELECT id, name FROM systems WHERE business_unit_id IN (
        SELECT id FROM business_units WHERE organization_id = ?
      )
    `).all(organizationId) as Array<{ id: string; name: string }>;
    systems.forEach(s => systemMap.set(s.name.toLowerCase(), s.id));

    const assets = db.prepare(`
      SELECT id, name FROM assets WHERE organization_id = ?
    `).all(organizationId) as Array<{ id: string; name: string }>;
    assets.forEach(a => assetMap.set(a.name.toLowerCase(), a.id));

    const riskStmt = db.prepare(`
      INSERT INTO cyber_risks (
        id, organization_id, business_unit_id, system_id, asset_id, risk_id,
        title, description, threat, vulnerability, impact_description, impact_type,
        likelihood, impact, exposure, category, response_type, owner_role, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        // Validate required fields
        if (!row.title || !row.description || !row.threat || !row.vulnerability) {
          results.errors.push(`Row ${i + 1}: Missing required fields`);
          continue;
        }

        if (row.likelihood < 1 || row.likelihood > 5 || row.impact < 1 || row.impact > 5) {
          results.errors.push(`Row ${i + 1}: Likelihood and Impact must be 1-5`);
          continue;
        }

        const exposure = row.likelihood * row.impact;
        const riskId = row.riskId || `RISK-${String(i + 1).padStart(3, '0')}`;

        // Lookup IDs
        const buId = row.businessUnit ? buMap.get(row.businessUnit.toLowerCase()) : null;
        const systemId = row.system ? systemMap.get(row.system.toLowerCase()) : null;
        const assetId = row.asset ? assetMap.get(row.asset.toLowerCase()) : null;

        riskStmt.run(
          uuidv4(),
          organizationId,
          buId || null,
          systemId || null,
          assetId || null,
          riskId,
          row.title,
          row.description,
          row.threat,
          row.vulnerability,
          row.impactDescription,
          row.impactType || 'Operational',
          row.likelihood,
          row.impact,
          exposure,
          row.category || 'Uncategorized',
          row.responseType || null,
          row.ownerRole || null,
          createdBy
        );

        results.imported++;
      } catch (error: any) {
        results.errors.push(`Row ${i + 1}: ${error.message}`);
      }
    }

    return results;
  }

  /**
   * Import risk appetite statements
   */
  static importRiskAppetite(
    rows: Array<{
      objective: string;
      category: string;
      statement: string;
      toleranceThreshold: number;
    }>,
    organizationId: string
  ) {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO risk_appetite (id, organization_id, objective, category, statement, tolerance_threshold)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    let imported = 0;
    for (const row of rows) {
      try {
        stmt.run(uuidv4(), organizationId, row.objective, row.category, row.statement, row.toleranceThreshold);
        imported++;
      } catch (error: any) {
        console.error(`Error importing appetite: ${error.message}`);
      }
    }

    return { imported };
  }
}

