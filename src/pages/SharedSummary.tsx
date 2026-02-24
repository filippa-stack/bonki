import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import { supabase } from '@/integrations/supabase/client';
import { useDevState } from '@/contexts/DevStateContext';
import ArchiveTakeaway from '@/components/ArchiveTakeaway';
import { ChevronRight } from 'lucide-react';
import Header from '@/components/Header';
import { RECOMMENDED_CATEGORY_ORDER } from '@/lib/recommendedOrder';
import { EMOTION, BEAT_1 } from '@/lib/motion';
import type { Prompt } from '@/types';

const ease = [0.4, 0, 0.2, 1] as const;

const CATEGORY_ACCENTS: Record<number, string> = {
  0: 'hsl(158, 35%, 22%)',
  1: 'hsl(38, 70%, 48%)',
  2: 'hsl(200, 30%, 38%)',
  3: 'hsl(10, 40%, 42%)',
  4: 'hsl(80, 25%, 35%)',
  5: 'hsl(28, 50%, 40%)',
  6: 'hsl(260, 20%, 40%)',
  7: 'hsl(45, 55%, 42%)',
  8: 'hsl(340, 30%, 40%)',
  9: 'hsl(170, 25%, 32%)',
};

function getCategoryAccent(categoryId: string): string {
  const idx = (RECOMMENDED_CATEGORY_ORDER as readonly string[]).indexOf(categoryId);
  return CATEGORY_ACCENTS[idx >= 0 ? idx : 0] ?? 'hsl(38, 70%, 48%)';
}

interface BookmarkRow {
  id: string;
  session_id: string;
  card_id: string;
  stage_index: number;
  prompt_index: number;
  question_text: string;
  bookmarked_at: string;
}

const STEP_ORDER = ['opening', 'reflective', 'scenario', 'exercise'] as const;

interface ReflectionRow {
  stepIndex: number;
  text: string;
}

interface CompletedEntry {
  sessionId: string;
  cardId: string;
  cardTitle: string;
  categoryId: string;
  categoryTitle: string;
  completedAt: string;
  excerpt: string;
  reflections: ReflectionRow[];
  takeaway: string;
}

function decodeStepIndex(encoded: number) {
  return { stageIndex: Math.floor(encoded / 100), promptIndex: encoded % 100 };
}

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

/** Get all questions from ALL stages with matching reflections.
 *  Reflections are stored with encoded step_index = stageIdx * 100 + promptIdx.
 *  Some legacy rows may have out-of-range prompt indexes within a stage.
 *  Those are reassigned to the next unanswered question in that stage.
 */
function getAllQuestionsWithReflections(
  getCardById: (id: string) => any,
  cardId: string,
  reflections: ReflectionRow[],
): { question: string; reflection: string | null; stageIndex: number }[] {
  const card = getCardById(cardId);
  if (!card) return [];

  const stageReflections = new Map<number, Array<{ local: number; text: string }>>();
  for (const r of reflections) {
    const stage = Math.floor(r.stepIndex / 100);
    const local = r.stepIndex % 100;
    const list = stageReflections.get(stage) || [];
    list.push({ local, text: r.text });
    stageReflections.set(stage, list);
  }

  const result: { question: string; reflection: string | null; stageIndex: number }[] = [];

  for (let stageIdx = 0; stageIdx < STEP_ORDER.length; stageIdx++) {
    const stageType = STEP_ORDER[stageIdx];
    const section = card.sections.find((s: any) => s.type === stageType);
    if (!section) continue;

    const prompts: (string | Prompt)[] = section.prompts ?? (section.content ? [section.content] : []);
    const stageRows = (stageReflections.get(stageIdx) || []).sort((a, b) => a.local - b.local);

    const rows = prompts
      .map((prompt) => {
        const questionText = typeof prompt === 'string' ? prompt : prompt.text;
        if (!questionText) return null;
        return { question: questionText, reflection: null as string | null, stageIndex: stageIdx };
      })
      .filter(Boolean) as { question: string; reflection: string | null; stageIndex: number }[];

    // 1) Exact local-index match when possible
    const overflow: string[] = [];
    for (const ref of stageRows) {
      if (ref.local >= 0 && ref.local < rows.length && rows[ref.local] && !rows[ref.local].reflection) {
        rows[ref.local].reflection = ref.text;
      } else {
        overflow.push(ref.text);
      }
    }

    // 2) Reassign out-of-range/duplicate indexes to first unanswered question
    for (const text of overflow) {
      const target = rows.find((r) => !r.reflection);
      if (target) target.reflection = text;
    }

    result.push(...rows);
  }

  return result;
}

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
            borderLeft: '2px solid hsla(38, 60%, 55%, 0.35)',
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

  const [bookmarks, setBookmarks] = useState<BookmarkRow[]>([]);

  const devState = useDevState();

  useEffect(() => {
    if (!user || !space) { setLoading(false); return; }

    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);

      const { data: sessions } = await supabase
        .from('couple_sessions')
        .select('id, card_id, category_id, started_at, ended_at')
        .eq('couple_space_id', space.id)
        .eq('status', 'completed')
        .order('started_at', { ascending: false });

      if (cancelled || !sessions?.length) { setLoading(false); return; }

      const sessionIds = sessions.map(s => s.id);
      const { data: reflections } = await supabase
        .from('step_reflections')
        .select('session_id, text, step_index')
        .in('session_id', sessionIds)
        .neq('text', '')
        .order('step_index', { ascending: true });

      if (cancelled) return;

      const reflectionMap = new Map<string, ReflectionRow[]>();
      for (const r of reflections || []) {
        if (!r.text?.trim()) continue;
        const list = reflectionMap.get(r.session_id) || [];
        list.push({ stepIndex: r.step_index, text: r.text });
        reflectionMap.set(r.session_id, list);
      }

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
            categoryId: s.category_id || '',
            categoryTitle: category?.title || '',
            completedAt: s.ended_at || s.started_at,
            excerpt: (takeawayMap.get(s.id) || refs[0]?.text || '').trim(),
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

  useEffect(() => {
    if (!user || !space) return;
    let cancelled = false;
    supabase
      .from('question_bookmarks' as any)
      .select('id, session_id, card_id, stage_index, prompt_index, question_text, bookmarked_at')
      .eq('couple_space_id', space.id)
      .eq('is_active', true)
      .order('bookmarked_at', { ascending: false })
      .then(({ data }) => {
        if (!cancelled && data) {
          setBookmarks(data as any as BookmarkRow[]);
        }
      });
    return () => { cancelled = true; };
  }, [user, space]);

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

  interface GroupedEntry {
    cardId: string;
    cardTitle: string;
    categoryId: string;
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
          categoryId: entry.categoryId,
          categoryTitle: entry.categoryTitle,
          latest: entry,
          older: [],
        });
      }
    }
    return Array.from(map.values());
  }, [entries]);

  const groupHasNotes = (g: GroupedEntry) => {
    const check = (e: CompletedEntry) => e.reflections.length > 0 || e.takeaway.trim().length > 0;
    return check(g.latest) || g.older.some(check);
  };

  const withNotes = useMemo(() => grouped.filter(groupHasNotes), [grouped]);
  const withoutNotes = useMemo(() => grouped.filter(g => !groupHasNotes(g)), [grouped]);
  const bothExist = withNotes.length > 0 && withoutNotes.length > 0;

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showOlderFor, setShowOlderFor] = useState<string | null>(null);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--surface-base)' }}>
      <Header showBack backTo="/" />

      <div className="px-5 pb-8 mx-auto" style={{ maxWidth: 540, paddingTop: '24px' }}>

        {/* Page title */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: EMOTION, ease }}
          className="font-serif text-center"
          style={{
            fontSize: '17px',
            color: 'var(--color-text-primary)',
            fontWeight: 500,
            marginBottom: '8px',
          }}
        >
          Era samtal
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: EMOTION, delay: BEAT_1, ease }}
          className="font-serif text-center"
          style={{
            fontSize: '16px',
            color: 'var(--color-text-secondary)',
            opacity: 0.65,
            marginBottom: '32px',
            marginTop: '8px',
          }}
        >
          Vad ni burit med er.
        </motion.p>

        {/* Empty state */}
        {!hasContent && !effectiveLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: EMOTION, ease }}
            className="text-center"
            style={{ marginTop: '48px' }}
          >
            <p
              className="font-serif"
              style={{
                fontSize: '15px',
                color: 'var(--color-text-tertiary)',
                opacity: 0.45,
                textAlign: 'center',
              }}
            >
              Era samtal visas här.
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
            <div className="flex flex-col" style={{ gap: '8px' }}>
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
                      delay: index * BEAT_1,
                      duration: EMOTION,
                      ease,
                    }}
                  >
                    <div
                      className="tile-door row-bloom relative"
                      style={{
                        backgroundColor: 'var(--surface-raised)',
                        border: '1px solid hsl(var(--neutral-300))',
                        borderRadius: '14px',
                        padding: '18px 16px 18px 20px',
                        borderLeft: `3px solid ${getCategoryAccent(group.categoryId)}`,
                      }}
                    >
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : entry.sessionId)}
                        className="w-full text-left"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            {entry.takeaway ? (
                              <>
                                <p
                                  className="font-serif"
                                  style={{
                                    fontSize: '17px',
                                    fontWeight: 500,
                                    color: 'var(--color-text-primary)',
                                    lineHeight: 1.5,
                                    marginBottom: '10px',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                  }}
                                >
                                  {entry.takeaway}
                                </p>
                                <p
                                  className="type-meta"
                                  style={{
                                    color: 'var(--color-text-tertiary)',
                                    opacity: 0.6,
                                  }}
                                >
                                  {entry.cardTitle}
                                </p>
                                <p
                                  className="type-meta"
                                  style={{
                                    color: 'var(--accent-text)',
                                    marginTop: '6px',
                                  }}
                                >
                                  {entry.categoryTitle}{entry.categoryTitle && ' · '}{formatDate(entry.completedAt)}
                                </p>
                              </>
                            ) : (
                              <>
                                <p
                                  className="font-serif"
                                  style={{
                                    fontSize: '17px',
                                    fontWeight: 500,
                                    color: 'var(--color-text-primary)',
                                    opacity: 0.6,
                                    lineHeight: 1.3,
                                  }}
                                >
                                  {entry.cardTitle}
                                </p>
                                <p
                                  className="type-meta"
                                  style={{
                                    color: 'var(--accent-text)',
                                    marginTop: '6px',
                                  }}
                                >
                                  {entry.categoryTitle}{entry.categoryTitle && ' · '}{formatDate(entry.completedAt)}
                                </p>
                              </>
                            )}
                          </div>
                          <ChevronRight
                            data-chevron
                            className="w-4 h-4 mt-1.5 flex-shrink-0"
                            style={{
                              color: 'var(--accent-saffron)',
                              opacity: 0.55,
                              transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                              transition: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                            }}
                          />
                        </div>
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2, ease }}
                            className="overflow-hidden"
                          >
                            <div style={{ paddingTop: '16px', paddingLeft: '8px' }}>
                              {getAllQuestionsWithReflections(getCardById, entry.cardId, entry.reflections).map((item, qi) => (
                                <div key={qi}>
                                  {qi > 0 && (
                                    <div style={{ height: '1px', background: 'hsl(var(--border) / 0.12)', margin: '16px 0' }} />
                                  )}
                                  <p
                                    className="type-body"
                                    style={{
                                      fontSize: '13px',
                                      color: 'var(--color-text-tertiary)',
                                      marginBottom: '6px',
                                      lineHeight: 1.4,
                                    }}
                                  >
                                    {renderBulletText(item.question)}
                                  </p>
                                  {item.reflection && (
                                    <div
                                      className="font-serif whitespace-pre-wrap"
                                      style={{
                                        fontSize: '20px',
                                        fontWeight: 500,
                                        lineHeight: 1.5,
                                        color: 'var(--color-text-primary)',
                                        marginBottom: '8px',
                                      }}
                                    >
                                      {renderBulletText(item.reflection)}
                                    </div>
                                  )}
                                </div>
                              ))}

                              <div>
                                <div style={{ height: '1px', background: 'hsl(var(--border) / 0.15)', marginTop: '16px', marginBottom: '12px' }} />
                                <ArchiveTakeaway sessionId={entry.sessionId} initialText={entry.takeaway} />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {olderCount > 0 && (
                        <div style={{ paddingTop: '4px' }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); setShowOlderFor(showingOlder ? null : group.cardId); }}
                            className="type-meta"
                            style={{
                              color: 'var(--color-text-tertiary)',
                              marginTop: '4px',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: 0,
                              transition: 'opacity 150ms ease',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.6'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                          >
                            {showingOlder ? 'Dölj tidigare' : `+ ${olderCount} tidigare samtal`}
                          </button>
                          <AnimatePresence>
                            {showingOlder && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2, ease }}
                                className="overflow-hidden"
                              >
                                <div style={{ marginTop: '12px' }} className="flex flex-col">
                                  {group.older.map((older) => (
                                    <button
                                      key={older.sessionId}
                                      onClick={() => navigate(`/card/${older.cardId}?from=archive`)}
                                      className="w-full text-left"
                                      style={{
                                        padding: '10px 8px',
                                        borderTop: '1px solid hsl(var(--border) / 0.08)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                      }}
                                    >
                                      <p className="type-meta" style={{ color: 'var(--color-text-tertiary)', opacity: 0.6 }}>
                                        {formatDate(older.completedAt)}
                                      </p>
                                      {older.excerpt && (
                                        <p
                                          className="font-serif mt-1"
                                          style={{
                                            color: 'var(--color-text-secondary)',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            fontSize: '15px',
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

              {/* Bookmarked questions section */}
              {bookmarks.length > 0 && (
                <>
                  <div style={{ margin: '24px 0' }}>
                    <div style={{ height: '1px', background: 'hsl(var(--border) / 0.15)' }} />
                  </div>
                  <p
                    className="type-meta text-center"
                    style={{
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: 'var(--color-text-tertiary)',
                      marginBottom: '16px',
                    }}
                  >
                    Frågor ni velat återvända till
                  </p>
                  <div className="flex flex-col" style={{ gap: '8px' }}>
                    {bookmarks.map((bm, bmIdx) => {
                      const card = getCardById(bm.card_id);
                      const category = card?.categoryId ? getCategoryById(card.categoryId) : null;
                      return (
                        <motion.div
                          key={bm.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            delay: bmIdx * BEAT_1,
                            duration: EMOTION,
                            ease,
                          }}
                        >
                          <div
                            className="tile-door row-bloom relative"
                            style={{
                              background: 'var(--surface-raised)',
                              border: '1px solid hsl(var(--neutral-300))',
                              borderRadius: '12px',
                              padding: '16px',
                            }}
                          >
                            <p
                              className="font-serif"
                              style={{
                                fontSize: '16px',
                                fontWeight: 700,
                                color: 'var(--color-text-primary)',
                                lineHeight: 1.4,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {bm.question_text}
                            </p>
                            <p
                              className="type-meta"
                              style={{
                                color: 'var(--accent-text)',
                                opacity: 0.7,
                                marginTop: '8px',
                              }}
                            >
                              {card?.title ?? bm.card_id}{' · '}{formatDate(bm.bookmarked_at)}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Divider + Section 2: Sessions without notes */}
              {bothExist && (
                <>
                  <div style={{ margin: '24px 0' }}>
                    <div style={{ height: '1px', background: 'hsl(var(--border) / 0.15)' }} />
                  </div>
                  <p
                    className="type-meta text-center"
                    style={{
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: 'var(--color-text-tertiary)',
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
                      delay: (withNotes.length + index) * BEAT_1,
                      duration: EMOTION,
                      ease,
                    }}
                  >
                    <div
                      className="w-full text-left"
                      style={{
                        backgroundColor: 'var(--surface-raised)',
                        border: '1px solid hsl(var(--neutral-300))',
                        borderRadius: '14px',
                        padding: '18px 16px 18px 20px',
                        borderLeft: `3px solid ${getCategoryAccent(group.categoryId)}`,
                        opacity: 0.55,
                      }}
                    >
                      <p
                        className="font-serif"
                        style={{
                          fontSize: '15px',
                          fontWeight: 500,
                          color: 'var(--color-text-primary)',
                          lineHeight: 1.3,
                        }}
                      >
                        {entry.cardTitle}
                      </p>
                      <p
                        className="type-meta"
                        style={{
                          color: 'var(--color-text-tertiary)',
                          marginTop: '6px',
                        }}
                      >
                        {entry.categoryTitle}{entry.categoryTitle && ' · '}{formatDate(entry.completedAt)}
                      </p>
                    </div>
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
