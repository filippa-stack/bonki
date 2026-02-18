import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/contexts/AppContext';
import Header from '@/components/Header';
import ConversationCard from '@/components/ConversationCard';
import { Button } from '@/components/ui/button';

export default function SavedConversations() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { savedConversations, backgroundColor } = useApp();

  const sortedConversations = [...savedConversations].sort(
    (a, b) => b.lastActivityAt.getTime() - a.lastActivityAt.getTime()
  );

  return (
    <div className="min-h-screen page-bg">
      <Header title={t('saved.title')} showBack backTo="/" />

      <div className="px-6 pt-8 pb-10">
        {sortedConversations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <h2 className="font-serif text-xl text-foreground mb-3">Sparade samtal</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-8">
              När ni sparar ett samtal dyker det upp här. Det kan vara något ni vill återvända till.
            </p>
            <Button variant="ghost" onClick={() => navigate('/')} className="text-sm">
              Till hem
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {sortedConversations.map((conversation, index) => (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
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
