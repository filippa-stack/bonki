import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil } from 'lucide-react';
import { useSessionReflections } from '@/hooks/useSessionReflections';
import { BEAT_2, EMOTION, EASE } from '@/lib/motion';
import { EMBER_GLOW, DRIFTWOOD, DEEP_SAFFRON, MIDNIGHT_INK } from '@/lib/palette';

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
  hideNoteField?: boolean;
  noteFieldLabel?: string;
  ctaLabel?: string;
  pauseLabel?: string;
  stillUsMode?: boolean;
  compactNoteTrigger?: boolean;
  onPause?: () => void;
  /** Called with note text when user advances (for local persistence) */
  onNoteCapture?: (text: string) => void;
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
  noteFieldLabel,
  ctaLabel,
  pauseLabel,
  stillUsMode = false,
  compactNoteTrigger = false,
  onPause,
  onNoteCapture,
}: SessionStepReflectionProps) {
  const navigate = useNavigate();
  const reflectionStepIndex = stepIndex * 100 + promptIndex;

  // If noteFieldLabel is provided, force the note field visible
  const effectiveHideNoteField = noteFieldLabel ? false : hideNoteField;
  const triggerLabel = noteFieldLabel || 'Skriv vad ni vill minnas';

  const { loading, myReflection, setText, markReady } =
    useSessionReflections(sessionId, reflectionStepIndex);

  const [localText, setLocalText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [saveIndicator, setSaveIndicator] = useState<'idle' | 'saved'>('idle');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Reset local state when step/prompt changes
  useEffect(() => {
    setLocalText('');
    setSubmitting(false);
    setIsExpanded(false);
    setSaveIndicator('idle');
    hadPriorTextRef.current = false;
  }, [reflectionStepIndex]);

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
    setSaveIndicator('idle');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    if (value.trim()) {
      saveTimeoutRef.current = setTimeout(() => {
        setSaveIndicator('saved');
        setTimeout(() => setSaveIndicator('idle'), 2500);
      }, 800);
    }
  };

  const handleExpand = () => {
    setIsExpanded(true);
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 320);
  };

  const handleAdvance = async () => {
    setSubmitting(true);
    try {
      await markReady(localText);
      if (localText.trim()) {
        onNoteCapture?.(localText.trim());
      }
      await onLocked?.();
    } finally {
      setSubmitting(false);
    }
  };

  const hasFill = displayText.trim().length > 0;

  // Resolve CTA text
  const resolvedCtaLabel = ctaLabel
    ?? (submitting ? 'Sparar…' : isLastStep ? 'Vi är klara' : 'Fortsätt');

  // Still Us palette
  const noteBg = stillUsMode ? EMBER_GLOW : 'hsla(36, 20%, 97%, 0.12)';
  const noteBgFocused = stillUsMode ? EMBER_GLOW : 'hsla(36, 20%, 97%, 0.12)';
  const noteTextColor = stillUsMode ? MIDNIGHT_INK : 'var(--text-primary)';
  const noteBorder = stillUsMode ? `1px solid ${DRIFTWOOD}33` : '1px solid hsla(36, 20%, 80%, 0.18)';
  const ctaBg = stillUsMode ? DEEP_SAFFRON : 'hsl(41, 78%, 48%)';
  const ctaTextColor = stillUsMode ? MIDNIGHT_INK : 'hsl(30, 10%, 12%)';
  const triggerColor = stillUsMode ? 'hsl(38 25% 92%)' : 'var(--text-primary)';

  return (
    <motion.div
      className="reflection-field-wrapper"
      style={{
        width: '100%',
        maxWidth: '520px',
        display: 'flex',
        flexDirection: 'column',
      }}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [...EASE] }}
    >
      {/* Note field — above the CTA */}
      {!effectiveHideNoteField && !isExpanded && (
        <motion.button
          key="trigger"
          onClick={handleExpand}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06, duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="w-full active:scale-[0.98]"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '14px 20px',
            marginBottom: stillUsMode ? '80px' : '16px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            transition: 'opacity 200ms ease',
          }}
        >
          <Pencil
            size={compactNoteTrigger ? 16 : 15}
            strokeWidth={1.5}
            style={{ color: triggerColor, opacity: 0.72 }}
          />
          {!compactNoteTrigger && (
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '14px',
                color: triggerColor,
                opacity: 0.78,
                letterSpacing: '0.01em',
              }}
            >
              {triggerLabel}
            </span>
          )}
        </motion.button>
      )}

      {/* Expanded textarea */}
      {!effectiveHideNoteField && isExpanded && (
        <motion.div
          key="expanded"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          style={{ marginBottom: '16px' }}
        >
          <div style={{ position: 'relative' }}>
            {/* Pencil watermark when empty */}
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
                <Pencil
                  size={14}
                  strokeWidth={1.5}
                  style={{ color: triggerColor, opacity: 0.25 }}
                />
              </motion.div>
            )}
            <textarea
              ref={textareaRef}
              value={displayText}
              onChange={(e) => handleChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Skriv här…"
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
                color: noteTextColor,
                backgroundColor: isFocused || hasFill ? noteBgFocused : noteBg,
                border: noteBorder,
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
          {/* Save indicator */}
          <AnimatePresence>
            {saveIndicator === 'saved' && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '11px',
                  color: stillUsMode ? DRIFTWOOD : 'var(--text-secondary)',
                  opacity: 0.55,
                  textAlign: 'center',
                  marginTop: '8px',
                  letterSpacing: '0.02em',
                }}
              >
                ✓ Sparat i era samtal
              </motion.p>
            )}
          </AnimatePresence>
          {/* Persistent hint */}
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontStyle: 'italic',
            fontSize: '11px',
            color: stillUsMode ? 'hsl(38 20% 82%)' : 'var(--text-secondary)',
            textAlign: 'center',
            marginTop: '8px',
            opacity: stillUsMode ? 0.88 : 0.72,
          }}>
            Det ni skriver sparas i era samtal
          </p>
        </motion.div>
      )}

      {/* Spacer when note not expanded in still us mode */}
      {stillUsMode && effectiveHideNoteField && <div style={{ height: '80px' }} />}

      {/* Full-width CTA button */}
      <motion.button
        onClick={handleAdvance}
        disabled={submitting}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.12 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '52px',
          borderRadius: '14px',
          backgroundColor: ctaBg,
          color: ctaTextColor,
          fontFamily: 'var(--font-sans)',
          fontSize: stillUsMode ? '17px' : '15px',
          fontWeight: 600,
          letterSpacing: '0.01em',
          border: 'none',
          cursor: submitting ? 'default' : 'pointer',
          boxShadow: 'none',
          opacity: submitting ? 0.5 : (hadPriorTextRef.current ? 0.90 : 1),
          transition: 'opacity 200ms ease, background-color 260ms ease-out',
        }}
      >
        {submitting ? 'Sparar…' : resolvedCtaLabel}
      </motion.button>

      {/* Pause button */}
      {(stillUsMode || isExerciseStep) && (
        <button
          onClick={() => (onPause ?? (() => navigate('/')))()}
          style={{
            display: 'block',
            width: '100%',
            minHeight: '44px',
            marginTop: '12px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            fontSize: stillUsMode ? '14px' : '13px',
            color: stillUsMode ? 'hsl(38 20% 82%)' : 'var(--text-secondary)',
            opacity: stillUsMode ? 0.9 : 0.72,
            textAlign: 'center',
          }}
        >
          {pauseLabel ?? 'Pausa för idag'}
        </button>
      )}
    </motion.div>
  );
}
