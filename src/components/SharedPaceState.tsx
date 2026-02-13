import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function SharedPaceState() {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-6 my-6 p-6 rounded-2xl border border-border bg-card text-left space-y-3"
    >
      <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
        {t('shared_pace.message')}
      </p>
      <p className="text-xs text-muted-foreground/60 not-italic">
        {t('shared_pace.hint')}
      </p>
    </motion.div>
  );
}
