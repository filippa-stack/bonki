import { useEffect, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
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
    return <div className="h-14 rounded-xl bg-muted/20 animate-pulse" />;
  }

  if (locked) {
    return text.trim() ? (
      <div className="rounded-xl border border-border/30 bg-muted/10 overflow-hidden">
        <p className="p-3 text-sm text-foreground whitespace-pre-wrap">{text}</p>
      </div>
    ) : null;
  }

  return (
    <div className="space-y-1.5">
      <div className="h-px bg-border/30 mb-4" />
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Skriv något ni vill bära med er."
        className="min-h-[56px] text-sm resize-none bg-transparent border-none shadow-none focus-visible:ring-0 px-0 placeholder:text-muted-foreground/40"
        rows={2}
      />
      <span className="text-[10px] text-muted-foreground/40">
        {saveStatus === 'saving' ? 'Sparar…' : saveStatus === 'saved' ? 'Sparad' : '\u00A0'}
      </span>
    </div>
  );
}
