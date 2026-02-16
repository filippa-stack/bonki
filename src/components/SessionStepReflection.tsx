import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCoupleSpace } from '@/hooks/useCoupleSpace';
import { useSessionReflections, type ReflectionState } from '@/hooks/useSessionReflections';

const COUCH_HINT_KEY = 'couch_hint_dismissed_session';

interface SessionStepReflectionProps {
  cardId: string;
  stepIndex: number;
  /** Called when this user marks their reflection as ready */
  onReady?: () => void;
  /** Called when either user locks the step */
  onLocked?: () => void;
}

export default function SessionStepReflection({
  cardId,
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
  } = useSessionReflections(cardId, stepIndex);

  const { space, userRole } = useCoupleSpace();
  const myName = userRole === 'partner_a' ? (space?.partner_a_name || 'Du') : (space?.partner_b_name || 'Du');
  const partnerName = userRole === 'partner_a' ? (space?.partner_b_name || 'Din partner') : (space?.partner_a_name || 'Din partner');

  // Couch hint: show once per session (keyed by cardId)
  const [couchHintVisible, setCouchHintVisible] = useState(() => {
    return sessionStorage.getItem(COUCH_HINT_KEY) !== cardId;
  });
  const dismissCouchHint = () => {
    sessionStorage.setItem(COUCH_HINT_KEY, cardId);
    setCouchHintVisible(false);
  };

  const [localText, setLocalText] = useState('');

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

  // ─── LOCKED: immutable view ───
  if (state === 'locked') {
    return (
      <div className="mt-8 mb-2 space-y-5">
        <p className="text-xs text-muted-foreground/50 text-center tracking-wide">
          Så här reflekterade ni
        </p>

        {partnerReflection && (
          <ReflectionBlock name={partnerName} text={partnerReflection.text} locked />
        )}

        <Separator className="opacity-30" />

        <ReflectionBlock name={myName} text={myReflection?.text || ''} locked />

        <p className="text-xs text-muted-foreground/40 text-center">
          Det här steget är låst.
        </p>
      </div>
    );
  }

  // ─── REVEALED: both visible, own editable ───
  if (state === 'revealed') {
    return (
      <div className="mt-8 mb-2 space-y-5">
        <p className="text-xs text-muted-foreground/50 text-center tracking-wide">
          Så här reflekterade ni
        </p>

        {/* Partner reflection first — read-only */}
        {partnerReflection && (
          <ReflectionBlock name={partnerName} text={partnerReflection.text} />
        )}

        <Separator className="opacity-30" />

        {/* User reflection — editable */}
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground/60 px-1">{myName}</p>
          <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
            <textarea
              value={displayText}
              onChange={(e) => handleChange(e.target.value)}
              className="w-full min-h-[72px] p-3 bg-transparent resize-none focus:outline-none focus:ring-0 text-sm text-foreground placeholder:text-muted-foreground/60"
            />
          </div>
        </div>

        <Button
          onClick={handleLock}
          size="lg"
          className="w-full h-14 rounded-2xl gap-2 font-normal mt-4"
        >
          Gå vidare tillsammans
        </Button>
      </div>
    );
  }

  // ─── READY: waiting for partner ───
  if (state === 'ready') {
    return (
      <div className="mt-12 mb-8 text-center space-y-6">
        <p className="text-sm text-muted-foreground/70 leading-relaxed">
          Samtalet väntar på din partner.
        </p>
        <p className="text-xs text-muted-foreground/40">
          Ni fortsätter när hen har reflekterat.
        </p>
        <button
          onClick={() => window.location.assign('/')}
          className="text-xs text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors mx-auto block"
        >
          Gå tillbaka till hem
        </button>
      </div>
    );
  }

  // ─── DRAFT: writing state ───
  return (
    <div className="mt-6 mb-2 space-y-3">
      {/* Couch hint — once per session, dismissible */}
      <AnimatePresence>
        {couchHintVisible && stepIndex === 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-start gap-2 rounded-xl bg-muted/30 px-4 py-3"
          >
            <p className="text-xs text-muted-foreground/60 leading-relaxed flex-1">
              Sitter ni tillsammans? Turas om att skriva – ni ser varandras reflektioner när båda är klara.
            </p>
            <button
              onClick={dismissCouchHint}
              className="shrink-0 p-0.5 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
              aria-label="Stäng"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
        <textarea
          value={displayText}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Skriv en tanke…"
          className="w-full min-h-[72px] p-3 bg-transparent resize-none focus:outline-none focus:ring-0 text-sm text-foreground placeholder:text-muted-foreground/60"
        />
        <div className="flex items-center justify-between px-3 pb-3">
          <span className="text-xs text-muted-foreground/50 flex items-center gap-1">
            <Lock className="w-3 h-3" />
            Bara du kan se det här
          </span>
        </div>
      </div>

      <Button
        onClick={handleMarkReady}
        disabled={!displayText.trim()}
        size="lg"
        className="w-full h-14 rounded-2xl gap-2 font-normal"
      >
        Klar med detta steg
      </Button>
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
      <div className={`rounded-xl border ${locked ? 'border-border/30 bg-muted/10' : 'border-border/50 bg-card/80'} overflow-hidden`}>
        <p className="p-3 text-sm text-foreground whitespace-pre-wrap">
          {text}
        </p>
      </div>
    </div>
  );
}
