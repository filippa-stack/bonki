import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ArrowRight, X } from 'lucide-react';

interface TopicProposalProps {
  cardTitle: string;
  cardSubtitle?: string;
  categoryTitle: string;
  partnerName?: string;
  onAccept: () => void;
  onDecline: () => void;
}

export default function TopicProposal({
  cardTitle,
  cardSubtitle,
  categoryTitle,
  partnerName,
  onAccept,
  onDecline,
}: TopicProposalProps) {
  const { t } = useTranslation();
  const displayName = partnerName || t('topic_proposal.partner_fallback');

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="px-6 mb-6"
    >
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <p className="text-sm text-foreground leading-relaxed">
          {t('topic_proposal.title', { name: displayName })}
        </p>

        {/* Card preview */}
        <div className="rounded-xl bg-muted/30 p-4 space-y-1">
          <p className="font-serif text-lg text-foreground">{cardTitle}</p>
          {cardSubtitle && (
            <p className="text-xs text-muted-foreground italic">{cardSubtitle}</p>
          )}
          <p className="text-xs text-muted-foreground/60">{categoryTitle}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={onAccept} size="sm" className="gap-2">
            {t('topic_proposal.accept')}
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
          <Button onClick={onDecline} variant="ghost" size="sm" className="gap-2 text-muted-foreground">
            <X className="w-3.5 h-3.5" />
            {t('topic_proposal.decline')}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
