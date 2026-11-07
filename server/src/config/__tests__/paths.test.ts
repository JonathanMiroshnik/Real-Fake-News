import { describe, it, expect, afterEach } from 'vitest';
import path from 'path';
import { resolveDatabaseFile, resolveImagesDirectory } from '../paths.js';

const originalDatabasePath = process.env.DATABASE_PATH;
const originalImagesPath = process.env.IMAGES_PATH;

const restoreEnv = (): void => {
  if (originalDatabasePath === undefined) {
    delete process.env.DATABASE_PATH;
  } else {
    process.env.DATABASE_PATH = originalDatabasePath;
  }

  if (originalImagesPath === undefined) {
    delete process.env.IMAGES_PATH;
  } else {
    process.env.IMAGES_PATH = originalImagesPath;
  }
};

describe('resolveDatabaseFile', () => {
  afterEach(restoreEnv);

  it('falls back to <repo>/database/database.db when DATABASE_PATH is unset', () => {
    delete process.env.DATABASE_PATH;

    const dbFile = resolveDatabaseFile();

    expect(path.isAbsolute(dbFile)).toBe(true);
    expect(dbFile.endsWith(path.join('database', 'database.db'))).toBe(true);
  });

  it('uses an absolute DATABASE_PATH as-is (any directory on the host)', () => {
    expect(resolveDatabaseFile('/var/lib/rfnews/database.db')).toBe('/var/lib/rfnews/database.db');
  });

  it('resolves a relative DATABASE_PATH against the server dir, not the cwd', () => {
    const fromRepoCwd = resolveDatabaseFile('data/database.db');
    const originalCwd = process.cwd();

    try {
      process.chdir('/tmp');
      expect(resolveDatabaseFile('data/database.db')).toBe(fromRepoCwd);
    } finally {
      process.chdir(originalCwd);
    }

    expect(fromRepoCwd.startsWith('/tmp')).toBe(false);
  });

  it('treats blank and whitespace-only values as unset', () => {
    delete process.env.DATABASE_PATH;
    const unsetValue = resolveDatabaseFile();

    expect(resolveDatabaseFile('')).toBe(unsetValue);
    expect(resolveDatabaseFile('   ')).toBe(unsetValue);
  });
});

describe('resolveImagesDirectory', () => {
  afterEach(restoreEnv);

  it('follows the database file when IMAGES_PATH is unset', () => {
    process.env.DATABASE_PATH = '/var/lib/rfnews/database.db';
    delete process.env.IMAGES_PATH;

    expect(resolveImagesDirectory()).toBe('/var/lib/rfnews/images');
  });

  it('uses an absolute IMAGES_PATH as-is, even on a different disk', () => {
    process.env.DATABASE_PATH = '/var/lib/rfnews/database.db';

    expect(resolveImagesDirectory('/mnt/big-disk/rfnews-images')).toBe(
      '/mnt/big-disk/rfnews-images',
    );
  });

  it('resolves a relative IMAGES_PATH against the server dir, not the cwd', () => {
    process.env.DATABASE_PATH = '/var/lib/rfnews/database.db';
    const fromRepoCwd = resolveImagesDirectory('media/images');
    const originalCwd = process.cwd();

    try {
      process.chdir('/tmp');
      expect(resolveImagesDirectory('media/images')).toBe(fromRepoCwd);
    } finally {
      process.chdir(originalCwd);
    }

    expect(fromRepoCwd.startsWith('/tmp')).toBe(false);
  });

  it('treats blank and whitespace-only values as unset', () => {
    process.env.DATABASE_PATH = '/var/lib/rfnews/database.db';
    delete process.env.IMAGES_PATH;
    const unsetValue = resolveImagesDirectory();

    expect(resolveImagesDirectory('')).toBe(unsetValue);
    expect(resolveImagesDirectory('   ')).toBe(unsetValue);
  });
});
