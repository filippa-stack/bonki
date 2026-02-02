import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import CategoryCard from '@/components/CategoryCard';
import ConversationCard from '@/components/ConversationCard';
import Header from '@/components/Header';
import { Bookmark } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { mostRecentConversation, savedConversations, categories, updateCategory, updateCategoryColor, updateCategoryTextColor, updateCategoryBorderColor, updateCategoryIcon, backgroundColor } = useApp();

  return (
    <div className="min-h-screen" style={{ backgroundColor: backgroundColor || 'hsl(var(--background))' }}>
      <Header showBackgroundPicker={true} />
      {/* Header */}
      <div className="px-6 pt-12 pb-8">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-display text-foreground"
        >
          Vi som föräldrar
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-body text-gentle mt-2"
        >
          A space for reflection
        </motion.p>
      </div>

      {/* Continue conversation */}
      {mostRecentConversation && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="px-6 mb-8"
        >
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
            Continue where you left off
          </p>
          <ConversationCard
            conversation={mostRecentConversation}
            onClick={() => navigate(`/card/${mostRecentConversation.cardId}`)}
            variant="compact"
          />
        </motion.div>
      )}

      {/* Categories */}
      <div className="px-6 pb-6">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">
          Choose a category
        </p>
        <div className="space-y-3">
          {categories.map((category, index) => (
            <CategoryCard
              key={category.id}
              category={category}
              onClick={() => navigate(`/category/${category.id}`)}
              index={index}
              onUpdate={updateCategory}
              onColorChange={(color) => updateCategoryColor(category.id, color)}
              onTextColorChange={(textColor) => updateCategoryTextColor(category.id, textColor)}
              onBorderColorChange={(borderColor) => updateCategoryBorderColor(category.id, borderColor)}
              onIconChange={(icon) => updateCategoryIcon(category.id, icon)}
              editable={true}
            />
          ))}
        </div>
      </div>

      {/* Saved conversations link */}
      {savedConversations.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="px-6 py-8 border-t border-divider"
        >
          <button
            onClick={() => navigate('/saved')}
            className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Bookmark className="w-4 h-4" />
            <span className="text-sm">
              Saved conversations ({savedConversations.length})
            </span>
          </button>
        </motion.div>
      )}
    </div>
  );
}
