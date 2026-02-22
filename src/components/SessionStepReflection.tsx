import { useState } from 'react';
import { useSessionReflections } from '@/hooks/useSessionReflections';

interface SessionStepReflectionProps {
  sessionId?: string | null;
  stepIndex: number;
  promptIndex?: number;
  isLastStep?: boolean;
  isFirstVisit?: boolean;
  onLocked?: () => void | Promise<void>;
  onBack?: () => void;
  /** Whether this is a reflection step (opening/deepening) for styling */
  isReflectionStep?: boolean;
}

export default function SessionStepReflection({
  sessionId = null,
  stepIndex,
  promptIndex = 0,
  isLastStep = false,
  isFirstVisit = false,
  onLocked,
  onBack,
  isReflectionStep = false,
}: SessionStepReflectionProps) {
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
    <div className="mt-12 mb-1">
      <textarea
        value={displayText}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Skriv."
        inputMode="text"
        autoCorrect="on"
        autoCapitalize="sentences"
        spellCheck={true}
        className="w-full min-h-[120px] resize-none focus:outline-none focus:ring-0 text-sm leading-relaxed placeholder:[color:#8C8681]"
        style={{
          color: 'var(--color-ink)',
          background: isReflectionStep ? 'hsl(36, 20%, 96%)' : 'var(--surface-raised)',
          border: isReflectionStep ? '1px solid hsl(36, 18%, 84%)' : '1px solid hsl(var(--border) / 0.20)',
          borderRadius: '12px',
          padding: '16px',
          transition: 'border-color 200ms ease, background-color 400ms ease',
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = isReflectionStep ? 'hsl(36, 18%, 74%)' : 'hsl(var(--border) / 0.40)'; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = isReflectionStep ? 'hsl(36, 18%, 84%)' : 'hsl(var(--border) / 0.20)'; }}
      />
      <div className="flex items-center mt-2">
        <span
          style={{
            fontSize: '11px',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: 'var(--text-tertiary)',
            opacity: 0.5,
          }}
        >
          Bara er
        </span>
      </div>

      {stepIndex === 0 && isFirstVisit && (
        <p
          className="type-meta mt-3"
          style={{ color: 'var(--color-text-secondary)', opacity: 0.5 }}
        >
          Dina svar sparas i Era samtal efter avslutat kort.
        </p>
      )}

      <div className="mt-6" style={{ paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))' }}>
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
