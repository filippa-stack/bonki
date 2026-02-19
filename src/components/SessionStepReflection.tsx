import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSessionReflections } from '@/hooks/useSessionReflections';
import { BEAT_2, BEAT_3, EASE } from '@/lib/motion';

interface SessionStepReflectionProps {
  sessionId?: string | null;
  stepIndex: number;
  /** Called after reflection is persisted — parent calls complete_couple_session_step */
  onLocked?: () => void | Promise<void>;
}

export default function SessionStepReflection({
  sessionId = null,
  stepIndex,
  onLocked,
}: SessionStepReflectionProps) {
  const { loading, myReflection, setText, markReady } =
    useSessionReflections(sessionId, stepIndex);

  const [localText, setLocalText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const displayText = myReflection?.text ?? localText;

  const handleChange = (value: string) => {
    setLocalText(value);
    setText(value);
  };

  /**
   * Progression sequence:
   * 1. Persist reflection text (if any) via markReady
   * 2. Call onLocked → parent calls complete_couple_session_step RPC
   * 3. RPC response triggers refetch → current_step_index increments → re-render
   *
   * Reflection is optional — button is always enabled.
   */
  const handleAdvance = async () => {
    setSubmitting(true);
    try {
      await markReady();
      await onLocked?.();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-6 mb-2">
        <div className="h-20 rounded-card bg-muted/20 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="mt-8 mb-2 space-y-3">
      <div
        className="rounded-card overflow-hidden p-6"
        style={{ border: '1px solid #E3E1DC', backgroundColor: 'var(--color-surface-primary)' }}
      >
        <textarea
          value={displayText}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Skriv din reflektion — valfritt."
          className="w-full min-h-[120px] bg-transparent resize-none focus:outline-none focus:ring-0 text-sm leading-relaxed placeholder:text-muted-foreground/40"
          style={{ color: 'var(--color-text-primary)' }}
        />
        <div className="flex items-center pt-3">
          <span className="text-xs flex items-center gap-1" style={{ color: 'var(--color-text-secondary)', opacity: 0.4 }}>
            <Lock className="w-3 h-3" />
            Bara du kan se det här
          </span>
        </div>
      </div>

      <div className="mt-4">
        <button
          onClick={handleAdvance}
          disabled={submitting}
          className="w-full h-14 rounded-button flex items-center justify-center text-sm font-medium transition-opacity disabled:opacity-50 hover:opacity-90"
          style={{
            backgroundColor: 'var(--color-button-primary)',
            color: 'var(--color-button-text)',
          }}
        >
          {submitting
            ? 'Sparar…'
            : stepIndex >= 3
            ? 'Avsluta samtalet'
            : 'Fortsätt till nästa steg'}
        </button>
      </div>
    </div>
  );
}
