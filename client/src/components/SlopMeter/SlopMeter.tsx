import { type CSSProperties } from 'react';
import { useSlopMeter } from '../../hooks/useSlopMeter';
import { SLOP_METER_INTELLIGENCE_LABEL } from '../../services/slopMeterService';
import { getSlopMeterTone } from './slopMeterTone';
import './SlopMeter.css';

/** Width used when there is nothing to report — an empty bar, not a broken one. */
const NO_READING_PERCENTAGE = 0;

/**
 * Read-only meter for the writing pipeline's current model.
 *
 * Draws a health bar plus a "?" control whose popup names the model the backend
 * says it is running. Rendering only: the value comes from `useSlopMeter` and
 * every animation is CSS (see `SlopMeter.css`).
 *
 * The popup opens on hover *and* on focus: hover-only would put the only way to
 * see the model out of reach for keyboard users (`contracts/design.md`,
 * accessibility floor).
 */
function SlopMeter() {
  const { reading, isLoading } = useSlopMeter();

  const intelligence = reading?.intelligence ?? NO_READING_PERCENTAGE;
  const modelName = reading?.model ?? 'Unavailable';
  const tone = getSlopMeterTone(intelligence);
  const meterClass = isLoading && !reading ? 'slop-meter is-loading' : 'slop-meter';

  return (
    <div className={meterClass} aria-busy={isLoading}>
      <div className="slop-meter-row">
        <div
          className="slop-meter-track"
          role="meter"
          aria-label={SLOP_METER_INTELLIGENCE_LABEL}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={intelligence}
          aria-valuetext={`${intelligence}%`}
        >
          <div
            className={`slop-meter-fill slop-meter-fill-${tone}`}
            style={{ '--slop-meter-intelligence': `${intelligence}%` } as CSSProperties}
          />
        </div>

        <div className="slop-meter-info">
          <button
            type="button"
            className="slop-meter-info-button"
            aria-label="What model writes the articles?"
            aria-describedby="slop-meter-popup"
          >
            ?
          </button>
          <div className="slop-meter-popup" id="slop-meter-popup" role="tooltip">
            {modelName}
          </div>
        </div>
      </div>

      <p className="slop-meter-label">{SLOP_METER_INTELLIGENCE_LABEL}</p>
    </div>
  );
}

export default SlopMeter;
