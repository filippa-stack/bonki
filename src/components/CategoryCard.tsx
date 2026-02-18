import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { Category } from '@/types';
import { getIconByName } from '@/components/IconPicker';

interface CategoryCardProps {
  category: Category;
  onClick: () => void;
  index: number;
  highlighted?: boolean;
  isCompleted?: boolean;
}

export default function CategoryCard({ 
  category, 
  onClick, 
  index, 
  highlighted = false,
  isCompleted = false,
}: CategoryCardProps) {
  const CategoryIcon = category.icon ? getIconByName(category.icon) : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      className={[
        'w-full text-left card-reflection group cursor-pointer rounded-[20px] p-6 transition-all shadow-[0_1px_4px_0_hsl(0_0%_0%/0.04)]',
        isCompleted ? 'bg-slate-50/60 border-slate-200/50' : 'item-colors',
        highlighted
          ? 'border-2 border-primary'
          : 'border border-slate-200/60',
        !highlighted && !isCompleted ? 'opacity-70 hover:opacity-100' : '',
      ].filter(Boolean).join(' ')}
      style={isCompleted ? {
        borderWidth: highlighted ? '2px' : '1px',
        borderStyle: 'solid',
      } : { 
        '--item-bg': category.color || undefined,
        '--item-border': highlighted ? undefined : (category.borderColor || undefined),
        borderStyle: 'solid',
      } as React.CSSProperties}
    >
      <div className="relative flex flex-col items-center justify-center gap-2">
        {/* Completed checkmark */}
        {isCompleted && (
          <div className="flex justify-center mb-1">
            <CheckCircle2 className="w-4 h-4 text-muted-foreground/30" />
          </div>
        )}

        {/* Icon - centered above text */}
        {!isCompleted && CategoryIcon && (
          <div className="flex justify-center">
            <CategoryIcon 
              className="w-6 h-6 item-text" 
              style={{ '--item-text': category.textColor || undefined } as React.CSSProperties} 
            />
          </div>
        )}
        
        {/* Text content - full width below */}
        <div className="w-full space-y-2.5">
          <h3 
            className={`text-base sm:text-lg font-serif font-medium text-center group-hover:text-primary transition-colors leading-snug ${isCompleted ? 'text-slate-400' : highlighted ? 'text-slate-800' : 'text-slate-500 item-text'}`}
            style={isCompleted || highlighted ? undefined : { '--item-text': category.textColor || undefined } as React.CSSProperties}
          >
            {category.title}
          </h3>
          {/* Emotional entry line — primary reading text */}
          {category.entryLine && (
            <p
              className={`text-sm text-center not-italic leading-relaxed ${isCompleted ? 'text-slate-300' : 'text-foreground/70'}`}
            >
              {category.entryLine}
            </p>
          )}
          {/* Description — demoted to metadata style */}
          <p 
            className={`text-[10px] text-center uppercase tracking-widest font-semibold mt-1 ${isCompleted ? 'text-slate-300' : 'text-muted-foreground/50'}`}
          >
            {category.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
