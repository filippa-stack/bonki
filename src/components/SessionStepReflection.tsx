import { useState, useRef, useEffect } from 'react';
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

  // Track whether the user had already written something when this mounted
  const hadPriorTextRef = useRef(false);
  useEffect(() => {
    if (!loading && myReflection?.text?.trim()) {
      hadPriorTextRef.current = true;
    }
  }, [loading, myReflection]);

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

  const isRevisited = hadPriorTextRef.current;

  return (
    <div style={{ marginTop: '16px', marginBottom: '1px' }}>
      <div className="reflection-field-wrapper">
        <textarea
          value={displayText}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Vad vill ni minnas från det här samtalet?"
          inputMode="text"
          autoCorrect="on"
          autoCapitalize="sentences"
          spellCheck={true}
          className="w-full resize-none focus:outline-none focus:ring-0 placeholder:font-serif placeholder:italic placeholder:text-[14px]"
          style={{
            minHeight: '120px',
            maxHeight: '240px',
            overflow: 'auto',
            fontFamily: 'var(--font-serif)',
            fontSize: '17px',
            lineHeight: 1.6,
            color: 'var(--color-ink)',
            backgroundColor: 'hsl(36, 20%, 95%)',
            border: 'none',
            borderBottom: '1px solid hsl(36, 12%, 78%)',
            borderRadius: 0,
            padding: '16px',
            boxShadow: 'none',
            transition: 'border-color 200ms ease',
          }}
        />
      </div>
      <div style={{ minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '8px' }}>
        <span
          className="font-serif"
          style={{
            fontSize: '12px',
            fontStyle: 'normal',
            color: '#8B5E1A',
            opacity: 0.65,
            textAlign: 'center',
          }}
        >
          Era gemensamma tankar.
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
          style={isRevisited ? { opacity: 0.80 } : undefined}
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
