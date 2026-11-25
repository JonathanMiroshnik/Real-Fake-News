/**
 * Reads-only report on the writer pipeline, shown by the client's "Slop meter".
 *
 * The meter is decoration with a real payload: it says which model writes the
 * articles and how capable that model is, so a reader can see the gap between
 * the model's claimed competence and the article in front of them.
 *
 * Nothing here produces content or touches the database — it describes the
 * pipeline's configuration. That is deliberate: the public route must not be
 * able to trigger a producer (see `contracts/architecture.md`).
 */
import { debugLog } from '../utils/debugLogger.js';

/** Default model; also the fallback when `DEEPSEEK_MODEL` is unset or blank. */
export const DEFAULT_DEEPSEEK_MODEL = 'deepseek-reasoner';

/**
 * Percentage label handed to the browser.
 *
 * `intelligence` is 0–100 because CSS consumes it directly (`width: 42%`).
 * `model` is the backend-only string: the client renders it verbatim and knows
 * nothing about naming models, so the popup keeps working when the model
 * changes without any client release.
 */
export interface SlopMeterReading {
  intelligence: number;
  model: string;
}

/**
 * Intelligence score per known model, 0–100.
 *
 * Hand-maintained on purpose. The real model here is `deepseek-reasoner`, a
 * reasoning model, hence the high figure; older and cheaper DeepSeek models sit
 * lower so the meter visibly moves when someone switches `DEEPSEEK_MODEL`.
 * Thresholds for the bar's colour live in the client (red ≤ 33, yellow 33–66,
 * green > 66).
 */
export const MODEL_INTELLIGENCE: Readonly<Record<string, number>> = {
  'deepseek-reasoner': 88,
  'deepseek-chat': 64,
  'deepseek-coder': 41,
};

/**
 * Score used for a model that is not in the table.
 *
 * Intentionally below the client's "healthy" threshold: an unknown model is a
 * missing fact, and the meter should not claim competence it cannot account
 * for. `model` still shows the real name, so the popup names the culprit.
 */
export const UNKNOWN_MODEL_INTELLIGENCE = 40;

/**
 * The model name the writer pipeline is configured to use.
 *
 * @returns `DEEPSEEK_MODEL` when set to something non-blank, else the default.
 */
export function getWriterModelName(): string {
  const configuredModel = process.env.DEEPSEEK_MODEL?.trim();
  return configuredModel ? configuredModel : DEFAULT_DEEPSEEK_MODEL;
}

/**
 * Clamps a score into the inclusive 0–100 range, so a typo in the table can
 * never hand the client a value that would overflow its bar.
 *
 * @param value Raw score from the model table.
 * @returns The score as a finite integer between 0 and 100.
 */
function clampIntelligence(value: number): number {
  const safeValue = Number.isFinite(value) ? value : UNKNOWN_MODEL_INTELLIGENCE;
  const clampedValue = Math.min(100, Math.max(0, safeValue));
  return Math.round(clampedValue);
}

/**
 * Current reading for the Slop meter.
 *
 * @returns The model name plus its 0–100 intelligence score.
 */
export function getSlopMeterReading(): SlopMeterReading {
  const model = getWriterModelName();
  const knownIntelligence = MODEL_INTELLIGENCE[model];

  const intelligence =
    knownIntelligence === undefined
      ? UNKNOWN_MODEL_INTELLIGENCE
      : clampIntelligence(knownIntelligence);

  if (knownIntelligence === undefined) {
    debugLog(`Slop meter: no intelligence score for model "${model}", using fallback`);
  }

  return { intelligence, model };
}
