import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronDown, Check } from 'lucide-react';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import { supabase } from '@/integrations/supabase/client';
import {
  MIDNIGHT_INK,
  LANTERN_GLOW,
  DRIFTWOOD,
  DEEP_DUSK,
  DEEP_SAFFRON,
  SAFFRON_FLAME,
} from '@/lib/palette';
import { cards as stillUsCards, categories as stillUsCategories } from '@/data/content';
import { allProducts } from '@/data/products';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const STILL_US_ID = 'still_us';

/** Determine the effective product type using card_id as source of truth */
function isKidsCard(cardId: string | null): boolean {
  if (!cardId) return false;
  // Check if the card belongs to any kids product manifest
  return allProducts.some(p => p.cards.some(c => c.id === cardId));
}

function effectiveIsPar(productId: string, cardId: string | null): boolean {
  // Card-level check takes priority over potentially stale product_id
  if (cardId && isKidsCard(cardId)) return false;
  return productId === STILL_US_ID;
}

const STILL_US_STEP_NAMES = ['Öppna', 'Vänd', 'Tänk om', 'Gör'];
const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;

type FilterChip = 'barn' | 'par';

interface CompletedSession {
  id: string;
  card_id: string | null;
  product_id: string;
  ended_at: string | null;
  category_id: string | null;
}

interface PausedSession {
  id: string;
  card_id: string | null;
  product_id: string;
  category_id: string | null;
  started_at: string;
  last_activity_at: string;
  currentStepIndex: number;
}

interface Bookmark {
  id: string;
  card_id: string;
  product_id: string;
  question_text: string;
}

interface NoteEntry {
  type: 'note';
  id: string;
  text: string;
  questionText: string | null; // null = reflection
  cardId: string;
  cardName: string;
  categoryName: string;
  productId: string;
  date: string; // ISO
  sessionId: string;
}

interface CompletedMarker {
  type: 'completed';
  id: string;
  cardId: string;
  cardName: string;
  productId: string;
  date: string;
}

type TimelineItem = NoteEntry | CompletedMarker;

const SWEDISH_MONTHS = [
  'januari', 'februari', 'mars', 'april', 'maj', 'juni',
  'juli', 'augusti', 'september', 'oktober', 'november', 'december',
];

function getCardTitle(cardId: string): string {
  const suCard = stillUsCards.find(c => c.id === cardId);
  if (suCard) return suCard.title;
  for (const prod of allProducts) {
    const card = prod.cards.find(c => c.id === cardId);
    if (card) return card.title;
  }
  return cardId;
}

function getCategoryName(categoryId: string | null, cardId: string): string {
  if (categoryId) {
    const suCat = stillUsCategories.find(c => c.id === categoryId);
    if (suCat) return suCat.title;
    for (const prod of allProducts) {
      const cat = prod.categories.find(c => c.id === categoryId);
      if (cat) return cat.title;
    }
  }
  // Derive from card
  const suCard = stillUsCards.find(c => c.id === cardId);
  if (suCard) {
    const cat = stillUsCategories.find(c => c.id === suCard.categoryId);
    if (cat) return cat.title;
  }
  for (const prod of allProducts) {
    const card = prod.cards.find(c => c.id === cardId);
    if (card) {
      const cat = prod.categories.find(c => c.id === card.categoryId);
      if (cat) return cat.title;
    }
  }
  return '';
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'idag';
  if (diffDays === 1) return 'igår';
  if (diffDays < 7) {
    return ['söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag'][date.getDay()];
  }
  return `${date.getDate()} ${SWEDISH_MONTHS[date.getMonth()]}`;
}

function formatFullDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 7) return formatRelativeDate(dateStr);
  return `${date.getDate()} ${SWEDISH_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

function monthKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
}

function monthLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return `${SWEDISH_MONTHS[d.getMonth()].toUpperCase()} ${d.getFullYear()}`;
}

function getProductColor(productId: string, cardId?: string): string {
  return effectiveIsPar(productId, cardId ?? null) ? DEEP_SAFFRON : SAFFRON_FLAME;
}

// ─── Note Entry Card ───
function NoteEntryCard({ entry, navigate }: { entry: NoteEntry; navigate: (p: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = entry.text.length > 200;

  return (
    <div
      style={{
        backgroundColor: DEEP_DUSK,
        borderRadius: '16px',
        borderLeft: `3px solid ${getProductColor(entry.productId)}`,
        padding: '16px',
      }}
    >
      {/* Note text */}
      <div style={{ position: 'relative' }}>
        <p
          style={{
            margin: 0,
            fontSize: '17px',
            color: LANTERN_GLOW,
            lineHeight: 1.5,
            ...(isLong && !expanded ? {
              display: '-webkit-box',
              WebkitLineClamp: 4,
              WebkitBoxOrient: 'vertical' as const,
              overflow: 'hidden',
            } : {}),
          }}
        >
          {entry.text}
        </p>
        {isLong && !expanded && (
          <button
            onClick={() => setExpanded(true)}
            style={{
              background: 'none',
              border: 'none',
              color: DEEP_SAFFRON,
              fontSize: '13px',
              cursor: 'pointer',
              padding: 0,
              marginTop: '4px',
            }}
          >
            Läs mer
          </button>
        )}
        {isLong && expanded && (
          <button
            onClick={() => setExpanded(false)}
            style={{
              background: 'none',
              border: 'none',
              color: DEEP_SAFFRON,
              fontSize: '13px',
              cursor: 'pointer',
              padding: 0,
              marginTop: '4px',
            }}
          >
            Visa mindre
          </button>
        )}
      </div>

      {/* Question anchor */}
      <p
        style={{
          margin: '8px 0 0',
          fontSize: '14px',
          fontStyle: 'italic',
          color: DRIFTWOOD,
          lineHeight: 1.4,
        }}
      >
        — {entry.questionText ?? 'Reflektion efter samtalet'}
      </p>

      {/* Metadata */}
      <p
        style={{
          margin: '8px 0 0',
          fontSize: '12px',
          color: DRIFTWOOD,
          lineHeight: 1.4,
        }}
      >
        {entry.cardName} · {entry.categoryName} · {formatFullDate(entry.date)}
      </p>
    </div>
  );
}

// ─── Completed-no-note marker ───
function CompletedMarkerRow({ marker }: { marker: CompletedMarker }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        paddingLeft: '8px',
      }}
    >
      <div
        style={{
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          backgroundColor: DEEP_SAFFRON,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Check size={10} strokeWidth={2.5} color={LANTERN_GLOW} />
      </div>
      <span style={{ fontSize: '14px', color: DRIFTWOOD }}>
        {marker.cardName}
      </span>
    </div>
  );
}

export default function Journal() {
  const navigate = useNavigate();
  const { space } = useCoupleSpaceContext();

  const [sessions, setSessions] = useState<CompletedSession[] | null>(null);
  const [takeaways, setTakeaways] = useState<any[] | null>(null);
  const [reflections, setReflections] = useState<any[] | null>(null);
  const [pausedSessions, setPausedSessions] = useState<PausedSession[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [activeFilters, setActiveFilters] = useState<Set<FilterChip>>(new Set(['barn', 'par']));
  const [parExpanded, setParExpanded] = useState(false);

  // Fetch data
  useEffect(() => {
    if (!space?.id) {
      setSessions([]);
      setTakeaways([]);
      setReflections([]);
      setPausedSessions([]);
      setBookmarks([]);
      return;
    }
    let cancelled = false;

    // Sessions
    supabase
      .from('couple_sessions')
      .select('id, card_id, product_id, ended_at, category_id')
      .eq('couple_space_id', space.id)
      .eq('status', 'completed')
      .order('ended_at', { ascending: false })
      .then(({ data }) => { if (!cancelled) setSessions(data ?? []); });

    // Takeaways (session-level notes)
    supabase
      .from('couple_takeaways')
      .select('id, session_id, content, created_at, speaker_label')
      .eq('couple_space_id', space.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (!cancelled) setTakeaways(data ?? []); });

    // Step reflections (per-step notes)
    supabase
      .from('step_reflections')
      .select('id, session_id, step_index, text, updated_at, speaker_label, product_id')
      .neq('text', '')
      .order('updated_at', { ascending: false })
      .then(({ data }) => { if (!cancelled) setReflections(data ?? []); });

    // Paused/active sessions (not completed)
    supabase
      .from('couple_sessions')
      .select('id, card_id, product_id, category_id, started_at, last_activity_at')
      .eq('couple_space_id', space.id)
      .eq('status', 'active')
      .order('last_activity_at', { ascending: false })
      .then(async ({ data }) => {
        if (cancelled || !data) { setPausedSessions([]); return; }
        const now = Date.now();
        const valid = data.filter(s => {
          // Kids sessions expire after 14 days
          if (!effectiveIsPar(s.product_id, s.card_id)) {
            const elapsed = now - new Date(s.last_activity_at).getTime();
            if (elapsed > FOURTEEN_DAYS_MS) return false;
          }
          return true;
        });
        // Get current step index for each session
        const sessionsWithStep: PausedSession[] = [];
        for (const s of valid) {
          // Find max completed step
          const { data: completions } = await supabase
            .from('couple_session_completions')
            .select('step_index')
            .eq('session_id', s.id)
            .order('step_index', { ascending: false })
            .limit(1);
          const maxStep = completions?.[0]?.step_index ?? -1;
          sessionsWithStep.push({
            id: s.id,
            card_id: s.card_id,
            product_id: s.product_id,
            category_id: s.category_id,
            started_at: s.started_at,
            last_activity_at: s.last_activity_at,
            currentStepIndex: maxStep + 1,
          });
        }
        if (!cancelled) setPausedSessions(sessionsWithStep);
      });

    // Bookmarked questions
    supabase
      .from('question_bookmarks')
      .select('id, card_id, product_id, question_text')
      .eq('couple_space_id', space.id)
      .eq('is_active', true)
      .order('bookmarked_at', { ascending: false })
      .then(({ data }) => { if (!cancelled) setBookmarks(data ?? []); });

    return () => { cancelled = true; };
  }, [space?.id]);

  const loading = sessions === null || takeaways === null || reflections === null;
  const isEmpty = !loading && sessions!.length === 0;

  const stillUsSessions = useMemo(() => {
    if (!sessions) return [];
    return sessions.filter(s => effectiveIsPar(s.product_id, s.card_id));
  }, [sessions]);

  // Build session lookup
  const sessionMap = useMemo(() => {
    const map = new Map<string, CompletedSession>();
    sessions?.forEach(s => map.set(s.id, s));
    return map;
  }, [sessions]);

  // Build timeline items
  const allTimelineItems = useMemo(() => {
    if (loading) return [];

    const items: TimelineItem[] = [];
    const sessionsWithNotes = new Set<string>();

    // Add takeaways as notes
    takeaways?.forEach(t => {
      if (!t.content?.trim()) return;
      const session = sessionMap.get(t.session_id);
      if (!session || !session.card_id || !session.ended_at) return;
      sessionsWithNotes.add(session.id);
      items.push({
        type: 'note',
        id: `takeaway-${t.id}`,
        text: t.content,
        questionText: null, // takeaway = reflection
        cardId: session.card_id,
        cardName: getCardTitle(session.card_id),
        categoryName: getCategoryName(session.category_id, session.card_id),
        productId: session.product_id,
        date: t.created_at,
        sessionId: session.id,
      });
    });

    // Add step reflections as notes
    reflections?.forEach(r => {
      if (!r.text?.trim()) return;
      const session = sessionMap.get(r.session_id);
      if (!session || !session.card_id || !session.ended_at) return;
      sessionsWithNotes.add(session.id);
      items.push({
        type: 'note',
        id: `reflection-${r.id}`,
        text: r.text,
        questionText: null, // We don't have the exact question text easily here
        cardId: session.card_id,
        cardName: getCardTitle(session.card_id),
        categoryName: getCategoryName(session.category_id, session.card_id),
        productId: session.product_id,
        date: r.updated_at,
        sessionId: session.id,
      });
    });

    // Add completed-no-note markers
    sessions?.forEach(s => {
      if (!s.card_id || !s.ended_at) return;
      if (sessionsWithNotes.has(s.id)) return;
      items.push({
        type: 'completed',
        id: `completed-${s.id}`,
        cardId: s.card_id,
        cardName: getCardTitle(s.card_id),
        productId: s.product_id,
        date: s.ended_at,
      });
    });

    // Sort by date desc
    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return items;
  }, [loading, takeaways, reflections, sessions, sessionMap]);

  // Filter by active chips + privacy logic
  const visibleItems = useMemo(() => {
    const bothActive = activeFilters.has('barn') && activeFilters.has('par');
    return allTimelineItems.filter(item => {
      const isPar = effectiveIsPar(item.productId, item.cardId);
      if (isPar) {
        if (!activeFilters.has('par')) return false;
        // When both active, par entries hidden behind privacy row (unless expanded)
        if (bothActive && !parExpanded) return false;
        return true;
      }
      return activeFilters.has('barn');
    });
  }, [allTimelineItems, activeFilters, parExpanded]);

  // Group by month
  const monthGroups = useMemo(() => {
    const groups: { key: string; label: string; items: TimelineItem[] }[] = [];
    const map = new Map<string, TimelineItem[]>();

    visibleItems.forEach(item => {
      const key = monthKey(item.date);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    });

    // Sort months descending
    const sortedKeys = [...map.keys()].sort((a, b) => b.localeCompare(a));
    sortedKeys.forEach(key => {
      const items = map.get(key)!;
      groups.push({ key, label: monthLabel(items[0].date), items });
    });

    return groups;
  }, [visibleItems]);

  // Pulse card data
  const filteredSessions = useMemo(() => {
    if (!sessions) return [];
    return sessions.filter(s => {
      const isPar = effectiveIsPar(s.product_id, s.card_id);
      if (isPar) return activeFilters.has('par');
      return activeFilters.has('barn');
    });
  }, [sessions, activeFilters]);

  const pulseData = useMemo(() => {
    if (!filteredSessions.length) return null;
    const total = filteredSessions.length;
    const latest = filteredSessions[0];
    const oldest = filteredSessions[filteredSessions.length - 1];
    const oldestDate = oldest.ended_at ? new Date(oldest.ended_at) : new Date();
    const now = new Date();
    const sameMonth = oldestDate.getMonth() === now.getMonth() && oldestDate.getFullYear() === now.getFullYear();
    const monthLbl = sameMonth ? 'den här månaden' : SWEDISH_MONTHS[oldestDate.getMonth()];
    const latestCardName = latest.card_id ? getCardTitle(latest.card_id) : 'Okänt';
    const latestRelDate = latest.ended_at ? formatRelativeDate(latest.ended_at) : '';
    const uniqueProducts = new Set(filteredSessions.map(s => s.product_id));
    return {
      total, monthLabel: monthLbl,
      latestCardId: latest.card_id, latestCardName, latestRelDate,
      uniqueProductCount: uniqueProducts.size,
    };
  }, [filteredSessions]);

  const showParPrivacy = activeFilters.has('barn') && activeFilters.has('par') && stillUsSessions.length > 0;

  // Filtered paused sessions
  const filteredPaused = useMemo(() => {
    return pausedSessions.filter(s => {
      const isPar = effectiveIsPar(s.product_id, s.card_id);
      return isPar ? activeFilters.has('par') : activeFilters.has('barn');
    });
  }, [pausedSessions, activeFilters]);

  // Filtered bookmarks
  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter(b => {
      const isPar = effectiveIsPar(b.product_id, b.card_id);
      return isPar ? activeFilters.has('par') : activeFilters.has('barn');
    });
  }, [bookmarks, activeFilters]);

  const toggleFilter = (chip: FilterChip) => {
    setActiveFilters(prev => {
      if (prev.has(chip) && prev.size === 1) return prev;
      const next = new Set(prev);
      next.has(chip) ? next.delete(chip) : next.add(chip);
      return next;
    });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: MIDNIGHT_INK, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        style={{
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 60px)',
          textAlign: 'center',
          paddingLeft: '24px',
          paddingRight: '24px',
        }}
      >
        <h1 style={{
          fontFamily: "'DM Serif Display', var(--font-serif)",
          fontSize: '28px', fontWeight: 600, color: LANTERN_GLOW, margin: 0, lineHeight: 1.2,
        }}>
          Era samtal
        </h1>
        <p style={{
          fontFamily: 'var(--font-serif)', fontSize: '14px', fontStyle: 'italic',
          color: DRIFTWOOD, marginTop: '8px', lineHeight: 1.4,
        }}>
          Vad ni burit med er.
        </p>
      </motion.div>

      {/* Filter chips */}
      {!isEmpty && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4, ease: EASE }}
          style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}
        >
          {(['barn', 'par'] as const).map(chip => {
            const active = activeFilters.has(chip);
            return (
              <button
                key={chip}
                onClick={() => toggleFilter(chip)}
                style={{
                  height: '32px', paddingLeft: '16px', paddingRight: '16px', borderRadius: '12px',
                  border: `1px solid ${DRIFTWOOD}`,
                  backgroundColor: active ? DEEP_DUSK : 'transparent',
                  color: active ? LANTERN_GLOW : DRIFTWOOD,
                  fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 500,
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  cursor: 'pointer', transition: 'all 200ms ease',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                {chip === 'barn' ? 'Barn' : 'Par'}
              </button>
            );
          })}
        </motion.div>
      )}

      {/* Content */}
      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: `${DRIFTWOOD}33` }} className="animate-pulse" />
        </div>
      ) : isEmpty ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5, ease: EASE }}
            style={{ textAlign: 'center', padding: '0 32px' }}
          >
            <p style={{
              fontFamily: "'DM Serif Display', var(--font-serif)",
              fontSize: '20px', color: LANTERN_GLOW, margin: 0, lineHeight: 1.3,
            }}>
              Det finns inget här ännu.
            </p>
            <p style={{
              fontFamily: 'var(--font-serif)', fontSize: '15px', fontStyle: 'italic',
              color: DRIFTWOOD, marginTop: '16px', lineHeight: 1.4,
            }}>
              Varje samtal ni har lämnar ett spår.
            </p>
          </motion.div>
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 0px))' }}>
          {/* Pulse Card */}
          {pulseData && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5, ease: EASE }}
              style={{
                margin: '24px 16px 0', backgroundColor: DEEP_DUSK,
                borderRadius: '16px', borderLeft: `3px solid ${DEEP_SAFFRON}`, padding: '16px',
              }}
            >
              <p style={{ margin: 0, fontSize: '16px', color: LANTERN_GLOW, lineHeight: 1.4 }}>
                Ni har haft <span style={{ fontWeight: 600 }}>{pulseData.total}</span> samtal sedan {pulseData.monthLabel}.
              </p>
              <p style={{ margin: '6px 0 0', fontSize: '14px', color: DRIFTWOOD, lineHeight: 1.4 }}>
                Senast:{' '}
                <span
                  onClick={() => pulseData.latestCardId && navigate(`/card/${pulseData.latestCardId}`)}
                  style={{
                    fontWeight: 600,
                    cursor: pulseData.latestCardId ? 'pointer' : 'default',
                    textDecoration: pulseData.latestCardId ? 'underline' : 'none',
                    textDecorationColor: `${DRIFTWOOD}66`, textUnderlineOffset: '2px',
                  }}
                >
                  {pulseData.latestCardName}
                </span>
                {' · '}{pulseData.latestRelDate}.
              </p>
              {pulseData.uniqueProductCount > 1 && (
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: DRIFTWOOD, lineHeight: 1.4 }}>
                  I {pulseData.uniqueProductCount} olika samtalsprodukter
                </p>
              )}
            </motion.div>
          )}

          {/* Par Privacy Row */}
          {showParPrivacy && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4, ease: EASE }}
              style={{ margin: '12px 16px 0' }}
            >
              <button
                onClick={() => setParExpanded(prev => !prev)}
                style={{
                  width: '100%', backgroundColor: DEEP_DUSK, borderRadius: '12px',
                  padding: '12px 14px', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <span style={{ fontSize: '15px', color: DRIFTWOOD, textAlign: 'left' }}>
                  {parExpanded ? 'Dölj parsamtal' : `Ni har ${stillUsSessions.length} parsamtal sparade`}
                </span>
                <span style={{ color: DRIFTWOOD, display: 'flex' }}>
                  {parExpanded ? <ChevronDown size={18} strokeWidth={1.5} /> : <ChevronRight size={18} strokeWidth={1.5} />}
                </span>
              </button>
            </motion.div>
          )}

          {/* Timeline */}
          {monthGroups.map(group => (
            <div key={group.key}>
              {/* Month header */}
              <p style={{
                margin: '32px 0 12px 16px', fontSize: '12px', fontWeight: 600,
                letterSpacing: '2px', color: DRIFTWOOD, lineHeight: 1,
              }}>
                {group.label}
              </p>

              {/* Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '0 16px' }}>
                {group.items.map(item =>
                  item.type === 'note' ? (
                    <NoteEntryCard key={item.id} entry={item} navigate={navigate} />
                  ) : (
                    <CompletedMarkerRow key={item.id} marker={item} />
                  )
                )}
              </div>
            </div>
          ))}

          {/* ── Paused Sessions ── */}
          {filteredPaused.length > 0 && (
            <div>
              <p style={{
                margin: '40px 0 12px 16px', fontSize: '12px', fontWeight: 600,
                letterSpacing: '2px', color: DRIFTWOOD, lineHeight: 1, textTransform: 'uppercase',
              }}>
                Samtal ni inte avslutat
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '0 16px' }}>
                {filteredPaused.map(s => {
                  const cardName = s.card_id ? getCardTitle(s.card_id) : 'Okänt samtal';
                  const catName = getCategoryName(s.category_id, s.card_id ?? '');
                  const stepName = effectiveIsPar(s.product_id, s.card_id)
                    ? (STILL_US_STEP_NAMES[s.currentStepIndex] ?? `Steg ${s.currentStepIndex + 1}`)
                    : `Fråga ${s.currentStepIndex + 1}`;

                  return (
                    <button
                      key={s.id}
                      onClick={() => s.card_id && navigate(`/card/${s.card_id}`)}
                      style={{
                        width: '100%', backgroundColor: DEEP_DUSK, borderRadius: '16px',
                        padding: '16px', cursor: 'pointer',
                        borderTop: 'none', borderRight: 'none', borderBottom: 'none',
                        borderLeft: `3px solid ${getProductColor(s.product_id)}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        textAlign: 'left', WebkitTapHighlightColor: 'transparent',
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <span style={{
                          fontSize: '17px', fontWeight: 600, color: LANTERN_GLOW,
                          display: 'block', lineHeight: 1.3,
                        }}>
                          {cardName}
                        </span>
                        <span style={{
                          fontSize: '13px', color: DRIFTWOOD, display: 'block', marginTop: '4px',
                        }}>
                          Pausad vid {stepName} · {catName}
                        </span>
                      </div>
                      <span style={{ fontSize: '15px', color: DEEP_SAFFRON, flexShrink: 0, marginLeft: '12px' }}>
                        Fortsätt
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Bookmarked Questions ── */}
          {filteredBookmarks.length > 0 && (
            <div>
              <p style={{
                margin: '40px 0 12px 16px', fontSize: '12px', fontWeight: 600,
                letterSpacing: '2px', color: DRIFTWOOD, lineHeight: 1, textTransform: 'uppercase',
              }}>
                Frågor ni velat återvända till
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '0 16px' }}>
                {filteredBookmarks.map(b => {
                  const cardName = getCardTitle(b.card_id);
                  const catName = getCategoryName(null, b.card_id);

                  return (
                    <button
                      key={b.id}
                      onClick={() => navigate(`/card/${b.card_id}`)}
                      style={{
                        width: '100%', backgroundColor: DEEP_DUSK, borderRadius: '16px',
                        padding: '16px', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        textAlign: 'left', WebkitTapHighlightColor: 'transparent',
                      }}
                    >
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <span style={{
                          fontSize: '17px', color: LANTERN_GLOW,
                          display: 'block', lineHeight: 1.4,
                        }}>
                          {b.question_text}
                        </span>
                        <span style={{
                          fontSize: '13px', color: DRIFTWOOD, display: 'block', marginTop: '8px',
                        }}>
                          {cardName} · {catName}
                        </span>
                      </div>
                      <ChevronRight size={18} strokeWidth={1.5} style={{ color: DRIFTWOOD, flexShrink: 0, marginLeft: '8px' }} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bottom spacer */}
          <div style={{ height: '120px' }} />
        </div>
      )}
    </div>
  );
}
