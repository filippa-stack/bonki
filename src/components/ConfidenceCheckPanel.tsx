import { useState } from 'react';
import { useDevState } from '@/contexts/DevStateContext';
import { useAppMode } from '@/hooks/useAppMode';
import { useNormalizedSessionContext } from '@/contexts/NormalizedSessionContext';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Dev-only collapsible panel showing key state for manual testing.
 * Only renders when devState is truthy.
 */
export default function ConfidenceCheckPanel() {
  const devState = useDevState();
  const [open, setOpen] = useState(false);

  if (!devState) return null;

  return (
    <div className="relative inline-block rounded-full border border-muted/60 bg-muted/20 text-xs font-mono">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
      >
        <span className="tracking-wide text-[10px]">dev</span>
        <ChevronDown className={`w-2.5 h-2.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-6 mt-1 z-50 rounded-xl border border-muted/60 bg-card shadow-lg text-xs font-mono min-w-[220px]">
          <PanelContent />
        </div>
      )}
    </div>
  );
}

function PanelContent() {
  const appMode = useAppMode();
  const ns = useNormalizedSessionContext();

  return (
    <div className="px-4 pb-3 space-y-2 text-[11px] leading-relaxed">
      <Row label="macroMode" value={appMode.mode} />
      <Row label="appMode" value={ns.appMode ?? 'null'} />
      <Row label="sessionId" value={ns.sessionId ?? '–'} />
      <Row label="cardId" value={ns.cardId ?? '–'} />
      <Row label="step" value={String(ns.currentStepIndex)} />
      <Row label="waiting" value={String(ns.waiting)} />
      <Row label="loading" value={String(ns.loading)} />
      <div className="flex gap-2 pt-1">
        <Button variant="outline" size="sm" className="h-6 text-[10px] px-2" onClick={() => ns.refetch()}>
          Refetch session
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted-foreground/60">{label}</span>
      <span className="text-foreground truncate text-right">{value}</span>
    </div>
  );
}

