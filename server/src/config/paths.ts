/**
 * Single source of truth for where runtime data lives on disk.
 *
 * Two independent locations, each overridable from the environment:
 *   DATABASE_PATH — the SQLite file        (default: <repo>/database/database.db)
 *   IMAGES_PATH   — the images directory   (default: dirname(DATABASE_PATH)/images)
 *
 * Setting only DATABASE_PATH moves the whole data set together; setting
 * IMAGES_PATH too gives images a disk of their own. Paths are resolved from this
 * module, never from process.cwd(): the server must start from any working
 * directory (repo root, server/, systemd) and still find the same files.
 */
import path, { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const MODULE_DIR = dirname(fileURLToPath(import.meta.url));
// server/src/config -> server   (same depth for server/dist/config)
const SERVER_ROOT = resolve(MODULE_DIR, '../..');

/** <repo>/database/database.db — the default when DATABASE_PATH is not set. */
const DEFAULT_DATABASE_FILE = path.join(SERVER_ROOT, '..', 'database', 'database.db');
const IMAGES_DIRECTORY_NAME = 'images';

/**
 * Normalises one configured location.
 *
 * @param configuredPath raw env value; blank (unset/whitespace) means "default".
 * @param defaultPath absolute path to use when nothing is configured.
 * Absolute values are used as-is; relative ones are anchored at the server
 * directory so they never depend on the shell's cwd.
 */
function toServerPath(configuredPath: string | undefined, defaultPath: string): string {
  const candidatePath = configuredPath?.trim();

  if (!candidatePath) {
    return defaultPath;
  }

  if (path.isAbsolute(candidatePath)) {
    return candidatePath;
  }

  return resolve(SERVER_ROOT, candidatePath);
}

/**
 * Absolute path of the SQLite file.
 *
 * @param configuredPath raw DATABASE_PATH (defaults to the current env value):
 *   `/data/database.db` in Docker, or any host path such as
 *   `/var/lib/rfnews/database.db` when the API runs directly on the host.
 */
export function resolveDatabaseFile(configuredPath = process.env.DATABASE_PATH): string {
  return toServerPath(configuredPath, DEFAULT_DATABASE_FILE);
}

/**
 * Absolute path of the images directory.
 *
 * @param configuredPath raw IMAGES_PATH (defaults to the current env value).
 *   Falls back to `dirname(DATABASE_PATH)/images`, so images follow the database
 *   until they are given a home of their own (`/mnt/big-disk/rfnews-images`).
 */
export function resolveImagesDirectory(configuredPath = process.env.IMAGES_PATH): string {
  const defaultDirectory = path.join(dirname(resolveDatabaseFile()), IMAGES_DIRECTORY_NAME);

  return toServerPath(configuredPath, defaultDirectory);
}
