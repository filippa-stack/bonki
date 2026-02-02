import { useState } from 'react';
import { Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CARD_COLORS = [
  { name: 'Default', value: '' },
  { name: 'Rose', value: 'hsl(350, 60%, 90%)' },
  { name: 'Peach', value: 'hsl(25, 70%, 90%)' },
  { name: 'Sand', value: 'hsl(40, 50%, 90%)' },
  { name: 'Sage', value: 'hsl(140, 30%, 88%)' },
  { name: 'Sky', value: 'hsl(200, 50%, 90%)' },
  { name: 'Lavender', value: 'hsl(260, 40%, 92%)' },
  { name: 'Blush', value: 'hsl(330, 40%, 92%)' },
];

interface ColorPickerProps {
  currentColor?: string;
  onColorChange: (color: string) => void;
}

export default function ColorPicker({ currentColor, onColorChange }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleColorSelect = (color: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onColorChange(color);
    setIsOpen(false);
  };

  const toggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleOpen}
        className="p-2 rounded-full hover:bg-muted transition-colors"
        title="Välj färg"
      >
        <Palette 
          className="w-4 h-4" 
          style={{ color: currentColor || 'currentColor' }}
        />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 z-50 bg-card border border-border rounded-lg shadow-lg p-3"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-xs text-muted-foreground mb-2">Välj färg</p>
            <div className="grid grid-cols-4 gap-2">
              {CARD_COLORS.map((color) => (
                <button
                  key={color.name}
                  onClick={(e) => handleColorSelect(color.value, e)}
                  className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 ${
                    currentColor === color.value 
                      ? 'border-primary ring-2 ring-primary/30' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  style={{ 
                    backgroundColor: color.value || 'hsl(var(--card))' 
                  }}
                  title={color.name}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
