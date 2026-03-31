/**
 * SuIntroPortal — Landing page for the Still Us intro card ("Ert första samtal").
 * Matches KidsCardPortal visual style with Still Us warm palette.
 */

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { COLORS } from '@/lib/stillUsTokens';
import { usePageBackground } from '@/hooks/usePageBackground';
import { useCardImage } from '@/hooks/useCardImage';

const LANTERN = COLORS.lanternGlow;
const SAFFRON = COLORS.deepSaffron;
const BG = COLORS.emberNight;

export default function SuIntroPortal() {
  const navigate = useNavigate();
  usePageBackground(BG);
  const imageSrc = useCardImage('su-mock-0');

  const handleStart = () => {
    localStorage.setItem('bonki-last-active-product', 'still-us');
    navigate('/card/su-mock-0');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: BG,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '-25%',
          right: '-25%',
          bottom: '30%',
          background: `radial-gradient(ellipse at 50% 35%, rgba(232,145,58,0.18) 0%, transparent 70%)`,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Top bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: `calc(env(safe-area-inset-top, 0px) + 10px) 16px 6px`,
          position: 'relative',
          zIndex: 10,
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => navigate('/product/still-us')}
          aria-label="Tillbaka"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: LANTERN, opacity: 0.7, padding: '4px' }}
        >
          <ChevronLeft size={22} strokeWidth={1.5} />
        </button>
      </div>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 24px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Card image tile */}
        {imageSrc && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{
              width: '100%',
              maxWidth: '320px',
              aspectRatio: '3 / 4',
              borderRadius: '20px',
              overflow: 'hidden',
              position: 'relative',
              boxShadow: [
                '0 20px 60px rgba(0, 0, 0, 0.55)',
                '0 8px 24px rgba(0, 0, 0, 0.40)',
                `0 14px 56px rgba(232, 145, 58, 0.15)`,
              ].join(', '),
            }}
          >
            <img
              src={imageSrc}
              alt="Ert första samtal"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
            {/* Obsidian glass overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '20px',
                boxShadow: [
                  'inset 0 2px 6px rgba(255, 255, 255, 0.35)',
                  'inset 0 -4px 12px rgba(0, 0, 0, 0.30)',
                ].join(', '),
                pointerEvents: 'none',
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                pointerEvents: 'none',
              }}
            />
          </motion.div>
        )}

        {/* Title + description */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{ textAlign: 'center', marginTop: '24px', maxWidth: '300px' }}
        >
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '26px',
              fontWeight: 700,
              color: LANTERN,
              margin: '0 0 8px',
            }}
          >
            Ert första samtal
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '14px',
              color: LANTERN,
              opacity: 0.7,
              lineHeight: 1.5,
              margin: '0 0 6px',
            }}
          >
            En introduktion till hur Still Us fungerar — och ett första steg mot att prata på riktigt.
          </p>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              color: LANTERN,
              opacity: 0.5,
            }}
          >
            ca 10–20 min
          </p>
        </motion.div>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          whileTap={{ scale: 0.96 }}
          onClick={handleStart}
          style={{
            marginTop: '32px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '14px 40px',
            background: SAFFRON,
            borderRadius: '14px',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-serif)',
            fontSize: '16px',
            fontWeight: 600,
            color: '#1a1008',
            boxShadow: `0 4px 20px rgba(232, 145, 58, 0.35), 0 2px 8px rgba(0,0,0,0.2)`,
          }}
        >
          Vi är redo
        </motion.button>
      </div>

      {/* Bottom spacing */}
      <div style={{ height: `calc(72px + env(safe-area-inset-bottom, 0px))`, flexShrink: 0 }} />
    </div>
  );
}
