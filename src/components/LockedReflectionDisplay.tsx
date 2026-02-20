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
    <div className="mt-10 mb-1">
      <div
        className="rounded-card overflow-hidden"
        style={{
          border: '1px solid hsl(var(--border) / 0.6)',
          backgroundColor: 'hsl(var(--muted) / 0.08)',
          padding: '1.5rem',
        }}
      >
        <p
          className="text-sm leading-relaxed whitespace-pre-wrap"
          style={{ color: 'var(--color-ink)' }}
        >
          {text}
        </p>
        <p className="mt-3 text-xs" style={{ color: 'var(--color-text-secondary)', opacity: 0.45 }}>
          Din reflektion
        </p>
      </div>
    </div>
  );
}
