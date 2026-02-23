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
    <div className="mt-8 mb-1" style={{ paddingLeft: '16px' }}>
      <p
        className="type-body font-serif whitespace-pre-wrap"
        style={{
          lineHeight: 1.8,
          color: 'var(--color-text-primary)',
          opacity: 0.75,
        }}
      >
        {text}
      </p>
      <p
        className="type-meta"
        style={{
          marginTop: '16px',
          color: 'var(--color-text-secondary)',
          opacity: 0.3,
          letterSpacing: '0.04em',
        }}
      >
        Din reflektion
      </p>
    </div>
  );
}
