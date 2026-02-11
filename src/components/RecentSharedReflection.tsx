import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpace } from '@/hooks/useCoupleSpace';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

interface SharedNotePreview {
  id: string;
  content: string;
  card_id: string;
  shared_at: string | null;
  created_at: string;
  author_label: string | null;
}

export default function RecentSharedReflection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { space } = useCoupleSpace();
  const { getCardById, getCategoryById } = useApp();
  const [note, setNote] = useState<SharedNotePreview | null>(null);

  useEffect(() => {
    if (!user || !space) return;

    const fetchLatest = async () => {
      const { data } = await supabase
        .from('prompt_notes')
        .select('id, content, card_id, shared_at, created_at, author_label')
        .eq('couple_space_id', space.id)
        .eq('visibility', 'shared')
        .order('created_at', { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        setNote(data[0]);
      }
    };

    fetchLatest();
  }, [user, space]);

  if (!note) return null;

  const card = getCardById(note.card_id);
  const category = card ? getCategoryById(card.categoryId) : null;
  const dateStr = new Date(note.shared_at || note.created_at).toLocaleDateString('sv-SE', {
    day: 'numeric',
    month: 'short',
  });

  const truncatedContent = note.content.length > 120
    ? note.content.slice(0, 120) + '…'
    : note.content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="px-6 mb-6"
    >
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
        <Heart className="w-3 h-3" />
        {t('home.recent_shared_title')}
      </p>
      <div
        className="p-4 rounded-xl border border-border bg-card cursor-pointer hover:border-primary/20 transition-colors"
        onClick={() => navigate('/shared')}
      >
        <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
          {truncatedContent}
        </p>
        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-muted-foreground">
            {[
              category?.title && card?.title ? `${category.title} · ${card.title}` : null,
              note.author_label,
              dateStr,
            ].filter(Boolean).join(' · ')}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-foreground gap-1 h-auto py-1 px-2"
            onClick={(e) => {
              e.stopPropagation();
              navigate('/shared');
            }}
          >
            {t('home.view_shared_space')}
            <ArrowRight className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
