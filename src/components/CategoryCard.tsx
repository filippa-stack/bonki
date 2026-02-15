import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Category } from '@/types';
import ColorPicker from '@/components/ColorPicker';
import IconPicker, { getIconByName } from '@/components/IconPicker';

interface CategoryCardProps {
  category: Category;
  onClick: () => void;
  index: number;
  onUpdate?: (id: string, title: string, description: string) => void;
  onColorChange?: (color: string) => void;
  onTextColorChange?: (textColor: string) => void;
  onBorderColorChange?: (borderColor: string) => void;
  onIconChange?: (icon: string) => void;
  editable?: boolean;
  status?: 'not_started' | 'in_progress' | 'explored';
}

export default function CategoryCard({ 
  category, 
  onClick, 
  index, 
  onUpdate,
  onColorChange,
  onTextColorChange,
  onBorderColorChange,
  onIconChange,
  editable = true,
  status,
}: CategoryCardProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(category.title);
  const [description, setDescription] = useState(category.description);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const CategoryIcon = category.icon ? getIconByName(category.icon) : null;

  const handleTitleClick = (e: React.MouseEvent) => {
    if (!editable) return;
    e.stopPropagation();
    setIsEditingTitle(true);
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (title !== category.title) {
      onUpdate?.(category.id, title, description);
    }
  };

  const handleDescClick = (e: React.MouseEvent) => {
    if (!editable) return;
    e.stopPropagation();
    setIsEditingDesc(true);
  };

  const handleDescBlur = () => {
    setIsEditingDesc(false);
    if (description !== category.description) {
      onUpdate?.(category.id, title, description);
    }
  };

  const isCompleted = status === 'explored';
  const isBegun = status === 'in_progress';

  const tonalClasses = isCompleted
    ? 'opacity-75 hover:opacity-85 ring-1 ring-border/20'
    : isBegun
      ? 'opacity-95 hover:opacity-100 ring-1 ring-border/40'
      : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      onClick={onClick}
      className={`w-full text-left card-reflection group cursor-pointer border rounded-2xl item-colors py-5 px-5 transition-all ${tonalClasses}`}
      style={{ 
        '--item-bg': category.color || undefined,
        '--item-border': category.borderColor || undefined,
      } as React.CSSProperties}
    >
      <div className="relative flex flex-col items-center justify-center gap-2">
        {/* Color picker - absolute top right */}
        <div className="absolute top-0 right-0" onClick={(e) => e.stopPropagation()}>
          {editable && onColorChange && (
            <ColorPicker
              currentColor={category.color}
              onColorChange={onColorChange}
              currentTextColor={category.textColor}
              onTextColorChange={onTextColorChange}
              currentBorderColor={category.borderColor}
              onBorderColorChange={onBorderColorChange}
              showTextColor
              showBorderColor
            />
          )}
        </div>
        
        {/* Icon - centered above text */}
        <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
          {editable && onIconChange ? (
            <IconPicker
              currentIcon={category.icon}
              onIconChange={onIconChange}
              iconColor={category.textColor}
            />
          ) : CategoryIcon ? (
             <CategoryIcon 
              className="w-6 h-6 item-text" 
              style={{ '--item-text': category.textColor || undefined } as React.CSSProperties} 
            />
          ) : null}
        </div>
        
        {/* Text content - full width below */}
        <div className="w-full space-y-2.5">
          {isEditingTitle ? (
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => { if (e.key === 'Enter') handleTitleBlur(); }}
              autoFocus
              className="w-full text-base sm:text-lg font-serif font-medium text-center bg-transparent border-none outline-none item-text leading-snug"
              style={{ '--item-text': category.textColor || undefined } as React.CSSProperties}
            />
          ) : (
            <h3 
              className="text-base sm:text-lg font-serif font-medium text-center group-hover:text-primary transition-colors item-text cursor-text leading-snug"
              style={{ '--item-text': category.textColor || undefined } as React.CSSProperties}
              onClick={handleTitleClick}
            >
              {category.title}
            </h3>
          )}
          {/* Emotional entry line — primary reading text */}
          {category.entryLine && (
            <p
              className="text-sm text-center not-italic text-foreground/70 leading-relaxed"
            >
              {category.entryLine}
            </p>
          )}
          {/* Description — demoted to metadata style */}
          {isEditingDesc ? (
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleDescBlur}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => { if (e.key === 'Enter') handleDescBlur(); }}
              autoFocus
              className="w-full text-[10px] text-center bg-transparent border-none outline-none uppercase tracking-widest text-muted-foreground/50 font-semibold mt-1"
            />
          ) : (
            <p 
              className="text-[10px] text-center uppercase tracking-widest text-muted-foreground/50 font-semibold cursor-text mt-1"
              onClick={handleDescClick}
            >
              {category.description}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
