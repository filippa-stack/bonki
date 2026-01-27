import { motion } from 'framer-motion';
import { Category } from '@/types';
import { ChevronRight } from 'lucide-react';

interface CategoryCardProps {
  category: Category;
  onClick: () => void;
  index: number;
}

export default function CategoryCard({ category, onClick, index }: CategoryCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      onClick={onClick}
      className="w-full text-left card-reflection group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-subheading text-foreground mb-2 group-hover:text-primary transition-colors">
            {category.title}
          </h3>
          <p className="text-body text-gentle text-sm">
            {category.description}
          </p>
          <p className="text-xs text-muted-foreground mt-3">
            {category.cardCount} {category.cardCount === 1 ? 'card' : 'cards'}
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors mt-1" />
      </div>
    </motion.button>
  );
}
