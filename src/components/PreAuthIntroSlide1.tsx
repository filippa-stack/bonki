/**
 * PreAuthIntroSlide1
 *
 * Static, stateless one-screen pre-auth gate shown once per browser before
 * the redesigned web Login. No auth, no pricing, no network calls.
 *
 * Layout (top to bottom):
 *   BONKI wordmark (top) → recognition sentence (vertically centered)
 *   → bar indicator → Fortsätt CTA (bottom cluster)
 *
 * Swipe-left advances (mirrors Fortsätt). Swipe-right is a no-op.
 *
 * Background: var(--surface-base) (#0B1026). iOS PWA safe-area aware,
 * uses 100vh with calc() (never 100dvh) per project iOS stability rules.
 */

import { motion } from 'framer-motion';

const ORANGE = '#E85D2C';
const ORANGE_PRESSED = '#D8531E';
const CREAM = '#FDF6E3';
const CREAM_DIM = 'rgba(253, 246, 227, 0.25)';

interface PreAuthIntroSlide1Props {
  onContinue: () => void;
}

export default function PreAuthIntroSlide1({ onContinue }: PreAuthIntroSlide1Props) {
  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={(_, info) => {
        if (info.offset.x < -60) onContinue();
      }}
      style={{
        minHeight: 'calc(100vh)',
        background: 'var(--surface-base, #0B1026)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 48px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
        paddingLeft: 24,
        paddingRight: 24,
        transform: 'translateZ(0)',
        touchAction: 'pan-y',
      }}
    >
      {/* BONKI wordmark — top, Bebas Neue text */}
      <div
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontWeight: 400,
          fontSize: 14,
          letterSpacing: '3px',
          color: CREAM,
          opacity: 0.85,
          textAlign: 'center',
          lineHeight: 1,
        }}
      >
        BONKI
      </div>

      {/* Recognition sentence — vertically centered in remaining space */}
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
            fontWeight: 400,
            fontSize: 22,
            lineHeight: 1.4,
            letterSpacing: 0,
            color: CREAM,
            textAlign: 'center',
            margin: 0,
            maxWidth: 280,
          }}
        >
          Samtalet som dagen inte gav plats för.
        </h1>
      </div>

      {/* Bottom cluster: bar indicator → 16px → Fortsätt CTA */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          width: '100%',
          maxWidth: 360,
        }}
      >
        {/* Three-dot pagination — first dot active */}
        <div
          aria-hidden="true"
          style={{
            display: 'flex',
            gap: 6,
            alignItems: 'center',
          }}
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: i === 0 ? ORANGE : 'rgba(253,246,227,0.20)',
                display: 'block',
              }}
            />
          ))}
        </div>

        {/* Filled Bonki Orange CTA */}
        <button
          onClick={onContinue}
          className="w-full"
          style={{
            height: 44,
            borderRadius: 22,
            background: ORANGE,
            border: 'none',
            color: CREAM,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            fontWeight: 500,
            letterSpacing: '0.01em',
            cursor: 'pointer',
            transition: 'background-color 150ms ease, transform 90ms ease',
          }}
          onPointerDown={(e) => {
            e.currentTarget.style.background = ORANGE_PRESSED;
          }}
          onPointerUp={(e) => {
            e.currentTarget.style.background = ORANGE;
          }}
          onPointerLeave={(e) => {
            e.currentTarget.style.background = ORANGE;
          }}
        >
          Fortsätt
        </button>
      </div>
    </motion.div>
  );
}
