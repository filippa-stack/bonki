import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import ColorPicker from '@/components/ColorPicker';

interface ContinueModuleProps {
  cardTitle: string;
  categoryTitle: string;
  onContinue: () => void;
  onChooseAnother: () => void;
}

export default function ContinueModule({
  cardTitle,
  categoryTitle,
  onContinue,
  onChooseAnother,
}: ContinueModuleProps) {
  const { t } = useTranslation();
  const { settings, updateSettings } = useSiteSettings();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="px-6 mb-10"
    >
      <div
        className="card-reflection relative"
        style={{
          backgroundColor: settings.continueModuleBgColor || undefined,
          borderColor: settings.continueModuleBorderColor || undefined,
          borderWidth: settings.continueModuleBorderColor ? '2px' : undefined,
          borderStyle: settings.continueModuleBorderColor ? 'solid' : undefined,
          color: settings.continueModuleTextColor || undefined,
        }}
      >
        <div className="absolute top-2 right-2" onClick={(e) => e.stopPropagation()}>
          <ColorPicker
            currentColor={settings.continueModuleBgColor}
            onColorChange={(c) => updateSettings({ continueModuleBgColor: c })}
            currentTextColor={settings.continueModuleTextColor}
            onTextColorChange={(c) => updateSettings({ continueModuleTextColor: c })}
            currentBorderColor={settings.continueModuleBorderColor}
            onBorderColorChange={(c) => updateSettings({ continueModuleBorderColor: c })}
            showTextColor
            showBorderColor
          />
        </div>
        <p className="text-xs uppercase tracking-wider mb-3" style={{ color: settings.continueModuleTextColor || undefined, opacity: settings.continueModuleTextColor ? 0.7 : undefined }}>
          {t('home.continue_where_left_off')}
        </p>
        <p className="font-serif text-lg mb-1" style={{ color: settings.continueModuleTextColor || undefined }}>
          {cardTitle}
        </p>
        <p className="text-sm mb-5" style={{ color: settings.continueModuleTextColor || undefined, opacity: settings.continueModuleTextColor ? 0.7 : undefined }}>
          {categoryTitle}
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={onContinue} className="gap-2" size="sm">
            {t('general.continue_cta')}
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button onClick={onChooseAnother} variant="ghost" size="sm" className="text-muted-foreground">
            {t('general.choose_another')}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
