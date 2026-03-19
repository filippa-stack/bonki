import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Consistent back-to-library button for all product home pages.
 * Positioned top-left with safe-area support.
 */
export default function ProductHomeBackButton({ color }: { color?: string }) {
  const navigate = useNavigate();

  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      onClick={() => {
        localStorage.removeItem('bonki-last-active-product');
        navigate('/');
      }}
      aria-label="Tillbaka till biblioteket"
      style={{
        position: 'absolute',
        top: 'calc(env(safe-area-inset-top, 0px) + 16px)',
        left: '16px',
        zIndex: 10,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: color ?? 'var(--text-primary)',
        opacity: 0.6,
        padding: '8px',
      }}
    >
      <ChevronLeft size={22} strokeWidth={1.5} />
    </motion.button>
  );
}
