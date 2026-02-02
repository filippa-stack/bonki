import { useState } from 'react';
import { Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CARD_COLORS = [
  // Row 1 - Neutrals & Default
  { name: 'Default', value: '' },
  { name: 'Warm White', value: 'hsl(40, 20%, 96%)' },
  { name: 'Cool Gray', value: 'hsl(220, 15%, 93%)' },
  { name: 'Warm Gray', value: 'hsl(30, 15%, 91%)' },
  
  // Row 2 - Pinks & Roses
  { name: 'Blush', value: 'hsl(350, 60%, 94%)' },
  { name: 'Rose', value: 'hsl(350, 55%, 90%)' },
  { name: 'Dusty Rose', value: 'hsl(350, 40%, 86%)' },
  { name: 'Mauve', value: 'hsl(330, 35%, 88%)' },
  
  // Row 3 - Peaches & Corals
  { name: 'Peach', value: 'hsl(25, 70%, 92%)' },
  { name: 'Apricot', value: 'hsl(25, 60%, 88%)' },
  { name: 'Coral', value: 'hsl(15, 55%, 86%)' },
  { name: 'Terracotta', value: 'hsl(15, 45%, 82%)' },
  
  // Row 4 - Yellows & Sands
  { name: 'Cream', value: 'hsl(45, 50%, 93%)' },
  { name: 'Sand', value: 'hsl(40, 45%, 89%)' },
  { name: 'Honey', value: 'hsl(45, 55%, 85%)' },
  { name: 'Wheat', value: 'hsl(38, 40%, 82%)' },
  
  // Row 5 - Greens & Sages
  { name: 'Mint', value: 'hsl(150, 35%, 92%)' },
  { name: 'Sage', value: 'hsl(140, 30%, 88%)' },
  { name: 'Eucalyptus', value: 'hsl(155, 28%, 84%)' },
  { name: 'Olive', value: 'hsl(80, 25%, 82%)' },
  
  // Row 6 - Blues & Skies
  { name: 'Ice', value: 'hsl(200, 40%, 94%)' },
  { name: 'Sky', value: 'hsl(200, 50%, 90%)' },
  { name: 'Powder', value: 'hsl(210, 45%, 86%)' },
  { name: 'Steel', value: 'hsl(215, 35%, 82%)' },
  
  // Row 7 - Purples & Lavenders
  { name: 'Lilac', value: 'hsl(270, 40%, 94%)' },
  { name: 'Lavender', value: 'hsl(260, 40%, 90%)' },
  { name: 'Wisteria', value: 'hsl(265, 35%, 86%)' },
  { name: 'Plum', value: 'hsl(280, 30%, 84%)' },
];

interface ColorPickerProps {
  currentColor?: string;
  onColorChange: (color: string) => void;
}

export default function ColorPicker({ currentColor, onColorChange }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customColor, setCustomColor] = useState(currentColor || '');

  const handleColorSelect = (color: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onColorChange(color);
    setCustomColor(color);
    setIsOpen(false);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomColor(value);
  };

  const handleCustomColorApply = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (customColor.trim()) {
      onColorChange(customColor.trim());
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCustomColorApply(e);
    }
    e.stopPropagation();
  };

  const toggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
    if (!isOpen) {
      setCustomColor(currentColor || '');
    }
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
            className="absolute right-0 top-full mt-2 z-50 bg-card border border-border rounded-lg shadow-lg p-3 max-h-80 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-xs text-muted-foreground mb-2">Välj färg</p>
            <div className="grid grid-cols-4 gap-1.5 mb-3">
              {CARD_COLORS.map((color) => (
                <button
                  key={color.name}
                  onClick={(e) => handleColorSelect(color.value, e)}
                  className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${
                    currentColor === color.value 
                      ? 'border-primary ring-2 ring-primary/30' 
                      : 'border-border/50 hover:border-primary/50'
                  }`}
                  style={{ 
                    backgroundColor: color.value || 'hsl(var(--card))' 
                  }}
                  title={color.name}
                />
              ))}
            </div>
            
            <div className="border-t border-border pt-3">
              <p className="text-xs text-muted-foreground mb-2">Egen färgkod</p>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={customColor}
                    onChange={handleCustomColorChange}
                    onKeyDown={handleKeyDown}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="#ff5500 eller hsl(30, 80%, 60%)"
                    className="w-full text-xs px-2 py-1.5 pr-8 rounded border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  {customColor && (
                    <div 
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-border"
                      style={{ backgroundColor: customColor }}
                    />
                  )}
                </div>
                <button
                  onClick={handleCustomColorApply}
                  className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                >
                  OK
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
