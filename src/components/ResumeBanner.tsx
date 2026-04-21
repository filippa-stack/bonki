import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface ResumeBannerProps {
  cardId: string;
  /** Product accent hex (typically tileLight). Falls back to Lantern Glow cream. */
  accentColor?: string;
}

const LANTERN_GLOW = '#FDF6E3';
const BONKI_ORANGE = '#E85D2C';

export default function ResumeBanner({ cardId, accentColor }: ResumeBannerProps) {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem('dismissedResumeBanner') === 'true'
  );

  if (dismissed) return null;

  const accent = accentColor ?? LANTERN_GLOW;

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    sessionStorage.setItem('dismissedResumeBanner', 'true');
    setDismissed(true);
  };

  return (
    <div
      style={{
        position: 'relative',
        padding: '14px 16px 16px',
        borderRadius: '24px',
        overflow: 'hidden',
        background: 'transparent',
      }}
    >
      {/* Breathing radial bloom — sits behind content */}
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0.85 }}
        animate={{ opacity: [0.85, 1, 0.85] }}
        transition={{ duration: 6, ease: 'easeInOut', repeat: Infinity }}
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse 320px 140px at 30% 50%, ${accent}33 0%, ${accent}10 60%, transparent 100%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Foreground content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div className="flex items-start justify-between">
          <div className="mb-3">
            <p
              className="text-xs flex items-center gap-2"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  backgroundColor: accent,
                  display: 'inline-block',
                  flexShrink: 0,
                }}
              />
              Ert samtal väntar.
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: 'var(--color-text-secondary)', opacity: 0.6, fontSize: '12px', paddingLeft: '12px' }}
            >
              Där ni senast slutade.
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="leading-none ml-1 -mt-0.5 -mr-1 transition-opacity hover:opacity-80"
            style={{
              color: 'var(--color-text-secondary)',
              opacity: 0.5,
              fontSize: '16px',
              padding: '8px 10px',
              background: 'none',
              border: 'none',
              lineHeight: 1,
            }}
            aria-label="Stäng"
          >
            ×
          </button>
        </div>
        <button
          onClick={() => navigate(`/card/${cardId}`, { state: { resumed: true } })}
          className="px-5 text-sm font-medium transition-opacity hover:opacity-90"
          style={{
            height: '32px',
            maxWidth: '160px',
            backgroundColor: BONKI_ORANGE,
            color: '#FFFFFF',
            letterSpacing: '0.2px',
            borderRadius: '20px',
            border: 'none',
            opacity: 1,
            boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
          }}
        >
          Fortsätt
        </button>
      </div>

      {/* Reduced-motion guard */}
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          [data-bonki-bloom] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
