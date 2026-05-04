/**
 * OnboardingMock — sandboxed v4 onboarding flow at /onboarding-mock.
 *
 * 3 screens (copy is immutable, do not paraphrase):
 *   1. Igenkänning — wordmark + recognition line, orange CTA
 *   2. Löfte & login — promise + credentials + price rows + Google CTA + e-post link
 *   3. Welcome gift — receptive register, ghost-glow CTA "Visa biblioteket"
 *
 * CTA color register matters:
 *   - Orange (#E85D2C) on screens 1+2 (transactional/advance)
 *   - Ghost-glow (#D4F5C0) on screen 3 (receptive/accept-the-gift)
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import BonkiLogoMark from '@/components/BonkiLogoMark';

const MIDNIGHT_INK = '#0F1727';
const LANTERN_GLOW = '#FDF6E3';
const BONKI_ORANGE = '#E85D2C';
const GHOST_GLOW = '#D4F5C0';

type Screen = 'recognition' | 'promise' | 'gift';
const SCREENS: Screen[] = ['recognition', 'promise', 'gift'];

/** Three 16×2 dashes, one active. Active color is per-screen. */
function DashProgress({ activeIndex, activeColor }: { activeIndex: number; activeColor: string }) {
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
      {[0, 1, 2].map(i => (
        <span
          key={i}
          aria-hidden
          style={{
            width: 16,
            height: 2,
            borderRadius: 1,
            background: i === activeIndex ? activeColor : 'rgba(253,246,227,0.20)',
          }}
        />
      ))}
    </div>
  );
}

export default function OnboardingMock() {
  const [screen, setScreen] = useState<Screen>('recognition');
  const idx = SCREENS.indexOf(screen);

  const goNext = () => {
    if (idx < SCREENS.length - 1) setScreen(SCREENS[idx + 1]);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: MIDNIGHT_INK,
        color: LANTERN_GLOW,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'Inter, system-ui, sans-serif',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {/* Pulsing-halo keyframes for screen 3 */}
      <style>{`
        @keyframes bonkiGiftPulse {
          0%, 100% { transform: scale(1); opacity: 0.85; }
          50% { transform: scale(1.10); opacity: 0.4; }
        }
        @media (prefers-reduced-motion: reduce) {
          .bonki-gift-halo::before { animation: none !important; }
        }
      `}</style>

      {screen === 'recognition' && <ScreenRecognition onNext={goNext} />}
      {screen === 'promise' && <ScreenPromise onNext={goNext} />}
      {screen === 'gift' && <ScreenGift />}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Screen 1 — Igenkänning                                                     */
/* ─────────────────────────────────────────────────────────────────────────── */

function ScreenRecognition({ onNext }: { onNext: () => void }) {
  return (
    <>
      {/* Wordmark — Inter 700, 12px, ls 4px, lantern-glow, ~56px from safe-area top */}
      <div
        style={{
          paddingTop: 56,
          textAlign: 'center',
        }}
      >
        <span
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: 4,
            color: LANTERN_GLOW,
          }}
        >
          BONKI
        </span>
      </div>

      {/* Vertical center: Fraunces italic 22, no subhead */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 28px',
        }}
      >
        <h1
          style={{
            fontFamily: 'Fraunces, serif',
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 22,
            lineHeight: 1.4,
            color: LANTERN_GLOW,
            textAlign: 'center',
            margin: 0,
          }}
        >
          Samtalet som dagen
          <br />
          inte gav plats för.
        </h1>
      </div>

      {/* Bottom: dashes + orange Fortsätt */}
      <div style={{ padding: '0 28px 32px' }}>
        <div style={{ marginBottom: 24 }}>
          <DashProgress activeIndex={0} activeColor={BONKI_ORANGE} />
        </div>
        <button
          onClick={onNext}
          style={{
            width: '100%',
            height: 50,
            borderRadius: 14,
            border: 'none',
            background: BONKI_ORANGE,
            color: '#FFFFFF',
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          Fortsätt
        </button>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Screen 2 — Löfte & login                                                   */
/* ─────────────────────────────────────────────────────────────────────────── */

function ScreenPromise({ onNext }: { onNext: () => void }) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '0 28px 32px',
      }}
    >
      {/* Flexible top spacer — breathes with viewport height */}
      <div style={{ flex: 0.7 }} />

      {/* Logo */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
        <BonkiLogoMark
          size={36}
          style={{ color: LANTERN_GLOW, opacity: 0.85 }}
        />
      </div>

      {/* Promise */}
      <p
        style={{
          fontFamily: 'Fraunces, serif',
          fontStyle: 'italic',
          fontWeight: 400,
          fontSize: 19,
          lineHeight: 1.4,
          color: LANTERN_GLOW,
          textAlign: 'center',
          margin: '0 0 14px',
        }}
      >
        De små samtalen är de som bär.
        <br />
        De som faktiskt blir av.
      </p>

      {/* Credentials */}
      <p
        style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 11.5,
          lineHeight: 1.55,
          color: 'rgba(253,246,227,0.55)',
          textAlign: 'center',
          margin: '0 0 8px',
        }}
      >
        Utvecklat av leg. psykolog och psykoterapeut med 29 års klinisk erfarenhet.
      </p>

      {/* Pace line */}
      <p
        style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 11.5,
          color: 'rgba(253,246,227,0.55)',
          textAlign: 'center',
          margin: '0 0 18px',
        }}
      >
        Ni bestämmer takten.
      </p>

      {/* Divider */}
      <div
        style={{
          width: 100,
          height: 0.5,
          background: 'rgba(253,246,227,0.20)',
          margin: '0 auto 18px',
        }}
      />

      {/* Price rows */}
      <PriceRow label="För dig och din partner" price="249 kr" />
      <PriceRow label="För dig och ditt barn" price="195 kr" />

      {/* CTA block — pushed to bottom of available space */}
      <div style={{ marginTop: 'auto', paddingTop: 18 }}>
        <button
          onClick={onNext}
          style={{
            width: '100%',
            height: 50,
            borderRadius: 14,
            border: 'none',
            background: BONKI_ORANGE,
            color: '#FFFFFF',
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          Fortsätt med Google
        </button>
        <div style={{ height: 12 }} />
        <button
          onClick={onNext}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            color: LANTERN_GLOW,
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: 12.5,
            cursor: 'pointer',
            padding: 0,
          }}
        >
          Logga in med e-post
        </button>
      </div>

      {/* Legal */}
      <p
        style={{
          marginTop: 14,
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 10,
          lineHeight: 1.55,
          color: 'rgba(253,246,227,0.45)',
          textAlign: 'center',
        }}
      >
        Genom att fortsätta godkänner du våra{' '}
        <Link to="/terms" style={{ color: 'inherit', textDecoration: 'underline' }}>Villkor</Link>
        {' '}och{' '}
        <Link to="/privacy" style={{ color: 'inherit', textDecoration: 'underline' }}>Integritetspolicy</Link>
        .
      </p>

      {/* Progress dots tucked at bottom for symmetry with screens 1 + 3 */}
      <div style={{ marginTop: 12 }}>
        <DashProgress activeIndex={1} activeColor={BONKI_ORANGE} />
      </div>
    </div>
  );
}

function PriceRow({ label, price }: { label: string; price: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        padding: '8px 0',
        color: LANTERN_GLOW,
      }}
    >
      <span
        style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 13,
          fontWeight: 400,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: 'Fraunces, serif',
          fontSize: 14,
        }}
      >
        {price}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Screen 3 — Welcome gift (ghost-glow / receptive register)                  */
/* ─────────────────────────────────────────────────────────────────────────── */

function ScreenGift() {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '50px 28px 32px',
      }}
    >
      {/* Eyebrow */}
      <p
        style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: 3,
          textTransform: 'uppercase',
          color: GHOST_GLOW,
          textAlign: 'center',
          margin: '0 0 24px',
        }}
      >
        EN GÅVA TILL ER
      </p>

      {/* 132×132 halo wrapper around 120px logo */}
      <div
        style={{
          width: 132,
          height: 132,
          margin: '0 auto 22px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          aria-hidden
          className="bonki-gift-halo"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background:
              'radial-gradient(circle at 50% 50%, rgba(212,245,192,0.18), transparent 70%)',
            animation: 'bonkiGiftPulse 3s ease-in-out infinite',
          }}
        />
        <BonkiLogoMark
          size={120}
          style={{
            color: GHOST_GLOW,
            filter: 'drop-shadow(0 4px 18px rgba(212,245,192,0.35))',
            position: 'relative',
            zIndex: 1,
          }}
        />
      </div>

      {/* Headline */}
      <h1
        style={{
          fontFamily: 'Fraunces, serif',
          fontWeight: 500,
          fontSize: 26,
          lineHeight: 1.18,
          letterSpacing: '-0.01em',
          color: LANTERN_GLOW,
          textAlign: 'center',
          margin: '0 0 12px',
        }}
      >
        Ett samtal,
        <br />
        från oss till{' '}
        <em style={{ fontStyle: 'italic', color: GHOST_GLOW }}>er</em>.
      </h1>

      {/* Body */}
      <p
        style={{
          fontFamily: '"Cormorant Garamond", serif',
          fontStyle: 'italic',
          fontSize: 15,
          lineHeight: 1.55,
          color: 'rgba(253,246,227,0.78)',
          textAlign: 'center',
          margin: '0 0 22px',
        }}
      >
        Välj vilket — där det betyder mest just nu.
      </p>

      {/* Promise card */}
      <div
        style={{
          background: 'rgba(212,245,192,0.06)',
          border: '0.5px solid rgba(212,245,192,0.20)',
          borderRadius: 18,
          padding: '14px 16px',
          marginBottom: 22,
        }}
      >
        {[
          'Det första samtalet i en produkt — gratis',
          'Engångsköp · Tillgång för alltid',
          'Ingen prenumeration',
        ].map(line => (
          <div
            key={line}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              padding: '5px 0',
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 12.5,
              color: 'rgba(253,246,227,0.78)',
              lineHeight: 1.4,
            }}
          >
            <span aria-hidden style={{ color: GHOST_GLOW, lineHeight: 1.4 }}>✓</span>
            <span>{line}</span>
          </div>
        ))}
      </div>

      {/* Push CTA to bottom */}
      <div style={{ marginTop: 'auto' }}>
        <button
          onClick={() => (window.location.href = '/library-mock')}
          style={{
            width: '100%',
            height: 50,
            borderRadius: 14,
            border: 'none',
            background: GHOST_GLOW,
            color: MIDNIGHT_INK,
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          Visa biblioteket
        </button>
        <div style={{ marginTop: 16 }}>
          <DashProgress activeIndex={2} activeColor={GHOST_GLOW} />
        </div>
      </div>
    </div>
  );
}
