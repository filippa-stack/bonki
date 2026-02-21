import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import { supabase } from '@/integrations/supabase/client';
import { useDevState } from '@/contexts/DevStateContext';
import Header from '@/components/Header';
import { ChevronDown } from 'lucide-react';
import type { Prompt } from '@/types';

const STEP_ORDER = ['opening', 'reflective', 'scenario', 'exercise'] as const;

interface ReflectionRow {
  stepIndex: number; // encoded: stageIndex * 100 + promptIndex
  text: string;
}

interface CompletedEntry {
  sessionId: string;
  cardId: string;
  cardTitle: string;
  categoryTitle: string;
  completedAt: string;
  excerpt: string;
  reflections: ReflectionRow[];
  takeaway: string;
}

/** Decode composite step_index → { stageIndex, promptIndex } */
function decodeStepIndex(encoded: number) {
  return { stageIndex: Math.floor(encoded / 100), promptIndex: encoded % 100 };
}

/** Look up the question text for a given card and encoded step_index */
function getQuestionText(
  getCardById: (id: string) => any,
  cardId: string,
  encoded: number,
): string | null {
  const card = getCardById(cardId);
  if (!card) return null;
  const { stageIndex, promptIndex } = decodeStepIndex(encoded);
  const stageType = STEP_ORDER[stageIndex];
  if (!stageType) return null;
  const section = card.sections.find((s: any) => s.type === stageType);
  if (!section) return null;

  const prompts: (string | Prompt)[] = section.prompts ?? (section.content ? [section.content] : []);
  const prompt = prompts[promptIndex];
  if (!prompt) return null;
  return typeof prompt === 'string' ? prompt : prompt.text;
}

export default function SharedSummary() {
  const navigate = useNavigate();
  const { getCardById, getCategoryById } = useApp();
  const { user } = useAuth();
  const { space } = useCoupleSpaceContext();

  const [entries, setEntries] = useState<CompletedEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const devState = useDevState();

  useEffect(() => {
    if (!user || !space) { setLoading(false); return; }

    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);

      // 1. Get all completed sessions
      const { data: sessions } = await supabase
        .from('couple_sessions')
        .select('id, card_id, category_id, started_at, ended_at')
        .eq('couple_space_id', space.id)
        .eq('status', 'completed')
        .order('started_at', { ascending: false });

      if (cancelled || !sessions?.length) { setLoading(false); return; }

      // 2. Get ALL non-empty reflections for these sessions
      const sessionIds = sessions.map(s => s.id);
      const { data: reflections } = await supabase
        .from('step_reflections')
        .select('session_id, text, step_index')
        .in('session_id', sessionIds)
        .neq('text', '')
        .order('step_index', { ascending: true });

      if (cancelled) return;

      // Build a map: session_id -> sorted reflections
      const reflectionMap = new Map<string, ReflectionRow[]>();
      for (const r of reflections || []) {
        if (!r.text?.trim()) continue;
        const list = reflectionMap.get(r.session_id) || [];
        list.push({ stepIndex: r.step_index, text: r.text });
        reflectionMap.set(r.session_id, list);
      }

      // 3. Get takeaways for these sessions
      const { data: takeaways } = await supabase
        .from('couple_takeaways')
        .select('session_id, content')
        .in('session_id', sessionIds)
        .neq('content', '');

      if (cancelled) return;

      const takeawayMap = new Map<string, string>();
      for (const t of takeaways || []) {
        if (t.content?.trim() && !takeawayMap.has(t.session_id)) {
          takeawayMap.set(t.session_id, t.content.trim());
        }
      }

      const built: CompletedEntry[] = sessions
        .filter(s => s.card_id)
        .map(s => {
          const card = getCardById(s.card_id!);
          const category = s.category_id ? getCategoryById(s.category_id) : null;
          const refs = reflectionMap.get(s.id) || [];
          return {
            sessionId: s.id,
            cardId: s.card_id!,
            cardTitle: card?.title || s.card_id!,
            categoryTitle: category?.title || '',
            completedAt: s.ended_at || s.started_at,
            excerpt: refs[0]?.text || '',
            reflections: refs,
            takeaway: takeawayMap.get(s.id) || '',
          };
        });

      setEntries(built);
      setLoading(false);
    };

    fetchData();
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
              {entries.map((entry, index) => {
                const isExpanded = expandedId === entry.sessionId;

                return (
                  <motion.div
                    key={entry.sessionId}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.1 + index * 0.03,
                      duration: 0.22,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                  >
                    {/* Collapsed header — always visible */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : entry.sessionId)}
                      className="w-full text-left group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
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
                        </div>

                        {entry.reflections.length > 0 && (
                          <ChevronDown
                            className="w-4 h-4 mt-1.5 flex-shrink-0 transition-transform duration-200"
                            style={{
                              color: 'var(--color-text-secondary)',
                              opacity: 0.3,
                              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                            }}
                          />
                        )}
                      </div>

                      {/* Excerpt — only when collapsed */}
                      {!isExpanded && entry.excerpt && (
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
                    </button>

                    {/* Expanded reflections */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                          className="overflow-hidden"
                        >
                          <div style={{ paddingTop: '16px', paddingLeft: '16px' }}>
                            {entry.reflections.map((ref, ri) => {
                              const question = getQuestionText(getCardById, entry.cardId, ref.stepIndex);

                              return (
                                <div key={ri}>
                                  {ri > 0 && (
                                    <div
                                      style={{
                                        height: '1px',
                                        background: 'hsl(var(--border) / 0.12)',
                                        margin: '16px 0',
                                      }}
                                    />
                                  )}

                                  {/* Question label */}
                                  {question && (
                                    <p
                                      className="type-meta"
                                      style={{
                                        color: 'var(--color-text-secondary)',
                                        opacity: 0.4,
                                        marginBottom: '6px',
                                        lineHeight: 1.5,
                                      }}
                                    >
                                      {question}
                                    </p>
                                  )}

                                  {/* Answer */}
                                  <p
                                    className="type-body font-serif whitespace-pre-wrap"
                                    style={{
                                      lineHeight: 1.8,
                                      color: 'var(--color-text-primary)',
                                      opacity: 0.75,
                                    }}
                                  >
                                    {ref.text}
                                  </p>
                                </div>
                              );
                            })}

                            {/* Takeaway */}
                            {entry.takeaway && (
                              <div>
                                <div
                                  style={{
                                    height: '1px',
                                    background: 'hsl(var(--border) / 0.15)',
                                    marginTop: '16px',
                                    marginBottom: '12px',
                                  }}
                                />
                                <p
                                  className="type-meta uppercase"
                                  style={{
                                    color: 'var(--color-text-secondary)',
                                    opacity: 0.55,
                                    letterSpacing: '0.06em',
                                    marginBottom: '6px',
                                  }}
                                >
                                  Ni bar med er:
                                </p>
                                <p
                                  className="font-serif italic whitespace-pre-wrap"
                                  style={{
                                    fontSize: '18px',
                                    lineHeight: 1.6,
                                    color: 'var(--foreground)',
                                    opacity: 0.85,
                                  }}
                                >
                                  {entry.takeaway}
                                </p>
                              </div>
                            )}

                            {/* Link to revisit full card */}
                            <button
                              onClick={() => navigate(`/card/${entry.cardId}?revisit=true&from=archive`)}
                              className="type-meta mt-6 mb-2 transition-opacity hover:opacity-60"
                              style={{
                                color: 'var(--color-text-secondary)',
                                opacity: 0.35,
                              }}
                            >
                              Visa hela samtalet →
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
}
