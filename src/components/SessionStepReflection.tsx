import { useState } from 'react';
import { Lock } from 'lucide-react';
import { useSessionReflections } from '@/hooks/useSessionReflections';

interface SessionStepReflectionProps {
  sessionId?: string | null;
  stepIndex: number;
  /** When true, button shows "Avsluta samtalet" instead of "Fortsätt" */
  isLastStep?: boolean;
  /** Called after reflection is persisted — parent calls complete_couple_session_step */
  onLocked?: () => void | Promise<void>;
  /** Called to go back one step — only shown when stepIndex > 0 */
  onBack?: () => void;
}

export default function SessionStepReflection({
  sessionId = null,
  stepIndex,
  isLastStep = false,
  onLocked,
  onBack,
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
      <div className="mt-8 mb-1">
        <div className="h-20 rounded-card bg-muted/20 animate-pulse" />
      </div>
    );
  }

  return (
    /* 48px above reflection, 32px between reflection and button */
    <div className="mt-12 mb-1">
      <div
        className="rounded-card overflow-hidden"
        style={{ border: '1px solid hsl(var(--border))', backgroundColor: 'transparent', padding: '2rem' }}
      >
        <textarea
          value={displayText}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Skriv din reflektion — valfritt."
          className="w-full min-h-[120px] bg-transparent resize-none focus:outline-none focus:ring-0 text-sm leading-relaxed placeholder:[color:#8C8681]"
          style={{ color: 'var(--color-ink)' }}
        />
        <div className="flex items-center pt-2">
          <span className="text-xs flex items-center gap-1" style={{ color: 'var(--color-text-secondary)', opacity: 0.4 }}>
            <Lock className="w-3 h-3" />
            Bara du kan se det här
          </span>
        </div>
      </div>

      <p className="mt-2 text-[12px]" style={{ color: 'var(--color-text-secondary)', opacity: 0.6 }}>
        Det du skriver sparas automatiskt i Vårt utrymme.
      </p>

      <div className="mt-22 space-y-2">
        <button
          onClick={handleAdvance}
          disabled={submitting}
          className="cta-primary"
        >
          {submitting
            ? 'Sparar…'
            : isLastStep
            ? 'Avsluta samtalet'
            : 'Fortsätt'}
        </button>

        {onBack && (
          <button
            onClick={onBack}
            className="w-full h-10 flex items-center justify-center text-sm transition-opacity hover:opacity-70"
            style={{ color: 'var(--color-text-secondary)', opacity: 0.6 }}
          >
            Tillbaka
          </button>
        )}
      </div>
    </div>
  );
}
