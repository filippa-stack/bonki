import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { EASE } from '@/lib/motion';

interface IllustrationPeekProps {
  imageUrl: string;
  cardTitle: string;
  /** Product background color — used as overlay bg when expanded */
  productBgColor?: string;
}

/**
 * Floating thumbnail bubble + fullscreen reveal overlay.
 * Positioned top-right below header. Uses product bg color when expanded.
 */
export default function IllustrationPeek({ imageUrl, cardTitle, productBgColor }: IllustrationPeekProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ── Floating bubble — top-right, below header ── */}
      <motion.button
        onClick={() => setOpen(true)}
        initial={{ opacity: 1, scale: 1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.4, ease: EASE }}
        aria-label={`Visa illustration: ${cardTitle}`}
        style={{
          position: 'fixed',
          top: 'calc(env(safe-area-inset-top, 0px) + 64px)',
          right: '16px',
          zIndex: 40,
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          overflow: 'hidden',
          border: '2px solid hsla(0, 0%, 100%, 0.25)',
          boxShadow: '0 4px 20px -4px hsla(0, 0%, 0%, 0.25)',
          cursor: 'pointer',
          background: productBgColor ?? 'var(--surface-raised)',
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
              background: productBgColor ?? 'var(--surface-base, #FAF7F2)',
              backdropFilter: 'blur(16px)',
              willChange: 'opacity',
              WebkitBackfaceVisibility: 'hidden',
              backfaceVisibility: 'hidden',
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
                background: 'hsla(0, 0%, 100%, 0.15)',
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
              <X size={18} strokeWidth={1.5} color="hsla(0, 0%, 100%, 0.8)" />
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
                textTransform: 'capitalize',
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
