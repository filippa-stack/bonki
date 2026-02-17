import { useState } from 'react';
import { useDevState } from '@/contexts/DevStateContext';
import { useAppMode } from '@/hooks/useAppMode';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import { useProposalsContext } from '@/contexts/ProposalsContext';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Dev-only collapsible panel showing key state for manual two-device testing.
 * Only renders when devState is truthy.
 */
export default function ConfidenceCheckPanel() {
  const devState = useDevState();
  const [open, setOpen] = useState(false);

  if (!devState) return null;

  return (
    <div className="mx-6 mt-2 rounded-xl border border-primary/20 bg-muted/30 text-xs font-mono">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <span className="font-semibold tracking-wide">Confidence Check</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <PanelContent />}
    </div>
  );
}

function PanelContent() {
  const appMode = useAppMode();
  const { userRole, memberCount, displayMemberCount } = useCoupleSpaceContext();
  const { proposals, refetch: refetchProposals } = useProposalsContext();

  const counts = {
    pending: proposals.filter(p => p.status === 'pending').length,
    saved_for_later: proposals.filter(p => p.status === 'saved_for_later').length,
    accepted: proposals.filter(p => p.status === 'accepted').length,
    declined: proposals.filter(p => p.status === 'declined').length,
  };

  const ns = appMode.normalizedSession;

  return (
    <div className="px-4 pb-3 space-y-2 text-[11px] leading-relaxed">
      <Row label="role" value={userRole ?? '–'} />
      <Row label="members" value={`${memberCount} / display ${displayMemberCount}`} />
      <div className="border-t border-primary/10 pt-1.5 mt-1.5" />
      <Row label="macroMode" value={appMode.mode} />
      <Row label="appMode" value={ns.appMode ?? 'null'} />
      <Row label="sessionId" value={ns.sessionId ?? '–'} />
      <Row label="cardId" value={ns.cardId ?? '–'} />
      <Row label="step" value={String(ns.currentStepIndex)} />
      <Row label="waiting" value={String(ns.waiting)} />
      <Row label="loading" value={String(ns.loading)} />
      <div className="border-t border-primary/10 pt-1.5 mt-1.5" />
      <Row label="proposals" value={`P:${counts.pending} S:${counts.saved_for_later} A:${counts.accepted} D:${counts.declined}`} />
      <div className="flex gap-2 pt-1">
        <Button variant="outline" size="sm" className="h-6 text-[10px] px-2" onClick={() => ns.refetch()}>
          Refetch session
        </Button>
        <Button variant="outline" size="sm" className="h-6 text-[10px] px-2" onClick={() => refetchProposals()}>
          Refetch proposals
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
