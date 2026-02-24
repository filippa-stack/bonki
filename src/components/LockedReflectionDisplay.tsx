import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { EMOTION, EASE, BEAT_1 } from '@/lib/motion';

interface Props {
  sessionId: string | null;
  stepIndex: number;
}

/**
 * Read-only display of a user's saved reflection for a completed session step.
 * Renders nothing if no reflection exists for this step.
 */
export default function LockedReflectionDisplay({ sessionId, stepIndex }: Props) {
  const { user } = useAuth();
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setText(null);
    setLoading(true);
    if (!sessionId || !user) { setLoading(false); return; }

    // Reflections are stored at stepIndex * 100 + promptIndex
    const encodedStep = stepIndex * 100;
    supabase
      .from('step_reflections')
      .select('text')
      .eq('session_id', sessionId)
      .gte('step_index', encodedStep)
      .lt('step_index', encodedStep + 100)
      .in('state', ['locked', 'revealed', 'ready'])
      .eq('user_id', user.id)
      .order('step_index', { ascending: true })
      .limit(1)
      .then(({ data }) => {
        const row = Array.isArray(data) ? data?.[0] : data;
        if (row?.text?.trim()) setText(row.text.trim());
        setLoading(false);
      });
  }, [sessionId, stepIndex, user]);

  if (loading || !text) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: BEAT_1, duration: EMOTION, ease: [...EASE] }}
      style={{
        fontFamily: 'var(--font-serif)',
        fontSize: '16px',
        fontWeight: 400,
        color: 'var(--text-secondary)',
        textAlign: 'left',
        lineHeight: 1.7,
        padding: '20px',
        background: 'var(--surface-raised)',
        borderRadius: '10px',
        border: 'none',
        marginBottom: '32px',
        whiteSpace: 'pre-wrap',
        boxShadow: '0 1px 2px hsla(30, 15%, 25%, 0.04), 0 4px 16px -4px hsla(30, 18%, 28%, 0.06)',
      }}
    >
      {text}
    </motion.div>
  );
}
