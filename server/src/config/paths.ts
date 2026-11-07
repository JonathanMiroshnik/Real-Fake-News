/**
 * Single source of truth for where runtime data lives on disk.
 *
 * Two independent locations, both REQUIRED and both read from the environment:
 *   DATABASE_PATH — the SQLite file
 *   IMAGES_PATH   — the images directory
 *
 * There is no default on purpose: a missing value throws (MissingPathConfigError)
 * instead of quietly writing a `database/` folder into the repo. Docker pins both
 * in docker-compose.yml (`/data/database.db`, `/images`); a host run sets them in
 * server/.env, which `env.ts` loads regardless of the working directory. Paths are
 * resolved from this module, never from process.cwd(): the server must start from
 * any working directory (repo root, server/, systemd) and still find the same files.
 */
import path, { resolve } from 'path';
import { SERVER_ROOT } from './env.js';

/** Thrown when a required data-location variable has no usable value. */
export class MissingPathConfigError extends Error {
  constructor(variableName: string) {
    super(
      `${variableName} is not set — there is no default. Set it in server/.env ` +
        `(host run) or in docker-compose.yml (container), then restart.`,
    );
    this.name = 'MissingPathConfigError';
  }
}

/**
 * Normalises one configured location, refusing to invent one.
 *
 * @param variableName env var being read; only used for the error message.
 * @param configuredPath raw value: unset or blank throws.
 * @returns absolute path — relative values are anchored at the server directory
 *   so they never depend on the shell's cwd.
 */
function requireConfiguredPath(
  variableName: 'DATABASE_PATH' | 'IMAGES_PATH',
  configuredPath: string | undefined,
): string {
  const candidatePath = configuredPath?.trim();

  if (!candidatePath) {
    throw new MissingPathConfigError(variableName);
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
  return requireConfiguredPath('DATABASE_PATH', configuredPath);
}

/**
 * Absolute path of the images directory.
 *
 * @param configuredPath raw IMAGES_PATH (defaults to the current env value):
 *   `/images` in Docker, or any host directory such as
 *   `/mnt/big-disk/rfnews-images` when the API runs directly on the host.
 */
export function resolveImagesDirectory(configuredPath = process.env.IMAGES_PATH): string {
  return requireConfiguredPath('IMAGES_PATH', configuredPath);
}
