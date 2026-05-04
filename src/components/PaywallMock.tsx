/**
 * PaywallMock — sandboxed paywall surface at /paywall-mock/:productId.
 *
 * Renders the post-welcome-session paywall. Single state (assumes welcome
 * spent on this product, not yet purchased). Live ProductPaywall.tsx and
 * production paywall logic untouched.
 *
 * Out of scope (mock placeholders):
 *   - Real card-2-title lookup from product card arrays (hardcoded)
 *   - welcome_product_id backend integration
 *   - Testimonials / social proof
 *   - Connection to actual session-completion event
 */

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getProductById } from '@/data/products';
import { usePageBackground } from '@/hooks/usePageBackground';

import jimImage from '@/assets/illustration-jag-i-mig.png';
import jmaImage from '@/assets/illustration-jag-med-andra.png';
import jivImage from '@/assets/illustration-jag-i-varlden.png';
import illustrationVardag from '@/assets/illustration-vardag.png';
import illustrationSyskon from '@/assets/illustration-syskon.png';
import illustrationStillUs from '@/assets/illustration-still-us-home.png';

const LANTERN_GLOW = '#FDF6E3';
const MIDNIGHT_INK = '#0F1727';
const BONKI_ORANGE = '#E85D2C';
const PRICE_SEK = 195;

const PRODUCT_ILLUSTRATION: Record<string, string> = {
  jag_i_mig: jimImage,
  jag_med_andra: jmaImage,
  jag_i_varlden: jivImage,
  vardagskort: illustrationVardag,
  syskonkort: illustrationSyskon,
  still_us: illustrationStillUs,
};

const PRODUCT_ILLUSTRATION_POSITION: Record<string, string> = {
  jag_i_mig: 'center 25%',
  jag_med_andra: 'center 35%',
  jag_i_varlden: 'center 30%',
  vardagskort: 'center 20%',
  syskonkort: 'center 15%',
  still_us: 'center 30%',
};

/** Hardcoded card-2 title placeholders. Production will read from product card arrays. */
const NEXT_CARD_TITLE: Record<string, string> = {
  jag_i_mig: 'Det jag bär',
  jag_med_andra: 'När någon ser mig',
  jag_i_varlden: 'Vad som är mitt',
  vardagskort: 'Det som var idag',
  syskonkort: 'När vi delar',
  still_us: 'Det vi inte sa',
};

/** Products where the single-line CTA "Fortsätt med {name} — 195 kr" is too wide at 14px. */
const CTA_TWO_LINE: Record<string, boolean> = {
  jag_med_andra: true,
  jag_i_varlden: true,
};

interface PaywallMockProps {
  productId: string;
}

export default function PaywallMock({ productId }: PaywallMockProps) {
  const navigate = useNavigate();
  const product = useMemo(() => getProductById(productId), [productId]);

  usePageBackground(MIDNIGHT_INK);

  if (!product || !NEXT_CARD_TITLE[productId]) {
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

  const creatureImage = PRODUCT_ILLUSTRATION[productId];
  const nextTitle = NEXT_CARD_TITLE[productId];
  const useTwoLineCta = CTA_TWO_LINE[productId] === true;

  const handlePurchase = () => {
    localStorage.setItem(`bonki-mock-purchased-${productId}`, '1');
    navigate('/library-mock');
  };
  const handleSoftDecline = () => navigate('/library-mock');

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
      <DevPanel productId={productId} />

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

        {/* Acknowledgment eyebrow */}
        <p
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: LANTERN_GLOW,
            opacity: 0.9,
            textAlign: 'center',
            margin: 0,
          }}
        >
          FÖRSTA SAMTALET · KLART
        </p>

        {/* Headline */}
        <h1
          style={{
            fontFamily: 'Fraunces, serif',
            fontSize: 36,
            fontWeight: 500,
            color: LANTERN_GLOW,
            textAlign: 'center',
            lineHeight: 1.15,
            letterSpacing: '-0.01em',
            margin: '18px 0 0',
            textShadow: '0 2px 12px rgba(0,0,0,0.35)',
          }}
        >
          Ni har börjat något.
        </h1>

        {/* Next session card */}
        <div
          style={{
            marginTop: 32,
            padding: '24px 20px',
            borderRadius: 18,
            background: 'rgba(15,23,39,0.85)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '0.5px solid rgba(255,255,255,0.18)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.20em',
              textTransform: 'uppercase',
              color: LANTERN_GLOW,
              opacity: 0.65,
            }}
          >
            NÄSTA SAMTAL
          </div>
          <p
            style={{
              fontFamily: 'Fraunces, serif',
              fontStyle: 'italic',
              fontSize: 22,
              fontWeight: 500,
              color: LANTERN_GLOW,
              margin: '12px 0 0',
              lineHeight: 1.3,
            }}
          >
            {nextTitle}
          </p>
        </div>

        {/* Scope context line */}
        <p
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: 13,
            fontWeight: 500,
            color: LANTERN_GLOW,
            opacity: 0.75,
            textAlign: 'center',
            margin: '24px 0 0',
            lineHeight: 1.5,
          }}
        >
          20 samtal kvar att utforska tillsammans.
        </p>

        {/* Bottom cluster: pricing + CTA + soft decline */}
        <div style={{ marginTop: 'auto', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 100px)' }}>
          {/* Pricing context */}
          <p
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 13,
              fontWeight: 500,
              color: LANTERN_GLOW,
              opacity: 0.75,
              textAlign: 'center',
              margin: '0',
              lineHeight: 1.5,
            }}
          >
            {PRICE_SEK} kr · Engångsköp · Tillgång för alltid
          </p>

          {/* Primary CTA */}
          <button
            onClick={handlePurchase}
            style={{
              width: '100%',
              height: 56,
              marginTop: 20,
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
            {useTwoLineCta
              ? `Fortsätt med ${product.name}`
              : `Fortsätt med ${product.name} — ${PRICE_SEK} kr`}
          </button>

          {useTwoLineCta && (
            <p
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: 12,
                color: LANTERN_GLOW,
                opacity: 0.7,
                textAlign: 'center',
                margin: '8px 0 0',
              }}
            >
              {PRICE_SEK} kr · Engångsköp
            </p>
          )}

          {/* Soft decline */}
          <button
            onClick={handleSoftDecline}
            style={{
              display: 'block',
              width: '100%',
              marginTop: 16,
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
        </div>

        {useTwoLineCta && (
          <p
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 12,
              color: LANTERN_GLOW,
              opacity: 0.7,
              textAlign: 'center',
              margin: '8px 0 0',
            }}
          >
            {PRICE_SEK} kr · Engångsköp
          </p>
        )}

        {/* Soft decline */}
        <button
          onClick={handleSoftDecline}
          style={{
            display: 'block',
            width: '100%',
            marginTop: 16,
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
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */

function DevPanel({ productId }: { productId: string }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const anchorStyle = {
    position: 'fixed' as const,
    bottom: 'calc(env(safe-area-inset-bottom, 0px) + 76px)',
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
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.04em',
          cursor: 'pointer',
        }}
      >
        Mock · paywall ▾
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
          fontFamily: 'Inter, system-ui, sans-serif',
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
        <span>Mock · paywall</span>
        <span style={{ opacity: 0.7 }}>▴</span>
      </button>
      <button
        onClick={() => navigate(`/intro-mock/${productId}`)}
        style={navButtonStyle}
      >
        Se intro
      </button>
      <button
        onClick={() => navigate('/library-mock')}
        style={navButtonStyle}
      >
        Tillbaka till biblioteket
      </button>
    </div>
  );
}

const navButtonStyle: React.CSSProperties = {
  padding: '6px 10px',
  borderRadius: 6,
  border: '0.5px solid rgba(255,255,255,0.18)',
  background: 'rgba(255,255,255,0.06)',
  color: '#FDF6E3',
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: 11,
  fontWeight: 600,
  cursor: 'pointer',
  textAlign: 'left',
};
