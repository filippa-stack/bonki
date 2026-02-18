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
      className="w-full text-left rounded-[20px] border border-border/30 bg-card/60 p-6 hover:border-primary/20 transition-colors shadow-[0_1px_4px_0_hsl(0_0%_0%/0.04)]"
    >
      <p className="text-[11px] text-muted-foreground/50 mb-3">
        {categoryTitle} · {dateLabel}
      </p>

      <p className="font-serif text-[15px] text-foreground leading-[1.8] whitespace-pre-wrap">
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
