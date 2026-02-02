import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import Header from '@/components/Header';
import ColorPicker from '@/components/ColorPicker';
import { ChevronRight } from 'lucide-react';

export default function Category() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { getCategoryById, getCardsByCategory, updateCard, updateCardColor } = useApp();
  
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
            <EditableCard
              key={card.id}
              card={card}
              index={index}
              onNavigate={() => navigate(`/card/${card.id}`)}
              onUpdate={updateCard}
              onColorChange={(color) => updateCardColor(card.id, color)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface EditableCardProps {
  card: {
    id: string;
    title: string;
    subtitle?: string;
    sections: any[];
    color?: string;
  };
  index: number;
  onNavigate: () => void;
  onUpdate: (id: string, title: string, subtitle: string) => void;
  onColorChange: (color: string) => void;
}

function EditableCard({
  card,
  index,
  onNavigate,
  onUpdate,
  onColorChange,
}: EditableCardProps) {
  const [title, setTitle] = useState(card.title);
  const [subtitle, setSubtitle] = useState(card.subtitle || '');

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    onUpdate(card.id, e.target.value, subtitle);
  };

  const handleSubtitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSubtitle(e.target.value);
    onUpdate(card.id, title, e.target.value);
  };

  const handleInputClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="w-full text-left card-reflection group"
      style={{ backgroundColor: card.color || undefined }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            onClick={handleInputClick}
            className="w-full font-serif text-xl text-foreground bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none transition-colors placeholder:text-muted-foreground/50"
            placeholder="Mitt sätt - Ditt sätt"
          />
          <input
            type="text"
            value={subtitle}
            onChange={handleSubtitleChange}
            onClick={handleInputClick}
            placeholder="Underrubrik..."
            className="w-full text-sm text-gentle bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none transition-colors placeholder:text-muted-foreground/50"
          />
          <p className="text-xs text-muted-foreground mt-3">
            {card.sections.length} sektioner
          </p>
        </div>
        <div className="flex items-center gap-1">
          <ColorPicker
            currentColor={card.color}
            onColorChange={onColorChange}
          />
          <button
            onClick={onNavigate}
            className="p-2 rounded-full hover:bg-muted transition-colors"
            aria-label="Öppna kort"
          >
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}