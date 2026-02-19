import { motion } from 'framer-motion';
import { ConversationThread } from '@/types';
import { getCardById } from '@/data/content';
import { formatDistanceToNow } from 'date-fns';
import { ArrowRight } from 'lucide-react';

interface ConversationCardProps {
  conversation: ConversationThread;
  onClick: () => void;
  variant?: 'default' | 'compact';
  isCompleted?: boolean;
}

export default function ConversationCard({ conversation, onClick, variant = 'default', isCompleted = false }: ConversationCardProps) {
  const card = getCardById(conversation.cardId);
  if (!card) return null;

  const timeAgo = formatDistanceToNow(conversation.lastActivityAt, { addSuffix: true });

  if (variant === 'compact') {
    return (
      <button
        onClick={onClick}
        className="w-full text-left p-5 rounded-card transition-opacity hover:opacity-80"
        style={{ backgroundColor: 'var(--color-surface-primary)', boxShadow: 'var(--shadow-card)' }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-serif text-lg truncate" style={{ color: 'var(--color-text-primary)' }}>
              {card.title}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>{timeAgo}</p>
          </div>
          <ArrowRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-text-secondary)', opacity: 0.4 }} />
        </div>
      </button>
    );
  }

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="w-full text-left px-7 py-7 rounded-card transition-opacity hover:opacity-80"
      style={{ backgroundColor: 'var(--color-surface-primary)', boxShadow: 'var(--shadow-card)' }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-xl leading-snug mb-1" style={{ color: 'var(--color-text-primary)' }}>
            {card.title}
          </h3>
          {card.subtitle && (
            <p className="text-sm mb-3 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{card.subtitle}</p>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)', opacity: 0.6 }}>{timeAgo}</p>
            {isCompleted && (
              <span
                className="text-[10px] px-2 py-0.5 rounded-full"
                style={{ backgroundColor: '#D9D6CF', color: '#6B6B6B' }}
              >
                Genomförd
              </span>
            )}
          </div>
        </div>
        <ArrowRight className="w-4 h-4 flex-shrink-0 mt-1" style={{ color: 'var(--color-text-secondary)', opacity: 0.3 }} />
      </div>
    </motion.button>
  );
}
