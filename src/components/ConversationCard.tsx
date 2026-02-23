import { motion } from 'framer-motion';
import { ConversationThread } from '@/types';
import { getCardById } from '@/data/content';
import { formatDistanceToNow } from 'date-fns';
import { sv } from 'date-fns/locale';
import { ArrowRight, Check } from 'lucide-react';

interface ConversationCardProps {
  conversation: ConversationThread;
  onClick: () => void;
  variant?: 'default' | 'compact';
  isCompleted?: boolean;
  isActive?: boolean;
}

export default function ConversationCard({ conversation, onClick, variant = 'default', isCompleted = false, isActive = false }: ConversationCardProps) {
  const card = getCardById(conversation.cardId);
  if (!card) return null;

  const timeAgo = formatDistanceToNow(conversation.lastActivityAt, { addSuffix: true, locale: sv });

  if (variant === 'compact') {
    return (
      <button
        onClick={onClick}
        className="w-full text-left p-6 rounded-card transition-opacity hover:opacity-80"
        style={{ backgroundColor: 'hsl(36, 16%, 98%)', border: '1px solid hsl(var(--foreground) / 0.09)' }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {isActive && (
                <span
                  style={{
                    display: 'inline-block',
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: '#C4821D',
                    flexShrink: 0,
                    animation: 'saffron-pulse 2.5s ease-in-out infinite',
                  }}
                />
              )}
              <p className="font-serif text-lg truncate" style={{ color: 'var(--color-text-primary)' }}>
                {card.title}
              </p>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)', opacity: 0.6 }}>{timeAgo}</p>
          </div>
          <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--color-text-secondary)', opacity: 0.6 }} />
        </div>
      </button>
    );
  }

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="w-full text-left px-6 py-6 rounded-card transition-opacity hover:opacity-80 group relative"
      style={{ backgroundColor: 'hsl(36, 16%, 98%)', border: '1px solid hsl(var(--foreground) / 0.09)' }}
    >
      {isCompleted && (
        <div style={{ position: 'absolute', top: '14px', right: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
          <Check size={14} style={{ color: 'hsl(158, 32%, 14%)' }} strokeWidth={2.5} />
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: 'var(--color-text-tertiary)', opacity: 0.5 }}>
            Gör om
          </span>
        </div>
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            {isActive && (
              <span
                style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#C4821D',
                  marginTop: '7px',
                  flexShrink: 0,
                  animation: 'saffron-pulse 2.5s ease-in-out infinite',
                }}
              />
            )}
            <h3 className="font-serif text-xl leading-snug mb-1" style={{ color: 'var(--color-text-primary)' }}>
              {card.title}
            </h3>
          </div>
          {card.subtitle && (
            <p className="text-sm mb-2 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{card.subtitle}</p>
          )}
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)', opacity: 0.6 }}>{timeAgo}</p>
        </div>
        <ArrowRight className="w-3.5 h-3.5 flex-shrink-0 mt-1 opacity-60 group-hover:opacity-90 transition-opacity" style={{ color: 'var(--color-text-secondary)' }} />
      </div>
    </motion.button>
  );
}
