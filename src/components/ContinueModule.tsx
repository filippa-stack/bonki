import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="px-6 mb-8"
    >
      <div className="card-reflection">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
          {t('home.continue_where_left_off')}
        </p>
        <p className="font-serif text-lg text-foreground mb-1">{cardTitle}</p>
        <p className="text-sm text-gentle mb-5">{categoryTitle}</p>
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
