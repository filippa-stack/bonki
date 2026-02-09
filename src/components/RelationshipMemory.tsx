import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Heart } from 'lucide-react';

interface RelationshipMemoryProps {
  cardTitle: string;
  categoryTitle: string;
  completedAt: string;
}

export default function RelationshipMemory({ cardTitle, categoryTitle, completedAt }: RelationshipMemoryProps) {
  const { t } = useTranslation();

  const formattedDate = new Date(completedAt).toLocaleDateString('sv-SE', {
    day: 'numeric',
    month: 'long',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="px-6 mb-6"
    >
      <div className="rounded-xl border border-border bg-card/50 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Heart className="w-4 h-4 text-muted-foreground" />
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            {t('home.relationship_memory_title')}
          </p>
        </div>
        <p className="font-serif text-foreground">{t('home.relationship_memory_explored')} <em>{cardTitle}</em></p>
        <p className="text-sm text-gentle mt-1">{categoryTitle} · {formattedDate}</p>
      </div>
    </motion.div>
  );
}
