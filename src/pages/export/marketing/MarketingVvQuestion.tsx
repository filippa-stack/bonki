/**
 * Marketing 01 — Vårt Vi mid-session question card.
 * Cream card with warm glow on Midnight Ink. Step indicator + "Nästa" pill.
 */
import { ScaledScreen, FONT_SERIF, FONT_LABEL, FONT_SANS, LOGICAL_H } from './MarketingShared';
import { MIDNIGHT_INK, LANTERN_GLOW, WARM_GOLD } from '@/lib/palette';

const QUESTION =
  'Vad är det som gör att ni känner er som ett par \u2014 bortom det praktiska ni delar?';

export default function MarketingVvQuestion() {
  return (
    <ScaledScreen background={MIDNIGHT_INK}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          padding: '64px 24px 28px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          height: LOGICAL_H,
        }}
      >
        {/* Step indicator */}
        <div
          style={{
            fontFamily: FONT_LABEL,
            fontSize: 12,
            letterSpacing: '0.22em',
            color: 'rgba(253,246,227,0.6)',
            marginBottom: 28,
          }}
        >
          FRÅGA 2 AV 4
        </div>

        {/* Cream question card with warm glow */}
        <div style={{ position: 'relative', width: '100%', flex: 1, display: 'flex', alignItems: 'center' }}>
          {/* Warm radial glow halo */}
          <div
            style={{
              position: 'absolute',
              inset: '-40px -20px',
              background:
                'radial-gradient(60% 50% at 50% 50%, rgba(233,200,144,0.32) 0%, rgba(233,200,144,0.08) 55%, rgba(233,200,144,0) 75%)',
              filter: 'blur(2px)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'relative',
              width: '100%',
              borderRadius: 28,
              background: LANTERN_GLOW,
              padding: '52px 30px 56px',
              boxShadow:
                '0 30px 80px rgba(0,0,0,0.45), 0 8px 24px rgba(0,0,0,0.25), 0 0 0 1px rgba(253,246,227,0.04)',
              minHeight: 320,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <p
              style={{
                fontFamily: FONT_SERIF,
                fontStyle: 'italic',
                fontSize: 26,
                lineHeight: 1.35,
                color: '#1A1A2E',
                margin: 0,
                textAlign: 'center',
                letterSpacing: 0,
              }}
            >
              {QUESTION}
            </p>
          </div>
        </div>

        {/* Warm-gold pill CTA */}
        <button
          style={{
            marginTop: 28,
            height: 48,
            minWidth: 200,
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
          Nästa
        </button>
      </div>
    </ScaledScreen>
  );
}
