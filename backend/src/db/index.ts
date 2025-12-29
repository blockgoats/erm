import Database from 'better-sqlite3';
import { initDatabase } from './schema.js';
import { mkdirSync } from 'fs';
import { dirname } from 'path';

let dbInstance: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!dbInstance) {
    const dbPath = process.env.DB_PATH || './data/erm.db';
    
    // Ensure the directory exists
    try {
      const dbDir = dirname(dbPath);
      mkdirSync(dbDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, ignore error
    }
    
    dbInstance = initDatabase(dbPath);
  }
  return dbInstance;
}

export function closeDatabase() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

