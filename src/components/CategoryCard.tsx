import { useState } from 'react';
import { motion } from 'framer-motion';
import { Category } from '@/types';
import { ChevronRight } from 'lucide-react';
import ColorPicker from '@/components/ColorPicker';

interface CategoryCardProps {
  category: Category;
  onClick: () => void;
  index: number;
  onUpdate?: (id: string, title: string, description: string) => void;
  onColorChange?: (color: string) => void;
  editable?: boolean;
}

export default function CategoryCard({ 
  category, 
  onClick, 
  index, 
  onUpdate,
  onColorChange,
  editable = true 
}: CategoryCardProps) {
  const [title, setTitle] = useState(category.title);
  const [description, setDescription] = useState(category.description);

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
      className="w-full text-left card-reflection group"
      style={{ backgroundColor: category.color || undefined }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          {editable ? (
            <>
              <input
                type="text"
                value={title}
                onChange={handleTitleChange}
                onClick={handleInputClick}
                placeholder="Kategorititel..."
                className="w-full text-subheading text-foreground bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none transition-colors placeholder:text-muted-foreground/50"
              />
              <textarea
                value={description}
                onChange={handleDescriptionChange}
                onClick={handleInputClick}
                placeholder="Beskrivning..."
                rows={2}
                className="w-full text-body text-gentle text-sm bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none transition-colors resize-none placeholder:text-muted-foreground/50"
              />
            </>
          ) : (
            <>
              <h3 className="text-subheading text-foreground mb-2 group-hover:text-primary transition-colors">
                {category.title}
              </h3>
              <p className="text-body text-gentle text-sm">
                {category.description}
              </p>
            </>
          )}
          <p className="text-xs text-muted-foreground mt-3">
            {category.cardCount} {category.cardCount === 1 ? 'kort' : 'kort'}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {editable && onColorChange && (
            <ColorPicker
              currentColor={category.color}
              onColorChange={onColorChange}
            />
          )}
          <button 
            onClick={onClick}
            className="p-2 rounded-full hover:bg-muted transition-colors"
            aria-label="Öppna kategori"
          >
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
