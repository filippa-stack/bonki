import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { Category } from '@/types';

interface CategoryCardProps {
  category: Category;
  onClick: () => void;
  index: number;
  highlighted?: boolean;
  isCompleted?: boolean;
  isFeatured?: boolean;
}

export default function CategoryCard({
  category,
  onClick,
  isCompleted = false,
}: CategoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      className="w-full text-left cursor-pointer rounded-card p-6 transition-opacity hover:opacity-80"
      style={{ backgroundColor: 'var(--color-surface)', border: 'var(--border-card)' }}
    >
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <h3
            className="font-serif text-base font-medium leading-snug"
            style={{ color: isCompleted ? 'var(--color-text-secondary)' : 'var(--color-text-primary)' }}
          >
            {category.title}
          </h3>
          {isCompleted && (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-text-secondary)', opacity: 0.4 }} />
          )}
        </div>
        {category.entryLine && (
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {category.entryLine}
          </p>
        )}
      </div>
    </motion.div>
  );
}
