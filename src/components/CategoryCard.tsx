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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.025, y: -2 }}
      whileTap={{ scale: 0.96, y: 2 }}
      onClick={onClick}
      className="w-full text-left cursor-pointer p-6 relative overflow-hidden"
      style={{
        backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.08) 100%)',
        backgroundColor: 'var(--color-surface)',
        borderRadius: '22px',
        border: '1.5px solid rgba(255, 255, 255, 0.30)',
        boxShadow: [
          '0 12px 32px rgba(0, 0, 0, 0.30)',
          '0 4px 12px rgba(0, 0, 0, 0.18)',
          '0 1px 3px rgba(0, 0, 0, 0.08)',
          'inset 0 3px 6px rgba(255, 255, 255, 0.45)',
          'inset 0 -4px 10px rgba(0, 0, 0, 0.14)',
        ].join(', '),
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