import { motion, AnimatePresence } from 'framer-motion';

interface StageInterstitialProps {
  visible: boolean;
}

/**
 * A brief transitional micro-moment shown between depth layers.
 * Fades in, holds, then fades out — auto only, no interaction.
 */
export default function StageInterstitial({ visible }: StageInterstitialProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="stage-interstitial"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-40 flex items-center justify-center"
          style={{ backgroundColor: 'var(--color-bg-base)' }}
        >
          <p
            className="text-meta tracking-wide"
            style={{ color: 'var(--color-text-secondary)', opacity: 0.6 }}
          >
            ···
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
