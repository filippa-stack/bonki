import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCoupleSpaceContext as useCoupleSpace } from '@/contexts/CoupleSpaceContext';
import { useSessionReflections, type ReflectionState } from '@/hooks/useSessionReflections';
import { BEAT_1, BEAT_2, EASE } from '@/lib/motion';



interface SessionStepReflectionProps {
  /** Normalized session ID from NormalizedSessionProvider (couple_sessions.id). */
  sessionId?: string | null;
  stepIndex: number;
  /**
   * Fires after markReady() resolves.
   * Signals only that this user's step_reflections row is now 'ready'.
   * Must NOT trigger session progression — that belongs to onLocked.
   */
  onReady?: () => void;
  /**
   * Fires after lockStep() resolves.
   * This is the sole entry point for complete_couple_session_step
   * and any step-index advancement in the parent.
   */
  onLocked?: () => void | Promise<void>;
}


export default function SessionStepReflection({
  sessionId = null,
  stepIndex,
  onReady,
  onLocked,
}: SessionStepReflectionProps) {
  const {
    loading,
    myReflection,
    partnerReflection,
    state,
    setText,
    markReady,
    lockStep,
  } = useSessionReflections(sessionId, stepIndex);

  const { space, userRole } = useCoupleSpace();
  const myName = userRole === 'partner_a' ? (space?.partner_a_name || 'Du') : (space?.partner_b_name || 'Du');
  const partnerName = userRole === 'partner_a' ? (space?.partner_b_name || 'Din partner') : (space?.partner_a_name || 'Din partner');

  const [localText, setLocalText] = useState('');

  // Track previous state to detect ready→revealed transition
  const [prevState, setPrevState] = useState(state);
  const [waitingVisible, setWaitingVisible] = useState(state === 'ready');
  const [revealVisible, setRevealVisible] = useState(state === 'revealed' || state === 'locked');

  useEffect(() => {
    if (prevState === 'ready' && (state === 'revealed' || state === 'locked')) {
      // Phase A: fade out waiting (120ms), Phase B: pause 80ms, Phase C+: reveal
      setWaitingVisible(false);
      const timer = setTimeout(() => setRevealVisible(true), 200); // 120 + 80
      return () => clearTimeout(timer);
    }
    if (state === 'ready') {
      setWaitingVisible(true);
      setRevealVisible(false);
    }
    if ((state === 'revealed' || state === 'locked') && prevState !== 'ready') {
      setRevealVisible(true);
      setWaitingVisible(false);
    }
    setPrevState(state);
  }, [state]);

  // Sync local text from hook
  const displayText = myReflection?.text ?? localText;

  const handleChange = (value: string) => {
    setLocalText(value);
    setText(value);
  };

  const handleMarkReady = async () => {
    await markReady();
    onReady?.();
  };

  const handleLock = async () => {
    await lockStep();
    onLocked?.();
  };

  if (loading) {
    return (
      <div className="mt-6 mb-2">
        <div className="h-20 rounded-xl bg-muted/20 animate-pulse" />
      </div>
    );
  }

  // ─── LOCKED: immutable view (same reveal sequence) ───
  if (state === 'locked') {
    return (
      <div className="mt-8 mb-2 space-y-5">
        <p className="text-xs text-muted-foreground/50 text-center tracking-wide">
          Så här reflekterade ni
        </p>

        {partnerReflection && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: EASE }}
          >
            <ReflectionBlock name={partnerName} text={partnerReflection.text} locked />
          </motion.div>
        )}

        <Separator className="opacity-30" />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06, duration: 0.18, ease: EASE }}
        >
          <ReflectionBlock name={myName} text={myReflection?.text || ''} locked />
        </motion.div>

        <p className="text-xs text-muted-foreground/40 text-center">
          Det här steget är låst.
        </p>
      </div>
    );
  }

  // ─── REVEALED: both visible, own editable ───
  // Uses animated sequence: waiting fade-out (120ms) → pause (80ms) → reflections stagger in
  if (state === 'revealed') {
    return (
      <div className="mt-8 mb-2">
        <AnimatePresence mode="wait">
          {!revealVisible ? (
            // Phase A: waiting state fades out
            <motion.div
              key="waiting"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12, ease: EASE }}
            className="min-h-[60vh] flex flex-col justify-center text-center"
            >
              <div className="space-y-6" style={{ animation: 'waiting-breathe 6.5s cubic-bezier(0.4, 0.0, 0.2, 1) infinite' }}>
                <p className="text-sm text-muted-foreground/70 leading-relaxed">
                  Väntar på att ni båda trycker klart.
                </p>
                <p className="text-xs text-muted-foreground/40">
                  När ni båda har markerat steget som klart visas era reflektioner.
                </p>
              </div>
            </motion.div>
          ) : (
            // Phase C–E: reflections stagger in
            <motion.div key="revealed">
              <p className="text-xs text-muted-foreground/40 text-center">
                Nu kan ni läsa varandras reflektioner.
              </p>
              <p className="text-xs text-muted-foreground/50 text-center tracking-wide mt-1">
                Så här reflekterade ni
              </p>

              <div className="mt-8 space-y-6">
                {/* Phase C — Partner reflection first */}
                {partnerReflection && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, ease: EASE }}
                  >
                    <ReflectionBlock name={partnerName} text={partnerReflection.text} />
                  </motion.div>
                )}

                <Separator className="opacity-30" />

                {/* Phase E — My reflection (60ms stagger after partner) */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06, duration: 0.18, ease: EASE }}
                >
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground/60 px-1">{myName}</p>
                    <div className="rounded-[20px] border border-border/50 bg-card overflow-hidden p-6">
                      <textarea
                        value={displayText}
                        onChange={(e) => handleChange(e.target.value)}
                        className="w-full min-h-[120px] bg-transparent resize-none focus:outline-none focus:ring-0 text-sm text-foreground placeholder:text-muted-foreground/60"
                      />
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="mt-10">
                <Button
                  onClick={handleLock}
                  size="lg"
                  className="w-full h-14 rounded-2xl gap-2 font-normal"
                >
                  Gå vidare tillsammans
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ─── READY: waiting for partner ───
  if (state === 'ready') {
    return (
      <AnimatePresence>
        {waitingVisible && (
          <motion.div
            key="waiting"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12, ease: EASE }}
            className="min-h-[60vh] flex flex-col justify-center text-center"
          >
            <div className="space-y-6" style={{ animation: 'waiting-breathe 6.5s cubic-bezier(0.4, 0.0, 0.2, 1) infinite' }}>
              <p className="text-sm text-muted-foreground/70 leading-relaxed">
                Väntar på att ni båda trycker klart.
              </p>
              <p className="text-xs text-muted-foreground/40">
                När ni båda har markerat steget som klart visas era reflektioner.
              </p>
              <div className="mt-10">
                <Button
                  variant="ghost"
                  size="lg"
                  className="w-full text-muted-foreground hover:text-foreground font-normal"
                  onClick={() => window.location.assign('/')}
                >
                  Tillbaka till hem
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // ─── DRAFT: writing state ───
  return (
    <div className="mt-8 mb-2 space-y-3">

      <div className="rounded-[20px] border border-border/50 bg-card overflow-hidden p-6">
        <textarea
          value={displayText}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Skriv något ni vill säga."
          className="w-full min-h-[120px] bg-transparent resize-none focus:outline-none focus:ring-0 text-sm text-foreground placeholder:text-muted-foreground/60"
        />
        <div className="flex items-center justify-between pt-3">
          <span className="text-xs text-muted-foreground/50 flex items-center gap-1">
            <Lock className="w-3 h-3" />
            Bara du kan se det här
          </span>
        </div>
      </div>

      <div className="mt-8">
        <Button
          onClick={handleMarkReady}
          disabled={!displayText.trim()}
          size="lg"
          className="w-full h-14 rounded-2xl gap-2 font-normal"
        >
          Markera klar →
        </Button>
        <p className="text-xs text-muted-foreground/50 text-center mt-3">
          Ni går vidare när båda är klara.
        </p>
      </div>
    </div>
  );
}

// ─── Read-only reflection block ───
function ReflectionBlock({
  name,
  text,
  locked = false,
}: {
  name: string;
  text: string;
  locked?: boolean;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground/60 px-1">{name}</p>
      <div className={`rounded-[20px] border ${locked ? 'border-border/30 bg-muted/10' : 'border-border/50 bg-card/80'} overflow-hidden shadow-[0_1px_4px_0_hsl(0_0%_0%/0.04)]`}>
        <p className="p-6 text-sm text-foreground whitespace-pre-wrap">
          {text}
        </p>
      </div>
    </div>
  );
}
