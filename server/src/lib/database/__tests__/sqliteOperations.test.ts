import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';

/**
 * Test helper: creates an in-memory SQLite database with the blog_posts table.
 * This avoids needing the real DatabaseManager singleton, keeping tests isolated.
 */
function createInMemoryDb(): DatabaseType {
  const db = new Database(':memory:');
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS blog_posts (
      key TEXT PRIMARY KEY,
      title TEXT,
      content TEXT,
      author TEXT,
      timestamp TEXT,
      category TEXT,
      headImage TEXT,
      shortDescription TEXT,
      originalNewsItem TEXT,
      writerType TEXT DEFAULT 'AI',
      isFeatured INTEGER DEFAULT 0,
      featuredDate TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS news_items (
      article_id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      pubDate TEXT NOT NULL,
      pubDateTZ TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  return db;
}

describe('SQLite Operations', () => {
  let db: DatabaseType;

  beforeEach(() => {
    db = createInMemoryDb();
  });

  afterEach(() => {
    db.close();
  });

  describe('Blog Posts CRUD', () => {
    it('should insert a blog post and retrieve it by key', () => {
      const stmt = db.prepare(`
        INSERT INTO blog_posts (key, title, content, author, timestamp, category, writerType)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run('test-1', 'Test Title', 'Test Content', JSON.stringify({ name: 'Tester' }), new Date().toISOString(), 'Technology', 'AI');

      const row = db.prepare('SELECT * FROM blog_posts WHERE key = ?').get('test-1') as any;
      expect(row).toBeDefined();
      expect(row.title).toBe('Test Title');
      expect(row.content).toBe('Test Content');
      expect(row.category).toBe('Technology');
      expect(row.writerType).toBe('AI');
    });

    it('should return all blog posts', () => {
      const insertStmt = db.prepare(`
        INSERT INTO blog_posts (key, title, content, timestamp, category)
        VALUES (?, ?, ?, ?, ?)
      `);
      insertStmt.run('key-1', 'Article 1', 'Content 1', new Date().toISOString(), 'Politics');
      insertStmt.run('key-2', 'Article 2', 'Content 2', new Date().toISOString(), 'Sports');

      const rows = db.prepare('SELECT * FROM blog_posts').all();
      expect(rows).toHaveLength(2);
    });

    it('should update an existing blog post', () => {
      const insertStmt = db.prepare(`
        INSERT INTO blog_posts (key, title, content, timestamp, category)
        VALUES (?, ?, ?, ?, ?)
      `);
      insertStmt.run('key-1', 'Original Title', 'Original Content', new Date().toISOString(), 'Politics');

      const updateStmt = db.prepare(`
        UPDATE blog_posts SET title = ?, content = ? WHERE key = ?
      `);
      updateStmt.run('Updated Title', 'Updated Content', 'key-1');

      const row = db.prepare('SELECT * FROM blog_posts WHERE key = ?').get('key-1') as any;
      expect(row.title).toBe('Updated Title');
      expect(row.content).toBe('Updated Content');
    });

    it('should delete a blog post', () => {
      const insertStmt = db.prepare(`
        INSERT INTO blog_posts (key, title, content, timestamp, category)
        VALUES (?, ?, ?, ?, ?)
      `);
      insertStmt.run('key-to-delete', 'Delete Me', 'Content', new Date().toISOString(), 'Technology');

      const deleteResult = db.prepare('DELETE FROM blog_posts WHERE key = ?').run('key-to-delete');
      expect(deleteResult.changes).toBe(1);

      const row = db.prepare('SELECT * FROM blog_posts WHERE key = ?').get('key-to-delete');
      expect(row).toBeUndefined();
    });

    it('should enforce primary key uniqueness', () => {
      const stmt = db.prepare(`
        INSERT INTO blog_posts (key, title, content, timestamp, category)
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run('duplicate-key', 'First', 'Content', new Date().toISOString(), 'Politics');

      expect(() => {
        stmt.run('duplicate-key', 'Second', 'Content', new Date().toISOString(), 'Sports');
      }).toThrow();
    });

    it('should handle posts with missing optional fields', () => {
      const stmt = db.prepare(`
        INSERT INTO blog_posts (key, title)
        VALUES (?, ?)
      `);
      stmt.run('minimal-post', 'Only Title');

      const row = db.prepare('SELECT * FROM blog_posts WHERE key = ?').get('minimal-post') as any;
      expect(row.title).toBe('Only Title');
      expect(row.content).toBeNull();
      expect(row.category).toBeNull();
    });
  });

  describe('News Items CRUD', () => {
    it('should insert and retrieve a news item', () => {
      const stmt = db.prepare(`
        INSERT INTO news_items (article_id, title, description, pubDate, pubDateTZ)
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run('news-1', 'News Title', 'A description', '2025-01-01T00:00:00Z', 'UTC');

      const row = db.prepare('SELECT * FROM news_items WHERE article_id = ?').get('news-1') as any;
      expect(row).toBeDefined();
      expect(row.title).toBe('News Title');
      expect(row.description).toBe('A description');
    });

    it('should return undefined for a non-existent news item', () => {
      const row = db.prepare('SELECT * FROM news_items WHERE article_id = ?').get('non-existent');
      expect(row).toBeUndefined();
    });
  });

  describe('Pagination & Queries', () => {
    it('should return paginated results with LIMIT and OFFSET', () => {
      const stmt = db.prepare(`
        INSERT INTO blog_posts (key, title, content, timestamp, category)
        VALUES (?, ?, ?, ?, ?)
      `);
      for (let i = 1; i <= 10; i++) {
        stmt.run(`key-${i}`, `Article ${i}`, `Content ${i}`, new Date().toISOString(), 'Politics');
      }

      const page1 = db.prepare('SELECT * FROM blog_posts ORDER BY key LIMIT 3 OFFSET 0').all();
      expect(page1).toHaveLength(3);
      expect((page1[0] as any).key).toBe('key-1');

      // Note: ORDER BY key sorts lexicographically (as strings), so 'key-10' comes before 'key-2'
      // Keys sorted: key-1, key-10, key-2, key-3, key-4, ...
      // Page 2 (OFFSET 3): key-3, key-4, key-5
      const page2 = db.prepare('SELECT * FROM blog_posts ORDER BY key LIMIT 3 OFFSET 3').all();
      expect(page2).toHaveLength(3);
      expect((page2[0] as any).key).toBe('key-3');
    });

    it('should filter posts by timestamp range', () => {
      const stmt = db.prepare(`
        INSERT INTO blog_posts (key, title, content, timestamp, category)
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run('old', 'Old Article', 'Content', '2024-01-01T00:00:00Z', 'Politics');
      stmt.run('new', 'New Article', 'Content', '2025-06-01T00:00:00Z', 'Politics');

      const recentPosts = db
        .prepare('SELECT * FROM blog_posts WHERE timestamp > ?')
        .all('2025-01-01T00:00:00Z');
      expect(recentPosts).toHaveLength(1);
      expect((recentPosts[0] as any).key).toBe('new');
    });

    it('should count total posts', () => {
      const stmt = db.prepare(`
        INSERT INTO blog_posts (key, title, content, timestamp, category)
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run('count-1', 'A', 'Content', new Date().toISOString(), 'Politics');
      stmt.run('count-2', 'B', 'Content', new Date().toISOString(), 'Sports');
      stmt.run('count-3', 'C', 'Content', new Date().toISOString(), 'Technology');

      const result = db.prepare('SELECT COUNT(*) as count FROM blog_posts').get() as any;
      expect(result.count).toBe(3);
    });
  });
});
