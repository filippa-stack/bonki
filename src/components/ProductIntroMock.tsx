/**
 * ProductIntroMock — sandboxed intro page at /intro-mock/:productId.
 *
 * Mirrors the live ProductIntro redesign (editorial layout, sticky CTA,
 * trust block, multi-question preview stack). Free-session UI is omitted
 * in this pass — the page targets the locked state only.
 *
 * The dev state-machine panel is preserved but only mounts in DEV builds.
 */

import { useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getProductById } from '@/data/products';
import { productIntros } from '@/data/productIntros';
import { PREVIEW_QUESTIONS } from '@/lib/productPreviewQuestions';
import { usePageBackground } from '@/hooks/usePageBackground';
import { LANTERN_GLOW, MIDNIGHT_INK, WARM_GOLD, DEEP_DUSK_BG, productTileColors } from '@/lib/palette';

import jimImage from '@/assets/illustration-jag-i-mig.png';
import jmaImage from '@/assets/illustration-jag-med-andra.png';
import jivImage from '@/assets/illustration-jag-i-varlden.png';
import illustrationVardag from '@/assets/illustration-vardag.png';
import illustrationSyskon from '@/assets/illustration-syskon.png';
import illustrationSexualitet from '@/assets/illustration-sexualitet.png';
import illustrationStillUs from '@/assets/illustration-still-us-home.png';

const PRODUCT_ILLUSTRATION: Record<string, string> = {
  jag_i_mig: jimImage,
  jag_med_andra: jmaImage,
  jag_i_varlden: jivImage,
  vardagskort: illustrationVardag,
  syskonkort: illustrationSyskon,
  sexualitetskort: illustrationSexualitet,
  still_us: illustrationStillUs,
};

const PRODUCT_ILLUSTRATION_POSITION: Record<string, string> = {
  jag_i_mig: 'center 25%',
  jag_med_andra: 'center 35%',
  jag_i_varlden: 'center 30%',
  vardagskort: 'center 20%',
  syskonkort: 'center 15%',
  sexualitetskort: 'center 20%',
  still_us: 'center 30%',
};

const TAGLINES: Record<string, string> = {
  still_us: 'Förbli ett vi medan ni uppfostrar dem',
  jag_i_mig: 'När känslor får ord',
  jag_med_andra: 'Det trygga och det svåra',
  jag_i_varlden: 'En värld som vidgas',
  vardagskort: 'Det vanliga, på djupet',
  syskonkort: 'Band för livet',
  sexualitetskort: 'Kropp, gränser och identitet',
};

type ForcedState = 'free' | 'locked' | 'purchased' | null;
type ResolvedState = 'free' | 'locked' | 'alreadyUsedHere' | 'purchased';

const PRICE_SEK = 195;

interface ProductIntroMockProps {
  productId: string;
}

export default function ProductIntroMock({ productId }: ProductIntroMockProps) {
  const navigate = useNavigate();
  const product = useMemo(() => getProductById(productId), [productId]);
  const introData = productIntros[productId];

  const [forcedState, setForcedState] = useState<ForcedState>(null);
  const [, setTick] = useState(0);
  const bumpTick = () => setTick(t => t + 1);

  const isAdult = productId === 'still_us';
  const bgColor = isAdult ? DEEP_DUSK_BG : (product?.backgroundColor ?? MIDNIGHT_INK);
  const accentTint = isAdult ? WARM_GOLD : (productTileColors[productId]?.tileLight ?? WARM_GOLD);
  usePageBackground(bgColor);

  if (!product || !introData) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: bgColor,
          color: LANTERN_GLOW,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          fontFamily: 'var(--font-sans)',
          fontSize: 14,
          textAlign: 'center',
        }}
      >
        Okänt produkt-id: {productId}
      </div>
    );
  }

  const resolved: ResolvedState = (() => {
    if (forcedState === 'purchased') return 'purchased';
    if (forcedState === 'free') return 'free';
    if (forcedState === 'locked') return 'locked';
    if (typeof window !== 'undefined') {
      if (localStorage.getItem(`bonki-mock-purchased-${productId}`)) return 'purchased';
      const spent = localStorage.getItem('bonki-mock-welcome-spent') === '1';
      const where = localStorage.getItem('bonki-mock-welcome-product');
      if (spent && where === productId) return 'alreadyUsedHere';
      if (spent && where && where !== productId) return 'locked';
    }
    return 'free';
  })();

  if (resolved === 'purchased') {
    return <Navigate to={`/product/${product.slug}`} replace />;
  }

  const creatureImage = PRODUCT_ILLUSTRATION[productId];
  const fullBodyText = introData.slides.map(s => s.body).join('\n\n');
  const paragraphs = fullBodyText.split('\n\n').map(p => p.trim()).filter(Boolean);
  const opening = paragraphs[0];
  const restParagraphs = paragraphs.slice(1);
  const previewQuestions = PREVIEW_QUESTIONS[productId] ?? [];
  const sexSafetyLine = productId === 'sexualitetskort' ? introData.slides[0]?.signoff : null;

  const handlePurchaseCta = () => {
    localStorage.setItem(`bonki-mock-purchased-${productId}`, '1');
    navigate('/library-mock');
  };

  const clearMockFlags = () => {
    localStorage.removeItem('bonki-mock-welcome-spent');
    localStorage.removeItem('bonki-mock-welcome-product');
    localStorage.removeItem(`bonki-mock-purchased-${productId}`);
  };

  return (
    <div
      style={{
        backgroundColor: bgColor,
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {/* Illustration backdrop */}
      {creatureImage && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: 0,
            left: '-10%',
            right: '-10%',
            height: '38%',
            overflow: 'hidden',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        >
          <img
            src={creatureImage}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: PRODUCT_ILLUSTRATION_POSITION[productId] ?? 'center 30%',
              opacity: 0.5,
              filter: 'brightness(1.15) saturate(0.95)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: isAdult
                ? 'radial-gradient(ellipse at 50% 30%, rgba(100,149,237,0.18) 0%, transparent 70%)'
                : `radial-gradient(ellipse at 50% 30%, ${accentTint}22 0%, transparent 70%)`,
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '60%',
              background: `linear-gradient(to top, ${bgColor} 0%, transparent 100%)`,
            }}
          />
        </div>
      )}

      {/* Back button */}
      <button
        onClick={() => navigate('/library-mock')}
        aria-label="Tillbaka"
        style={{
          position: 'absolute',
          top: 'max(12px, env(safe-area-inset-top, 12px))',
          left: 16,
          zIndex: 10,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 8,
          color: LANTERN_GLOW,
          opacity: 0.7,
        }}
      >
        <ArrowLeft size={24} />
      </button>

      {/* Dev panel (DEV-only) */}
      {import.meta.env.DEV && (
        <DevPanel
          resolved={resolved}
          forced={forcedState}
          onSelect={(s) => {
            clearMockFlags();
            setForcedState(s);
            bumpTick();
          }}
        />
      )}

      {/* Scrollable content */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          style={{
            padding: '0 24px',
            paddingTop: 'max(80px, calc(env(safe-area-inset-top, 0px) + 80px))',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ height: 'calc(28vh - 80px)', minHeight: 60 }} />

          {/* Title */}
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 40,
              fontWeight: 500,
              color: LANTERN_GLOW,
              textAlign: 'center',
              lineHeight: 1.15,
              letterSpacing: '-0.01em',
              margin: 0,
              textShadow: '0 2px 12px rgba(0,0,0,0.35)',
            }}
          >
            {product.name}
          </h1>

          {/* Subtitle */}
          {TAGLINES[productId] && (
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontSize: 18,
                color: LANTERN_GLOW,
                opacity: 0.85,
                textAlign: 'center',
                lineHeight: 1.4,
                margin: '10px 0 0',
              }}
            >
              {TAGLINES[productId]}
            </p>
          )}

          {/* Trust signal */}
          <div
            style={{
              marginTop: 32,
              padding: '14px 0',
              borderTop: `1px solid color-mix(in srgb, ${WARM_GOLD} 35%, transparent)`,
              borderBottom: `1px solid color-mix(in srgb, ${WARM_GOLD} 35%, transparent)`,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: WARM_GOLD,
                opacity: 0.8,
              }}
            >
              Utvecklat av psykolog
            </div>
            <div
              style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontSize: 15,
                color: LANTERN_GLOW,
                opacity: 0.95,
                marginTop: 6,
              }}
            >
              Ida W. · 29 års klinisk erfarenhet
            </div>
          </div>

          {/* Opening */}
          {opening && (
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 18,
                color: LANTERN_GLOW,
                lineHeight: 1.4,
                textAlign: 'center',
                margin: '24px 0',
              }}
            >
              {opening}
            </p>
          )}

          {/* Body paragraphs */}
          {restParagraphs.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {restParagraphs.map((para, i) => (
                <p
                  key={i}
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 15,
                    color: LANTERN_GLOW,
                    opacity: 0.85,
                    lineHeight: 1.55,
                    textAlign: 'center',
                    margin: 0,
                  }}
                >
                  {para}
                </p>
              ))}
            </div>
          )}

          {/* Example questions */}
          {previewQuestions.length > 0 && (
            <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {previewQuestions.map((q, i) => (
                <div
                  key={i}
                  style={{
                    padding: '24px 20px',
                    borderRadius: 14,
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: '0.10em',
                      textTransform: 'uppercase',
                      color: LANTERN_GLOW,
                      opacity: 0.55,
                      marginBottom: 12,
                    }}
                  >
                    En fråga ur {product.name}
                  </div>
                  <p
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontStyle: 'italic',
                      fontSize: 17,
                      color: LANTERN_GLOW,
                      lineHeight: 1.45,
                      margin: 0,
                    }}
                  >
                    &ldquo;{q}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          )}

          {sexSafetyLine && (
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontSize: 13,
                color: LANTERN_GLOW,
                opacity: 0.6,
                textAlign: 'center',
                marginTop: 20,
                lineHeight: 1.5,
              }}
            >
              {sexSafetyLine}
            </p>
          )}

          {resolved === 'alreadyUsedHere' && (
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontSize: 13,
                color: LANTERN_GLOW,
                opacity: 0.6,
                textAlign: 'center',
                marginTop: 20,
              }}
            >
              (Mock: paywall placeholder — already used here)
            </p>
          )}

          <div style={{ height: 'calc(140px + env(safe-area-inset-bottom, 0px))' }} />
        </div>
      </div>

      {/* Sticky bottom: price + CTA */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 5,
          paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 0px))',
          paddingTop: 16,
          background: `linear-gradient(to top, ${bgColor} 0%, ${bgColor} 70%, transparent 100%)`,
          pointerEvents: 'none',
        }}
      >
        <div style={{ pointerEvents: 'auto', padding: '0 24px' }}>
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 13,
              color: LANTERN_GLOW,
              opacity: 0.7,
              letterSpacing: '0.04em',
              textAlign: 'center',
              margin: '0 0 10px',
            }}
          >
            {product.cards.length} samtal · {PRICE_SEK} kr · engångsköp
          </p>
          <button
            onClick={handlePurchaseCta}
            style={{
              width: '100%',
              height: 56,
              borderRadius: 28,
              background: `color-mix(in srgb, ${accentTint} 28%, rgba(255,255,255,0.06))`,
              border: `1px solid color-mix(in srgb, ${accentTint} 50%, transparent)`,
              color: LANTERN_GLOW,
              fontFamily: 'var(--font-display)',
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Köp {product.name}
            <span style={{ opacity: 0.85, marginLeft: 6 }}>· {PRICE_SEK} kr</span>
          </button>
        </div>
      </div>
      {/* TODO: free-session branch returns in a later release */}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */

interface DevPanelProps {
  resolved: ResolvedState;
  forced: ForcedState;
  onSelect: (s: ForcedState) => void;
}

function DevPanel({ resolved, forced, onSelect }: DevPanelProps) {
  const [expanded, setExpanded] = useState(false);

  const buttons: Array<{ label: string; value: Exclude<ForcedState, null> }> = [
    { label: 'Free', value: 'free' },
    { label: 'Locked (i Jag i Mig)', value: 'locked' },
    { label: 'Purchased', value: 'purchased' },
  ];

  const anchorStyle = {
    position: 'fixed' as const,
    bottom: 'calc(env(safe-area-inset-bottom, 0px) + 140px)',
    left: 12,
    zIndex: 9998,
  };

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        style={{
          ...anchorStyle,
          padding: '6px 10px',
          borderRadius: 999,
          background: 'rgba(0,0,0,0.55)',
          border: '0.5px solid rgba(255,255,255,0.18)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          color: '#FDF6E3',
          fontFamily: 'var(--font-sans)',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.04em',
          cursor: 'pointer',
        }}
      >
        Mock · {resolved} ▾
      </button>
    );
  }

  return (
    <div
      style={{
        ...anchorStyle,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        padding: 6,
        borderRadius: 10,
        background: 'rgba(0,0,0,0.55)',
        border: '0.5px solid rgba(255,255,255,0.18)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <button
        onClick={() => setExpanded(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          fontFamily: 'var(--font-sans)',
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.08em',
          color: 'rgba(253,246,227,0.7)',
          textTransform: 'uppercase',
          padding: '2px 6px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span>Mock state · {resolved}</span>
        <span style={{ opacity: 0.7 }}>▴</span>
      </button>
      {buttons.map(b => {
        const active = forced === b.value;
        return (
          <button
            key={b.value}
            onClick={() => onSelect(b.value)}
            style={{
              padding: '6px 10px',
              borderRadius: 6,
              border: '0.5px solid rgba(255,255,255,0.18)',
              background: active ? 'rgba(232,93,44,0.85)' : 'rgba(255,255,255,0.06)',
              color: '#FDF6E3',
              fontFamily: 'var(--font-sans)',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            {b.label}
          </button>
        );
      })}
    </div>
  );
}
