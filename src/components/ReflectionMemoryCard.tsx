import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

interface ReflectionMemoryCardProps {
  content: string;
  cardTitle: string;
  categoryTitle: string;
  authorLabel: string | null;
  date: string;
  responseCount: number;
  onClick: () => void;
}

export default function ReflectionMemoryCard({
  content,
  cardTitle,
  categoryTitle,
  authorLabel,
  date,
  responseCount,
  onClick,
}: ReflectionMemoryCardProps) {
  const dateLabel = new Date(date).toLocaleDateString('sv-SE', {
    day: 'numeric',
    month: 'short',
  });

  const truncated = content.length > 140 ? content.slice(0, 140) + '…' : content;

  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClick}
      className="w-full text-left rounded-card border border-border/20 p-6 hover:border-primary/20 transition-colors"
    >
      <p className="text-[11px] text-muted-foreground/50 mb-3">
        {categoryTitle} · {dateLabel}
      </p>

      <p className="font-serif text-[15px] text-foreground leading-[1.8] whitespace-pre-wrap">
        {authorLabel && /^[AB]$/.test(authorLabel) && (
          <span className="font-mono text-[11px] text-muted-foreground/40 mr-1.5 select-none">{authorLabel}:</span>
        )}
        "{truncated}"
      </p>

      <div className="flex items-center justify-between mt-4">
        <p className="text-[11px] text-muted-foreground/60">
          {authorLabel || cardTitle}
        </p>
        {responseCount > 0 && (
          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/50">
            <MessageCircle className="w-3 h-3" />
            {responseCount}
          </span>
        )}
      </div>
    </motion.button>
  );
}
