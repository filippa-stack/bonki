import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import Header from '@/components/Header';
import ConversationCard from '@/components/ConversationCard';

export default function SavedConversations() {
  const navigate = useNavigate();
  const { savedConversations, backgroundColor } = useApp();

  const sortedConversations = [...savedConversations].sort(
    (a, b) => b.lastActivityAt.getTime() - a.lastActivityAt.getTime()
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: backgroundColor || 'hsl(var(--background))' }}>
      <Header title="Saved Conversations" showBack backTo="/" />

      <div className="px-6 py-8">
        {sortedConversations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-gentle mb-2">No saved conversations yet</p>
            <p className="text-sm text-muted-foreground">
              When you save a conversation for later, it will appear here.
            </p>
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
