import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { EASE } from '@/lib/motion';

interface IllustrationPeekProps {
  imageUrl: string;
  cardTitle: string;
}

/**
 * Floating thumbnail bubble + fullscreen reveal overlay.
 * Shows during active sessions so children can peek at the illustration.
 */
export default function IllustrationPeek({ imageUrl, cardTitle }: IllustrationPeekProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ── Floating bubble ── */}
      <motion.button
        onClick={() => setOpen(true)}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.4, ease: EASE }}
        aria-label={`Visa illustration: ${cardTitle}`}
        style={{
          position: 'fixed',
          bottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
          left: '20px',
          zIndex: 40,
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          overflow: 'hidden',
          border: '2.5px solid var(--surface-raised)',
          boxShadow: '0 4px 20px -4px hsla(30, 20%, 20%, 0.20), 0 8px 32px -8px hsla(30, 18%, 20%, 0.15)',
          cursor: 'pointer',
          background: 'var(--surface-raised)',
          padding: 0,
        }}
        whileTap={{ scale: 0.9 }}
      >
        <img
          src={imageUrl}
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 20%',
          }}
          draggable={false}
        />
      </motion.button>

      {/* ── Fullscreen overlay ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            onClick={() => setOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9998,
              background: 'color-mix(in srgb, var(--surface-base, hsl(30, 10%, 8%)) 92%, transparent)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 24px',
              cursor: 'pointer',
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setOpen(false)}
              aria-label="Stäng"
              style={{
                position: 'absolute',
                top: 'calc(16px + env(safe-area-inset-top, 0px))',
                right: '16px',
                background: 'hsla(30, 20%, 20%, 0.12)',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={18} strokeWidth={1.5} color="hsla(30, 20%, 20%, 0.7)" />
            </button>

            {/* Illustration */}
            <motion.img
              src={imageUrl}
              alt={cardTitle}
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.35, ease: EASE }}
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: '85vw',
                maxHeight: '70vh',
                objectFit: 'contain',
                borderRadius: '12px',
                cursor: 'default',
              }}
              draggable={false}
            />

            {/* Title */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.1, duration: 0.3, ease: EASE }}
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '18px',
                fontWeight: 600,
                color: 'hsla(0, 0%, 100%, 0.85)',
                marginTop: '20px',
                textAlign: 'center',
              }}
            >
              {cardTitle}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
