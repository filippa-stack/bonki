/**
 * ProductIntroMock — sandboxed intro page state machine at /intro-mock/:productId.
 *
 * State machine (driven by localStorage + dev panel override):
 *   - free:             no welcome session used → ghost-glow "Använd mitt gratis-samtal"
 *   - locked:           welcome used in another product → orange "Köp · 195 kr"
 *   - alreadyUsedHere:  welcome used in THIS product → paywall placeholder
 *   - purchased:        product purchased → render-time redirect to /product/{slug}
 *
 * Live ProductIntro.tsx is untouched.
 *
 * NOTE for live migration: in production, the free-state CTA should navigate
 * to /card/{firstCardId} (the product's first session), not back to
 * /library-mock. The mock loops back to the library so we can evaluate the
 * state machine end-to-end without leaving the sandbox.
 */

import { useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getProductById } from '@/data/products';
import { productIntros } from '@/data/productIntros';
import { PREVIEW_QUESTION } from '@/lib/productPreviewQuestions';
import { usePageBackground } from '@/hooks/usePageBackground';

import jimImage from '@/assets/illustration-jag-i-mig.png';
import jmaImage from '@/assets/illustration-jag-med-andra.png';
import jivImage from '@/assets/illustration-jag-i-varlden.png';
import illustrationVardag from '@/assets/illustration-vardag.png';
import illustrationSyskon from '@/assets/illustration-syskon.png';
import illustrationSexualitet from '@/assets/illustration-sexualitet.png';
import illustrationStillUs from '@/assets/illustration-still-us-home.png';

const LANTERN_GLOW = '#FDF6E3';
const MIDNIGHT_INK = '#0F1727';
const BONKI_ORANGE = '#E85D2C';
const GHOST_GLOW = '#D4F5C0';

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

/** Subhead taglines — mirror the library mock's tagline map. */
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

  usePageBackground(MIDNIGHT_INK);

  if (!product || !introData) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: MIDNIGHT_INK,
          color: LANTERN_GLOW,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 14,
          textAlign: 'center',
        }}
      >
        Okänt produkt-id: {productId}
      </div>
    );
  }

  // ── Resolve state ──
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

  // For locked state, "Locked" dev button hardcodes Jag i Mig display name.
  const otherProductName = (() => {
    if (forcedState === 'locked') return 'Jag i Mig';
    const where = typeof window !== 'undefined'
      ? localStorage.getItem('bonki-mock-welcome-product')
      : null;
    return where ? (getProductById(where)?.name ?? 'ett annat samtal') : 'ett annat samtal';
  })();

  const creatureImage = PRODUCT_ILLUSTRATION[productId];
  const fullBodyText = introData.slides.map(s => s.body).join('\n\n');
  const sexSafetyLine =
    productId === 'sexualitetskort' ? introData.slides[0]?.signoff : null;

  // ── CTA handlers ──
  const handleFreeCta = () => {
    localStorage.setItem('bonki-mock-welcome-spent', '1');
    localStorage.setItem('bonki-mock-welcome-product', productId);
    // Mock loop — in live, navigate to /card/{firstCardId}
    navigate('/library-mock');
  };

  const handlePurchaseCta = () => {
    localStorage.setItem(`bonki-mock-purchased-${productId}`, '1');
    navigate('/library-mock');
  };

  const handleSoftDecline = () => navigate('/library-mock');

  const clearMockFlags = () => {
    localStorage.removeItem('bonki-mock-welcome-spent');
    localStorage.removeItem('bonki-mock-welcome-product');
    localStorage.removeItem(`bonki-mock-purchased-${productId}`);
  };

  return (
    <div
      style={{
        backgroundColor: MIDNIGHT_INK,
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'Inter, system-ui, sans-serif',
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
            height: '42%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
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
              bottom: 0,
              left: 0,
              right: 0,
              height: '50%',
              background: `linear-gradient(to top, ${MIDNIGHT_INK} 0%, transparent 100%)`,
              pointerEvents: 'none',
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

      {/* Dev panel */}
      <DevPanel
        resolved={resolved}
        forced={forcedState}
        onSelect={(s) => {
          clearMockFlags();
          setForcedState(s);
          bumpTick();
        }}
      />

      {/* Content column */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '0 28px',
          paddingTop: 'max(44px, env(safe-area-inset-top, 44px))',
          paddingBottom: 'calc(28px + env(safe-area-inset-bottom, 0px))',
          minHeight: '100vh',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ flex: '0 0 auto', minHeight: '15%', paddingTop: 60 }} />

        {/* Headline — product name only */}
        <h1
          style={{
            fontFamily: 'Fraunces, serif',
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

        {/* Subhead tagline */}
        {TAGLINES[productId] && (
          <p
            style={{
              fontFamily: 'Fraunces, serif',
              fontStyle: 'italic',
              fontSize: 18,
              color: LANTERN_GLOW,
              opacity: 0.92,
              textAlign: 'center',
              lineHeight: 1.4,
              margin: '10px 0 0',
            }}
          >
            {TAGLINES[productId]}
          </p>
        )}

        {/* Credentials — dark pill backing keeps contrast stable across illustration fade */}
        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
          <p
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 12,
              color: LANTERN_GLOW,
              opacity: 0.85,
              textAlign: 'center',
              margin: 0,
              lineHeight: 1.5,
              background: 'rgba(15,23,39,0.85)',
              padding: '6px 16px',
              borderRadius: 999,
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
            }}
          >
            Utvecklat av psykologer · 29 års klinisk erfarenhet
          </p>
        </div>

        {/* Body copy */}
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          {fullBodyText.split('\n\n').map((para, i) => (
            <p
              key={i}
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: 16,
                color: LANTERN_GLOW,
                opacity: 0.92,
                lineHeight: 1.5,
                margin: i === 0 ? 0 : '14px 0 0',
              }}
            >
              {para}
            </p>
          ))}
        </div>

        {/* Sample question card */}
        {PREVIEW_QUESTION[productId] && (
          <div
            style={{
              marginTop: 28,
              padding: '22px 22px',
              borderRadius: 14,
              backgroundColor: 'rgba(11, 16, 38, 0.35)',
              border: '1px solid rgba(253, 246, 227, 0.20)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: LANTERN_GLOW,
                opacity: 0.5,
                marginBottom: 10,
              }}
            >
              En fråga ur {product.name}
            </div>
            <p
              style={{
                fontFamily: 'Fraunces, serif',
                fontStyle: 'italic',
                fontSize: 17,
                fontWeight: 400,
                lineHeight: 1.45,
                color: LANTERN_GLOW,
                opacity: 0.92,
                margin: 0,
              }}
            >
              &ldquo;{PREVIEW_QUESTION[productId]}&rdquo;
            </p>
          </div>
        )}

        {/* CTA region */}
        <div style={{ marginTop: 28 }}>
          {resolved === 'alreadyUsedHere' ? (
            <AlreadyUsedHerePlaceholder onBack={handleSoftDecline} />
          ) : (
            <>
              {resolved === 'free' && (
                <p
                  style={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: 15,
                    fontWeight: 600,
                    color: LANTERN_GLOW,
                    opacity: 0.9,
                    textAlign: 'center',
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  Resten av {product.name} — {PRICE_SEK} kr
                </p>
              )}

              {resolved === 'locked' && (
                <p
                  style={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: 11.5,
                    color: LANTERN_GLOW,
                    opacity: 0.6,
                    textAlign: 'center',
                    margin: '0 0 14px',
                    lineHeight: 1.5,
                  }}
                >
                  Du har redan använt ditt gratis-samtal i {otherProductName}.
                </p>
              )}

              {resolved === 'free' ? (
                <button
                  onClick={handleFreeCta}
                  style={{
                    width: '100%',
                    height: 56,
                    marginTop: 18,
                    background: GHOST_GLOW,
                    color: MIDNIGHT_INK,
                    border: 'none',
                    borderRadius: 14,
                    cursor: 'pointer',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  Använd mitt gratis-samtal
                </button>
              ) : (
                <button
                  onClick={handlePurchaseCta}
                  style={{
                    width: '100%',
                    height: 56,
                    background: BONKI_ORANGE,
                    color: LANTERN_GLOW,
                    border: 'none',
                    borderRadius: 14,
                    cursor: 'pointer',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  Köp · {PRICE_SEK} kr
                </button>
              )}

              {resolved === 'locked' && (
                <button
                  onClick={handleSoftDecline}
                  style={{
                    display: 'block',
                    width: '100%',
                    marginTop: 14,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: 12.5,
                    color: LANTERN_GLOW,
                    opacity: 0.7,
                    padding: '4px 0',
                  }}
                >
                  Inte just nu
                </button>
              )}

              {sexSafetyLine && (
                <p
                  style={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontStyle: 'italic',
                    fontSize: 13,
                    color: LANTERN_GLOW,
                    opacity: 0.6,
                    textAlign: 'center',
                    marginTop: 12,
                    lineHeight: 1.5,
                  }}
                >
                  {sexSafetyLine}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */

function AlreadyUsedHerePlaceholder({ onBack }: { onBack: () => void }) {
  return (
    <div
      style={{
        padding: '20px 20px',
        borderRadius: 14,
        background: 'rgba(232, 93, 44, 0.12)',
        border: '1px dashed rgba(232, 93, 44, 0.45)',
        textAlign: 'center',
      }}
    >
      <p
        style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 14,
          color: LANTERN_GLOW,
          opacity: 0.85,
          margin: 0,
          lineHeight: 1.5,
        }}
      >
        Paywall would render here — coming next
      </p>
      <button
        onClick={onBack}
        style={{
          marginTop: 12,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: LANTERN_GLOW,
          opacity: 0.7,
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 12.5,
          padding: '4px 8px',
        }}
      >
        Tillbaka till biblioteket
      </button>
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
  const buttons: Array<{ label: string; value: Exclude<ForcedState, null> }> = [
    { label: 'Free', value: 'free' },
    { label: 'Locked (i Jag i Mig)', value: 'locked' },
    { label: 'Purchased', value: 'purchased' },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 76px)',
        left: 12,
        zIndex: 9999,
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
      <div
        style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.08em',
          color: 'rgba(253,246,227,0.6)',
          textTransform: 'uppercase',
          padding: '2px 6px 0',
        }}
      >
        Mock state · {resolved}
      </div>
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
              fontFamily: 'Inter, system-ui, sans-serif',
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
