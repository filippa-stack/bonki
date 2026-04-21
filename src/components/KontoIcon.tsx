import { motion } from 'framer-motion';
import { CircleUser } from 'lucide-react';

/**
 * Top-right account icon. Pure presentational button — owns no state.
 * Mirrors ProductHomeBackButton structure but anchored right.
 */
export default function KontoIcon({
  color,
  onClick,
}: {
  color?: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      onClick={onClick}
      aria-label="Konto"
      style={{
        position: 'absolute',
        top: 'calc(env(safe-area-inset-top, 0px) + 16px)',
        right: '16px',
        zIndex: 10,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: color ?? 'var(--color-text-primary)',
        opacity: 0.6,
        padding: '8px',
      }}
    >
      <CircleUser size={22} strokeWidth={1.5} />
    </motion.button>
  );
}
