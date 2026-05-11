/**
 * Marketing 02 — Vardag mid-session question card.
 * Renders the real card 'vk-hur-var-din-dag' prompt[6] inside a
 * production-faithful cream card on Vardag atmospheric green.
 * Visual styling mirrors the live kids session in CardView.
 */
import { ScaledScreen, FONT_SERIF, FONT_SANS, LOGICAL_H } from './MarketingShared';
import { LANTERN_GLOW, productAccentColor, productTileColors } from '@/lib/palette';
import { vardagskortProduct } from '@/data/products/vardagskort';
import { useCardImage } from '@/hooks/useCardImage';

const CARD = vardagskortProduct.cards.find((c) => c.id === 'vk-hur-var-din-dag')!;
const PROMPTS = (CARD.sections[0] as any).prompts as string[];
const QUESTION = PROMPTS[6];
const TOTAL = PROMPTS.length; // 7
const CURRENT = 7;

const VARDAG_BG = vardagskortProduct.backgroundColor || productTileColors.vardagskort.tileDeep;
const VARDAG_ACCENT = productAccentColor['vardagskort'];

export default function MarketingVardagQuestion() {
  return (
    <ScaledScreen background={VARDAG_BG}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          height: LOGICAL_H,
        }}
      >
        {/* ── Top bar — card title left, close button right (matches live kids chrome) ── */}
        <div
          style={{
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingLeft: 16,
            paddingRight: 16,
          }}
        >
          <span
            style={{
              fontFamily: FONT_SANS,
              fontSize: 15,
              fontWeight: 400,
              color: LANTERN_GLOW,
            }}
          >
            {CARD.title}
          </span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={LANTERN_GLOW} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.65 }}>
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </div>

        {/* Progress bar */}
        <div style={{ width: '100%', height: 4, backgroundColor: 'rgba(255,255,255,0.10)' }}>
          <div
            style={{
              height: '100%',
              width: `${(CURRENT / TOTAL) * 100}%`,
              background: `linear-gradient(90deg, ${VARDAG_ACCENT}, color-mix(in srgb, ${VARDAG_ACCENT} 70%, white))`,
            }}
          />
        </div>

        {/* Kids counter pill — production format ("7 av 7" with leading dot) */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 36 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontFamily: FONT_SANS,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.04em',
              color: 'rgba(253,246,227,0.75)',
              borderRadius: 20,
              padding: '5px 14px 5px 10px',
              border: '1px solid rgba(253,246,227,0.18)',
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: 'rgba(253,246,227,0.75)',
              }}
            />
            {CURRENT} av {TOTAL}
          </span>
        </div>

        {/* Cream question card */}
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
              inset: '-24px -12px',
              background:
                'radial-gradient(60% 50% at 50% 50%, rgba(233,200,144,0.18) 0%, rgba(233,200,144,0.04) 55%, transparent 75%)',
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
              padding: '32px 24px 36px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.20)',
              minHeight: 240,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <p
              style={{
                fontFamily: FONT_SERIF,
                fontStyle: 'italic',
                fontSize: 21,
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

        {/* Reflection trigger */}
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            marginTop: 16,
            background: 'none',
            border: 'none',
            padding: '12px 20px',
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
            }}
          >
            Skriv vad ni vill minnas
          </span>
        </button>

        {/* Kids accent pill — matches live CardView kids CTA exactly */}
        <div style={{ padding: '8px 24px 20px', display: 'flex', justifyContent: 'center' }}>
          <button
            style={{
              width: '100%',
              maxWidth: 340,
              height: 56,
              borderRadius: 28,
              background: `color-mix(in srgb, ${VARDAG_ACCENT} 40%, rgba(255,255,255,0.06))`,
              border: `1px solid color-mix(in srgb, ${VARDAG_ACCENT} 60%, transparent)`,
              color: LANTERN_GLOW,
              fontFamily: FONT_SANS,
              fontWeight: 600,
              fontSize: 16,
              letterSpacing: 0,
            }}
          >
            Nästa
          </button>
        </div>
      </div>
    </ScaledScreen>
  );
}
