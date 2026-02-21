import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import { supabase } from '@/integrations/supabase/client';
import { useDevState } from '@/contexts/DevStateContext';
import Header from '@/components/Header';

interface CompletedEntry {
  sessionId: string;
  cardId: string;
  cardTitle: string;
  categoryTitle: string;
  completedAt: string;
  excerpt: string;
}

export default function SharedSummary() {
  const navigate = useNavigate();
  const { getCardById, getCategoryById } = useApp();
  const { user } = useAuth();
  const { space } = useCoupleSpaceContext();

  const [entries, setEntries] = useState<CompletedEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const devState = useDevState();

  useEffect(() => {
    if (!user || !space) { setLoading(false); return; }

    let cancelled = false;

    const fetch = async () => {
      setLoading(true);

      // 1. Get all completed sessions
      const { data: sessions } = await supabase
        .from('couple_sessions')
        .select('id, card_id, category_id, started_at, ended_at')
        .eq('couple_space_id', space.id)
        .eq('status', 'completed')
        .order('started_at', { ascending: false });

      if (cancelled || !sessions?.length) { setLoading(false); return; }

      // 2. Get first non-empty reflection per session for excerpt
      const sessionIds = sessions.map(s => s.id);
      const { data: reflections } = await supabase
        .from('step_reflections')
        .select('session_id, text, step_index')
        .in('session_id', sessionIds)
        .eq('state', 'locked')
        .neq('text', '')
        .order('step_index', { ascending: true });

      if (cancelled) return;

      // Build a map: session_id -> first reflection text
      const excerptMap: Record<string, string> = {};
      for (const r of reflections || []) {
        if (!excerptMap[r.session_id]) excerptMap[r.session_id] = r.text;
      }

      const built: CompletedEntry[] = sessions
        .filter(s => s.card_id)
        .map(s => {
          const card = getCardById(s.card_id!);
          const category = s.category_id ? getCategoryById(s.category_id) : null;
          return {
            sessionId: s.id,
            cardId: s.card_id!,
            cardTitle: card?.title || s.card_id!,
            categoryTitle: category?.title || '',
            completedAt: s.ended_at || s.started_at,
            excerpt: excerptMap[s.id] || '',
          };
        });

      setEntries(built);
      setLoading(false);
    };

    fetch();
    return () => { cancelled = true; };
  }, [user, space, getCardById, getCategoryById]);

  const hasContent = devState === 'archiveEmpty' ? false
    : devState === 'archiveWithHistory' ? true
    : entries.length > 0;
  const effectiveLoading = devState ? false : loading;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const day = d.getDate();
    const month = d.toLocaleString('sv-SE', { month: 'short' }).replace('.', '');
    return `${day} ${month}`;
  };

  return (
    <div className="min-h-screen page-bg">
      <Header title="Era samtal" showBack backTo="/" />

      <div className="px-6 pb-8 mx-auto" style={{ maxWidth: 540, paddingTop: '32px' }}>

        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className="text-center"
        >
          <p className="type-body text-muted-foreground/50">
            Vad ni burit med er.
          </p>
        </motion.div>

        <div style={{ height: '48px' }} />

        {/* Empty state */}
        {!hasContent && !effectiveLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="pt-8 pb-24 text-center"
          >
            <p className="type-h2 text-foreground/70 mt-6">
              Här växer det ni delar.
            </p>
            <p className="type-body text-muted-foreground/57 mt-8">
              Ert första avslutade samtal dyker upp här.
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
              {entries.map((entry, index) => (
                <motion.button
                  key={`${entry.sessionId}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.1 + index * 0.03,
                    duration: 0.22,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                  onClick={() => navigate(`/card/${entry.cardId}?revisit=true&from=archive`)}
                  className="w-full text-left group"
                >
                  {/* Card title */}
                  <p
                    className="type-h3"
                    style={{
                      color: 'var(--color-text-primary)',
                      opacity: 0.9,
                      fontFamily: 'var(--font-serif)',
                    }}
                  >
                    {entry.cardTitle}
                  </p>

                  {/* Category + date */}
                  <p
                    className="type-meta mt-1"
                    style={{
                      color: 'var(--color-text-secondary)',
                      opacity: 0.45,
                    }}
                  >
                    {entry.categoryTitle}{entry.categoryTitle && ' · '}{formatDate(entry.completedAt)}
                  </p>

                  {/* Reflection excerpt — max 2 lines */}
                  {entry.excerpt && (
                    <div
                      className="relative overflow-hidden"
                      style={{
                        marginTop: '10px',
                        maxHeight: 'calc(1.6em * 2)',
                      }}
                    >
                      <p
                        className="type-body"
                        style={{
                          color: 'var(--color-text-secondary)',
                          opacity: 0.5,
                        }}
                      >
                        {entry.excerpt}
                      </p>
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
