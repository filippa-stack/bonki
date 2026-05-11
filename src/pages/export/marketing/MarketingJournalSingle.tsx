/**
 * Marketing 06 — Era samtal cropped to single reflection.
 */
import { ScaledScreen, FONT_DISPLAY, FONT_SERIF, FONT_LABEL, FONT_SANS, LOGICAL_H } from './MarketingShared';
import { MIDNIGHT_INK, LANTERN_GLOW, WARM_GOLD, CORNFLOWER } from '@/lib/palette';

const PRODUCT_LABEL = 'Vårt Vi';
const CARD_SUBTITLE = "Ert minsta 'vi'";
const DATE = '10 april';
const QUESTION =
  '\u2014 Vad är det som gör att ni känner er som ett par \u2014 bortom det praktiska ni delar?';
const REFLECTION =
  'Att vi skrattar åt samma saker. Att jag kan komma hem och säga något helt obegripligt och han förstår direkt vad jag menar.';

export default function MarketingJournalSingle() {
  return (
    <ScaledScreen background={MIDNIGHT_INK}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          padding: '52px 24px 28px',
          display: 'flex',
          flexDirection: 'column',
          height: LOGICAL_H,
        }}
      >
        {/* Page title cluster */}
        <h1
          style={{
            fontFamily: FONT_DISPLAY,
            fontWeight: 500,
            fontSize: 30,
            color: LANTERN_GLOW,
            margin: 0,
            letterSpacing: '-0.005em',
          }}
        >
          Era samtal
        </h1>
        <p
          style={{
            fontFamily: FONT_SERIF,
            fontStyle: 'italic',
            fontSize: 16,
            color: 'rgba(253,246,227,0.65)',
            margin: '6px 0 0',
          }}
        >
          Vad ni burit med er
        </p>

        {/* Timeline header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 40 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: CORNFLOWER,
              boxShadow: '0 0 0 4px rgba(100,149,237,0.18)',
            }}
          />
          <span
            style={{
              fontFamily: FONT_LABEL,
              fontSize: 12,
              letterSpacing: '0.22em',
              color: 'rgba(253,246,227,0.7)',
            }}
          >
            APRIL 2026
          </span>
          <span style={{ flex: 1, height: 1, background: 'rgba(253,246,227,0.10)' }} />
          <span
            style={{
              fontFamily: FONT_SANS,
              fontSize: 12,
              color: 'rgba(253,246,227,0.55)',
              letterSpacing: '0.04em',
            }}
          >
            1 samtal
          </span>
        </div>

        {/* Single reflection card */}
        <div style={{ marginTop: 18, flex: 1, display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              width: '100%',
              borderRadius: 22,
              background: 'rgba(253,246,227,0.04)',
              border: '1px solid rgba(253,246,227,0.08)',
              padding: '24px 22px 26px',
              boxShadow: '0 18px 40px rgba(0,0,0,0.35)',
            }}
          >
            {/* Top row: label + date */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span
                style={{
                  fontFamily: FONT_LABEL,
                  fontSize: 11,
                  letterSpacing: '0.22em',
                  color: CORNFLOWER,
                }}
              >
                {PRODUCT_LABEL.toUpperCase()}
              </span>
              <span
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 12,
                  color: 'rgba(253,246,227,0.5)',
                }}
              >
                {DATE}
              </span>
            </div>

            {/* Card subtitle */}
            <p
              style={{
                fontFamily: FONT_SERIF,
                fontStyle: 'italic',
                fontSize: 22,
                color: LANTERN_GLOW,
                margin: '10px 0 18px',
                lineHeight: 1.25,
              }}
            >
              {CARD_SUBTITLE}
            </p>

            {/* Question */}
            <p
              style={{
                fontFamily: FONT_SERIF,
                fontStyle: 'italic',
                fontSize: 15,
                lineHeight: 1.5,
                color: 'rgba(253,246,227,0.85)',
                margin: 0,
              }}
            >
              {QUESTION}
            </p>

            {/* Hairline */}
            <div style={{ height: 1, background: 'rgba(253,246,227,0.10)', margin: '20px 0' }} />

            {/* Reflection */}
            <p
              style={{
                fontFamily: FONT_SERIF,
                fontSize: 16,
                fontStyle: 'italic',
                lineHeight: 1.55,
                color: WARM_GOLD,
                margin: 0,
              }}
            >
              {REFLECTION}
            </p>
          </div>
        </div>
      </div>
    </ScaledScreen>
  );
}
