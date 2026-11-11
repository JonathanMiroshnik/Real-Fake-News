import { randomInt } from 'crypto';
import { Writer } from '../types/writer.js';
import type { ContentPorts } from '../types/contentPorts.js';
import { findAll } from '../lib/database/sqliteOperations.js';
import { writerDatabaseConfig } from '../lib/database/databaseConfigurations.js';
import { ports as defaultPorts } from './contentSources/index.js';
import type { RandomBelow } from '../utils/random.js';

/**
 * @param randomBelow Chooses an index below the writer count; defaults to
 * `crypto.randomInt`. A job passes a seeded generator here so its run is
 * reproducible — see `utils/random.ts` for why that has to be a parameter.
 * @param ports The content source the job is writing with.
 * @returns Single random Writer from the Writers in the database
 *
 * The returned writer is **re-stamped** with the caller's origin rather than
 * inheriting the `writers.row` value. A writer is embedded in every article and
 * recipe as a nested object, so its marker travels *inside* a row whose own marker
 * says something different: a mock article about a seeded writer would otherwise
 * carry `contentSource: 'live'` in its author field, and a reader looking at the
 * author would be told the wrong thing (`plans/dev-content-marking.md` Phase B).
 * The caller is the one that knows which pipeline is running, so the caller wins.
 */
export async function getRandomWriter(
  randomBelow: RandomBelow = randomInt,
  ports: ContentPorts = defaultPorts,
): Promise<Writer> {
  const writersList = await findAll<Writer>(writerDatabaseConfig);

  if (writersList.length === 0) {
    throw new Error('No writers found in the database. Cannot select a random writer.');
  }

  const writerReturn = writersList[randomBelow(writersList.length)];
  if (writerReturn === undefined) {
    throw new Error('Random Writer not found');
  }

  return { ...writerReturn, contentSource: ports.text.contentSource };
}
