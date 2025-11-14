import Database, { type Database as DatabaseType } from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

class DatabaseManager {
    private static instance: DatabaseManager | null = null;
    private db: DatabaseType;
    
    private constructor() {
        // Private constructor - can only be called from getInstance()
        const dbPath = path.join(__dirname, '../../data/database.db');
        const dbDir = path.dirname(dbPath);
        
        // Ensure the directory exists
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }
        
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