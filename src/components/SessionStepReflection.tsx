import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSessionReflections } from '@/hooks/useSessionReflections';
import { BEAT_2, EMOTION, EASE } from '@/lib/motion';

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
    <motion.div
      className="reflection-field-wrapper"
      style={{ marginTop: '20px', marginBottom: '4px' }}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: BEAT_2, duration: EMOTION, ease: [...EASE] }}
    >
      <textarea
        value={displayText}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Något ni vill ta med er?"
        inputMode="text"
        autoCorrect="on"
        autoCapitalize="sentences"
        spellCheck={true}
        className="w-full resize-none focus:outline-none focus:ring-0 text-center"
        style={{
          height: isFocused || hasFill ? 'auto' : '72px',
          minHeight: '72px',
          maxHeight: '180px',
          overflow: 'auto',
          fontFamily: hasFill ? 'var(--font-sans)' : 'var(--font-serif)',
          fontSize: hasFill ? '15px' : '17px',
          lineHeight: 1.6,
          color: 'var(--text-primary)',
          backgroundColor: isFocused || hasFill
            ? 'hsl(0 0% 100% / 0.65)'
            : 'hsl(0 0% 100% / 0.35)',
          border: 'none',
          borderRadius: '10px',
          padding: '18px 20px 16px 20px',
          boxShadow: isFocused
            ? 'inset 0 1px 0 var(--accent-saffron), inset 0 -1px 0 var(--accent-saffron), 0 0 0 3px hsla(38, 80%, 46%, 0.08)'
            : '0 1px 2px hsla(30, 15%, 25%, 0.04), 0 4px 16px -4px hsla(30, 18%, 28%, 0.06)',
          transition: 'background-color 280ms ease, box-shadow 280ms ease',
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

      <p
        className="type-meta mt-2"
        style={{ color: 'var(--text-ghost)', opacity: 0.50, textAlign: 'center' }}
      >
        Valfritt
      </p>

      <div
        className="flex flex-col items-center"
        style={{
          paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
          marginTop: '24px',
        }}
      >
        <motion.button
          onClick={handleAdvance}
          disabled={submitting}
          className="cta-primary"
          style={hadPriorTextRef.current ? { opacity: 0.80 } : undefined}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.12 }}
        >
          {submitting
            ? 'Sparar…'
            : isLastStep
            ? 'Klar'
            : 'Fortsätt'}
        </motion.button>

        <button
          onClick={() => navigate('/')}
          className="type-meta text-center block mx-auto transition-opacity hover:opacity-60"
          style={{ color: 'var(--text-tertiary)', opacity: 0.35, background: 'none', border: 'none', cursor: 'pointer', marginTop: '24px' }}
        >
          Till startsidan
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
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                opacity: 0.50,
                textAlign: 'center',
              }}
            >
              Vi pausar här — fortsätt en annan dag
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
