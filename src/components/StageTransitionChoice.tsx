import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import type { PronounMode } from '@/lib/pronouns';

interface StageTransitionChoiceProps {
  onContinue: () => void;
  onStop: () => void;
  pronounMode?: PronounMode;
}

export default function StageTransitionChoice({ onContinue, onStop, pronounMode = 'ni' }: StageTransitionChoiceProps) {
  const heading = pronounMode === 'du' ? 'Vill du fortsätta?' : 'Vill ni fortsätta?';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="my-6 py-6 px-6 text-center max-w-sm mx-auto"
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}
    >
      <h2
        style={{
          fontFamily: "'DM Serif Display', var(--font-serif)",
          fontSize: '20px',
          fontWeight: 400,
          color: 'var(--text-primary)',
          lineHeight: 1.3,
        }}
      >
        {heading}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '100%', paddingTop: '8px' }}>
        <button
          onClick={onContinue}
          className="cta-primary"
          style={{ maxWidth: '220px', width: '100%', gap: '8px' }}
        >
          Vidare
          <ArrowRight size={16} />
        </button>
        <button
          onClick={onStop}
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            opacity: 0.55,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '12px 20px',
            minHeight: '44px',
          }}
        >
          Stanna här
        </button>
      </div>
    </motion.div>
  );
}
