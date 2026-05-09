import Database, { type Database as DatabaseType } from 'better-sqlite3';
import path, { resolve } from 'path';
import fs from 'fs';
import { debugLog } from '../../utils/debugLogger.js';

class DatabaseManager {
  private static instance: DatabaseManager | null = null;
  private db: DatabaseType;

  private constructor() {
    // Private constructor - can only be called from getInstance()
    let dbPath: string;

    // Priority 1: Use DATABASE_PATH if set (Docker container path, e.g., /data/database.db)
    if (process.env.DATABASE_PATH) {
      dbPath = process.env.DATABASE_PATH;
    }
    // Priority 2: Default fallback - use database/ at the project root (local development)
    else {
      // In local development, commands run from server/ directory
      // (e.g., npm run dev, npm run generate-mock-data)
      // process.cwd() is server/, so .. resolves to the project root
      const projectRoot = resolve(process.cwd(), '..');
      dbPath = path.join(projectRoot, 'database', 'database.db');
    }

    const dbDir = path.dirname(dbPath);

    // Ensure the directory exists
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    debugLog('📁 [DatabaseManager] Using database at:', dbPath);
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('busy_timeout = 5000');
    this.db.pragma('foreign_keys = ON');
  }

  public static getInstance(): DatabaseType {
    if (DatabaseManager.instance === null) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance.db;
  }

  public static closeInstance(): void {
    if (DatabaseManager.instance?.db) {
      DatabaseManager.instance.db.close();
      DatabaseManager.instance = null;
    }
  }
}

/**
 * Get the SQLite database instance.
 * Creates a singleton connection if it doesn't exist.
 * @returns The SQLite database instance
 */
export function getDatabase(): DatabaseType {
  return DatabaseManager.getInstance();
}

/**
 * Close the SQLite database connection.
 */
export function closeDatabase(): void {
  DatabaseManager.closeInstance();
}
