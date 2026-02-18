import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Proposal } from '@/hooks/useProposals';

interface IncomingProposalProps {
  proposal: Proposal;
  cardTitle: string;
  categoryTitle: string;
  proposerName?: string;
  onAccept: () => void | Promise<void>;
  onSaveForLater: () => void | Promise<void>;
}

export default function IncomingProposal({
  proposal,
  cardTitle,
  categoryTitle,
  proposerName,
  onAccept,
  onSaveForLater,
}: IncomingProposalProps) {
  const displayName = proposerName || 'Din partner';
  const [acting, setActing] = useState(false);

  const handleAccept = async () => {
    if (acting) return;
    setActing(true);
    try { await onAccept(); } catch { setActing(false); }
  };

  const handleSave = async () => {
    if (acting) return;
    setActing(true);
    try { await onSaveForLater(); } catch { setActing(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.4, 0.0, 0.2, 1] }}
      className="rounded-2xl border border-border bg-card p-6 space-y-4"
    >
      <p className="text-xs text-muted-foreground/60 tracking-wide">
        Föreslaget av {displayName}
      </p>

      {/* Card preview */}
      <div className="rounded-xl bg-muted/30 p-4 space-y-1">
        <p className="font-serif text-base text-foreground">{cardTitle}</p>
        <p className="text-xs text-muted-foreground/60">{categoryTitle}</p>
      </div>

      {/* Optional message */}
      {proposal.message && (
        <div className="rounded-xl bg-muted/20 px-4 py-3">
          <p className="text-sm text-foreground/80 italic leading-relaxed">
            "{proposal.message}"
          </p>
        </div>
      )}

      {/* Actions — premium labels, no decline */}
      <div className="flex flex-col gap-2 pt-1">
        <Button
          onClick={handleAccept}
          disabled={acting}
          size="sm"
          className="gap-2"
        >
          Starta samtalet
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
        <Button
          onClick={handleSave}
          disabled={acting}
          variant="ghost"
          size="sm"
          className="text-muted-foreground gap-2"
        >
          <Clock className="w-3.5 h-3.5" />
          Spara till senare
        </Button>
      </div>
    </motion.div>
  );
}
