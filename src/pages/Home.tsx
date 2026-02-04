import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import CategoryCard from '@/components/CategoryCard';
import ConversationCard from '@/components/ConversationCard';
import Header from '@/components/Header';
import { Bookmark, Pencil, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ColorPicker from '@/components/ColorPicker';
import bonkiLogo from '@/assets/bonki-logo.png';

const fontOptions = [
  { value: 'serif', label: 'Serif (Cormorant)', className: 'font-serif' },
  { value: 'sans', label: 'Sans-serif', className: 'font-sans' },
  { value: 'mono', label: 'Monospace', className: 'font-mono' },
];

export default function Home() {
  const navigate = useNavigate();
  const { mostRecentConversation, savedConversations, categories, updateCategory, updateCategoryColor, updateCategoryTextColor, updateCategoryBorderColor, updateCategoryIcon, backgroundColor } = useApp();
  const { settings, updateSettings } = useSiteSettings();
  const [isEditingHero, setIsEditingHero] = useState(false);
  const [editTitle, setEditTitle] = useState(settings.heroTitle);
  const [editSubtitle, setEditSubtitle] = useState(settings.heroSubtitle);
  const [editTitleColor, setEditTitleColor] = useState(settings.heroTitleColor);
  const [editSubtitleColor, setEditSubtitleColor] = useState(settings.heroSubtitleColor);
  const [editTitleFont, setEditTitleFont] = useState(settings.heroTitleFont);
  const [editSubtitleFont, setEditSubtitleFont] = useState(settings.heroSubtitleFont);

  const handleSaveHero = () => {
    updateSettings({ 
      heroTitle: editTitle, 
      heroSubtitle: editSubtitle,
      heroTitleColor: editTitleColor,
      heroSubtitleColor: editSubtitleColor,
      heroTitleFont: editTitleFont,
      heroSubtitleFont: editSubtitleFont,
    });
    setIsEditingHero(false);
  };

  const handleStartEdit = () => {
    setEditTitle(settings.heroTitle);
    setEditSubtitle(settings.heroSubtitle);
    setEditTitleColor(settings.heroTitleColor);
    setEditSubtitleColor(settings.heroSubtitleColor);
    setEditTitleFont(settings.heroTitleFont);
    setEditSubtitleFont(settings.heroSubtitleFont);
    setIsEditingHero(true);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: backgroundColor || 'hsl(var(--background))' }}>
      <Header showBackgroundPicker={true} />
      {/* Header with Logo */}
      <div className="px-6 pt-8 pb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <img 
            src={bonkiLogo} 
            alt="Bonki" 
            className="h-12 w-auto"
          />
        </motion.div>
        
        <div className="relative group">
          {isEditingHero ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Rubrik</Label>
                <div className="flex gap-2 items-center flex-wrap">
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="text-xl font-semibold bg-card flex-1 min-w-[150px]"
                    placeholder="Rubrik..."
                  />
                  <Select value={editTitleFont} onValueChange={setEditTitleFont}>
                    <SelectTrigger className="w-[140px] bg-card">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontOptions.map((font) => (
                        <SelectItem key={font.value} value={font.value} className={font.className}>
                          {font.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <ColorPicker
                    currentColor={editTitleColor}
                    onColorChange={setEditTitleColor}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Underrubrik</Label>
                <div className="flex gap-2 items-center flex-wrap">
                  <Input
                    value={editSubtitle}
                    onChange={(e) => setEditSubtitle(e.target.value)}
                    className="text-base bg-card flex-1 min-w-[150px]"
                    placeholder="Underrubrik..."
                  />
                  <Select value={editSubtitleFont} onValueChange={setEditSubtitleFont}>
                    <SelectTrigger className="w-[140px] bg-card">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontOptions.map((font) => (
                        <SelectItem key={font.value} value={font.value} className={font.className}>
                          {font.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <ColorPicker
                    currentColor={editSubtitleColor}
                    onColorChange={setEditSubtitleColor}
                  />
                </div>
              </div>
              <Button size="sm" onClick={handleSaveHero} className="gap-2">
                <Check className="w-4 h-4" />
                Spara
              </Button>
            </motion.div>
          ) : (
            <>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={`text-display font-${settings.heroTitleFont}`}
                style={{ color: settings.heroTitleColor || 'hsl(var(--foreground))' }}
              >
                {settings.heroTitle}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className={`text-body mt-2 font-${settings.heroSubtitleFont}`}
                style={{ color: settings.heroSubtitleColor || 'hsl(var(--text-gentle))' }}
              >
                {settings.heroSubtitle}
              </motion.p>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleStartEdit}
                className="absolute -right-2 top-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
              >
                <Pencil className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Continue conversation */}
      {mostRecentConversation && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="px-6 mb-8"
        >
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
            Continue where you left off
          </p>
          <ConversationCard
            conversation={mostRecentConversation}
            onClick={() => navigate(`/card/${mostRecentConversation.cardId}`)}
            variant="compact"
          />
        </motion.div>
      )}

      {/* Categories */}
      <div className="px-6 pb-6">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">
          Choose a category
        </p>
        <div className="space-y-3">
          {categories.map((category, index) => (
            <CategoryCard
              key={category.id}
              category={category}
              onClick={() => navigate(`/category/${category.id}`)}
              index={index}
              onUpdate={updateCategory}
              onColorChange={(color) => updateCategoryColor(category.id, color)}
              onTextColorChange={(textColor) => updateCategoryTextColor(category.id, textColor)}
              onBorderColorChange={(borderColor) => updateCategoryBorderColor(category.id, borderColor)}
              onIconChange={(icon) => updateCategoryIcon(category.id, icon)}
              editable={true}
            />
          ))}
        </div>
      </div>

      {/* Saved conversations link */}
      {savedConversations.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="px-6 py-8 border-t border-divider"
        >
          <button
            onClick={() => navigate('/saved')}
            className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Bookmark className="w-4 h-4" />
            <span className="text-sm">
              Saved conversations ({savedConversations.length})
            </span>
          </button>
        </motion.div>
      )}
    </div>
  );
}
