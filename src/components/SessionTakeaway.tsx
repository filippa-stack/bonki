import { useEffect, useRef } from 'react';

import { useCardTakeaway } from '@/hooks/useCardTakeaway';

interface SessionTakeawayProps {
  sessionId: string | null;
}

/**
 * Single shared takeaway field for the integration/completion screen.
 * Auto-saves on change, locks when component unmounts (user leaves).
 */
export default function SessionTakeaway({ sessionId }: SessionTakeawayProps) {
  const { text, locked, loading, saveStatus, setText, lockTakeaway } = useCardTakeaway(sessionId);
  const lockOnLeaveRef = useRef(lockTakeaway);
  lockOnLeaveRef.current = lockTakeaway;

  // Lock takeaway when user leaves the integration screen
  useEffect(() => {
    return () => {
      lockOnLeaveRef.current();
    };
  }, []);

  if (loading) {
    return <div className="h-14 rounded-card bg-muted/20 animate-pulse" />;
  }

  if (locked) {
    return text.trim() ? (
      <div className="rounded-card border border-border/20 overflow-hidden">
        <p className="p-6 text-sm text-foreground whitespace-pre-wrap">{text}</p>
      </div>
    ) : null;
  }

  return (
    <div>
      <div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Skriv något ni vill bära med er."
          rows={3}
          inputMode="text"
          autoCorrect="on"
          autoCapitalize="sentences"
          spellCheck={true}
          enterKeyHint="done"
          style={{
            display: 'block',
            width: '100%',
            minHeight: '100px',
            backgroundColor: '#EDE8E1',
            border: '1px solid rgba(180, 165, 148, 0.40)',
            borderRadius: '12px',
            padding: '16px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '15px',
            color: '#1C1B1A',
            resize: 'none' as const,
            outline: 'none',
          }}
        />
      </div>
      <span className="text-[10px] text-muted-foreground/40 block text-right px-1">
        {saveStatus === 'saving' ? 'Sparar…' : saveStatus === 'saved' ? 'Sparad' : '\u00A0'}
      </span>
    </div>
  );
}
