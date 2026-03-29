import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { EMOTION, EASE, BEAT_1 } from '@/lib/motion';

interface Props {
  sessionId: string | null;
  stepIndex: number;
}

interface ReflectionEntry {
  text: string;
  stepIndex: number;
}

/**
 * Read-only display of a user's saved reflections for a completed session step.
 * Renders nothing if no reflections exist for this step.
 * The highest step_index reflection is treated as the completion takeaway.
 */
export default function LockedReflectionDisplay({ sessionId, stepIndex }: Props) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<ReflectionEntry[]>([]);
  const [maxStepIndex, setMaxStepIndex] = useState<number>(-1);
  const [loading, setLoading] = useState(true);

  console.log('[archive-debug] LockedReflectionDisplay mounted', { sessionId, stepIndex });

  useEffect(() => {
    setEntries([]);
    setMaxStepIndex(-1);
    setLoading(true);
    if (!sessionId || !user) { setLoading(false); return; }

    const encodedStep = stepIndex * 100;

    // Fetch reflections for this step AND get max step_index for completion detection
    Promise.all([
      supabase
        .from('step_reflections')
        .select('text, step_index')
        .eq('session_id', sessionId)
        .gte('step_index', encodedStep)
        .lt('step_index', encodedStep + 100)
        .in('state', ['locked', 'revealed', 'ready'])
        .eq('user_id', user.id)
        .order('step_index', { ascending: true }),
      supabase
        .from('step_reflections')
        .select('step_index')
        .eq('session_id', sessionId)
        .eq('user_id', user.id)
        .neq('text', '')
        .order('step_index', { ascending: false })
        .limit(1),
    ]).then(([{ data: rows }, { data: maxRows }]) => {
      const validRows = Array.isArray(rows) ? rows : [];
      setEntries(
        validRows
          .filter(r => r.text?.trim())
          .map(r => ({ text: r.text.trim(), stepIndex: r.step_index }))
      );
      setMaxStepIndex(maxRows?.[0]?.step_index ?? -1);
      setLoading(false);
    });
  }, [sessionId, stepIndex, user]);

  if (loading || entries.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
      {entries.map((entry, i) => {
        const isCompletion = entry.stepIndex === maxStepIndex;
        return (
          <div key={i}>
            {isCompletion && (
              <p style={{
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: '#D4A03A',
                opacity: 0.7,
                marginBottom: '6px',
              }}>
                Ert takeaway
              </p>
            )}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: BEAT_1 + i * 0.06, duration: EMOTION, ease: [...EASE] }}
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '17px',
                fontWeight: 400,
                fontStyle: 'italic',
                color: 'var(--text-secondary)',
                textAlign: 'left',
                lineHeight: 1.7,
                padding: '24px',
                background: isCompletion
                  ? 'hsl(36 20% 97% / 0.70)'
                  : 'hsl(36 20% 97% / 0.70)',
                borderRadius: '12px',
                border: 'none',
                whiteSpace: 'pre-wrap',
                boxShadow: 'inset 0 1px 3px hsla(30, 12%, 25%, 0.04), 0 1px 2px hsla(30, 15%, 25%, 0.03)',
                ...(isCompletion ? {
                  borderLeft: '3px solid rgba(212, 160, 58, 0.20)',
                } : {}),
              }}
            >
              {entry.text}
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
