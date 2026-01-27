import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getCategoryById, getCardsByCategory } from '@/data/content';
import Header from '@/components/Header';
import { ChevronRight } from 'lucide-react';

export default function Category() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();

  const category = categoryId ? getCategoryById(categoryId) : undefined;
  const cards = categoryId ? getCardsByCategory(categoryId) : [];

  if (!category) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-gentle">Category not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header showBack backTo="/" />

      {/* Category header */}
      <div className="px-6 pt-8 pb-6">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-display text-foreground mb-2"
        >
          {category.title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-body text-gentle"
        >
          {category.description}
        </motion.p>
      </div>

      {/* Cards */}
      <div className="px-6 pb-12">
        <div className="space-y-3">
          {cards.map((card, index) => (
            <motion.button
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => navigate(`/card/${card.id}`)}
              className="w-full text-left card-reflection group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-serif text-xl text-foreground mb-1 group-hover:text-primary transition-colors">
                    {card.title}
                  </h3>
                  {card.subtitle && (
                    <p className="text-sm text-gentle">{card.subtitle}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-3">
                    {card.sections.length} sections
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors mt-1" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
