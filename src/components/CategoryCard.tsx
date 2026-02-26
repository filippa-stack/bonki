import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Category } from '@/types';
import bonkiLogo from '@/assets/bonki-logo.png';

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
  const [params] = useSearchParams();
  const watermark = params.get('watermark');
  const isTileMode = watermark === 'tile';
  const isBehindMode = watermark === 'behind';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      className="w-full text-left cursor-pointer rounded-card p-6 transition-opacity hover:opacity-80 relative overflow-hidden"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: 'var(--border-card)',
        ...(isBehindMode ? { opacity: 0.85, backdropFilter: 'blur(2px)' } : {}),
      }}
    >
      {/* Tile watermark mode — small logo whisper per card */}
      {isTileMode && (
        <img
          src={bonkiLogo}
          alt=""
          aria-hidden="true"
          className="absolute right-4 bottom-3 w-10 h-10 object-contain opacity-[0.06] select-none pointer-events-none"
          draggable={false}
        />
      )}

      <div className="flex flex-col gap-2 relative z-[1]">
        <div className="flex items-center justify-between">
          <h3
            className="text-heading"
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
            className="type-body leading-relaxed"
            style={{ color: 'var(--color-text-secondary)', opacity: 0.8 }}
          >
            {category.entryLine}
          </p>
        )}
      </div>
    </motion.div>
  );
}