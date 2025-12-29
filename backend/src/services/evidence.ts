import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';

export interface Evidence {
  id: string;
  risk_id: string;
  file_name: string;
  file_path: string;
  file_type?: string;
  uploaded_by: string;
  created_at: string;
}

export interface CreateEvidenceDTO {
  risk_id: string;
  file_name: string;
  file_content: string; // Base64 encoded
  file_type?: string;
}

export class EvidenceService {
  private uploadDir: string;

  constructor(private db: Database.Database) {
    this.uploadDir = process.env.EVIDENCE_UPLOAD_DIR || './uploads/evidence';
    // Ensure upload directory exists
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Upload evidence file
   */
  uploadEvidence(userId: string, dto: CreateEvidenceDTO): Evidence {
    const id = uuidv4();
    const fileExtension = dto.file_name.split('.').pop() || 'bin';
    const fileName = `${id}.${fileExtension}`;
    const filePath = join(this.uploadDir, fileName);

    // Decode base64 and save file
    try {
      const fileBuffer = Buffer.from(dto.file_content, 'base64');
      writeFileSync(filePath, fileBuffer);
    } catch (error) {
      throw new Error('Failed to save evidence file');
    }

    // Save to database
    const stmt = this.db.prepare(`
      INSERT INTO evidence (
        id, risk_id, file_name, file_path, file_type, uploaded_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      dto.risk_id,
      dto.file_name,
      filePath,
      dto.file_type || this.getFileType(dto.file_name),
      userId,
      new Date().toISOString()
    );

    return this.getEvidenceById(id)!;
  }

  /**
   * Get evidence by ID
   */
  getEvidenceById(id: string): Evidence | null {
    const stmt = this.db.prepare('SELECT * FROM evidence WHERE id = ?');
    const row = stmt.get(id) as any;
    if (!row) return null;
    return this.mapRowToEvidence(row);
  }

  /**
   * Get evidence for a risk
   */
  getEvidenceByRiskId(riskId: string): Evidence[] {
    const stmt = this.db.prepare(`
      SELECT * FROM evidence 
      WHERE risk_id = ? 
      ORDER BY created_at DESC
    `);
    const rows = stmt.all(riskId) as any[];
    return rows.map(row => this.mapRowToEvidence(row));
  }

  /**
   * Download evidence file
   */
  downloadEvidence(id: string): { file: Buffer; fileName: string; fileType: string } {
    const evidence = this.getEvidenceById(id);
    if (!evidence) {
      throw new Error('Evidence not found');
    }

    if (!existsSync(evidence.file_path)) {
      throw new Error('Evidence file not found on disk');
    }

    const file = readFileSync(evidence.file_path);
    return {
      file,
      fileName: evidence.file_name,
      fileType: evidence.file_type || 'application/octet-stream',
    };
  }

  /**
   * Delete evidence
   */
  deleteEvidence(id: string): void {
    const evidence = this.getEvidenceById(id);
    if (!evidence) {
      throw new Error('Evidence not found');
    }

    // Delete file
    try {
      if (existsSync(evidence.file_path)) {
        const { unlinkSync } = require('fs');
        unlinkSync(evidence.file_path);
      }
    } catch (error) {
      console.error('Failed to delete evidence file:', error);
    }

    // Delete from database
    this.db.prepare('DELETE FROM evidence WHERE id = ?').run(id);
  }

  private getFileType(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const types: { [key: string]: string } = {
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      txt: 'text/plain',
    };
    return types[ext || ''] || 'application/octet-stream';
  }

  private mapRowToEvidence(row: any): Evidence {
    return {
      id: row.id,
      risk_id: row.risk_id,
      file_name: row.file_name,
      file_path: row.file_path,
      file_type: row.file_type || undefined,
      uploaded_by: row.uploaded_by,
      created_at: row.created_at,
    };
  }
}

