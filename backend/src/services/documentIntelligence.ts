/**
 * Document Intelligence Service
 * 
 * Phase 1 MVP: Basic PDF parsing and risk extraction
 * - Layer 1: PDF parsing (text extraction)
 * - Layer 2: Basic risk extraction (pattern matching)
 * - Auto-create risk register entries
 * - Review queue for low-confidence extractions
 */

import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { RiskRegisterService } from './riskRegister.js';
import { NLPExtractor } from './nlpExtractor.js';

// pdf-parse is a CommonJS module, use dynamic import
let pdfParse: any;
async function getPdfParse() {
  if (!pdfParse) {
    pdfParse = (await import('pdf-parse')).default;
  }
  return pdfParse;
}

export interface Document {
  id: string;
  organization_id: string;
  file_name: string;
  file_path: string;
  file_hash: string;
  file_type: string;
  document_type: 'compliance_report' | 'audit_finding' | 'contract' | 'policy' | 'risk_assessment' | 'other' | null;
  version_number: number;
  parent_document_id: string | null;
  uploaded_by: string;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  processing_error: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExtractedClause {
  id: string;
  document_id: string;
  clause_text: string;
  clause_number: string | null;
  clause_type: 'obligation' | 'prohibition' | 'penalty' | 'condition' | 'right' | 'definition' | 'other' | null;
  confidence_score: number;
  requires_review: boolean;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_status: 'pending' | 'approved' | 'rejected' | 'modified' | null;
  created_at: string;
  // Phase 2: Enhanced metadata
  actors?: Array<{ actor: string; role?: string; action: string }>;
  deadlines?: Array<{ text: string; deadline: Date | null; relative: string | null }>;
  dependencies?: Array<{ depends_on: string; condition: string }>;
  ambiguities?: Array<{ vague_terms: string[]; recommendation: string }>;
}

export interface ExtractedRisk {
  title: string;
  description: string;
  threat: string;
  vulnerability: string;
  impact_description: string;
  category: string;
  likelihood: number; // 1-5
  impact: number; // 1-5
  source_clause: string;
  confidence: number; // 0-1
  requires_review: boolean;
}

export interface DocumentProcessingResult {
  document: Document;
  extracted_risks: ExtractedRisk[];
  extracted_clauses: ExtractedClause[];
  created_risks: string[]; // Risk IDs
  review_queue_count: number;
}

export interface CreateDocumentDTO {
  file_name: string;
  file_content: string; // Base64 encoded
  file_type: string;
  document_type?: 'compliance_report' | 'audit_finding' | 'contract' | 'policy' | 'risk_assessment' | 'other';
  organization_id: string;
}

export class DocumentIntelligenceService {
  private uploadDir: string;
  private riskRegisterService: RiskRegisterService;
  private nlpExtractor: NLPExtractor;

  constructor(private db: Database.Database) {
    this.uploadDir = process.env.DOCUMENT_UPLOAD_DIR || './uploads/documents';
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
    this.riskRegisterService = new RiskRegisterService(db);
    this.nlpExtractor = new NLPExtractor();
  }

  /**
   * Upload and process a document
   */
  async uploadDocument(userId: string, dto: CreateDocumentDTO): Promise<Document> {
    const id = uuidv4();
    const fileExtension = dto.file_name.split('.').pop()?.toLowerCase() || 'bin';
    const fileName = `${id}.${fileExtension}`;
    const filePath = join(this.uploadDir, fileName);

    // Decode base64 and save file
    let fileBuffer: Buffer;
    try {
      fileBuffer = Buffer.from(dto.file_content, 'base64');
      writeFileSync(filePath, fileBuffer);
    } catch (error) {
      throw new Error('Failed to save document file');
    }

    // Calculate file hash for version detection
    const fileHash = createHash('sha256').update(fileBuffer).digest('hex');

    // Check if this is a new version of an existing document
    const existingDoc = this.db.prepare(`
      SELECT id, version_number FROM documents 
      WHERE file_hash = ? AND organization_id = ?
      ORDER BY version_number DESC
      LIMIT 1
    `).get(fileHash, dto.organization_id) as { id: string; version_number: number } | undefined;

    const parentDocumentId = existingDoc?.id || null;
    const versionNumber = existingDoc ? existingDoc.version_number + 1 : 1;

    const now = new Date().toISOString();

    // Insert document record
    const stmt = this.db.prepare(`
      INSERT INTO documents (
        id, organization_id, file_name, file_path, file_hash, file_type,
        document_type, version_number, parent_document_id, uploaded_by,
        processing_status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
    `);

    stmt.run(
      id,
      dto.organization_id,
      dto.file_name,
      filePath,
      fileHash,
      dto.file_type,
      dto.document_type || null,
      versionNumber,
      parentDocumentId,
      userId,
      now,
      now
    );

    // Process document asynchronously (in MVP, we'll do it synchronously)
    try {
      await this.processDocument(id);
    } catch (error: any) {
      // Update status to failed
      this.db.prepare(`
        UPDATE documents 
        SET processing_status = 'failed', processing_error = ?, updated_at = ?
        WHERE id = ?
      `).run(error.message, new Date().toISOString(), id);
      throw error;
    }

    return this.getDocumentById(id)!;
  }

  /**
   * Process a document: parse PDF and extract risks
   */
  async processDocument(documentId: string): Promise<DocumentProcessingResult> {
    const document = this.getDocumentById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    // Update status to processing
    this.db.prepare(`
      UPDATE documents 
      SET processing_status = 'processing', updated_at = ?
      WHERE id = ?
    `).run(new Date().toISOString(), documentId);

    try {
      // Layer 1: Parse PDF
      const parsedText = await this.parsePDF(document.file_path);

      // Layer 2: Extract risks and clauses
      const { risks, clauses } = await this.extractRisksAndClauses(parsedText, documentId);

      // Save extracted clauses
      const clauseIds: string[] = [];
      for (const clause of clauses) {
        const clauseId = this.saveExtractedClause(clause);
        clauseIds.push(clauseId);
      }

      // Create risk register entries for high-confidence extractions
      const createdRiskIds: string[] = [];
      for (const risk of risks) {
        if (risk.confidence >= 0.7 && !risk.requires_review) {
          try {
            const createdRisk = this.riskRegisterService.createRisk(
              document.organization_id,
              document.uploaded_by,
              {
                title: risk.title,
                description: risk.description,
                threat: risk.threat,
                vulnerability: risk.vulnerability,
                impact_description: risk.impact_description,
                impact_type: 'Compliance', // Default for document-extracted risks
                likelihood: risk.likelihood,
                impact: risk.impact,
                category: this.mapCategoryToRiskCategory(risk.category),
                owner_role: 'Risk Manager', // Default, can be updated
                response_type: 'mitigate',
              }
            );
            createdRiskIds.push(createdRisk.id);
          } catch (error) {
            console.error(`Failed to create risk from extraction: ${error}`);
            // Continue with other risks
          }
        }
      }

      // Update status to completed
      this.db.prepare(`
        UPDATE documents 
        SET processing_status = 'completed', updated_at = ?
        WHERE id = ?
      `).run(new Date().toISOString(), documentId);

      const reviewQueueCount = risks.filter(r => r.requires_review).length + 
                                clauses.filter(c => c.requires_review).length;

      return {
        document: this.getDocumentById(documentId)!,
        extracted_risks: risks,
        extracted_clauses: clauses,
        created_risks: createdRiskIds,
        review_queue_count: reviewQueueCount,
      };
    } catch (error: any) {
      // Update status to failed
      this.db.prepare(`
        UPDATE documents 
        SET processing_status = 'failed', processing_error = ?, updated_at = ?
        WHERE id = ?
      `).run(error.message, new Date().toISOString(), documentId);
      throw error;
    }
  }

  /**
   * Layer 1: Parse PDF and extract text
   */
  private async parsePDF(filePath: string): Promise<string> {
    try {
      const pdfParseFn = await getPdfParse();
      const dataBuffer = readFileSync(filePath);
      const data = await pdfParseFn(dataBuffer);
      return data.text;
    } catch (error: any) {
      throw new Error(`Failed to parse PDF: ${error.message}`);
    }
  }

  /**
   * Layer 2: Extract risks and clauses from text (MVP: pattern matching)
   */
  private async extractRisksAndClauses(
    text: string,
    documentId: string
  ): Promise<{ risks: ExtractedRisk[]; clauses: ExtractedClause[] }> {
    const risks: ExtractedRisk[] = [];
    const clauses: ExtractedClause[] = [];

    // Split text into sentences/paragraphs
    const sentences = text.split(/[.!?]\s+/).filter(s => s.length > 20);

    // Pattern matching for risk indicators (MVP approach)
    const riskPatterns = [
      {
        pattern: /(?:risk|threat|vulnerability|exposure|breach|attack|compromise)/i,
        category: 'Security',
        confidence: 0.6,
      },
      {
        pattern: /(?:non.?compliance|violation|penalty|fine|sanction)/i,
        category: 'Compliance',
        confidence: 0.7,
      },
      {
        pattern: /(?:data.?loss|data.?breach|privacy.?violation)/i,
        category: 'Privacy',
        confidence: 0.75,
      },
      {
        pattern: /(?:system.?failure|outage|downtime|availability)/i,
        category: 'Availability',
        confidence: 0.65,
      },
    ];

    // Extract clauses (simple: sentences with obligation indicators)
    const obligationPatterns = [
      /(?:shall|must|required|mandatory|obligated)/i,
      /(?:must not|shall not|prohibited|forbidden)/i,
      /(?:penalty|fine|sanction|consequence)/i,
    ];

    let clauseNumber = 1;
    for (const sentence of sentences) {
      // Use NLP extractor for enhanced classification
      const classification = this.nlpExtractor.classifyClause(sentence);
      
      // Only process if it's a meaningful clause type
      if (classification.type !== 'other' && sentence.length > 30) {
        // Extract additional intelligence
        const actors = this.nlpExtractor.extractActors(sentence);
        const deadlines = this.nlpExtractor.extractDeadlines(sentence);
        const dependencies = this.nlpExtractor.extractDependencies(sentence);
        const ambiguities = this.nlpExtractor.detectAmbiguity(sentence);

        // Calculate enhanced confidence
        const enhancedConfidence = this.nlpExtractor.calculateConfidence(
          classification,
          actors.length > 0,
          deadlines.length > 0,
          dependencies.length > 0,
          ambiguities.length > 0
        );

        // Store clause with enhanced metadata
        const clauseId = uuidv4();
        clauses.push({
          id: clauseId,
          document_id: documentId,
          clause_text: sentence.substring(0, 500), // Limit length
          clause_number: `${clauseNumber++}`,
          clause_type: classification.type,
          confidence_score: enhancedConfidence,
          requires_review: enhancedConfidence < 0.8 || ambiguities.length > 0,
          reviewed_by: null,
          reviewed_at: null,
          review_status: 'pending',
          created_at: new Date().toISOString(),
        });

        // Store extracted metadata in compliance_obligations if it's an obligation
        if (classification.type === 'obligation' && actors.length > 0) {
          const obligation = actors[0];
          const deadline = deadlines.length > 0 ? deadlines[0] : null;

          this.db.prepare(`
            INSERT INTO compliance_obligations (
              id, document_id, clause_id, obligation_text,
              extracted_action, deadline_date, owner_role, status, evidence_required, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 0, ?, ?)
          `).run(
            uuidv4(),
            documentId,
            clauseId,
            sentence.substring(0, 500),
            obligation.action,
            deadline?.deadline?.toISOString() || null,
            obligation.role || 'Risk Manager',
            new Date().toISOString(),
            new Date().toISOString()
          );
        }
      }

      // Check for risk patterns
      for (const riskPattern of riskPatterns) {
        if (riskPattern.pattern.test(sentence)) {
          // Extract a risk scenario
          const riskTitle = sentence.substring(0, 100);
          const riskDescription = sentence;

          risks.push({
            title: riskTitle || 'Risk identified in document',
            description: riskDescription,
            threat: this.extractThreat(sentence),
            vulnerability: this.extractVulnerability(sentence),
            impact_description: this.extractImpact(sentence),
            category: riskPattern.category,
            likelihood: this.estimateLikelihood(sentence),
            impact: this.estimateImpact(sentence),
            source_clause: sentence.substring(0, 200),
            confidence: riskPattern.confidence,
            requires_review: riskPattern.confidence < 0.8,
          });

          break; // Only one risk per sentence
        }
      }
    }

    return { risks, clauses };
  }

  /**
   * Helper: Extract threat from text
   */
  private extractThreat(text: string): string {
    const threatKeywords = ['attack', 'breach', 'compromise', 'threat', 'malicious'];
    for (const keyword of threatKeywords) {
      if (text.toLowerCase().includes(keyword)) {
        return `Potential ${keyword} identified in document`;
      }
    }
    return 'Threat identified in document';
  }

  /**
   * Helper: Extract vulnerability from text
   */
  private extractVulnerability(text: string): string {
    const vulnKeywords = ['vulnerability', 'weakness', 'gap', 'deficiency', 'exposure'];
    for (const keyword of vulnKeywords) {
      if (text.toLowerCase().includes(keyword)) {
        return `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} identified`;
      }
    }
    return 'Vulnerability identified in document';
  }

  /**
   * Helper: Extract impact from text
   */
  private extractImpact(text: string): string {
    // Look for impact indicators
    if (text.match(/(?:penalty|fine|sanction)/i)) {
      return 'Financial and compliance impact';
    }
    if (text.match(/(?:data.?loss|breach)/i)) {
      return 'Data breach and privacy impact';
    }
    if (text.match(/(?:outage|downtime)/i)) {
      return 'Operational disruption';
    }
    return 'Impact to be assessed';
  }

  /**
   * Helper: Estimate likelihood (1-5) from text
   */
  private estimateLikelihood(text: string): number {
    // Simple heuristic
    if (text.match(/(?:high|likely|probable|frequent)/i)) return 4;
    if (text.match(/(?:medium|moderate|possible)/i)) return 3;
    if (text.match(/(?:low|unlikely|rare)/i)) return 2;
    return 3; // Default to medium
  }

  /**
   * Helper: Estimate impact (1-5) from text
   */
  private estimateImpact(text: string): number {
    // Simple heuristic
    if (text.match(/(?:critical|severe|major|significant)/i)) return 5;
    if (text.match(/(?:high|substantial)/i)) return 4;
    if (text.match(/(?:medium|moderate)/i)) return 3;
    if (text.match(/(?:low|minor|minimal)/i)) return 2;
    return 3; // Default to medium
  }

  /**
   * Helper: Map extracted category to RiskCategory type
   */
  private mapCategoryToRiskCategory(category: string): 'confidentiality' | 'integrity' | 'availability' | 'compliance' | 'reputation' | 'financial' {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('compliance')) return 'compliance';
    if (categoryLower.includes('privacy') || categoryLower.includes('confidential')) return 'confidentiality';
    if (categoryLower.includes('availability') || categoryLower.includes('uptime')) return 'availability';
    if (categoryLower.includes('financial') || categoryLower.includes('revenue')) return 'financial';
    if (categoryLower.includes('reputation') || categoryLower.includes('brand')) return 'reputation';
    return 'compliance'; // Default for document-extracted risks
  }

  /**
   * Save extracted clause to database
   */
  private saveExtractedClause(clause: Omit<ExtractedClause, 'id' | 'created_at'>): string {
    const id = uuidv4();
    const now = new Date().toISOString();

    this.db.prepare(`
      INSERT INTO extracted_clauses (
        id, document_id, clause_text, clause_number, clause_type,
        confidence_score, requires_review, review_status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)
    `).run(
      id,
      clause.document_id,
      clause.clause_text,
      clause.clause_number,
      clause.clause_type,
      clause.confidence_score,
      clause.requires_review ? 1 : 0,
      now
    );

    return id;
  }

  /**
   * Get document by ID
   */
  getDocumentById(id: string): Document | null {
    const row = this.db.prepare('SELECT * FROM documents WHERE id = ?').get(id) as any;
    if (!row) return null;

    return {
      id: row.id,
      organization_id: row.organization_id,
      file_name: row.file_name,
      file_path: row.file_path,
      file_hash: row.file_hash,
      file_type: row.file_type,
      document_type: row.document_type,
      version_number: row.version_number,
      parent_document_id: row.parent_document_id,
      uploaded_by: row.uploaded_by,
      processing_status: row.processing_status,
      processing_error: row.processing_error,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  /**
   * List documents for an organization
   */
  listDocuments(orgId: string): Document[] {
    const rows = this.db.prepare(`
      SELECT * FROM documents 
      WHERE organization_id = ? 
      ORDER BY created_at DESC
    `).all(orgId) as any[];

    return rows.map(row => ({
      id: row.id,
      organization_id: row.organization_id,
      file_name: row.file_name,
      file_path: row.file_path,
      file_hash: row.file_hash,
      file_type: row.file_type,
      document_type: row.document_type,
      version_number: row.version_number,
      parent_document_id: row.parent_document_id,
      uploaded_by: row.uploaded_by,
      processing_status: row.processing_status,
      processing_error: row.processing_error,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));
  }

  /**
   * Get review queue (clauses requiring review)
   */
  getReviewQueue(orgId: string): ExtractedClause[] {
    const rows = this.db.prepare(`
      SELECT ec.* FROM extracted_clauses ec
      JOIN documents d ON ec.document_id = d.id
      WHERE d.organization_id = ? 
        AND ec.requires_review = 1
        AND ec.review_status = 'pending'
      ORDER BY ec.created_at DESC
    `).all(orgId) as any[];

    return rows.map(row => ({
      id: row.id,
      document_id: row.document_id,
      clause_text: row.clause_text,
      clause_number: row.clause_number,
      clause_type: row.clause_type,
      confidence_score: row.confidence_score,
      requires_review: row.requires_review === 1,
      reviewed_by: row.reviewed_by,
      reviewed_at: row.reviewed_at,
      review_status: row.review_status,
      created_at: row.created_at,
    }));
  }
}

