import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import Header from '@/components/Header';
import { Star, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function SharedSummary() {
  const { t } = useTranslation();
  const {
    categories,
    cards,
    backgroundColor,
    getAllSharedNotes,
    getHighlightedCards,
    getCardById,
    getCategoryById,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');

  const sharedNotes = getAllSharedNotes();
  const highlightedCardIds = getHighlightedCards();

  // Group shared notes by category
  const groupedByCategory = useMemo(() => {
    const groups: Record<string, { categoryTitle: string; items: { cardId: string; cardTitle: string; text: string; sharedAt: string }[] }> = {};

    for (const [cardId, note] of Object.entries(sharedNotes)) {
      const card = getCardById(cardId);
      if (!card) continue;
      const category = getCategoryById(card.categoryId);
      if (!category) continue;

      // Filter by search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!note.text.toLowerCase().includes(q) && !card.title.toLowerCase().includes(q)) {
          continue;
        }
      }

      if (!groups[category.id]) {
        groups[category.id] = { categoryTitle: category.title, items: [] };
      }
      groups[category.id].items.push({
        cardId,
        cardTitle: card.title,
        text: note.text,
        sharedAt: note.sharedAt,
      });
    }

    return groups;
  }, [sharedNotes, searchQuery, getCardById, getCategoryById]);

  // Highlighted items
  const highlights = useMemo(() => {
    return highlightedCardIds
      .map((cardId) => {
        const note = sharedNotes[cardId];
        const card = getCardById(cardId);
        if (!note || !card) return null;
        return { cardId, cardTitle: card.title, text: note.text };
      })
      .filter(Boolean) as { cardId: string; cardTitle: string; text: string }[];
  }, [highlightedCardIds, sharedNotes, getCardById]);

  const hasContent = Object.keys(sharedNotes).length > 0;

  return (
    <div className="min-h-screen" style={{ backgroundColor: backgroundColor || 'hsl(var(--background))' }}>
      <Header title={t('shared.title')} showBack backTo="/" />

      <div className="px-6 pt-6 pb-8 max-w-2xl mx-auto">
        {!hasContent ? (
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
            {/* A) Highlights */}
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
                      key={h.cardId}
                      className="p-4 rounded-lg bg-card border border-primary/20"
                    >
                      <p className="text-xs text-muted-foreground mb-1">{h.cardTitle}</p>
                      <p className="text-body text-foreground whitespace-pre-wrap">{h.text}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* C) Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('shared.search_placeholder')}
                className="pl-10"
              />
            </div>

            {/* B) Accordion by category */}
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
                            key={item.cardId}
                            className="p-4 rounded-lg bg-card border border-border"
                          >
                            <p className="text-xs text-muted-foreground mb-1">{item.cardTitle}</p>
                            <p className="text-body text-foreground whitespace-pre-wrap">{item.text}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(item.sharedAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>

            {/* No results from search */}
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
