import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import { supabase } from '@/integrations/supabase/client';

interface ArchiveTakeawayProps {
  sessionId: string;
  initialText: string;
}

export default function ArchiveTakeaway({ sessionId, initialText }: ArchiveTakeawayProps) {
  const { user } = useAuth();
  const { space } = useCoupleSpaceContext();
  const [text, setText] = useState(initialText);
  const [savedText, setSavedText] = useState(initialText);
  const [showSaved, setShowSaved] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasExisting = initialText.trim().length > 0;

  const save = useCallback(async () => {
    if (!user || !space || text === savedText) return;

    const trimmed = text.trim();
    if (!trimmed && !savedText) return;

    if (trimmed) {
      // Try update first, then insert
      const { data: existing } = await supabase
        .from('couple_takeaways')
        .select('id')
        .eq('session_id', sessionId)
        .eq('created_by', user.id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('couple_takeaways')
          .update({ content: trimmed } as any)
          .eq('id', existing.id);
      } else {
        await supabase
          .from('couple_takeaways')
          .insert({
            session_id: sessionId,
            couple_space_id: space.id,
            content: trimmed,
            created_by: user.id,
          } as any);
      }
    }

    setSavedText(text);
    setShowSaved(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShowSaved(false), 2000);
  }, [text, savedText, sessionId, user, space]);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const textareaStyle: React.CSSProperties = {
    backgroundColor: 'var(--surface-sunken)',
    border: '1px solid hsl(var(--neutral-300))',
    borderRadius: '10px',
    padding: '16px',
    fontFamily: 'var(--font-serif)',
    fontSize: '17px',
    fontStyle: 'italic',
    color: 'var(--color-text-primary)',
    width: '100%',
    minHeight: '80px',
    resize: 'none' as const,
    outline: 'none',
    lineHeight: 1.5,
  };

  return (
    <div style={{ marginTop: '16px' }}>
      {hasExisting ? (
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--accent-text)',
            marginBottom: '8px',
          }}
        >
          Ni bar med er:
        </p>
      ) : (
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '12px',
            color: 'var(--text-tertiary)',
            marginBottom: '8px',
          }}
        >
          Något ni vill bära med er?
        </p>
      )}

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={save}
        placeholder="Skriv något ni vill minnas."
        style={textareaStyle}
      />

      {showSaved && (
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '11px',
            color: 'var(--text-tertiary)',
            marginTop: '6px',
            opacity: 0.7,
          }}
        >
          Sparat
        </p>
      )}
    </div>
  );
}
