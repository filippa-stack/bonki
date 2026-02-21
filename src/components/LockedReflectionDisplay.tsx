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

    supabase
      .from('step_reflections')
      .select('text')
      .eq('session_id', sessionId)
      .eq('step_index', stepIndex)
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.text?.trim()) setText(data.text.trim());
        setLoading(false);
      });
  }, [sessionId, stepIndex, user]);

  if (loading || !text) return null;

  return (
    <div className="mt-10 mb-1" style={{ paddingLeft: '16px' }}>
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
          marginTop: '12px',
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
