/**
 * Marketing 01 — Vårt Vi mid-session question card.
 * Renders the real card 'smallest-we' prompt[0] inside a production-faithful
 * cream card on Midnight Ink. Visual styling mirrors SessionFocusShell's
 * cream card (#FAF7F2, 28px radius) and the live VV warm-gold pill CTA.
 */
import { ScaledScreen, FONT_SERIF, FONT_SANS, LOGICAL_H } from './MarketingShared';
import { MIDNIGHT_INK, LANTERN_GLOW, WARM_GOLD, BARK } from '@/lib/palette';
import { cards as stillUsCards } from '@/data/content';
import { useCardImage } from '@/hooks/useCardImage';

const CARD = stillUsCards.find((c) => c.id === 'smallest-we')!;
const QUESTION = (CARD.sections[0].prompts as string[])[0];
const TOTAL_PROMPTS = (CARD.sections[0].prompts as string[]).length; // 4
const CURRENT_PROMPT = 2;

export default function MarketingVvQuestion() {
  return (
    <ScaledScreen background={MIDNIGHT_INK}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          height: LOGICAL_H,
        }}
      >
        {/* ── Top bar: card title (matches live VV chrome) ── */}
        <div
          style={{
            height: 52,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            paddingTop: 8,
          }}
        >
          <span
            style={{
              fontFamily: FONT_SANS,
              fontSize: 13,
              color: LANTERN_GLOW,
              opacity: 0.85,
              letterSpacing: 0,
            }}
          >
            {CARD.title}
          </span>
        </div>

        {/* Faint progress hairline */}
        <div style={{ width: '100%', height: 2, backgroundColor: 'rgba(255,255,255,0.08)' }}>
          <div style={{ height: '100%', width: '50%', backgroundColor: '#E9B44C' }} />
        </div>

        {/* Step counter — production VV format (lowercase paragraph) */}
        <p
          style={{
            fontFamily: FONT_SANS,
            fontSize: 11,
            letterSpacing: '0.04em',
            color: 'rgba(253,246,227,0.55)',
            textShadow: '0 1px 3px rgba(0,0,0,0.5)',
            textAlign: 'center',
            marginTop: 26,
            marginBottom: 0,
          }}
        >
          Fråga {CURRENT_PROMPT} av {TOTAL_PROMPTS}
        </p>

        {/* Cream question card with warm glow halo */}
        <div
          style={{
            position: 'relative',
            margin: '20px 16px 0',
            flex: 1,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: '-32px -16px',
              background:
                'radial-gradient(60% 50% at 50% 50%, rgba(233,200,144,0.28) 0%, rgba(233,200,144,0.08) 55%, rgba(233,200,144,0) 75%)',
              filter: 'blur(2px)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'relative',
              width: '100%',
              borderRadius: 28,
              background: '#FAF7F2',
              padding: '40px 24px 44px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
              minHeight: 280,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <p
              style={{
                fontFamily: FONT_SERIF,
                fontStyle: 'italic',
                fontSize: 24,
                lineHeight: 1.4,
                color: '#1A1A2E',
                margin: 0,
                textAlign: 'center',
              }}
            >
              {QUESTION}
            </p>
          </div>
        </div>

        {/* Reflection trigger — italic serif with pencil watermark feel */}
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            marginTop: 20,
            background: 'none',
            border: 'none',
            padding: '14px 20px',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={LANTERN_GLOW} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
          </svg>
          <span
            style={{
              fontFamily: FONT_SERIF,
              fontStyle: 'italic',
              fontSize: 14,
              color: LANTERN_GLOW,
              opacity: 0.7,
              letterSpacing: '0.01em',
            }}
          >
            Skriv vad ni vill minnas
          </span>
        </button>

        {/* Warm-gold pill CTA — matches live stillUsMode CTA */}
        <div style={{ padding: '8px 24px 20px', display: 'flex', justifyContent: 'center' }}>
          <button
            style={{
              width: '100%',
              maxWidth: 340,
              height: 56,
              borderRadius: 999,
              background: `color-mix(in srgb, ${WARM_GOLD} 28%, rgba(255,255,255,0.06))`,
              border: `1px solid color-mix(in srgb, ${WARM_GOLD} 50%, transparent)`,
              color: '#FDF6E3',
              fontFamily: FONT_SANS,
              fontWeight: 600,
              fontSize: 16,
              letterSpacing: '0.01em',
            }}
          >
            Nästa
          </button>
        </div>
      </div>
    </ScaledScreen>
  );
}
