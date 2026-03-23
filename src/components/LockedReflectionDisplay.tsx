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
 * Read-only display of a user's saved reflections for a completed session step.
 * Renders nothing if no reflections exist for this step.
 */
export default function LockedReflectionDisplay({ sessionId, stepIndex }: Props) {
  const { user } = useAuth();
  const [texts, setTexts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTexts([]);
    setLoading(true);
    if (!sessionId || !user) { setLoading(false); return; }

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
      .then(({ data }) => {
        const rows = Array.isArray(data) ? data : [];
        setTexts(rows.map(r => r.text?.trim()).filter(Boolean) as string[]);
        setLoading(false);
      });
  }, [sessionId, stepIndex, user]);

  if (loading || texts.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
      {texts.map((t, i) => (
        <motion.div
          key={i}
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
            background: 'hsl(36 20% 97% / 0.70)',
            borderRadius: '12px',
            border: 'none',
            whiteSpace: 'pre-wrap',
            boxShadow: 'inset 0 1px 3px hsla(30, 12%, 25%, 0.04), 0 1px 2px hsla(30, 15%, 25%, 0.03)',
          }}
        >
          {t}
        </motion.div>
      ))}
    </div>
  );
}
