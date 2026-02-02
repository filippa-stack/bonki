import { useState } from 'react';
import { Palette, Type, Square } from 'lucide-react';
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

const TEXT_COLORS = [
  { name: 'Default', value: '' },
  { name: 'Black', value: 'hsl(0, 0%, 10%)' },
  { name: 'Dark Gray', value: 'hsl(0, 0%, 25%)' },
  { name: 'Charcoal', value: 'hsl(0, 0%, 35%)' },
  { name: 'Medium Gray', value: 'hsl(0, 0%, 50%)' },
  { name: 'Deep Brown', value: 'hsl(25, 40%, 25%)' },
  { name: 'Warm Brown', value: 'hsl(25, 35%, 35%)' },
  { name: 'Sepia', value: 'hsl(30, 30%, 40%)' },
  { name: 'Navy', value: 'hsl(220, 50%, 25%)' },
  { name: 'Midnight', value: 'hsl(230, 40%, 30%)' },
  { name: 'Deep Blue', value: 'hsl(210, 45%, 35%)' },
  { name: 'Forest', value: 'hsl(150, 40%, 25%)' },
  { name: 'Deep Teal', value: 'hsl(180, 35%, 30%)' },
  { name: 'Burgundy', value: 'hsl(350, 45%, 30%)' },
  { name: 'Wine', value: 'hsl(340, 40%, 35%)' },
  { name: 'Deep Purple', value: 'hsl(270, 35%, 35%)' },
];

const BORDER_COLORS = [
  { name: 'Default', value: '' },
  { name: 'Light Gray', value: 'hsl(0, 0%, 85%)' },
  { name: 'Medium Gray', value: 'hsl(0, 0%, 70%)' },
  { name: 'Dark Gray', value: 'hsl(0, 0%, 50%)' },
  { name: 'Warm Beige', value: 'hsl(30, 30%, 75%)' },
  { name: 'Blush', value: 'hsl(350, 50%, 80%)' },
  { name: 'Rose', value: 'hsl(350, 45%, 70%)' },
  { name: 'Peach', value: 'hsl(25, 60%, 75%)' },
  { name: 'Coral', value: 'hsl(15, 50%, 70%)' },
  { name: 'Sand', value: 'hsl(40, 40%, 75%)' },
  { name: 'Honey', value: 'hsl(45, 50%, 70%)' },
  { name: 'Mint', value: 'hsl(150, 30%, 75%)' },
  { name: 'Sage', value: 'hsl(140, 25%, 65%)' },
  { name: 'Sky', value: 'hsl(200, 45%, 75%)' },
  { name: 'Steel', value: 'hsl(215, 30%, 65%)' },
  { name: 'Lavender', value: 'hsl(260, 35%, 75%)' },
];

interface ColorPickerProps {
  currentColor?: string;
  onColorChange: (color: string) => void;
  currentTextColor?: string;
  onTextColorChange?: (color: string) => void;
  currentBorderColor?: string;
  onBorderColorChange?: (color: string) => void;
  showTextColor?: boolean;
  showBorderColor?: boolean;
}

export default function ColorPicker({ 
  currentColor, 
  onColorChange,
  currentTextColor,
  onTextColorChange,
  currentBorderColor,
  onBorderColorChange,
  showTextColor = false,
  showBorderColor = false
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'background' | 'text' | 'border'>('background');
  const [customColor, setCustomColor] = useState(currentColor || '');
  const [customTextColor, setCustomTextColor] = useState(currentTextColor || '');
  const [customBorderColor, setCustomBorderColor] = useState(currentBorderColor || '');

  const handleColorSelect = (color: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeTab === 'background') {
      onColorChange(color);
      setCustomColor(color);
    } else if (activeTab === 'text') {
      onTextColorChange?.(color);
      setCustomTextColor(color);
    } else {
      onBorderColorChange?.(color);
      setCustomBorderColor(color);
    }
    setIsOpen(false);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (activeTab === 'background') {
      setCustomColor(value);
    } else if (activeTab === 'text') {
      setCustomTextColor(value);
    } else {
      setCustomBorderColor(value);
    }
  };

  const handleCustomColorApply = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (activeTab === 'background') {
      if (customColor.trim()) {
        onColorChange(customColor.trim());
        setIsOpen(false);
      }
    } else if (activeTab === 'text') {
      if (customTextColor.trim()) {
        onTextColorChange?.(customTextColor.trim());
        setIsOpen(false);
      }
    } else {
      if (customBorderColor.trim()) {
        onBorderColorChange?.(customBorderColor.trim());
        setIsOpen(false);
      }
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
      setCustomTextColor(currentTextColor || '');
      setCustomBorderColor(currentBorderColor || '');
    }
  };

  const colors = activeTab === 'background' ? CARD_COLORS : activeTab === 'text' ? TEXT_COLORS : BORDER_COLORS;
  const currentSelected = activeTab === 'background' ? currentColor : activeTab === 'text' ? currentTextColor : currentBorderColor;
  const customValue = activeTab === 'background' ? customColor : activeTab === 'text' ? customTextColor : customBorderColor;

  const tabLabel = activeTab === 'background' ? 'Välj bakgrundsfärg' : activeTab === 'text' ? 'Välj textfärg' : 'Välj ramfärg';

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
            className="absolute right-0 top-full mt-2 z-50 bg-card border border-border rounded-lg shadow-lg p-3 max-h-80 overflow-y-auto min-w-[200px]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tabs */}
            {(showTextColor || showBorderColor) && (
              <div className="flex gap-1 mb-3 p-1 bg-muted rounded-lg">
                <button
                  onClick={(e) => { e.stopPropagation(); setActiveTab('background'); }}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded text-xs transition-colors ${
                    activeTab === 'background' 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Palette className="w-3 h-3" />
                  Bakgrund
                </button>
                {showTextColor && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setActiveTab('text'); }}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded text-xs transition-colors ${
                      activeTab === 'text' 
                        ? 'bg-background text-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Type className="w-3 h-3" />
                    Text
                  </button>
                )}
                {showBorderColor && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setActiveTab('border'); }}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded text-xs transition-colors ${
                      activeTab === 'border' 
                        ? 'bg-background text-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Square className="w-3 h-3" />
                    Ram
                  </button>
                )}
              </div>
            )}
            
            <p className="text-xs text-muted-foreground mb-2">
              {tabLabel}
            </p>
            <div className="grid grid-cols-4 gap-1.5 mb-3">
              {colors.map((color) => (
                <button
                  key={color.name}
                  onClick={(e) => handleColorSelect(color.value, e)}
                  className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${
                    currentSelected === color.value 
                      ? 'border-primary ring-2 ring-primary/30' 
                      : 'border-border/50 hover:border-primary/50'
                  }`}
                  style={{ 
                    backgroundColor: color.value || (activeTab === 'background' ? 'hsl(var(--card))' : activeTab === 'text' ? 'hsl(var(--foreground))' : 'hsl(var(--border))') 
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
                    value={customValue}
                    onChange={handleCustomColorChange}
                    onKeyDown={handleKeyDown}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="#ff5500 eller hsl(30, 80%, 60%)"
                    className="w-full text-xs px-2 py-1.5 pr-8 rounded border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  {customValue && (
                    <div 
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-border"
                      style={{ backgroundColor: customValue }}
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