import { useState } from 'react';
import { Palette, Type, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ColorWheel from './ColorWheel';

// Color Palette Groups for Mental Health & Relationships
const COLOR_PALETTES = [
  {
    name: 'Mina färger',
    description: 'Din egna anpassade palett',
    colors: [
      { name: 'Terracotta', value: '#d08f63' },
      { name: 'Röd', value: '#FF0000' },
      { name: 'Mint', value: '#d4fffc' },
      { name: 'Cream', value: '#fffdee' },
      { name: 'Ivory', value: '#fffef3' },
      { name: 'Solgul', value: '#ffde59' },
    ]
  },
  {
    name: 'Sage & Sand',
    description: 'Jordad, lugn, naturlig',
    colors: [
      { name: 'Warm Sand BG', value: 'hsl(45, 30%, 96%)' },
      { name: 'Sage Primary', value: 'hsl(150, 20%, 42%)' },
      { name: 'Terracotta Accent', value: 'hsl(25, 35%, 55%)' },
      { name: 'Sage Light', value: 'hsl(150, 25%, 88%)' },
    ]
  },
  {
    name: 'Dusty Rose & Stone',
    description: 'Mjuk, omhändertagande, intim',
    colors: [
      { name: 'Stone BG', value: 'hsl(20, 20%, 95%)' },
      { name: 'Dusty Rose Primary', value: 'hsl(350, 25%, 65%)' },
      { name: 'Steel Blue Accent', value: 'hsl(200, 15%, 50%)' },
      { name: 'Rose Light', value: 'hsl(350, 30%, 90%)' },
    ]
  },
  {
    name: 'Ocean Calm',
    description: 'Klarhet, djup, trygghet',
    colors: [
      { name: 'Mist BG', value: 'hsl(200, 25%, 97%)' },
      { name: 'Teal Primary', value: 'hsl(195, 30%, 45%)' },
      { name: 'Honey Accent', value: 'hsl(35, 40%, 60%)' },
      { name: 'Ocean Light', value: 'hsl(195, 35%, 88%)' },
    ]
  },
  {
    name: 'Lavender Twilight',
    description: 'Reflektiv, spirituell, lugnande',
    colors: [
      { name: 'Lavender BG', value: 'hsl(260, 20%, 97%)' },
      { name: 'Purple Primary', value: 'hsl(265, 25%, 55%)' },
      { name: 'Gold Accent', value: 'hsl(45, 40%, 70%)' },
      { name: 'Lavender Light', value: 'hsl(260, 30%, 90%)' },
    ]
  },
  {
    name: 'Forest & Cream',
    description: 'Stabil, organisk, växande',
    colors: [
      { name: 'Cream BG', value: 'hsl(60, 20%, 96%)' },
      { name: 'Forest Primary', value: 'hsl(160, 30%, 35%)' },
      { name: 'Burnt Orange Accent', value: 'hsl(30, 50%, 55%)' },
      { name: 'Forest Light', value: 'hsl(160, 25%, 88%)' },
    ]
  },
];

const CARD_COLORS = [
  // Row 1 - Neutrals & Default
  { name: 'Default', value: '' },
  { name: 'Warm White', value: 'hsl(40, 20%, 96%)' },
  { name: 'Cool Gray', value: 'hsl(220, 15%, 93%)' },
  { name: 'Warm Gray', value: 'hsl(30, 15%, 91%)' },
  
  // Sage & Sand Palette
  { name: 'Warm Sand', value: 'hsl(45, 30%, 96%)' },
  { name: 'Sage', value: 'hsl(150, 20%, 42%)' },
  { name: 'Terracotta', value: 'hsl(25, 35%, 55%)' },
  { name: 'Sage Light', value: 'hsl(150, 25%, 88%)' },
  
  // Dusty Rose & Stone Palette
  { name: 'Stone', value: 'hsl(20, 20%, 95%)' },
  { name: 'Dusty Rose', value: 'hsl(350, 25%, 65%)' },
  { name: 'Steel Blue', value: 'hsl(200, 15%, 50%)' },
  { name: 'Rose Light', value: 'hsl(350, 30%, 90%)' },
  
  // Ocean Calm Palette
  { name: 'Mist', value: 'hsl(200, 25%, 97%)' },
  { name: 'Teal', value: 'hsl(195, 30%, 45%)' },
  { name: 'Honey', value: 'hsl(35, 40%, 60%)' },
  { name: 'Ocean Light', value: 'hsl(195, 35%, 88%)' },
  
  // Lavender Twilight Palette
  { name: 'Lavender BG', value: 'hsl(260, 20%, 97%)' },
  { name: 'Purple', value: 'hsl(265, 25%, 55%)' },
  { name: 'Gold', value: 'hsl(45, 40%, 70%)' },
  { name: 'Lavender Light', value: 'hsl(260, 30%, 90%)' },
  
  // Forest & Cream Palette
  { name: 'Cream', value: 'hsl(60, 20%, 96%)' },
  { name: 'Forest', value: 'hsl(160, 30%, 35%)' },
  { name: 'Burnt Orange', value: 'hsl(30, 50%, 55%)' },
  { name: 'Forest Light', value: 'hsl(160, 25%, 88%)' },
  
  // Pastel Tones - Soft & Harmonious
  // Pink pastels
  { name: 'Blush', value: 'hsl(350, 60%, 94%)' },
  { name: 'Rose', value: 'hsl(350, 55%, 90%)' },
  { name: 'Mauve', value: 'hsl(340, 40%, 88%)' },
  { name: 'Petal', value: 'hsl(355, 50%, 92%)' },
  
  // Peach & Coral pastels
  { name: 'Peach', value: 'hsl(25, 70%, 92%)' },
  { name: 'Apricot', value: 'hsl(25, 60%, 88%)' },
  { name: 'Coral Light', value: 'hsl(15, 65%, 90%)' },
  { name: 'Salmon', value: 'hsl(10, 55%, 88%)' },
  
  // Yellow & Cream pastels
  { name: 'Butter', value: 'hsl(50, 70%, 92%)' },
  { name: 'Vanilla', value: 'hsl(45, 60%, 94%)' },
  { name: 'Champagne', value: 'hsl(40, 50%, 90%)' },
  { name: 'Honey Cream', value: 'hsl(35, 55%, 91%)' },
  
  // Green pastels
  { name: 'Mint', value: 'hsl(150, 45%, 90%)' },
  { name: 'Seafoam', value: 'hsl(160, 40%, 88%)' },
  { name: 'Pistachio', value: 'hsl(140, 35%, 90%)' },
  { name: 'Eucalyptus', value: 'hsl(155, 30%, 86%)' },
  
  // Blue pastels
  { name: 'Sky', value: 'hsl(200, 60%, 92%)' },
  { name: 'Baby Blue', value: 'hsl(210, 55%, 90%)' },
  { name: 'Powder', value: 'hsl(195, 50%, 92%)' },
  { name: 'Ice', value: 'hsl(190, 45%, 94%)' },
  
  // Purple & Lavender pastels
  { name: 'Lilac', value: 'hsl(270, 45%, 92%)' },
  { name: 'Wisteria', value: 'hsl(265, 40%, 90%)' },
  { name: 'Periwinkle', value: 'hsl(240, 50%, 92%)' },
  { name: 'Thistle', value: 'hsl(280, 35%, 90%)' },
  
  // Neutral pastels
  { name: 'Cloud', value: 'hsl(220, 20%, 95%)' },
  { name: 'Dove', value: 'hsl(30, 15%, 93%)' },
  { name: 'Linen', value: 'hsl(40, 25%, 94%)' },
  { name: 'Pearl', value: 'hsl(0, 0%, 96%)' },
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
  const [pickerMode, setPickerMode] = useState<'wheel' | 'swatches'>('wheel');
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
            className="absolute right-0 top-full mt-2 z-50 bg-card border border-border rounded-lg shadow-lg p-3 max-h-[450px] overflow-y-auto min-w-[240px]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Color Type Tabs */}
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

            {/* Picker Mode Toggle */}
            <div className="flex gap-1 mb-3 p-1 bg-secondary rounded-lg">
              <button
                onClick={(e) => { e.stopPropagation(); setPickerMode('wheel'); }}
                className={`flex-1 px-2 py-1.5 rounded text-xs transition-colors ${
                  pickerMode === 'wheel' 
                    ? 'bg-background text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                🎨 Färgcirkel
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setPickerMode('swatches'); }}
                className={`flex-1 px-2 py-1.5 rounded text-xs transition-colors ${
                  pickerMode === 'swatches' 
                    ? 'bg-background text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                🎯 Färgrutor
              </button>
            </div>

            {/* Color Wheel Mode */}
            {pickerMode === 'wheel' && (
              <div className="mb-3">
                <ColorWheel
                  size={180}
                  currentColor={currentSelected}
                  onColorChange={(color) => {
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
                  }}
                />
              </div>
            )}

            {/* Swatches Mode */}
            {pickerMode === 'swatches' && (
              <>
                {/* Palette Groups - only for background tab */}
                {activeTab === 'background' && (
                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground mb-2 font-medium">
                      Färgpaletter för mental hälsa
                    </p>
                    <div className="space-y-3">
                      {COLOR_PALETTES.map((palette) => (
                        <div key={palette.name} className="border border-border/50 rounded-lg p-2">
                          <p className="text-xs font-medium mb-1">{palette.name}</p>
                          <p className="text-[10px] text-muted-foreground mb-2">{palette.description}</p>
                          <div className="flex gap-1.5">
                            {palette.colors.map((color) => (
                              <button
                                key={color.name}
                                onClick={(e) => handleColorSelect(color.value, e)}
                                className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${
                                  currentSelected === color.value 
                                    ? 'border-primary ring-2 ring-primary/30' 
                                    : 'border-border/50 hover:border-primary/50'
                                }`}
                                style={{ backgroundColor: color.value }}
                                title={color.name}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="divider-soft my-3" />
                  </div>
                )}
                
                <p className="text-xs text-muted-foreground mb-2">
                  {activeTab === 'background' ? 'Alla färger' : tabLabel}
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
              </>
            )}
            
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