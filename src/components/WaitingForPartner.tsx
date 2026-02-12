import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Heart } from 'lucide-react';

export default function WaitingForPartner() {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-6 my-6 p-6 rounded-2xl border border-border bg-card text-center space-y-3"
    >
      <Heart className="w-5 h-5 text-primary/50 mx-auto" />
      <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
        {t('waiting_for_partner.message')}
      </p>
      <p className="text-xs text-muted-foreground/60 italic">
        {t('waiting_for_partner.hint')}
      </p>
    </motion.div>
  );
}
