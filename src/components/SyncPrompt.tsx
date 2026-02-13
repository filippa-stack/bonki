import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface SyncPromptProps {
  partnerStepIndex: number;
  stepLabels: string[];
  onCatchUp: () => void;
  onStay: () => void;
}

export default function SyncPrompt({ partnerStepIndex, stepLabels, onCatchUp, onStay }: SyncPromptProps) {
  const { t } = useTranslation();
  const stepName = stepLabels[partnerStepIndex] || '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-6 my-4 p-5 rounded-2xl border border-border bg-card space-y-4"
    >
      <p className="text-sm text-foreground leading-relaxed">
        {t('sync_prompt.message')}
      </p>
      <p className="text-xs text-muted-foreground not-italic">
        {t('sync_prompt.current_position', { step: stepName })}
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <Button onClick={onCatchUp} size="sm" className="gap-2">
          {t('sync_prompt.catch_up')}
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
        <Button onClick={onStay} variant="ghost" size="sm">
          {t('sync_prompt.stay')}
        </Button>
      </div>
    </motion.div>
  );
}
