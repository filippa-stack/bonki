import { motion } from 'framer-motion';
import { ConversationThread } from '@/types';
import { getCardById } from '@/data/content';
import { formatDistanceToNow } from 'date-fns';
import { ArrowRight, MessageCircle } from 'lucide-react';

interface ConversationCardProps {
  conversation: ConversationThread;
  onClick: () => void;
  variant?: 'default' | 'compact';
}

export default function ConversationCard({ conversation, onClick, variant = 'default' }: ConversationCardProps) {
  const card = getCardById(conversation.cardId);
  if (!card) return null;

  const hasReflections = conversation.reflections.length > 0;
  const timeAgo = formatDistanceToNow(conversation.lastActivityAt, { addSuffix: true });

  if (variant === 'compact') {
    return (
      <button
        onClick={onClick}
        className="w-full text-left p-4 rounded-lg bg-warm hover:bg-card transition-colors group"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-serif text-lg text-foreground truncate">
              {card.title}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{timeAgo}</p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
        </div>
      </button>
    );
  }

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="w-full text-left card-reflection group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-serif text-xl text-foreground mb-1 group-hover:text-primary transition-colors">
            {card.title}
          </h3>
          {card.subtitle && (
            <p className="text-sm text-gentle mb-2">{card.subtitle}</p>
          )}
          <p className="text-xs text-muted-foreground">{timeAgo}</p>
        </div>
        <div className="flex items-center gap-2">
          {hasReflections && (
            <div className="flex items-center gap-1 text-xs text-accent">
              <MessageCircle className="w-3 h-3" />
              <span>{conversation.reflections.length}</span>
            </div>
          )}
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </div>
    </motion.button>
  );
}
