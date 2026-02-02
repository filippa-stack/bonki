import { useState } from 'react';
import { motion } from 'framer-motion';
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
  editable = true 
}: CategoryCardProps) {
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
      className="w-full text-left card-reflection group cursor-pointer border rounded-xl"
      style={{ 
        backgroundColor: category.color || undefined,
        borderColor: category.borderColor || 'hsl(var(--border))'
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          {editable && onIconChange ? (
            <div className="mt-1" onClick={(e) => e.stopPropagation()}>
              <IconPicker
                currentIcon={category.icon}
                onIconChange={onIconChange}
                iconColor={category.textColor}
              />
            </div>
          ) : CategoryIcon ? (
            <div className="mt-1">
              <CategoryIcon 
                className="w-5 h-5" 
                style={{ color: category.textColor || 'hsl(var(--foreground))' }} 
              />
            </div>
          ) : null}
          <div className="flex-1 space-y-2">
        {editable ? (
            <>
              <textarea
                value={title}
                onChange={(e) => {
                  e.stopPropagation();
                  setTitle(e.target.value);
                  onUpdate?.(category.id, e.target.value, description);
                }}
                onClick={handleInputClick}
                placeholder="Kategorititel..."
                rows={1}
                className="w-full text-base sm:text-lg font-semibold bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none transition-colors resize-none placeholder:text-muted-foreground/50 overflow-hidden text-center"
                style={{ color: category.textColor || 'hsl(var(--foreground))', fieldSizing: 'content' } as React.CSSProperties}
              />
              <textarea
                value={description}
                onChange={handleDescriptionChange}
                onClick={handleInputClick}
                placeholder="Beskrivning..."
                rows={1}
                className="w-full text-sm sm:text-base bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none transition-colors resize-none placeholder:text-muted-foreground/50 overflow-hidden text-center"
                style={{ color: category.textColor || 'hsl(var(--gentle))', fieldSizing: 'content' } as React.CSSProperties}
              />
            </>
          ) : (
            <>
              <h3 
                className="text-subheading mb-2 group-hover:text-primary transition-colors"
                style={{ color: category.textColor || 'hsl(var(--foreground))' }}
              >
                {category.title}
              </h3>
              <p 
                className="text-body text-sm"
                style={{ color: category.textColor || 'hsl(var(--gentle))' }}
              >
                {category.description}
              </p>
            </>
          )}
          <p className="text-xs text-muted-foreground mt-3">
            {category.cardCount} {category.cardCount === 1 ? 'kort' : 'kort'}
          </p>
          </div>
        </div>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
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
      </div>
    </motion.div>
  );
}
