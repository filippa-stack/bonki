import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

/**
 * Subtle back-to-library button, positioned at top-left of product home screens.
 * Uses absolute positioning — parent must have `position: relative`.
 */
export default function BackToLibraryButton({ color = 'var(--color-text-secondary)' }: { color?: string }) {
  const navigate = useNavigate();

  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      onClick={() => navigate('/')}
      aria-label="Tillbaka till biblioteket"
      style={{
        position: 'absolute',
        top: 'calc(16px + env(safe-area-inset-top, 0px))',
        left: '16px',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '8px 4px',
        color,
        opacity: 0.6,
        fontFamily: 'var(--font-sans)',
        fontSize: '13px',
        fontWeight: 500,
        letterSpacing: '0.01em',
      }}
    >
      <ArrowLeft style={{ width: '16px', height: '16px' }} />
      <span>Biblioteket</span>
    </motion.button>
  );
}
