import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionReflections } from '@/hooks/useSessionReflections';

interface SessionStepReflectionProps {
  sessionId?: string | null;
  stepIndex: number;
  promptIndex?: number;
  isLastStep?: boolean;
  isFirstVisit?: boolean;
  onLocked?: () => void | Promise<void>;
  onBack?: () => void;
  isReflectionStep?: boolean;
  isExerciseStep?: boolean;
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
  isExerciseStep = false,
}: SessionStepReflectionProps) {
  const navigate = useNavigate();
  const reflectionStepIndex = stepIndex * 100 + promptIndex;

  const { loading, myReflection, setText, markReady } =
    useSessionReflections(sessionId, reflectionStepIndex);

  const [localText, setLocalText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Track whether the user had already written something when this mounted
  const hadPriorTextRef = useRef(false);
  useEffect(() => {
    if (!loading && myReflection?.text?.trim()) {
      hadPriorTextRef.current = true;
    }
  }, [loading, myReflection]);

  // Sync server text into local when it arrives
  useEffect(() => {
    if (!loading && myReflection?.text) {
      setLocalText(myReflection.text);
    }
  }, [loading, myReflection?.text]);

  // Use local text as the source of truth for the field
  const displayText = localText;

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

  // CHANGE 1: Always render the field — no loading gate
  const hasFill = displayText.trim().length > 0;

  return (
    <div className="reflection-field-wrapper" style={{ marginTop: '32px', marginBottom: '8px' }}>
      <textarea
        value={displayText}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Vad vill ni minnas från det här samtalet?"
        inputMode="text"
        autoCorrect="on"
        autoCapitalize="sentences"
        spellCheck={true}
        className="w-full resize-none focus:outline-none focus:ring-0 text-center"
        style={{
          height: isFocused || hasFill ? 'auto' : '88px',
          minHeight: '88px',
          maxHeight: '240px',
          overflow: 'auto',
          fontFamily: hasFill ? 'Inter, sans-serif' : 'var(--font-serif)',
          fontSize: hasFill ? '15px' : '17px',
          lineHeight: 1.6,
          color: 'var(--color-text-primary)',
          backgroundColor: isFocused || hasFill
            ? 'hsl(36, 30%, 93%)'
            : 'hsl(36, 28%, 90%)',
          border: 'none',
          borderTop: isFocused
            ? '1px solid hsl(36, 30%, 72%)'
            : '1px solid hsl(36, 18%, 83%)',
          borderBottom: isFocused
            ? '1px solid hsl(36, 30%, 72%)'
            : '1px solid hsl(36, 18%, 83%)',
          borderRadius: 0,
          padding: '20px 8px 16px 8px',
          boxShadow: 'none',
          transition: 'background-color 200ms ease, border-top 200ms ease, border-bottom 200ms ease',
        }}
      />
      <style>{`
        .reflection-field-wrapper textarea::placeholder {
          font-family: 'Cormorant Garamond', serif !important;
          font-style: normal !important;
          font-size: 16px !important;
          color: var(--text-ghost) !important;
          opacity: 0.70 !important;
          transition: opacity 300ms ease !important;
        }
        .reflection-field-wrapper textarea:focus::placeholder {
          opacity: 0 !important;
        }
      `}</style>
      {/* Removed 'Era gemensamma tankar.' label — placeholder communicates shared ownership */}

      {stepIndex === 0 && isFirstVisit && (
        <p
          className="type-meta mt-3"
          style={{ color: 'var(--color-text-secondary)', opacity: 0.5 }}
        >
          Dina svar sparas i Era samtal efter avslutat kort.
        </p>
      )}

      <div
        className="flex flex-col items-center"
        style={{
          paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
          marginTop: '40px',
        }}
      >
        <button
          onClick={handleAdvance}
          disabled={submitting}
          className="cta-primary"
          style={hadPriorTextRef.current ? { opacity: 0.80 } : undefined}
        >
          {submitting
            ? 'Sparar…'
            : isLastStep
            ? 'Klar'
            : 'Fortsätt'}
        </button>

        <button
          onClick={() => navigate('/')}
          className="type-meta text-center block mx-auto hover:underline transition-opacity"
          style={{ color: 'var(--text-secondary)', opacity: 0.65, background: 'none', border: 'none', cursor: 'pointer', marginTop: '24px' }}
        >
          Tillbaka till översikten
        </button>

        {isExerciseStep && (
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <button
              onClick={() => navigate('/')}
              style={{
                display: 'block',
                width: '100%',
                minHeight: '44px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                fontSize: '13px',
                color: 'var(--color-text-secondary)',
                opacity: 0.50,
                textAlign: 'center',
              }}
            >
              Vi pausar här — fortsätt en annan dag
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
