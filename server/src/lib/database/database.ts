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
            const sourceDataPath = path.join(serverRoot, 'src/data/database.db');
            const distDataPath = path.join(serverRoot, 'dist/data/database.db');
            
            // Prefer source database if it exists (for development), otherwise use dist
            if (fs.existsSync(sourceDataPath)) {
                dbPath = sourceDataPath;
            } else {
                dbPath = distDataPath;
            }
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