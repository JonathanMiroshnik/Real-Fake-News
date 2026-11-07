import { describe, it, expect, afterEach } from 'vitest';
import path from 'path';
import { resolveDatabaseFile, resolveImagesDirectory, MissingPathConfigError } from '../paths.js';

/**
 * Both data locations are required: `paths.ts` throws instead of inventing a
 * default, which is the whole point of these tests — an unset variable must fail
 * loudly, never fall back to a `database/` folder inside the repo.
 */

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

  it('throws when DATABASE_PATH is unset instead of guessing a location', () => {
    delete process.env.DATABASE_PATH;

    expect(() => resolveDatabaseFile()).toThrow(MissingPathConfigError);
    expect(() => resolveDatabaseFile()).toThrow(/DATABASE_PATH is not set/);
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

  it('treats blank and whitespace-only values as missing', () => {
    expect(() => resolveDatabaseFile('')).toThrow(MissingPathConfigError);
    expect(() => resolveDatabaseFile('   ')).toThrow(MissingPathConfigError);
  });
});

describe('resolveImagesDirectory', () => {
  afterEach(restoreEnv);

  it('throws when IMAGES_PATH is unset instead of following the database', () => {
    delete process.env.IMAGES_PATH;

    expect(() => resolveImagesDirectory()).toThrow(MissingPathConfigError);
    expect(() => resolveImagesDirectory()).toThrow(/IMAGES_PATH is not set/);
  });

  it('uses an absolute IMAGES_PATH as-is, even on a different disk', () => {
    expect(resolveImagesDirectory('/mnt/big-disk/rfnews-images')).toBe(
      '/mnt/big-disk/rfnews-images',
    );
  });

  it('resolves a relative IMAGES_PATH against the server dir, not the cwd', () => {
    const fromRepoCwd = resolveImagesDirectory('media/images');
    const originalCwd = process.cwd();

    try {
      process.chdir('/tmp');
      expect(resolveImagesDirectory('media/images')).toBe(fromRepoCwd);
    } finally {
      process.chdir(originalCwd);
    }

    expect(fromRepoCwd.startsWith('/tmp')).toBe(false);
    expect(fromRepoCwd.endsWith(path.join('media', 'images'))).toBe(true);
  });

  it('treats blank and whitespace-only values as missing', () => {
    expect(() => resolveImagesDirectory('')).toThrow(MissingPathConfigError);
    expect(() => resolveImagesDirectory('   ')).toThrow(MissingPathConfigError);
  });
});
