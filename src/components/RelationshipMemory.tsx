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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      className="px-6 mb-6"
    >
      <div className="rounded-card border border-border/20 p-6">
        <div className="flex items-center gap-2 mb-2">
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
