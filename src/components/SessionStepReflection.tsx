import { useState } from 'react';
import { Lock, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCoupleSpaceContext as useCoupleSpace } from '@/contexts/CoupleSpaceContext';
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

  const { space, userRole } = useCoupleSpace();
  const myName = userRole === 'partner_a' ? (space?.partner_a_name || 'Du') : (space?.partner_b_name || 'Du');
  const partnerName = userRole === 'partner_a' ? (space?.partner_b_name || 'Din partner') : (space?.partner_a_name || 'Din partner');


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
        <p className="text-xs text-muted-foreground/40 text-center">
          Nu kan ni läsa varandras reflektioner.
        </p>
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
          Väntar på att ni båda trycker klart.
        </p>
        <p className="text-xs text-muted-foreground/40">
          När ni båda har markerat steget som klart visas era reflektioner.
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
        Markera klar →
      </Button>
      <p className="text-xs text-muted-foreground/50 text-center">
        Ni går vidare när båda är klara.
      </p>
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
