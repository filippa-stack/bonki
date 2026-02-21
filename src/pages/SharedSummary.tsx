import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import { supabase } from '@/integrations/supabase/client';
import { useDevState } from '@/contexts/DevStateContext';
import Header from '@/components/Header';
import ArchiveTakeaway from '@/components/ArchiveTakeaway';
import { ChevronRight, ChevronDown } from 'lucide-react';
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

/** Render text with bullet parsing for teamwork assignments */
function renderBulletText(text: string) {
  if (!text.includes('•')) {
    return <span>{text}</span>;
  }
  const items = text.split('•').map(s => s.trim()).filter(Boolean);
  const hasIntro = !text.startsWith('•');
  const intro = hasIntro ? items[0] : null;
  const listItems = hasIntro ? items.slice(1) : items;
  return (
    <div>
      {intro && <p style={{ marginBottom: '8px' }}>{intro}</p>}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {listItems.map((item, i) => (
          <li key={i} style={{
            paddingLeft: '12px',
            borderLeft: '2px solid rgba(196, 130, 45, 0.35)',
            marginBottom: '4px',
          }}>{item}</li>
        ))}
      </ul>
    </div>
  );
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

  // ─── Group entries by cardId ───
  interface GroupedEntry {
    cardId: string;
    cardTitle: string;
    categoryTitle: string;
    latest: CompletedEntry;
    older: CompletedEntry[];
  }

  const grouped = useMemo(() => {
    const map = new Map<string, GroupedEntry>();
    for (const entry of entries) {
      const existing = map.get(entry.cardId);
      if (existing) {
        existing.older.push(entry);
      } else {
        map.set(entry.cardId, {
          cardId: entry.cardId,
          cardTitle: entry.cardTitle,
          categoryTitle: entry.categoryTitle,
          latest: entry,
          older: [],
        });
      }
    }
    return Array.from(map.values());
  }, [entries]);

  // Helper: does a group have any notes (reflections or takeaway)?
  const groupHasNotes = (g: GroupedEntry) => {
    const check = (e: CompletedEntry) => e.reflections.length > 0 || e.takeaway.trim().length > 0;
    return check(g.latest) || g.older.some(check);
  };

  const withNotes = useMemo(() => grouped.filter(groupHasNotes), [grouped]);
  const withoutNotes = useMemo(() => grouped.filter(g => !groupHasNotes(g)), [grouped]);
  const bothExist = withNotes.length > 0 && withoutNotes.length > 0;

  // Track which groups have expanded reflections and which show older entries
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showOlderFor, setShowOlderFor] = useState<string | null>(null);

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
          <p className="type-body" style={{ color: 'var(--text-tertiary)' }}>
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
            <p
              className="font-serif text-center"
              style={{ fontSize: '22px', color: 'var(--text-primary)', opacity: 0.5 }}
            >
              Här finns det ni skrivit.
            </p>
            <p
              className="text-center mt-2"
              style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--text-tertiary)' }}
            >
              Era reflektioner samlas här efter varje samtal.
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
            <div className="flex flex-col" style={{ gap: '12px' }}>
              {/* Section 1: Sessions with notes */}
              {withNotes.map((group, index) => {
                const entry = group.latest;
                const isExpanded = expandedId === entry.sessionId;
                const olderCount = group.older.length;
                const showingOlder = showOlderFor === group.cardId;

                return (
                  <motion.div
                    key={group.cardId}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.1 + index * 0.03,
                      duration: 0.22,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                  >
                    <div
                      style={{
                        background: 'var(--surface-raised)',
                        borderRadius: '12px',
                        padding: '16px',
                      }}
                    >
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : entry.sessionId)}
                        className="w-full text-left"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p
                              className="font-serif"
                              style={{
                                fontSize: '20px',
                                color: 'var(--text-primary)',
                                fontWeight: 400,
                                lineHeight: 1.3,
                              }}
                            >
                              {entry.cardTitle}
                            </p>
                            <p
                              className="mt-1"
                              style={{
                                fontFamily: 'var(--font-sans)',
                                fontSize: '12px',
                                color: 'var(--accent-saffron)',
                                opacity: 0.75,
                              }}
                            >
                              {entry.categoryTitle}{entry.categoryTitle && ' · '}{formatDate(entry.completedAt)}
                            </p>
                          </div>
                          <ChevronRight
                            className="w-4 h-4 mt-1.5 flex-shrink-0 transition-transform duration-200"
                            style={{
                              color: '#C4821D',
                              opacity: 0.55,
                              transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                            }}
                          />
                        </div>
                        {!isExpanded && entry.excerpt && (
                          <p
                            className="mt-2"
                            style={{
                              fontFamily: 'Inter, sans-serif',
                              fontSize: '13px',
                              color: 'var(--text-secondary)',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              marginTop: '6px',
                            }}
                          >
                            {entry.excerpt}
                          </p>
                        )}
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                            className="overflow-hidden"
                          >
                            <div style={{ paddingTop: '16px', paddingLeft: '8px' }}>
                              {entry.reflections.map((ref, ri) => {
                                const question = getQuestionText(getCardById, entry.cardId, ref.stepIndex);
                                return (
                                  <div key={ri}>
                                    {ri > 0 && (
                                      <div style={{ height: '1px', background: 'hsl(var(--border) / 0.12)', margin: '16px 0' }} />
                                    )}
                                    {question && (
                                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 400, color: '#7A7067', marginBottom: '6px', lineHeight: 1.4 }}>
                                        {renderBulletText(question)}
                                      </p>
                                    )}
                                    <div className="font-serif whitespace-pre-wrap" style={{ fontSize: '20px', fontWeight: 500, lineHeight: 1.5, color: '#1C1B1A', marginBottom: '24px' }}>
                                      {renderBulletText(ref.text)}
                                    </div>
                                  </div>
                                );
                              })}

                              <div>
                                <div style={{ height: '1px', background: 'hsl(var(--border) / 0.15)', marginTop: '16px', marginBottom: '12px' }} />
                                <ArchiveTakeaway sessionId={entry.sessionId} initialText={entry.takeaway} />
                              </div>

                              <button
                                onClick={() => navigate(`/card/${entry.cardId}?from=archive`)}
                                className="type-meta mt-6 mb-2 transition-opacity hover:opacity-60"
                                style={{ color: 'var(--text-ghost)' }}
                              >
                                Visa hela samtalet →
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {olderCount > 0 && (
                        <div style={{ paddingTop: '4px' }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); setShowOlderFor(showingOlder ? null : group.cardId); }}
                            className="type-meta transition-opacity hover:opacity-60"
                            style={{ color: 'var(--text-tertiary)', marginTop: '4px' }}
                          >
                            {showingOlder ? 'Dölj tidigare' : `+ ${olderCount} tidigare samtal`}
                          </button>
                          <AnimatePresence>
                            {showingOlder && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                                className="overflow-hidden"
                              >
                                <div style={{ marginTop: '12px' }} className="flex flex-col">
                                  {group.older.map((older) => (
                                    <button
                                      key={older.sessionId}
                                      onClick={() => navigate(`/card/${older.cardId}?from=archive`)}
                                      className="w-full text-left"
                                      style={{ padding: '10px 8px', borderTop: '1px solid hsl(var(--border) / 0.08)' }}
                                    >
                                      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--text-tertiary)', opacity: 0.6 }}>
                                        {formatDate(older.completedAt)}
                                      </p>
                                      {older.excerpt && (
                                        <p
                                          className="type-body mt-1"
                                          style={{
                                            color: 'var(--text-secondary)',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            fontSize: '13px',
                                          }}
                                        >
                                          {older.excerpt}
                                        </p>
                                      )}
                                    </button>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {/* Divider + Section 2: Sessions without notes */}
              {bothExist && (
                <>
                  <div style={{ margin: '24px 0' }}>
                    <div style={{ height: '1px', background: 'hsl(var(--border) / 0.15)' }} />
                  </div>
                  <p
                    className="text-center"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: 'var(--text-tertiary)',
                      marginBottom: '16px',
                    }}
                  >
                    Avslutade utan anteckningar
                  </p>
                </>
              )}

              {withoutNotes.map((group, index) => {
                const entry = group.latest;
                return (
                  <motion.div
                    key={group.cardId}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.1 + (withNotes.length + index) * 0.03,
                      duration: 0.22,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                  >
                    <button
                      onClick={() => navigate(`/card/${entry.cardId}?from=archive`)}
                      className="w-full text-left"
                      style={{
                        background: 'var(--surface-raised)',
                        borderRadius: '12px',
                        padding: '16px',
                        opacity: 0.70,
                      }}
                    >
                      <p
                        className="font-serif"
                        style={{
                          fontSize: '20px',
                          color: 'var(--text-primary)',
                          fontWeight: 400,
                          lineHeight: 1.3,
                        }}
                      >
                        {entry.cardTitle}
                      </p>
                      <p
                        className="mt-1"
                        style={{
                          fontFamily: 'var(--font-sans)',
                          fontSize: '12px',
                          color: 'var(--accent-saffron)',
                          opacity: 0.75,
                        }}
                      >
                        {entry.categoryTitle}{entry.categoryTitle && ' · '}{formatDate(entry.completedAt)}
                      </p>
                    </button>
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
