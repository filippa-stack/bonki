/**
 * Marketing 03 — Vårt Vi completion screen with reflection takeaway.
 */
import { ScaledScreen, FONT_DISPLAY, FONT_SERIF, FONT_SANS, LOGICAL_H } from './MarketingShared';
import { MIDNIGHT_INK, LANTERN_GLOW, WARM_GOLD, SAFFRON_FLAME } from '@/lib/palette';

const HEADLINE = "Ni pratade om Ert minsta 'vi'.";
const REFLECTION =
  'Att vi skrattar åt samma saker. Att jag kan komma hem och säga något helt obegripligt och han förstår direkt vad jag menar.';

export default function MarketingVvCompletion() {
  return (
    <ScaledScreen background={MIDNIGHT_INK}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          padding: '56px 24px 28px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          height: LOGICAL_H,
        }}
      >
        {/* Saffron checkmark badge */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: SAFFRON_FLAME,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 0 6px rgba(233,180,76,0.18), 0 12px 24px rgba(0,0,0,0.35)',
            marginBottom: 22,
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1A1A2E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontFamily: FONT_DISPLAY,
            fontWeight: 500,
            fontStyle: 'normal',
            fontSize: 30,
            lineHeight: 1.2,
            color: LANTERN_GLOW,
            textAlign: 'center',
            margin: 0,
            maxWidth: 320,
            letterSpacing: '-0.005em',
          }}
        >
          {HEADLINE}
        </h1>

        {/* Cream takeaway field with warm glow */}
        <div style={{ position: 'relative', width: '100%', marginTop: 36, flex: 1, display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              position: 'absolute',
              inset: '-40px -20px',
              background:
                'radial-gradient(60% 55% at 50% 50%, rgba(233,200,144,0.32) 0%, rgba(233,200,144,0.08) 55%, rgba(233,200,144,0) 75%)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'relative',
              width: '100%',
              borderRadius: 24,
              background: LANTERN_GLOW,
              padding: '36px 28px',
              boxShadow:
                '0 30px 80px rgba(0,0,0,0.45), 0 8px 24px rgba(0,0,0,0.25)',
            }}
          >
            <p
              style={{
                fontFamily: FONT_SERIF,
                fontStyle: 'italic',
                fontSize: 19,
                lineHeight: 1.55,
                color: '#1A1A2E',
                margin: 0,
                textAlign: 'left',
              }}
            >
              {REFLECTION}
            </p>
          </div>
        </div>

        <button
          style={{
            marginTop: 28,
            height: 48,
            minWidth: 220,
            paddingInline: 36,
            borderRadius: 24,
            border: 'none',
            background: WARM_GOLD,
            color: '#1A1A2E',
            fontFamily: FONT_SANS,
            fontWeight: 600,
            fontSize: 15,
            letterSpacing: '0.02em',
            boxShadow: '0 12px 28px rgba(233,200,144,0.28)',
          }}
        >
          Nästa samtal
        </button>
      </div>
    </ScaledScreen>
  );
}
