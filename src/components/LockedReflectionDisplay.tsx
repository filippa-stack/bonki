import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
    <div
      style={{
        fontFamily: 'var(--font-serif)',
        fontSize: '16px',
        fontWeight: 400,
        color: 'var(--color-text-secondary)',
        textAlign: 'left',
        lineHeight: 1.7,
        padding: '16px',
        background: 'hsl(36, 20%, 97%)',
        borderRadius: '12px',
        border: '1px solid hsl(36, 15%, 88%)',
        marginBottom: '32px',
        whiteSpace: 'pre-wrap',
      }}
    >
      {text}
    </div>
  );
}
