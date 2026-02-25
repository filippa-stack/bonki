import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

const EASE = [0.22, 1, 0.36, 1] as const;

interface FeedbackSheetProps {
  sessionId: string;
  coupleSpaceId: string;
  show: boolean;
  onDismiss: () => void;
}

export default function FeedbackSheet({ sessionId, coupleSpaceId, show, onDismiss }: FeedbackSheetProps) {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  const dismiss = useCallback(() => {
    onDismiss();
  }, [onDismiss]);

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) {
      dismiss();
    }
  }, [dismiss]);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await supabase.from('beta_feedback' as any).insert({
        couple_space_id: coupleSpaceId,
        session_id: sessionId,
        response_text: text.trim() || null,
      } as any);
    } catch {
      // silent fail
    }
    dismiss();
  }, [text, coupleSpaceId, sessionId, submitting, dismiss]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          transition={{ duration: 0.4, ease: [...EASE] }}
          onClick={handleOverlayClick}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0,0,0,0.25)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'flex-end',
          }}
        >
          <motion.div
            ref={sheetRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%', transition: { duration: 0.25, ease: [0.4, 0, 1, 1] } }}
            transition={{ duration: 0.5, ease: [...EASE] }}
            style={{
              width: '100%',
              maxHeight: '70vh',
              background: 'var(--surface-base)',
              borderRadius: 'var(--radius-card) var(--radius-card) 0 0',
              padding: '48px 32px calc(32px + env(safe-area-inset-bottom, 0px))',
              display: 'flex',
              flexDirection: 'column',
              gap: '0px',
              overflowY: 'auto',
              boxShadow: '0 -8px 40px -12px rgba(0,0,0,0.12)',
            }}
          >
            {/* Brand label */}
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5, ease: [...EASE] }}
              className="type-meta"
              style={{
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                fontSize: '10px',
                color: 'var(--text-tertiary)',
                opacity: 0.5,
                textAlign: 'center',
                marginBottom: '24px',
              }}
            >
              Still Us
            </motion.p>

            {/* Question */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22, duration: 0.6, ease: [...EASE] }}
              className="font-serif"
              style={{
                fontSize: 'clamp(20px, 5.5vw, 24px)',
                fontWeight: 400,
                color: 'var(--text-primary)',
                textAlign: 'center',
                lineHeight: 1.45,
                marginBottom: '12px',
                textWrap: 'balance',
              }}
            >
              Vad hände i rummet under det här samtalet som inte hade hänt annars?
            </motion.p>

            {/* Founding member note */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.6, ease: [...EASE] }}
              className="font-serif italic"
              style={{
                fontSize: '13px',
                color: 'var(--accent-saffron)',
                textAlign: 'center',
                lineHeight: 1.5,
                marginBottom: '32px',
              }}
            >
              Som Founding Member är det just din feedback som hjälper oss att göra Still Us bättre – tack för att du är med och formar det
            </motion.p>

            {/* Textarea */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5, ease: [...EASE] }}
            >
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Skriv fritt..."
                className="font-sans"
                style={{
                  background: 'var(--surface-sunken)',
                  border: '1px solid transparent',
                  outline: 'none',
                  borderRadius: 'var(--radius-card)',
                  padding: '16px 20px',
                  fontSize: '16px',
                  lineHeight: 1.6,
                  color: 'var(--text-primary)',
                  minHeight: '96px',
                  resize: 'none',
                  marginBottom: '24px',
                  width: '100%',
                  fontFamily: 'inherit',
                  transition: 'border-color 200ms ease',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent-saffron-muted)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'transparent'; }}
              />
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5, ease: [...EASE] }}
              style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}
            >
              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="cta-primary"
                style={{
                  opacity: submitting ? 0.6 : 1,
                  width: '100%',
                }}
              >
                Skicka
              </button>

              {/* Skip */}
              <button
                onClick={dismiss}
                className="font-sans"
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '13px',
                  color: 'var(--text-tertiary)',
                  opacity: 0.5,
                  height: '48px',
                  width: '100%',
                  cursor: 'pointer',
                  letterSpacing: '0.01em',
                }}
              >
                Inte just nu
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
