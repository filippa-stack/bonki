import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSessionReflections } from '@/hooks/useSessionReflections';
import { BEAT_2, BEAT_3, EASE } from '@/lib/motion';

interface SessionStepReflectionProps {
  /** Normalized session ID from NormalizedSessionProvider (couple_sessions.id). */
  sessionId?: string | null;
  stepIndex: number;
  /**
   * Fires after markReady() resolves and the RPC step-completion call succeeds.
   * This is the sole entry point for complete_couple_session_step and
   * any step-index advancement in the parent.
   */
  onLocked?: () => void | Promise<void>;
}

export default function SessionStepReflection({
  sessionId = null,
  stepIndex,
  onLocked,
}: SessionStepReflectionProps) {
  const {
    loading,
    myReflection,
    state,
    setText,
    markReady,
  } = useSessionReflections(sessionId, stepIndex);

  const [localText, setLocalText] = useState('');

  // Sync local text from hook
  const displayText = myReflection?.text ?? localText;

  const handleChange = (value: string) => {
    setLocalText(value);
    setText(value);
  };

  const handleMarkReady = async () => {
    await markReady();
    // In the single-writer model, ready = done for this step.
    // Call onLocked immediately — parent handles complete_couple_session_step.
    await onLocked?.();
  };

  if (loading) {
    return (
      <div className="mt-6 mb-2">
        <div className="h-20 rounded-xl bg-muted/20 animate-pulse" />
      </div>
    );
  }

  // ─── READY (already submitted) ───
  if (state === 'ready' || state === 'revealed' || state === 'locked') {
    return (
      <motion.div
        className="mt-8 mb-2 space-y-4"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: BEAT_2, ease: EASE }}
      >
        <div className="rounded-[20px] border border-border/30 bg-muted/10 overflow-hidden p-6">
          <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
            {myReflection?.text || displayText}
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/50">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Sparat
        </div>
      </motion.div>
    );
  }

  // ─── DRAFT: writing state ───
  return (
    <div className="mt-8 mb-2 space-y-3">
      <div className="rounded-[20px] border border-border/50 bg-card overflow-hidden p-6">
        <textarea
          value={displayText}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Skriv din reflektion."
          className="w-full min-h-[120px] bg-transparent resize-none focus:outline-none focus:ring-0 text-sm text-foreground placeholder:text-muted-foreground/60"
        />
        <div className="flex items-center pt-3">
          <span className="text-xs text-muted-foreground/50 flex items-center gap-1">
            <Lock className="w-3 h-3" />
            Bara du kan se det här
          </span>
        </div>
      </div>

      <div className="mt-4">
        <Button
          onClick={handleMarkReady}
          disabled={!displayText.trim()}
          size="lg"
          className="w-full h-14 rounded-2xl gap-2 font-normal"
        >
          {stepIndex >= 3 ? 'Avsluta samtalet' : 'Fortsätt till nästa steg'}
        </Button>
      </div>
    </div>
  );
}
