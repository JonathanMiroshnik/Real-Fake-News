/**
 * Header presence indicator: a status light plus a one-line explanation.
 *
 * Four states, three of them measured and one honest about failure:
 * - `yellow` — the API says content was generated within the job's cadence, so the
 *   next edition is plausibly in progress. The dots animate while this is true.
 * - `green`  — nothing is being generated; the light just reports the audience.
 * - `unknown`, never yet measured — shown while the first request is in flight.
 * - `unknown`, after a failure — the request failed, so the indicator says it
 *   cannot tell instead of guessing "all fine".
 *
 * `role="status"` + `aria-live="polite"`: the text changes on its own every minute,
 * and a screen reader should hear the change without having focus moved.
 */
import { usePresenceIndicator, type PresenceStatus } from '../../hooks/usePresenceIndicator';
import './PresenceIndicator.css';

/** How the dot and the sentence look for each status. */
const STATUS_LABELS: Record<PresenceStatus, string> = {
  green: 'Connected',
  yellow: 'Next edition in progress',
  unknown: 'Status unavailable',
};

const DOT_CLASS_NAMES: Record<PresenceStatus, string> = {
  green: 'presence-dot--fresh',
  yellow: 'presence-dot--generating',
  unknown: 'presence-dot--unknown',
};

/** "7 readers" / "1 reader" / "Measuring readers". */
function describeVisitorCount(count: number | null): string {
  if (count === null) return 'Measuring readers';

  const noun = count === 1 ? 'reader' : 'readers';
  return `${count} ${noun}`;
}

interface PresenceIndicatorProps {
  /** Hide the sentence on narrow screens, leaving only the dot. */
  compact?: boolean;
}

function PresenceIndicator({ compact = false }: PresenceIndicatorProps) {
  const { status, visitorCount } = usePresenceIndicator();
  const stateLabel = STATUS_LABELS[status];
  const dotClassName = `presence-dot ${DOT_CLASS_NAMES[status]}`;
  const containerClassName = compact
    ? 'presence-indicator presence-indicator--compact'
    : 'presence-indicator';

  return (
    <div
      className={containerClassName}
      role="status"
      aria-live="polite"
      data-presence-status={status}
      title={`${stateLabel} · ${describeVisitorCount(visitorCount)}`}
    >
      <span className={dotClassName} aria-hidden="true" />
      <span className="presence-indicator__text">
        <span className="presence-indicator__count">{describeVisitorCount(visitorCount)}</span>
        {status !== 'green' && (
          <span className="presence-indicator__state">
            {stateLabel}
            {status === 'yellow' && <span className="presence-dots" aria-hidden="true" />}
          </span>
        )}
      </span>
    </div>
  );
}

export default PresenceIndicator;
