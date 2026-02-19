import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BEAT_2, EASE } from '@/lib/motion';

interface WelcomeBackBannerProps {
  lastCardTitle?: string;
  lastCategoryTitle?: string;
  onContinue: () => void;
  onDismiss: () => void;
}

export default function WelcomeBackBanner({
  lastCardTitle,
  lastCategoryTitle,
  onContinue,
  onDismiss,
}: WelcomeBackBannerProps) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: BEAT_2, ease: EASE }}
      className="mx-6 mb-6 p-6 rounded-card border border-border/20"
    >
      <p className="text-sm text-foreground leading-relaxed">
        {t('welcome_back.message')}
      </p>
      {lastCardTitle && lastCategoryTitle && (
        <p className="text-xs text-muted-foreground mt-2">
          {t('welcome_back.last_context', { category: lastCategoryTitle, card: lastCardTitle })}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3 mt-4">
        {lastCardTitle && (
          <Button size="sm" className="gap-1.5" onClick={onContinue}>
            {t('welcome_back.continue')}
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={onDismiss}
        >
          {t('welcome_back.dismiss')}
        </Button>
      </div>
    </motion.div>
  );
}
