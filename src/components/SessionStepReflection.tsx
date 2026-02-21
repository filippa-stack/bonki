import { useState } from 'react';
import { Lock } from 'lucide-react';
import { useSessionReflections } from '@/hooks/useSessionReflections';

interface SessionStepReflectionProps {
  sessionId?: string | null;
  stepIndex: number;
  /** Prompt index within the current stage (default 0) */
  promptIndex?: number;
  /** When true, button shows "Avsluta samtalet" instead of "Fortsätt" */
  isLastStep?: boolean;
  /** First visit to this card (no completed session exists) */
  isFirstVisit?: boolean;
  /** Called after reflection is persisted — parent calls complete_couple_session_step */
  onLocked?: () => void | Promise<void>;
  /** Called to go back one step — only shown when stepIndex > 0 */
  onBack?: () => void;
}

export default function SessionStepReflection({
  sessionId = null,
  stepIndex,
  promptIndex = 0,
  isLastStep = false,
  isFirstVisit = false,
  onLocked,
  onBack,
}: SessionStepReflectionProps) {
  // Encode stage + prompt into a single step_index for the DB.
  // stage 0 prompt 0 → 0, stage 0 prompt 1 → 1, stage 1 prompt 0 → 100, etc.
  const reflectionStepIndex = stepIndex * 100 + promptIndex;

  const { loading, myReflection, setText, markReady } =
    useSessionReflections(sessionId, reflectionStepIndex);

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
        className="overflow-hidden"
        style={{
          border: '1px solid hsl(var(--border) / 0.18)',
          borderRadius: '24px',
          backgroundColor: 'hsl(30 12% 94% / 0.35)',
          padding: '32px 32px',
        }}
      >
        <textarea
          value={displayText}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Skriv fritt."
          inputMode="text"
          autoCorrect="on"
          autoCapitalize="sentences"
          spellCheck={true}
          className="w-full min-h-[120px] bg-transparent resize-none focus:outline-none focus:ring-0 text-sm leading-relaxed placeholder:[color:#8C8681]"
          style={{ color: 'var(--color-ink)' }}
        />
        <div className="flex items-center pt-3">
          <span className="type-meta flex items-center gap-1" style={{ color: 'var(--color-text-secondary)', opacity: 0.5 }}>
            <Lock className="w-2.5 h-2.5" />
            Privat
          </span>
        </div>
      </div>

      {stepIndex === 0 && isFirstVisit && (
        <p
          className="type-meta mt-3"
          style={{ color: 'var(--color-text-secondary)', opacity: 0.5 }}
        >
          Dina svar sparas i Era samtal efter avslutat kort.
        </p>
      )}

      <div className="mt-12" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)' }}>
        <button
          onClick={handleAdvance}
          disabled={submitting}
          className="cta-primary"
        >
          {submitting
            ? 'Sparar…'
            : isLastStep
            ? 'Klar'
            : 'Fortsätt'}
        </button>

      </div>
    </div>
  );
}
