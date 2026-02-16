import { motion } from 'framer-motion';
import { ExternalLink, Star } from 'lucide-react';
import type { SharedNoteRow } from '@/pages/SharedSummary';

interface SharedTimelineItemProps {
  note: SharedNoteRow & {
    cardTitle: string;
    categoryTitle: string;
    categoryId: string;
    promptText: string;
  };
  isOwnNote: boolean;
  partnerResponseContent?: string;
  onOpenInContext: (cardId: string, sectionId: string, promptId: string) => void;
  /** Timeline variant: 'recent' for top section, 'journey' for archive timeline */
  variant?: 'recent' | 'journey';
}

const STEP_LABELS: Record<string, string> = {
  opening: 'Början',
  reflective: 'Fördjupning',
  scenario: 'I vardagen',
  exercise: 'Tillsammans',
};

function getStepLabel(sectionId: string): string | null {
  for (const [key, label] of Object.entries(STEP_LABELS)) {
    if (sectionId.includes(key)) return label;
  }
  return null;
}

export default function SharedTimelineItem({
  note,
  isOwnNote,
  partnerResponseContent,
  onOpenInContext,
  variant = 'recent',
}: SharedTimelineItemProps) {
  const createdDate = note.shared_at || note.created_at;
  const stepLabel = getStepLabel(note.section_id);
  const dateLabel = new Date(createdDate).toLocaleDateString('sv-SE', { day: 'numeric', month: 'long' });

  const isJourney = variant === 'journey';

  return (
    <div className={`relative ${isJourney ? 'pl-8' : ''}`}>
      {/* Timeline dot and connector */}
      {isJourney && (
        <>
          <div className="absolute left-0 top-0 bottom-0 w-px bg-border/20" />
          <div className="absolute left-[-3px] top-6 w-[7px] h-[7px] rounded-full bg-primary/30 border border-primary/20" />
        </>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`py-5 ${!isJourney ? 'border-b border-border/20 last:border-b-0' : ''}`}
      >
        {/* Metadata */}
        <div className="mb-3 space-y-0.5">
          {!isJourney && (
            <p className="text-[11px] text-muted-foreground/50">
              {note.cardTitle}
              {stepLabel && <span className="text-muted-foreground/35"> · {stepLabel}</span>}
            </p>
          )}
          <p className="text-[10px] text-muted-foreground/35">
            {dateLabel}
            {stepLabel && isJourney && <span> · {stepLabel}</span>}
            {!isOwnNote && note.author_label && ` · ${note.author_label}`}
          </p>
        </div>

        {/* Prompt text */}
        {note.promptText && (
          <p className="text-xs text-foreground/50 italic mb-2 leading-relaxed">{note.promptText}</p>
        )}

        {/* Reflection content — read-only */}
        <p className="text-[15px] leading-relaxed text-foreground whitespace-pre-wrap font-serif">{note.content}</p>

        {/* Partner response — read-only */}
        {partnerResponseContent && partnerResponseContent.trim().length > 0 && (
          <div className="mt-3 pl-4 border-l-2 border-border/30">
            <p className="text-sm text-foreground/70 whitespace-pre-wrap leading-relaxed">{partnerResponseContent}</p>
          </div>
        )}

        {/* Controls — view in context only */}
        <div className="flex items-center gap-3 mt-3">
          <button onClick={() => onOpenInContext(note.card_id, note.section_id, note.prompt_id)} className="text-muted-foreground/40 hover:text-muted-foreground transition-colors">
            <ExternalLink className="w-3 h-3" />
          </button>
          {note.is_highlight && <Star className="w-3 h-3 text-primary fill-primary/30" />}
        </div>
      </motion.div>
    </div>
  );
}
