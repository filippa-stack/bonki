import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpace } from '@/hooks/useCoupleSpace';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { Star, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface SharedNoteRow {
  id: string;
  card_id: string;
  section_id: string;
  prompt_id: string;
  content: string;
  is_highlight: boolean;
  author_label: string | null;
  shared_at: string | null;
  updated_at: string;
  user_id: string;
}

export default function SharedSummary() {
  const { t } = useTranslation();
  const { categories, backgroundColor, getCardById, getCategoryById } = useApp();
  const { user } = useAuth();
  const { space } = useCoupleSpace();

  const [searchQuery, setSearchQuery] = useState('');
  const [sharedNotes, setSharedNotes] = useState<SharedNoteRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all shared notes in the couple space
  useEffect(() => {
    if (!user || !space) {
      setLoading(false);
      return;
    }

    const fetchSharedNotes = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('prompt_notes')
        .select('*')
        .eq('couple_space_id', space.id)
        .eq('visibility', 'shared')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch shared notes:', error);
      } else {
        setSharedNotes(data || []);
      }
      setLoading(false);
    };

    fetchSharedNotes();
  }, [user, space]);

  const highlights = useMemo(() => {
    return sharedNotes
      .filter(n => n.is_highlight)
      .map(n => {
        const card = getCardById(n.card_id);
        return card ? { ...n, cardTitle: card.title } : null;
      })
      .filter(Boolean) as (SharedNoteRow & { cardTitle: string })[];
  }, [sharedNotes, getCardById]);

  // Group by category
  const groupedByCategory = useMemo(() => {
    const groups: Record<string, {
      categoryTitle: string;
      items: (SharedNoteRow & { cardTitle: string; promptText: string })[];
    }> = {};

    for (const note of sharedNotes) {
      const card = getCardById(note.card_id);
      if (!card) continue;
      const category = getCategoryById(card.categoryId);
      if (!category) continue;

      // Find prompt text from card data
      const section = card.sections.find(s => s.id === note.section_id);
      const promptIndex = parseInt(note.prompt_id.replace('prompt-', ''), 10);
      const rawPrompt = section?.prompts?.[promptIndex];
      const promptText = typeof rawPrompt === 'string' ? rawPrompt : rawPrompt?.text || '';

      // Filter by search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !note.content.toLowerCase().includes(q) &&
          !card.title.toLowerCase().includes(q) &&
          !promptText.toLowerCase().includes(q)
        ) {
          continue;
        }
      }

      if (!groups[category.id]) {
        groups[category.id] = { categoryTitle: category.title, items: [] };
      }
      groups[category.id].items.push({
        ...note,
        cardTitle: card.title,
        promptText,
      });
    }

    return groups;
  }, [sharedNotes, searchQuery, getCardById, getCategoryById]);

  const hasContent = sharedNotes.length > 0;

  return (
    <div className="min-h-screen" style={{ backgroundColor: backgroundColor || 'hsl(var(--background))' }}>
      <Header title={t('shared.title')} showBack backTo="/" />

      <div className="px-6 pt-6 pb-8 max-w-2xl mx-auto">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gentle text-sm">{t('general.loading', 'Laddar...')}</p>
          </div>
        ) : !hasContent ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-gentle">{t('shared.empty')}</p>
            <p className="text-xs text-muted-foreground mt-2">{t('shared.empty_hint')}</p>
          </motion.div>
        ) : (
          <>
            {/* Highlights */}
            {highlights.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Star className="w-3 h-3" />
                  {t('shared.highlights_title')}
                </p>
                <div className="space-y-3">
                  {highlights.map((h) => (
                    <div
                      key={h.id}
                      className="p-4 rounded-lg bg-card border border-primary/20"
                    >
                      <p className="text-xs text-muted-foreground mb-1">{h.cardTitle}</p>
                      <p className="text-body text-foreground whitespace-pre-wrap">{h.content}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('shared.search_placeholder')}
                className="pl-10"
              />
            </div>

            {/* Accordion by category */}
            <Accordion type="multiple" className="space-y-2">
              {categories.map((category) => {
                const group = groupedByCategory[category.id];
                if (!group || group.items.length === 0) return null;

                return (
                  <AccordionItem key={category.id} value={category.id} className="border border-border rounded-lg overflow-hidden">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline">
                      <span className="text-sm font-medium text-foreground">
                        {group.categoryTitle} ({group.items.length})
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="space-y-3">
                        {group.items.map((item) => (
                          <div
                            key={item.id}
                            className="p-4 rounded-lg bg-card border border-border"
                          >
                            <p className="text-xs text-muted-foreground mb-1">{item.cardTitle}</p>
                            {item.promptText && (
                              <p className="text-xs text-foreground/60 italic mb-2">{item.promptText}</p>
                            )}
                            <p className="text-body text-foreground whitespace-pre-wrap">{item.content}</p>
                            {item.shared_at && (
                              <p className="text-xs text-muted-foreground mt-2">
                                {new Date(item.shared_at).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>

            {/* No results */}
            {searchQuery && Object.keys(groupedByCategory).length === 0 && (
              <p className="text-center text-gentle py-8 text-sm">
                {t('shared.no_results')}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
