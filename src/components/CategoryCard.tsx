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
  const CategoryIcon = category.icon ? getIconByName(category.icon) : null;

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setTitle(e.target.value);
    onUpdate?.(category.id, e.target.value, description);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.stopPropagation();
    setDescription(e.target.value);
    onUpdate?.(category.id, title, e.target.value);
  };

  const handleInputClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      onClick={onClick}
      className="w-full text-left card-reflection group cursor-pointer border rounded-xl item-colors"
      style={{ 
        '--item-bg': category.color || undefined,
        '--item-border': category.borderColor || undefined,
      } as React.CSSProperties}
    >
      <div className="flex flex-col items-center justify-center gap-2">
        {/* Color picker - top right corner */}
        <div className="flex justify-end -mb-4" onClick={(e) => e.stopPropagation()}>
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
        <div className="w-full space-y-2">
          <h3 
            className="text-base sm:text-lg md:text-xl font-medium text-center group-hover:text-primary transition-colors item-text"
            style={{ '--item-text': category.textColor || undefined } as React.CSSProperties}
          >
            {category.title}
          </h3>
          <p 
            className="text-xs sm:text-sm text-center item-text-gentle"
            style={{ '--item-text': category.textColor || undefined } as React.CSSProperties}
          >
            {category.description}
          </p>
          <p className="text-xs text-muted-foreground text-center mt-3">
            {category.cardCount} {category.cardCount === 1 ? 'kort' : 'kort'}
          </p>
          {status && (
            <p className="text-xs text-muted-foreground text-center mt-1 italic">
              {t(`category_status.${status}`)}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
