/**
 * Marketing 04 — Onboarding clean quote frame.
 * Static replica of PreAuthIntroSlide1 (no auth context, no CTA).
 */
import { ScaledScreen, LOGICAL_H } from './MarketingShared';
import { MIDNIGHT_INK, LANTERN_GLOW, BONKI_ORANGE } from '@/lib/palette';

const QUOTE = 'Samtalet som dagen inte gav plats för';

export default function MarketingOnboarding() {
  return (
    <ScaledScreen background={MIDNIGHT_INK}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          padding: '64px 24px 48px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          height: LOGICAL_H,
        }}
      >
        {/* BONKI wordmark — top */}
        <div
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 14,
            letterSpacing: '3px',
            color: LANTERN_GLOW,
            opacity: 0.85,
            lineHeight: 1,
          }}
        >
          BONKI
        </div>

        {/* Centered italic serif quote */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            maxWidth: 320,
          }}
        >
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 26,
              lineHeight: 1.4,
              color: LANTERN_GLOW,
              textAlign: 'center',
              margin: 0,
            }}
          >
            {QUOTE}
          </h1>
        </div>

        {/* Three-dot pagination — first dot orange */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: i === 0 ? BONKI_ORANGE : 'rgba(253,246,227,0.20)',
                display: 'block',
              }}
            />
          ))}
        </div>
      </div>
    </ScaledScreen>
  );
}
