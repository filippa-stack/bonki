import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

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
          transition={{ duration: 0.28 }}
          onClick={handleOverlayClick}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'flex-end',
          }}
        >
          <motion.div
            ref={sheetRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%', transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } }}
            transition={{ duration: 0.28, ease: [0, 0, 0.2, 1] }}
            style={{
              width: '100%',
              maxHeight: '60vh',
              background: 'hsl(36, 20%, 95%)',
              borderRadius: '24px 24px 0 0',
              padding: '40px 32px calc(32px + env(safe-area-inset-bottom, 0px))',
              display: 'flex',
              flexDirection: 'column',
              gap: '0px',
              overflowY: 'auto',
            }}
          >
            {/* BONKI label */}
            <p
              className="font-sans"
              style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: 'hsl(30, 8%, 56%)',
                opacity: 0.6,
                textAlign: 'center',
                marginBottom: '24px',
              }}
            >
              BONKI
            </p>

            {/* Question */}
            <p
              className="font-serif"
              style={{
                fontSize: '22px',
                fontWeight: 400,
                color: 'hsl(220, 25%, 18%)',
                textAlign: 'center',
                lineHeight: 1.5,
                marginBottom: '28px',
              }}
            >
              Vad hände i rummet under det här samtalet som inte hade hänt annars?
            </p>

            {/* Textarea */}
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Skriv fritt..."
              className="font-sans"
              style={{
                background: 'hsl(36, 22%, 92%)',
                border: 'none',
                outline: 'none',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '16px',
                color: 'hsl(220, 25%, 18%)',
                minHeight: '100px',
                resize: 'none',
                marginBottom: '20px',
                width: '100%',
                fontFamily: 'inherit',
              }}
            />

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="font-sans"
              style={{
                background: 'hsl(158, 35%, 18%)',
                color: '#fff',
                fontSize: '15px',
                fontWeight: 500,
                border: 'none',
                borderRadius: '12px',
                height: '52px',
                width: '100%',
                cursor: 'pointer',
                opacity: submitting ? 0.6 : 1,
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
                fontSize: '14px',
                color: 'hsl(30, 8%, 56%)',
                opacity: 0.6,
                height: '44px',
                width: '100%',
                cursor: 'pointer',
              }}
            >
              Hoppa över
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
