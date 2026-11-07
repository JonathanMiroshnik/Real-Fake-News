import { describe, it, expect, vi, afterEach } from 'vitest';
import { FIXED_SEED } from '../../../services/contentSources/mocks/mockContent.js';
import { assertNotProduction, parseSeedArgs, type SeedOptions } from '../seedOptions.js';

/**
 * These tests pin the two promises a seeder has to keep before it touches any
 * data: a mistyped flag must fail instead of being ignored, and a production
 * database must not be filled with mock content by accident.
 */

/** Options as if the CLI had been invoked with the given arguments. */
const parse = (argv: string[]): SeedOptions => parseSeedArgs(argv);

const forcedOptions: SeedOptions = { reset: true, force: true, seed: FIXED_SEED, help: false };

describe('parseSeedArgs', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('defaults to a plain, deterministic, non-destructive seed run', () => {
    expect(parse([])).toEqual({ reset: false, force: false, seed: FIXED_SEED, help: false });
  });

  it('reads --reset, --force and --help', () => {
    expect(parse(['--reset', '--force', '--help'])).toEqual({
      reset: true,
      force: true,
      seed: FIXED_SEED,
      help: true,
    });
  });

  it('accepts --seed as a separate value and as --seed=<n>', () => {
    expect(parse(['--seed', '42']).seed).toBe(42);
    expect(parse(['--seed=42']).seed).toBe(42);
  });

  it('throws on an unknown flag rather than silently ignoring it', () => {
    expect(() => parse(['--reseet'])).toThrow(/Unknown argument "--reseet"/);
  });

  it('throws when --seed has no integer value', () => {
    expect(() => parse(['--seed'])).toThrow(/expects an integer/);
    expect(() => parse(['--seed', 'abc'])).toThrow(/expects an integer/);
    expect(() => parse(['--seed=1.5'])).toThrow(/expects an integer/);
  });
});

describe('assertNotProduction', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('allows a development environment', () => {
    expect(() => assertNotProduction(parse([]), { NODE_ENV: 'development' })).not.toThrow();
    expect(() => assertNotProduction(parse([]), {})).not.toThrow();
  });

  it('refuses to seed production without --force', () => {
    expect(() => assertNotProduction(parse([]), { NODE_ENV: 'production' })).toThrow(
      /NODE_ENV=production/,
    );
  });

  it('seeds production with --force, but says so out loud', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(() => assertNotProduction(forcedOptions, { NODE_ENV: 'production' })).not.toThrow();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('production database'));
  });
});
