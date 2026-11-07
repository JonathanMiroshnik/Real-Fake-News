/**
 * Loads server/.env before any other module reads process.env.
 *
 * Why a separate module: ES module imports are evaluated before the importing
 * module's body, and app.ts reads env vars while it is being imported (CORS
 * allowlist, scheduled-job flags). Calling dotenv from index.ts's body therefore
 * ran too late — this side-effect import fixes the ordering.
 *
 * The file is located relative to this module, so the server works from any
 * working directory. A missing file is fine (Docker injects env vars instead).
 */
import { config } from 'dotenv';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const MODULE_DIR = dirname(fileURLToPath(import.meta.url));
// server/src/config -> server/.env   (same depth from server/dist/config)
const ENV_FILE_PATH = resolve(MODULE_DIR, '../../.env');

const { error } = config({ path: ENV_FILE_PATH });
const isMissingEnvFile = (error as NodeJS.ErrnoException | undefined)?.code === 'ENOENT';

if (error && !isMissingEnvFile) {
  console.warn(`⚠️  Could not load ${ENV_FILE_PATH}: ${error.message}`);
}
