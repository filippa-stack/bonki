/**
 * BonkiButton — Signature tactile "memory card" button.
 *
 * Two variants:
 *   primary   → Solid saffron, bold CTA (Vi är redo, Fortsätt, Köp)
 *   secondary → Glassmorphic, blends with environment (Pausa, Avsluta)
 *
 * Shared DNA: 24px radius, multi-layered shadows, inner highlights,
 * tactile press compression (scale 0.95, y +2).
 */

import { motion, type HTMLMotionProps } from 'framer-motion';
import React from 'react';

const SAFFRON = '#DA9D1D';
const SAFFRON_DARK = '#B8841A';

interface BonkiButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  /** Full width (default true) */
  fullWidth?: boolean;
}

export default function BonkiButton({
  variant = 'primary',
  children,
  fullWidth = true,
  style,
  ...props
}: BonkiButtonProps) {
  const isPrimary = variant === 'primary';

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.95, y: 2 }}
      transition={{ type: 'tween', duration: 0.12 }}
      style={{
        position: 'relative',
        width: fullWidth ? '100%' : 'auto',
        padding: '16px 32px',
        borderRadius: '24px',
        cursor: 'pointer',
        fontFamily: "var(--font-display)",
        fontSize: '17px',
        fontWeight: 600,
        fontVariationSettings: "'opsz' 17",
        letterSpacing: '0.01em',
        lineHeight: 1.3,
        border: 'none',
        outline: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        ...(isPrimary
          ? {
              background: `linear-gradient(180deg, ${SAFFRON} 0%, ${SAFFRON_DARK} 100%)`,
              color: '#FFFDF7',
              boxShadow: [
                '0 10px 28px rgba(218, 157, 29, 0.35)',
                '0 4px 10px rgba(218, 157, 29, 0.20)',
                '0 1px 3px rgba(0, 0, 0, 0.12)',
                'inset 0 1.5px 0 rgba(255, 255, 255, 0.35)',
                'inset 0 -2px 6px rgba(0, 0, 0, 0.12)',
              ].join(', '),
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.15)',
            }
          : {
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(24px) saturate(1.3)',
              WebkitBackdropFilter: 'blur(24px) saturate(1.3)',
              color: 'var(--text-primary, #F5EFE6)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: [
                '0 10px 28px rgba(0, 0, 0, 0.20)',
                '0 4px 10px rgba(0, 0, 0, 0.12)',
                '0 1px 3px rgba(0, 0, 0, 0.08)',
                'inset 0 1.5px 0 rgba(255, 255, 255, 0.20)',
                'inset 0 -2px 6px rgba(0, 0, 0, 0.06)',
              ].join(', '),
            }),
        ...style,
      }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
