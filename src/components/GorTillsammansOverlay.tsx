import { motion } from 'framer-motion';

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
      style={{ backgroundColor: 'hsla(36, 20%, 95%, 0.97)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Two circles icon */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--color-text-secondary)' }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--color-text-secondary)' }} />
      </div>

      {/* Heading */}
      <h2
        className="font-serif"
        style={{
          fontSize: '26px',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          textAlign: 'center',
          marginBottom: '16px',
        }}
      >
        Gör det tillsammans.
      </h2>

      {/* Body */}
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '15px',
          color: 'var(--color-text-secondary)',
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
          color: 'var(--color-text-secondary)',
          textAlign: 'center',
          lineHeight: 1.6,
          marginBottom: '40px',
          maxWidth: '320px',
        }}
      >
        Läs uppgiften högt. Gör den. Kom tillbaka när ni är klara.
      </p>

      {/* CTA */}
      <button
        onClick={handleDismiss}
        className="cta-primary"
        style={{ width: '60%', maxWidth: '280px' }}
      >
        Vi förstår.
      </button>
    </motion.div>
  );
}
