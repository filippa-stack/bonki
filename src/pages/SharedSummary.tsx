import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { formatDistanceToNow } from 'date-fns';
import { sv } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import { useSpaceSnapshot } from '@/hooks/useSpaceSnapshot';
import { selectExploredCardIds } from '@/selectors/spaceSnapshotSelectors';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import { supabase } from '@/integrations/supabase/client';
import { useDevState } from '@/contexts/DevStateContext';
import Header from '@/components/Header';

export interface SharedNoteRow {
  id: string;
  card_id: string;
  section_id: string;
  prompt_id: string;
  content: string;
  is_highlight: boolean;
  author_label: string | null;
  shared_at: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface JournalEntry {
  cardId: string;
  cardTitle: string;
  categoryTitle: string;
  completedAt: string | null;
  excerpt: string;
}

export default function SharedSummary() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { categories, getCardById, getCategoryById, cards } = useApp();
  const { user } = useAuth();
  const { space } = useCoupleSpaceContext();
  const { snapshot } = useSpaceSnapshot(user?.id ?? null, space?.id ?? null);

  const [sharedNotes, setSharedNotes] = useState<SharedNoteRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch completed sessions for dates
  const [sessionDates, setSessionDates] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user || !space) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);

      const [notesRes, sessionsRes] = await Promise.all([
        supabase
          .from('prompt_notes')
          .select('*')
          .eq('couple_space_id', space.id)
          .eq('visibility', 'shared')
          .order('created_at', { ascending: false }),
        supabase
          .from('card_sessions')
          .select('card_id, completed_at')
          .eq('couple_space_id', space.id)
          .not('completed_at', 'is', null)
          .order('completed_at', { ascending: false }),
      ]);

      if (!notesRes.error) setSharedNotes(notesRes.data || []);
      if (!sessionsRes.error) {
        const dates: Record<string, string> = {};
        for (const s of sessionsRes.data || []) {
          if (!dates[s.card_id] && s.completed_at) dates[s.card_id] = s.completed_at;
        }
        setSessionDates(dates);
      }
      setLoading(false);
    };

    fetchData();
  }, [user, space]);

  const exploredIds = selectExploredCardIds(snapshot);

  // Build journal entries from explored cards
  const journalEntries: JournalEntry[] = useMemo(() => {
    return cards
      .filter(c => exploredIds.includes(c.id))
      .map(card => {
        const category = getCategoryById(card.categoryId);
        // Find most recent shared note for this card as excerpt
        const cardNotes = sharedNotes.filter(n => n.card_id === card.id);
        const excerpt = cardNotes.length > 0 ? cardNotes[0].content : '';
        const completedAt = sessionDates[card.id] || null;

        return {
          cardId: card.id,
          cardTitle: card.title,
          categoryTitle: category?.title || '',
          completedAt,
          excerpt,
        };
      })
      .sort((a, b) => {
        // Most recently completed first
        if (a.completedAt && b.completedAt) return b.completedAt.localeCompare(a.completedAt);
        if (a.completedAt) return -1;
        if (b.completedAt) return 1;
        return 0;
      });
  }, [cards, exploredIds, getCategoryById, sharedNotes, sessionDates]);

  const devState = useDevState();
  const hasContent = devState === 'archiveEmpty' ? false
    : devState === 'archiveWithHistory' ? true
    : journalEntries.length > 0;
  const effectiveLoading = devState ? false : loading;

  return (
    <div className="min-h-screen page-bg">
      <Header showBack backTo="/" showSharedLink={false} />

      <div className="px-6 pb-10 mx-auto" style={{ maxWidth: 540, paddingTop: '32px' }}>

        {/* ─── Title ─── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className="text-center"
        >
          <h1 className="font-serif text-xl font-medium text-foreground tracking-tight">
            {t('shared.title')}
          </h1>
          <p className="text-sm text-muted-foreground/50" style={{ marginTop: '16px' }}>
            Här finns det ni har utforskat tillsammans.
          </p>
        </motion.div>

        {/* 48px before content */}
        <div style={{ height: '48px' }} />

        {/* ─── Empty state ─── */}
        {!hasContent && !effectiveLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="pt-8 pb-24 text-center"
          >
            <p className="text-[17px] font-medium text-foreground/70 leading-relaxed mt-6">
              Här växer det ni delar.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground/57 mt-7">
              När ni har haft ert första samtal, börjar rummet ta form.
            </p>
          </motion.div>
        )}

        {effectiveLoading ? (
          <div className="py-12 space-y-6 animate-fade-in">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-4 w-3/4 mx-auto rounded bg-muted/20 animate-pulse" />
            ))}
          </div>
        ) : (
          hasContent && (
            <div className="flex flex-col" style={{ gap: '32px' }}>
              {journalEntries.map((entry, index) => (
                <motion.button
                  key={entry.cardId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.1 + index * 0.03,
                    duration: 0.22,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                  onClick={() => navigate(`/card/${entry.cardId}?revisit=true`)}
                  className="w-full text-left group"
                >
                  {/* Category */}
                  <p
                    className="uppercase tracking-[0.08em] font-sans"
                    style={{
                      fontSize: '10px',
                      color: 'var(--color-text-secondary)',
                      opacity: 0.5,
                      lineHeight: 1,
                    }}
                  >
                    {entry.categoryTitle}
                  </p>

                  {/* Topic title — 8px below category */}
                  <p
                    className="font-serif group-hover:text-foreground transition-colors"
                    style={{
                      marginTop: '8px',
                      fontSize: '17px',
                      lineHeight: 1.3,
                      color: 'var(--color-text-primary)',
                      opacity: 0.9,
                    }}
                  >
                    {entry.cardTitle}
                  </p>

                  {/* Date — 8px below title */}
                  {entry.completedAt && (
                    <p
                      className="font-sans"
                      style={{
                        marginTop: '8px',
                        fontSize: '11px',
                        color: 'var(--color-text-secondary)',
                        opacity: 0.35,
                        lineHeight: 1,
                      }}
                    >
                      {formatDistanceToNow(new Date(entry.completedAt), {
                        addSuffix: true,
                        locale: sv,
                      })}
                    </p>
                  )}

                  {/* Reflection excerpt — 16px below, max 3 lines with fade */}
                  {entry.excerpt && (
                    <div
                      className="relative overflow-hidden"
                      style={{
                        marginTop: '16px',
                        maxHeight: 'calc(1.6em * 3)',
                      }}
                    >
                      <p
                        className="font-sans"
                        style={{
                          fontSize: '13px',
                          lineHeight: 1.6,
                          color: 'var(--color-text-secondary)',
                          opacity: 0.6,
                        }}
                      >
                        {entry.excerpt}
                      </p>
                      {/* Fade-out gradient */}
                      <div
                        className="absolute bottom-0 left-0 right-0 pointer-events-none"
                        style={{
                          height: '1.6em',
                          background: 'linear-gradient(to bottom, transparent, var(--color-bg, hsl(var(--background))))',
                        }}
                      />
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
