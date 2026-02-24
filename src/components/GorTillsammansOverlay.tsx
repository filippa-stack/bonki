import { motion } from 'framer-motion';
import { EMOTION, EASE, BEAT_1, BEAT_2 } from '@/lib/motion';

const STORAGE_KEY = 'bonki_gor_tillsammans_explained';

export function hasSeenGorTillsammans(): boolean {
  try { return localStorage.getItem(STORAGE_KEY) === 'true'; } catch { return false; }
}

export function markGorTillsammansSeen(): void {
  try { localStorage.setItem(STORAGE_KEY, 'true'); } catch {}
}

interface Props {
  onDismiss: () => void;
}

export default function GorTillsammansOverlay({ onDismiss }: Props) {
  const handleDismiss = () => {
    markGorTillsammansSeen();
    onDismiss();
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: 'hsla(36, 20%, 95%, 0.98)', paddingBottom: 'env(safe-area-inset-bottom, 24px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: EMOTION, ease: [...EASE] }}
    >

      {/* Two-person icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: BEAT_1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}
      >
        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--text-secondary)' }} />
        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--text-secondary)' }} />
      </motion.div>

      {/* Heading */}
      <motion.h2
        className="font-serif"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: BEAT_1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          fontSize: '26px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          textAlign: 'center',
          marginBottom: '16px',
        }}
      >
        Gör det tillsammans.
      </motion.h2>

      {/* Body */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: BEAT_2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '15px',
            color: 'var(--text-secondary)',
            textAlign: 'center',
            lineHeight: 1.6,
            marginBottom: '8px',
            maxWidth: '320px',
          }}
        >
          Nästa steg är något ni gör gemensamt — inte i appen, utan med varandra.
        </p>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '15px',
            color: 'var(--text-secondary)',
            textAlign: 'center',
            lineHeight: 1.6,
            marginBottom: '40px',
            maxWidth: '320px',
          }}
        >
          Läs uppgiften högt. Gör den. Kom tillbaka när ni är klara.
        </p>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <button
          onClick={handleDismiss}
          className="cta-primary"
          style={{ width: '60vw', maxWidth: '280px' }}
        >
          Vi förstår.
        </button>
      </motion.div>
    </motion.div>
  );
}
