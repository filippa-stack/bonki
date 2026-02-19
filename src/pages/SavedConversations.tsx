import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BEAT_1 } from '@/lib/motion';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/contexts/AppContext';
import Header from '@/components/Header';
import ConversationCard from '@/components/ConversationCard';

export default function SavedConversations() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { savedConversations } = useApp();

  const sortedConversations = [...savedConversations].sort(
    (a, b) => b.lastActivityAt.getTime() - a.lastActivityAt.getTime()
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-base)' }}>
      <Header title={t('saved.title')} showBack backTo="/" />

      <div className="px-6 pt-8 pb-12">
        {sortedConversations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <h2 className="font-serif text-xl mb-3" style={{ color: 'var(--color-text-primary)' }}>
              Sparade samtal
            </h2>
            <p className="text-sm leading-relaxed mb-10" style={{ color: 'var(--color-text-secondary)' }}>
              När ni sparar ett samtal dyker det upp här. Det kan vara något ni vill återvända till.
            </p>
            <button
              onClick={() => navigate('/')}
              className="text-sm transition-opacity hover:opacity-70"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Till hem
            </button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {sortedConversations.map((conversation, index) => (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * BEAT_1 }}
              >
                <ConversationCard
                  conversation={conversation}
                  onClick={() => navigate(`/card/${conversation.cardId}`)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
