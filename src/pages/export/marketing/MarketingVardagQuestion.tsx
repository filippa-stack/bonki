/**
 * Marketing 02 — Vardag (kids) mid-session question card.
 * Cream card with warm glow on Vardag #48A873 background. Glassy mid-green CTA.
 */
import { ScaledScreen, FONT_SERIF, FONT_LABEL, FONT_SANS, LOGICAL_H } from './MarketingShared';
import { LANTERN_GLOW, productTileColors, productAccentColor } from '@/lib/palette';

const VARDAG_BG = productTileColors.vardagskort.tileDeep; // #48A873
const PILL_BG = productAccentColor.vardagskort; // #A8E5C0

const QUESTION = 'Vad var det bästa som hände idag?';

export default function MarketingVardagQuestion() {
  return (
    <ScaledScreen background={VARDAG_BG}>
      {/* Soft atmospheric vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(110% 80% at 50% 30%, rgba(255,253,248,0.18) 0%, rgba(72,168,115,0) 60%)',
          pointerEvents: 'none',
        }}
      />
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
        <div
          style={{
            fontFamily: FONT_LABEL,
            fontSize: 12,
            letterSpacing: '0.22em',
            color: 'rgba(255,253,248,0.78)',
            marginBottom: 28,
          }}
        >
          FRÅGA 1 AV 5
        </div>

        <div style={{ position: 'relative', width: '100%', flex: 1, display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              position: 'absolute',
              inset: '-40px -20px',
              background:
                'radial-gradient(60% 50% at 50% 50%, rgba(253,246,227,0.40) 0%, rgba(253,246,227,0.10) 55%, rgba(253,246,227,0) 75%)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'relative',
              width: '100%',
              borderRadius: 28,
              background: LANTERN_GLOW,
              padding: '64px 30px 68px',
              boxShadow:
                '0 30px 80px rgba(0,0,0,0.30), 0 8px 24px rgba(0,0,0,0.18), 0 0 0 1px rgba(253,246,227,0.05)',
              minHeight: 300,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <p
              style={{
                fontFamily: FONT_SERIF,
                fontStyle: 'italic',
                fontSize: 30,
                lineHeight: 1.3,
                color: '#0E2E22',
                margin: 0,
                textAlign: 'center',
              }}
            >
              {QUESTION}
            </p>
          </div>
        </div>

        {/* Glassy mid-green pill CTA */}
        <button
          style={{
            marginTop: 28,
            height: 48,
            minWidth: 200,
            paddingInline: 36,
            borderRadius: 24,
            border: '1px solid rgba(255,253,248,0.35)',
            background: `${PILL_BG}cc`,
            color: '#0E2E22',
            fontFamily: FONT_SANS,
            fontWeight: 600,
            fontSize: 15,
            letterSpacing: '0.02em',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 12px 28px rgba(0,0,0,0.18)',
          }}
        >
          Nästa
        </button>
      </div>
    </ScaledScreen>
  );
}
