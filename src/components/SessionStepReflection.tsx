import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSessionReflections, type ReflectionState } from '@/hooks/useSessionReflections';

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
      <div className="mt-6 mb-2 space-y-4">
        <ReflectionCard
          label="Din reflektion"
          text={myReflection?.text || ''}
          icon={<Lock className="w-3 h-3" />}
          locked
        />
        {partnerReflection && (
          <ReflectionCard
            label="Din partners reflektion"
            text={partnerReflection.text}
            icon={<Lock className="w-3 h-3" />}
            locked
          />
        )}
        <p className="text-xs text-muted-foreground/40 text-center">
          Det här steget är låst.
        </p>
      </div>
    );
  }

  // ─── REVEALED: both visible, own editable ───
  if (state === 'revealed') {
    return (
      <div className="mt-6 mb-2 space-y-4">
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
          <div className="flex items-center gap-1.5 px-3 pt-3">
            <Eye className="w-3 h-3 text-muted-foreground/60" />
            <span className="text-xs text-muted-foreground/60">Din reflektion</span>
          </div>
          <textarea
            value={displayText}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full min-h-[72px] p-3 bg-transparent resize-none focus:outline-none focus:ring-0 text-sm text-foreground placeholder:text-muted-foreground/60"
          />
        </div>

        {partnerReflection && (
          <ReflectionCard
            label="Din partners reflektion"
            text={partnerReflection.text}
            icon={<Eye className="w-3 h-3" />}
          />
        )}

        <Button
          onClick={handleLock}
          size="lg"
          className="w-full h-14 rounded-2xl gap-2 font-normal"
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

// ─── Read-only reflection card ───
function ReflectionCard({
  label,
  text,
  icon,
  locked = false,
}: {
  label: string;
  text: string;
  icon: React.ReactNode;
  locked?: boolean;
}) {
  return (
    <div className={`rounded-xl border ${locked ? 'border-border/30 bg-muted/10' : 'border-border/50 bg-card/80'} overflow-hidden`}>
      <div className="flex items-center gap-1.5 px-3 pt-3">
        <span className="text-muted-foreground/60">{icon}</span>
        <span className="text-xs text-muted-foreground/60">{label}</span>
      </div>
      <p className="p-3 text-sm text-foreground whitespace-pre-wrap">
        {text}
      </p>
    </div>
  );
}
