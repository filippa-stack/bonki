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
  /** Hide the note textarea + Valfritt label (used for new kid/family products) */
  hideNoteField?: boolean;
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
  hideNoteField = false,
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
      style={{ marginTop: hideNoteField ? '32px' : '20px', marginBottom: '4px' }}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: BEAT_2, duration: EMOTION, ease: [...EASE] }}
    >
      {!hideNoteField && (
        <>
          <textarea
            value={displayText}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Skriv något ni vill bära med er."
            inputMode="text"
            autoCorrect="on"
            autoCapitalize="sentences"
            spellCheck={true}
            className="w-full resize-none focus:outline-none focus:ring-0 text-center"
            style={{
              height: isFocused || hasFill ? 'auto' : '80px',
              minHeight: '80px',
              maxHeight: '180px',
              overflow: 'auto',
              fontFamily: hasFill ? 'var(--font-sans)' : 'var(--font-serif)',
              fontSize: hasFill ? '15px' : '17px',
              lineHeight: 1.6,
              color: 'var(--text-primary)',
              backgroundColor: isFocused || hasFill
                ? 'hsl(36 20% 97% / 0.80)'
                : 'hsl(36 18% 96% / 0.50)',
              border: 'none',
              borderRadius: '12px',
              padding: '22px 24px 20px 24px',
              boxShadow: isFocused
                ? 'inset 0 1px 0 var(--accent-saffron-muted), inset 0 -1px 0 var(--accent-saffron-muted), 0 0 0 4px hsla(38, 80%, 46%, 0.06)'
                : 'inset 0 1px 3px hsla(30, 12%, 25%, 0.05), 0 1px 2px hsla(30, 15%, 25%, 0.03)',
              transition: 'background-color 320ms ease, box-shadow 320ms ease, border-radius 200ms ease',
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
          <p
            className="type-meta"
            style={{ color: 'var(--text-ghost)', opacity: 0.40, textAlign: 'center', marginTop: '6px', fontSize: '10px', letterSpacing: '0.08em' }}
          >
            Valfritt
          </p>
        </>
      )}

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

        {isExerciseStep ? (
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'block',
              width: '100%',
              minHeight: '44px',
              marginTop: '24px',
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
        ) : (
          <button
            onClick={() => navigate('/')}
            className="type-meta text-center block mx-auto transition-opacity hover:opacity-60"
            style={{ color: 'var(--text-tertiary)', opacity: 0.35, background: 'none', border: 'none', cursor: 'pointer', marginTop: '24px' }}
          >
            Till startsidan
          </button>
        )}
      </div>
    </motion.div>
  );
}
