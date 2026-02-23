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
  /** Whether this is a reflection step (opening/deepening) for styling */
  isReflectionStep?: boolean;
  /** Whether this is an exercise/assignment step */
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

  const hasFill = displayText.trim().length > 0;

  return (
    <div style={{ marginTop: '16px', marginBottom: '1px' }}>
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
          minHeight: '96px',
          maxHeight: '240px',
          overflow: 'auto',
          fontFamily: hasFill ? 'Inter, sans-serif' : 'var(--font-serif)',
          fontSize: hasFill ? '15px' : '17px',
          lineHeight: 1.6,
          color: 'var(--color-text-primary)',
          backgroundColor: isFocused || hasFill
            ? 'hsl(36, 30%, 93%)'
            : 'hsl(36, 25%, 91%)',
          border: 'none',
          borderBottom: isFocused
            ? '1.5px solid #C4821D'
            : '1px solid hsl(36, 18%, 82%)',
          borderRadius: 0,
          padding: '16px 0 12px 0',
          boxShadow: 'none',
          transition: 'background-color 200ms ease, border-bottom 200ms ease',
        }}
      />
      {/* Placeholder overlay for custom styling */}
      <style>{`
        .reflection-field-wrapper textarea::placeholder {
          font-family: 'Cormorant Garamond', serif !important;
          font-style: italic !important;
          font-size: 16px !important;
          color: #8B5E1A !important;
          opacity: 0.60 !important;
          transition: opacity 300ms ease !important;
        }
        .reflection-field-wrapper textarea:focus::placeholder {
          opacity: 0 !important;
        }
      `}</style>
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
          style={hadPriorTextRef.current ? { opacity: 0.80 } : undefined}
        >
          {submitting
            ? 'Sparar…'
            : isLastStep
            ? 'Klar'
            : 'Fortsätt'}
        </button>

        {isExerciseStep && (
          <>
            <button
              onClick={() => navigate('/')}
              style={{
                display: 'block',
                width: '100%',
                marginTop: '16px',
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
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '11px',
              color: 'var(--color-text-tertiary)',
              opacity: 0.35,
              textAlign: 'center',
              marginTop: '8px',
            }}>
              Appen kommer ihåg var ni är.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
