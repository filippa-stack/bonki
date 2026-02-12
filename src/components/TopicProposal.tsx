import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ArrowRight, Search } from 'lucide-react';

interface TopicProposalProps {
  cardTitle: string;
  cardSubtitle?: string;
  categoryTitle: string;
  partnerName?: string;
  isOwnProposal?: boolean;
  onAccept: () => void;
  onDecline: () => void;
  onSuggestAnother: () => void;
}

export default function TopicProposal({
  cardTitle,
  cardSubtitle,
  categoryTitle,
  partnerName,
  isOwnProposal,
  onAccept,
  onDecline,
  onSuggestAnother,
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
          {isOwnProposal
            ? t('topic_proposal.your_proposal')
            : t('topic_proposal.title', { name: displayName })}
        </p>

        {/* Card preview */}
        <div className="rounded-xl bg-muted/30 p-4 space-y-1">
          <p className="font-serif text-lg text-foreground">{cardTitle}</p>
          {cardSubtitle && (
            <p className="text-xs text-muted-foreground italic">{cardSubtitle}</p>
          )}
          <p className="text-xs text-muted-foreground/60">{categoryTitle}</p>
        </div>

        {!isOwnProposal && (
          <div className="flex flex-col gap-2">
            <Button onClick={onAccept} size="sm" className="gap-2">
              {t('topic_proposal.accept')}
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={onSuggestAnother} variant="outline" size="sm" className="gap-2 text-muted-foreground">
                <Search className="w-3.5 h-3.5" />
                {t('topic_proposal.suggest_another')}
              </Button>
              <Button onClick={onDecline} variant="ghost" size="sm" className="text-muted-foreground">
                {t('topic_proposal.decline')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
