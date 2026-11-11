/**
 * Randomness for the content pipeline, routed through one function.
 *
 * `crypto.randomInt` is correct for production (an unpredictable choice between
 * news items or writers is what stops two runs from producing the same article),
 * but it makes a job assertion impossible: a test that wants "the first article of
 * five" cannot say so. Jobs therefore take this function as a parameter and
 * default to `randomInt`, so production code reads unchanged while a test can
 * inject `createSeededRandom(SEED)` from `services/contentSources/mocks/mockContent.ts`
 * and then assert the exact rows a run wrote.
 *
 * Same shape as `randomInt(max)` from `crypto`: an integer in [0, max).
 */
export type RandomBelow = (max: number) => number;
