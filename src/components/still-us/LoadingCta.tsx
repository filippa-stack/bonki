/**
 * LoadingCta — Button with loading state for Still Us.
 * Shows pulsing text during loading. Respects prefers-reduced-motion.
 */

import { motion } from 'framer-motion';
import { COLORS } from '@/lib/stillUsTokens';

interface LoadingCtaProps {
  label: string;
  loadingLabel?: string;
  loading?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export default function LoadingCta({
  label,
  loadingLabel = 'Sparar...',
  loading = false,
  disabled = false,
  onClick,
}: LoadingCtaProps) {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      whileTap={isDisabled ? undefined : { scale: 0.98 }}
      style={{
        width: '100%',
        height: '52px',
        borderRadius: '12px',
        backgroundColor: isDisabled ? `${COLORS.deepSaffron}40` : COLORS.deepSaffron,
        border: 'none',
        cursor: isDisabled ? 'default' : 'pointer',
        fontFamily: 'var(--font-sans)',
        fontSize: '16px',
        fontWeight: 600,
        color: COLORS.emberNight,
        opacity: isDisabled && !loading ? 0.5 : 1,
        transition: 'opacity 0.2s, background-color 0.2s',
      }}
    >
      {loading ? (
        <motion.span
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          // prefers-reduced-motion handled via CSS rule in index.css
          // (animation-duration forced to 0.01ms)
        >
          {loadingLabel}
        </motion.span>
      ) : (
        label
      )}
    </motion.button>
  );
}
