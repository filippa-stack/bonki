import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';

interface ContinueModuleProps {
  cardTitle: string;
  categoryTitle: string;
  onContinue: () => void;
  onChooseAnother?: () => void;
  lastActiveAt?: string; // ISO date of last activity
  isCatchingUp?: boolean; // True when user is behind partner
}

function getTimeCue(lastActiveAt: string | undefined): string | null {
  if (!lastActiveAt) return null;
  const date = new Date(lastActiveAt);
  return `Senast: ${format(date, 'd MMM', { locale: sv })}`;
}

export default function ContinueModule({
  cardTitle,
  categoryTitle,
  onContinue,
  onChooseAnother,
  lastActiveAt,
  isCatchingUp = false,
}: ContinueModuleProps) {
  const { t } = useTranslation();
  const { settings } = useSiteSettings();

  const timeCue = useMemo(() => getTimeCue(lastActiveAt), [lastActiveAt]);

  const textStyle = settings.continueModuleTextColor
    ? { color: settings.continueModuleTextColor }
    : undefined;
  const mutedTextStyle = settings.continueModuleTextColor
    ? { color: settings.continueModuleTextColor, opacity: 0.6 }
    : undefined;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      className="px-6 mb-8"
    >
      <div
        className="card-reflection relative py-6 px-5 border border-border/30"
        style={{
          backgroundColor: settings.continueModuleBgColor || '#ffffff',
          borderColor: settings.continueModuleBorderColor || undefined,
          borderWidth: settings.continueModuleBorderColor ? '2px' : undefined,
          borderStyle: settings.continueModuleBorderColor ? 'solid' : undefined,
          color: settings.continueModuleTextColor || undefined,
        }}
      >

        <p className="font-serif text-lg mb-2" style={textStyle}>
          {cardTitle}
        </p>
        <p className="text-xs mb-2" style={mutedTextStyle}>
          {categoryTitle}{timeCue ? ` · ${timeCue}` : ''}
        </p>

        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <Button
            onClick={onContinue}
            className="gap-2 bg-[#497575] text-white hover:bg-[#365757]"
            size="sm"
          >
            {isCatchingUp ? t('general.catch_up_cta', 'Kom ikapp') : t('general.continue_cta')}
            <ArrowRight className="w-4 h-4" />
          </Button>
          {onChooseAnother && (
            <Button
              onClick={onChooseAnother}
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
            >
              {t('general.choose_another')}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
