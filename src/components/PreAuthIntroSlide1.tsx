/**
 * PreAuthIntroSlide1
 *
 * Static, stateless one-screen pre-auth gate shown once per browser before
 * the redesigned web Login. No auth, no pricing, no network calls.
 *
 * Layout (top to bottom — order locked):
 *   serif headline → bar indicator (active orange) → "Fortsätt" pill → BONKI wordmark
 *
 * Background: var(--surface-base) (#0B1026). iOS PWA safe-area aware,
 * uses 100vh with calc() (never 100dvh) per project iOS stability rules.
 */

import bonkiWordmark from '@/assets/bonki-wordmark.png';

const ORANGE = '#E8743C';
const CREAM = '#FDF6E3';
const CREAM_DIM = 'rgba(253, 246, 227, 0.25)';

interface PreAuthIntroSlide1Props {
  onContinue: () => void;
}

export default function PreAuthIntroSlide1({ onContinue }: PreAuthIntroSlide1Props) {
  return (
    <div
      style={{
        minHeight: 'calc(100vh)',
        background: 'var(--surface-base, #0B1026)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 96px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 32px)',
        paddingLeft: 24,
        paddingRight: 24,
        transform: 'translateZ(0)',
      }}
    >
      {/* Headline — vertically centered upper portion */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: 360,
        }}
      >
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: 'italic',
            fontSize: 22,
            lineHeight: 1.1,
            color: CREAM,
            textAlign: 'center',
            fontWeight: 400,
            margin: 0,
            maxWidth: 320,
          }}
        >
          Samtalet som dagen inte gav plats för.
        </h1>
      </div>

      {/* Bottom cluster: indicator → button → wordmark */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
          width: '100%',
          maxWidth: 360,
        }}
      >
        {/* Bar indicator (NOT circles): two 18×2 segments, active orange */}
        <div
          aria-hidden="true"
          style={{
            display: 'flex',
            gap: 6,
            alignItems: 'center',
          }}
        >
          <span
            style={{
              width: 18,
              height: 2,
              borderRadius: 2,
              background: ORANGE,
              display: 'block',
            }}
          />
          <span
            style={{
              width: 18,
              height: 2,
              borderRadius: 2,
              background: CREAM_DIM,
              display: 'block',
            }}
          />
        </div>

        {/* Outlined cream pill button */}
        <button
          onClick={onContinue}
          className="w-full"
          style={{
            height: 52,
            borderRadius: 26,
            background: 'transparent',
            border: `1px solid ${CREAM}`,
            color: CREAM,
            fontFamily: 'var(--font-sans)',
            fontSize: 16,
            fontWeight: 500,
            letterSpacing: '0.01em',
            cursor: 'pointer',
            transition: 'background-color 150ms ease, transform 90ms ease',
          }}
          onPointerDown={(e) => {
            e.currentTarget.style.background = 'rgba(253, 246, 227, 0.08)';
          }}
          onPointerUp={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
          onPointerLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          Fortsätt
        </button>

        {/* BONKI wordmark — bottom signature, NOT a top header */}
        <img
          src={bonkiWordmark}
          alt="BONKI"
          style={{
            height: 28,
            width: 'auto',
            objectFit: 'contain',
            opacity: 0.7,
            marginTop: 8,
          }}
        />
      </div>
    </div>
  );
}
