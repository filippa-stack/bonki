import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Feather } from 'lucide-react';
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
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Track whether the user had already written something when this mounted
  const hadPriorTextRef = useRef(false);
  useEffect(() => {
    if (!loading && myReflection?.text?.trim()) {
      hadPriorTextRef.current = true;
      setIsExpanded(true);
    }
  }, [loading, myReflection]);

  // Sync server text into local when it arrives
  useEffect(() => {
    if (!loading && myReflection?.text) {
      setLocalText(myReflection.text);
    }
  }, [loading, myReflection?.text]);

  const displayText = localText;

  const handleChange = (value: string) => {
    setLocalText(value);
    setText(value);
  };

  const handleExpand = () => {
    setIsExpanded(true);
    setTimeout(() => textareaRef.current?.focus(), 320);
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

  const hasFill = displayText.trim().length > 0;

  return (
    <motion.div
      className="reflection-field-wrapper"
      style={{
        marginTop: hideNoteField ? '32px' : '20px',
        marginBottom: '4px',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
      }}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [...EASE] }}
    >
      {/* Expanded textarea — shows above the bottom zone when active */}
      {!hideNoteField && isExpanded && (
        <motion.div
          key="expanded"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <div style={{ position: 'relative' }}>
            {/* Feather watermark when empty */}
            {!hasFill && !isFocused && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  position: 'absolute',
                  top: '22px',
                  left: '20px',
                  pointerEvents: 'none',
                  zIndex: 1,
                }}
              >
                <Feather
                  size={14}
                  strokeWidth={1.5}
                  style={{ color: 'var(--text-primary)', opacity: 0.25 }}
                />
              </motion.div>
            )}
            <textarea
              ref={textareaRef}
              value={displayText}
              onChange={(e) => handleChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder=""
              inputMode="text"
              autoCorrect="on"
              autoCapitalize="sentences"
              spellCheck={true}
              className="w-full resize-none focus:outline-none focus:ring-0"
              style={{
                height: 'auto',
                minHeight: '80px',
                maxHeight: '180px',
                overflow: 'auto',
                fontFamily: 'var(--font-serif)',
                fontSize: '16px',
                lineHeight: 1.7,
                color: 'var(--text-primary)',
                backgroundColor: isFocused || hasFill
                  ? 'hsla(36, 20%, 97%, 0.12)'
                  : 'hsla(36, 18%, 96%, 0.06)',
                border: 'none',
                borderRadius: '12px',
                padding: '20px 24px',
                textAlign: 'center',
                boxShadow: isFocused
                  ? '0 0 0 1px hsla(36, 20%, 80%, 0.15)'
                  : 'none',
                transition: 'background-color 320ms ease, box-shadow 320ms ease',
              }}
            />
          </div>
        </motion.div>
      )}

      {/* Spacer pushes bottom zone down */}
      <div style={{ flexGrow: 1 }} />

      {/* Bottom zone: trigger + CTA */}
      <div
        className="flex flex-col items-center"
        style={{
          paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        {/* Collapsed trigger — poetic invitation */}
        {!hideNoteField && !isExpanded && (
          <motion.button
            key="trigger"
            onClick={handleExpand}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full active:scale-[0.98]"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '14px 20px',
              marginBottom: '16px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'opacity 200ms ease',
            }}
          >
            <Feather
              size={15}
              strokeWidth={1.5}
              style={{ color: 'var(--text-primary)', opacity: 0.35 }}
            />
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontSize: '15px',
                color: 'var(--text-primary)',
                opacity: 0.40,
                letterSpacing: '0.01em',
              }}
            >
              Fäst en tanke
            </span>
          </motion.button>
        )}

        {isExpanded && !hideNoteField && (
          <div style={{ height: '16px' }} />
        )}

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
             ? 'Vi är klara'
             : 'Nästa fråga'}
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
        ) : null}
      </div>
    </motion.div>
  );
}