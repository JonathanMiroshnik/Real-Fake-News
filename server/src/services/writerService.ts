import { randomInt } from 'crypto';
import { Writer } from '../types/writer.js';
import { findAll } from '../lib/database/sqliteOperations.js';
import { writerDatabaseConfig } from '../lib/database/databaseConfigurations.js';
import type { RandomBelow } from '../utils/random.js';

/**
 * @param randomBelow Chooses an index below the writer count; defaults to
 * `crypto.randomInt`. A job passes a seeded generator here so its run is
 * reproducible — see `utils/random.ts` for why that has to be a parameter.
 * @returns Single random Writer from the Writers in the database
 */
export async function getRandomWriter(randomBelow: RandomBelow = randomInt): Promise<Writer> {
  const writersList = await findAll<Writer>(writerDatabaseConfig);

  if (writersList.length === 0) {
    throw new Error('No writers found in the database. Cannot select a random writer.');
  }

  const writerReturn = writersList[randomBelow(writersList.length)];
  if (writerReturn === undefined) {
    throw new Error('Random Writer not found');
  }

  return writerReturn;
}
