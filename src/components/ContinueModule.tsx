import { useMemo } from 'react';
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
  lastActiveAt?: string; // ISO date of last activity
}

function getTimeCue(lastActiveAt: string | undefined, t: (key: string, fallback: string) => string): string | null {
  if (!lastActiveAt) return null;
  const elapsed = Date.now() - new Date(lastActiveAt).getTime();
  const hours = elapsed / (1000 * 60 * 60);
  const days = Math.floor(hours / 24);

  if (hours < 1) return t('continue.cue_just_now', 'Ni var precis här.');
  if (hours < 24) return t('continue.cue_today', 'Ni pratade om det här tidigare idag.');
  if (days === 1) return t('continue.cue_yesterday', 'Ni började prata om det här igår.');
  if (days < 7) return t('continue.cue_days_ago', 'Ni öppnade det här för några dagar sedan.');
  return t('continue.cue_while_ago', 'Det har gått ett tag. Ert samtal finns kvar.');
}

export default function ContinueModule({
  cardTitle,
  categoryTitle,
  onContinue,
  onChooseAnother,
  lastActiveAt,
}: ContinueModuleProps) {
  const { t } = useTranslation();
  const { settings, updateSettings } = useSiteSettings();

  const timeCue = useMemo(() => getTimeCue(lastActiveAt, t), [lastActiveAt, t]);

  const textStyle = settings.continueModuleTextColor
    ? { color: settings.continueModuleTextColor }
    : undefined;
  const mutedTextStyle = settings.continueModuleTextColor
    ? { color: settings.continueModuleTextColor, opacity: 0.6 }
    : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="px-6 mb-10"
    >
      <div
        className="card-reflection relative py-6 px-5"
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

        {/* Emotional continuity cue */}
        {timeCue && (
          <p className="text-xs italic mb-4" style={mutedTextStyle}>
            {timeCue}
          </p>
        )}

        <p className="font-serif text-lg mb-1" style={textStyle}>
          {cardTitle}
        </p>
        <p className="text-sm mb-6" style={mutedTextStyle}>
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
