import Database, { type Database as DatabaseType } from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class DatabaseManager {
    private static instance: DatabaseManager | null = null;
    private db: DatabaseType;
    
    private constructor() {
        // Private constructor - can only be called from getInstance()
        // Use environment variable if set, otherwise resolve relative to server root
        let dbPath: string;
        
        if (process.env.DATABASE_PATH) {
            dbPath = process.env.DATABASE_PATH;
        } else {
            // Resolve relative to server root (where .env is located)
            // __dirname in compiled code is server/dist/lib/database/
            // So we go up 3 levels to get to server root
            const serverRoot = resolve(__dirname, '../../..');
            // Use server/data/database.db - this is outside src/ and dist/ so it won't be affected by builds
            // This directory already exists and is used for other data files (images, JSON files, etc.)
            dbPath = path.join(serverRoot, 'data/database.db');
        }
        
        const dbDir = path.dirname(dbPath);
        
        // Ensure the directory exists
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }
        
        console.log('📁 [DatabaseManager] Using database at:', dbPath);
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