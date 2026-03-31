import { useState, useEffect, useMemo } from 'react';
import { usePageBackground } from '@/hooks/usePageBackground';
import { useDefaultTheme } from '@/hooks/useDefaultTheme';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronDown, Check, Bookmark, Play } from 'lucide-react';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import { supabase } from '@/integrations/supabase/client';
import {
  MIDNIGHT_INK,
  LANTERN_GLOW,
  DRIFTWOOD,
  DEEP_DUSK,
  DEEP_SAFFRON,
  productTileColors,
} from '@/lib/palette';
import { cards as stillUsCards, categories as stillUsCategories } from '@/data/content';
import { allProducts } from '@/data/products';
import { isDemoMode } from '@/lib/demoMode';
import { useDevState } from '@/contexts/DevStateContext';
import { DEMO_DIARY_EVENT } from '@/lib/demoDiary';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const STILL_US_ID = 'still_us';

/** Determine the effective product type using card_id as source of truth */
function isKidsCard(cardId: string | null): boolean {
  if (!cardId) return false;
  // Check if the card belongs to any NON-Still-Us product manifest
  return allProducts
    .filter(p => p.id !== STILL_US_ID)
    .some(p => p.cards.some(c => c.id === cardId));
}

function isStillUsCard(cardId: string | null): boolean {
  if (!cardId) return false;
  const suProduct = allProducts.find(p => p.id === STILL_US_ID);
  return suProduct?.cards.some(c => c.id === cardId) ?? false;
}

function effectiveIsPar(productId: string, cardId: string | null): boolean {
  // Card-level check takes priority over potentially stale product_id
  if (cardId && isStillUsCard(cardId)) return true;
  if (cardId && isKidsCard(cardId)) return false;
  return productId === STILL_US_ID;
}


type FilterChip = 'barn' | 'par';

interface CompletedSession {
  id: string;
  card_id: string | null;
  product_id: string;
  ended_at: string | null;
  category_id: string | null;
  status: string;
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

interface DemoDiaryEntry {
  cardId: string;
  text: string;
  date: string;
  type?: string;
}

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

function getProductName(productId: string, cardId?: string): string {
  if (cardId) {
    const prod = allProducts.find(p => p.cards.some(c => c.id === cardId));
    if (prod) return prod.name;
  }
  const prod = allProducts.find(p => p.id === productId);
  return prod?.name ?? '';
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


function monthKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
}

function monthLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return `${SWEDISH_MONTHS[d.getMonth()].toUpperCase()} ${d.getFullYear()}`;
}

function getProductAccent(productId: string, cardId?: string): { light: string; mid: string; deep: string } {
  // Resolve effective product from card if needed
  let effectiveProduct = productId;
  if (cardId) {
    for (const prod of allProducts) {
      if (prod.cards.some(c => c.id === cardId)) {
        effectiveProduct = prod.id;
        break;
      }
    }
  }
  // Map product ID to palette key (products use underscores in palette)
  const paletteKey = effectiveProduct.replace(/-/g, '_');
  const colors = productTileColors[paletteKey];
  return colors
    ? { light: colors.tileLight, mid: colors.tileMid, deep: colors.tileDeep }
    : { light: DEEP_SAFFRON, mid: DEEP_SAFFRON, deep: DEEP_SAFFRON };
}

function splitReflectionBlocks(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
}

// ─── Note Entry Card ───
function NoteEntryCard({ entry, navigate, index }: { entry: NoteEntry; navigate: (p: string) => void; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = entry.text.length > 200;
  const accent = getProductAccent(entry.productId, entry.cardId);
  const reflectionBlocks = splitReflectionBlocks(entry.text);
  const isTakeaway = entry.id.startsWith('takeaway-');

  return (
    <div
      style={{
        backgroundColor: isTakeaway ? `${accent.deep}14` : '#2E3142',
        borderRadius: '16px',
        padding: '0 16px 14px',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Top color bar */}
      <div style={{
        height: '2px',
        background: `${accent.mid}66`,
        marginLeft: '-16px',
        marginRight: '-16px',
        marginBottom: '16px',
      }} />

      {/* Takeaway label */}
      {isTakeaway && (
        <p style={{
          margin: '0 0 10px',
          fontSize: '10px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: `${accent.mid}b3`,
        }}>
          Ni bar med er
        </p>
      )}

      {/* Note text */}
      <div style={{ position: 'relative' }}>
          <div
            style={{
              ...(isLong && !expanded ? {
                display: '-webkit-box',
                WebkitLineClamp: 4,
                WebkitBoxOrient: 'vertical' as const,
                overflow: 'hidden',
              } : {}),
            }}
          >
            {reflectionBlocks.map((block, blockIndex) => (
              <p
                key={`${entry.id}-block-${blockIndex}`}
                style={{
                  margin: blockIndex === 0 ? 0 : '12px 0 0',
                  fontFamily: 'var(--font-serif)',
                  fontSize: '16px',
                  color: LANTERN_GLOW,
                  lineHeight: 1.6,
                }}
              >
                {block}
              </p>
            ))}
          </div>
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              background: 'none',
              border: 'none',
              color: accent.mid,
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              padding: 0,
              marginTop: '6px',
              letterSpacing: '0.02em',
            }}
          >
            {expanded ? 'Visa mindre' : 'Läs mer'}
          </button>
        )}
      </div>

      {/* Question anchor — only when there's a real question */}
      {entry.questionText && (
        <p
          style={{
            margin: '10px 0 0',
            fontSize: '13px',
            fontStyle: 'italic',
            color: `${DRIFTWOOD}cc`,
            lineHeight: 1.4,
          }}
        >
          — {entry.questionText}
        </p>
      )}

      {/* Metadata */}
      <div style={{ marginTop: '10px', lineHeight: 1.3 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
        }}>
          {getProductName(entry.productId, entry.cardId) && (
            <span style={{ fontSize: '13px', fontWeight: 600, color: accent.light }}>
              {getProductName(entry.productId, entry.cardId)}
            </span>
          )}
          <span style={{ fontSize: '11px', color: `${DRIFTWOOD}77` }}>
            {formatRelativeDate(entry.date)}
          </span>
        </div>
        <p style={{ margin: '2px 0 0', fontSize: '12px', color: `${DRIFTWOOD}88` }}>
          {entry.cardName}
        </p>
      </div>
    </div>
  );
}

// ─── Completed-no-note marker ───
function CompletedMarkerRow({ marker, index }: { marker: CompletedMarker; index: number }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        paddingLeft: '8px',
        paddingTop: '2px',
        paddingBottom: '2px',
      }}
    >
      <div
        style={{
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          backgroundColor: `${DEEP_SAFFRON}22`,
          border: `1.5px solid ${DEEP_SAFFRON}66`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Check size={10} strokeWidth={2.5} color={DEEP_SAFFRON} />
      </div>
      <span style={{ fontSize: '14px', color: `${DRIFTWOOD}cc` }}>
        {(() => {
          const name = getProductName(marker.productId, marker.cardId);
          const markerAccent = getProductAccent(marker.productId, marker.cardId);
          return name ? (
            <>
              <span style={{ fontSize: '13px', fontWeight: 500, color: markerAccent.light, marginRight: '6px' }}>{name}</span>
              <span style={{ color: `${DRIFTWOOD}88` }}>·</span>{' '}
            </>
          ) : null;
        })()}
        {marker.cardName}
      </span>
      <span style={{ fontSize: '12px', color: `${DRIFTWOOD}66`, marginLeft: 'auto' }}>
        {formatRelativeDate(marker.date)}
      </span>
    </div>
  );
}

export default function Journal() {
  useDefaultTheme();
  const navigate = useNavigate();
  const { space } = useCoupleSpaceContext();
  const devState = useDevState();
  const demoActive = isDemoMode() || !!devState;
  const [demoDiaryVersion, setDemoDiaryVersion] = useState(0);

  const [sessions, setSessions] = useState<CompletedSession[] | null>(null);
  const [takeaways, setTakeaways] = useState<any[] | null>(null);
  const [reflections, setReflections] = useState<any[] | null>(null);
  
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [activeFilters, setActiveFilters] = useState<Set<FilterChip>>(new Set(['barn', 'par']));
  const [parExpanded, setParExpanded] = useState(true);

  // Fetch data
  useEffect(() => {
    if (!space?.id) {
      setSessions([]);
      setTakeaways([]);
      setReflections([]);
      setBookmarks([]);
      return;
    }
    let cancelled = false;

    // Sessions
    supabase
      .from('couple_sessions')
      .select('id, card_id, product_id, ended_at, category_id, status')
      .eq('couple_space_id', space.id)
      .in('status', ['completed', 'active', 'abandoned'])
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

  const stillUsSessions = useMemo(() => {
    if (!sessions) return [];
    return sessions.filter(s => effectiveIsPar(s.product_id, s.card_id));
  }, [sessions]);

  const demoTimelineItems = useMemo<TimelineItem[]>(() => {
    if (!demoActive) return [];

    const items: TimelineItem[] = [];

    for (const product of allProducts) {
      try {
        const key = `bonki-demo-diary-${product.id}`;
        const stored = JSON.parse(localStorage.getItem(key) || '[]') as DemoDiaryEntry[];

        stored.forEach((entry, index) => {
          if (!entry?.text?.trim() || !entry.cardId || !entry.date) return;
          items.push({
            type: 'note',
            id: `demo-${product.id}-${entry.cardId}-${entry.date}-${index}`,
            text: entry.text.trim(),
            questionText: null,
            cardId: entry.cardId,
            cardName: getCardTitle(entry.cardId),
            categoryName: getCategoryName(null, entry.cardId),
            productId: product.id,
            date: entry.date,
            sessionId: `demo-${product.id}-${entry.cardId}`,
          });
        });
      } catch {
        // Ignore malformed local demo data
      }
    }

    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return items;
  }, [demoActive, demoDiaryVersion]);

  useEffect(() => {
    if (!demoActive) return;

    const syncDemoDiary = () => setDemoDiaryVersion((version) => version + 1);
    window.addEventListener(DEMO_DIARY_EVENT, syncDemoDiary);
    window.addEventListener('storage', syncDemoDiary);

    return () => {
      window.removeEventListener(DEMO_DIARY_EVENT, syncDemoDiary);
      window.removeEventListener('storage', syncDemoDiary);
    };
  }, [demoActive]);

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
      if (!session || !session.card_id) return;
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
        date: session.ended_at || t.created_at,
        sessionId: session.id,
      });
    });

    // Add step reflections as notes
    reflections?.forEach(r => {
      if (!r.text?.trim()) return;
      const session = sessionMap.get(r.session_id);
      if (!session || !session.card_id) return;
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
    return [...demoTimelineItems, ...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [loading, takeaways, reflections, sessions, sessionMap, demoTimelineItems]);

  const isEmpty = !loading && allTimelineItems.length === 0 && bookmarks.length === 0;

  // Separate Still Us empty-session markers for collapsible section
  const [emptySessionsOpen, setEmptySessionsOpen] = useState(false);

  const { visibleItems, emptyStillUsSessions } = useMemo(() => {
    const bothActive = activeFilters.has('barn') && activeFilters.has('par');
    const visible: TimelineItem[] = [];
    const emptySU: CompletedMarker[] = [];

    allTimelineItems.forEach(item => {
      const isPar = effectiveIsPar(item.productId, item.cardId);

      // All empty sessions go to collapsible, regardless of product
      if (item.type === 'completed') {
        if (isPar && !activeFilters.has('par')) return;
        if (!isPar && !activeFilters.has('barn')) return;
        if (isPar && bothActive && !parExpanded) return;
        emptySU.push(item);
        return;
      }

      if (isPar) {
        if (!activeFilters.has('par')) return;
        if (bothActive && !parExpanded) return;
      } else {
        if (!activeFilters.has('barn')) return;
      }
      visible.push(item);
    });

    return { visibleItems: visible, emptyStillUsSessions: emptySU };
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
      <div
        style={{
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 56px)',
          textAlign: 'center',
          paddingLeft: '24px',
          paddingRight: '24px',
          paddingBottom: '4px',
        }}
      >
        <h1 style={{
          fontFamily: "var(--font-display)",
          fontVariationSettings: "'opsz' 28",
          fontSize: '26px', fontWeight: 600, color: LANTERN_GLOW, margin: 0, lineHeight: 1.2,
        }}>
          Era samtal
        </h1>
        <p style={{
          fontFamily: 'var(--font-serif)', fontSize: '14px', fontStyle: 'italic',
          color: `${DRIFTWOOD}cc`, marginTop: '6px', lineHeight: 1.4,
        }}>
          Vad ni burit med er.
        </p>
      </div>

      {/* Filter chips */}
      {!isEmpty && !loading && (
        <div
          style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}
        >
          {(['barn', 'par'] as const).map(chip => {
            const active = activeFilters.has(chip);
            return (
              <button
                key={chip}
                onClick={() => toggleFilter(chip)}
                style={{
                  height: '30px', paddingLeft: '16px', paddingRight: '16px', borderRadius: '10px',
                  border: active ? `1px solid ${DEEP_SAFFRON}44` : `1px solid ${DRIFTWOOD}44`,
                  backgroundColor: active ? `${DEEP_SAFFRON}18` : 'transparent',
                  color: active ? LANTERN_GLOW : `${DRIFTWOOD}aa`,
                  fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 500,
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  cursor: 'pointer', transition: 'all 200ms ease',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                {chip === 'barn' ? 'Barn' : 'Föräldrar'}
              </button>
            );
          })}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="loading-skeleton" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: `${DRIFTWOOD}33` }} className="animate-pulse" />
        </div>
      ) : isEmpty ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div
            style={{ textAlign: 'center', padding: '0 40px' }}
          >
            {/* Subtle decorative line */}
            <div style={{
              width: '32px', height: '1px', margin: '0 auto 24px',
              background: `linear-gradient(90deg, transparent, ${DRIFTWOOD}66, transparent)`,
            }} />
            <p style={{
              fontFamily: "var(--font-display)",
              fontVariationSettings: "'opsz' 20",
              fontSize: '19px', color: LANTERN_GLOW, margin: 0, lineHeight: 1.35,
            }}>
              Det finns inget här ännu.
            </p>
            <p style={{
              fontFamily: 'var(--font-serif)', fontSize: '15px', fontStyle: 'italic',
              color: `${DRIFTWOOD}cc`, marginTop: '12px', lineHeight: 1.5,
            }}>
              Varje samtal ni har lämnar ett spår —<br />en anteckning, en tanke, ett minne.
            </p>
            <div style={{
              width: '32px', height: '1px', margin: '24px auto 0',
              background: `linear-gradient(90deg, transparent, ${DRIFTWOOD}66, transparent)`,
            }} />
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 0px))' }}>
          {/* Pulse Card */}
          {pulseData && (
            <div
              style={{
                margin: '20px 16px 0',
                background: `linear-gradient(135deg, ${DEEP_DUSK}, ${DEEP_DUSK}ee)`,
                borderRadius: '16px', borderLeft: `3px solid ${DEEP_SAFFRON}`,
                padding: '16px 16px 14px',
              }}
            >
              <p style={{
                margin: 0, fontSize: '15px', color: LANTERN_GLOW, lineHeight: 1.5,
                fontFamily: 'var(--font-sans)',
              }}>
                Ni har haft{' '}
                <span style={{ fontWeight: 700, color: DEEP_SAFFRON, fontSize: '18px' }}>{pulseData.total}</span>
                {' '}samtal sedan {pulseData.monthLabel}.
              </p>
              <p style={{ margin: '8px 0 0', fontSize: '13px', color: `${DRIFTWOOD}cc`, lineHeight: 1.5 }}>
                Senast:{' '}
                <span
                  onClick={() => pulseData.latestCardId && navigate(`/card/${pulseData.latestCardId}`)}
                  style={{
                    fontWeight: 600,
                    color: DRIFTWOOD,
                    cursor: pulseData.latestCardId ? 'pointer' : 'default',
                    textDecoration: pulseData.latestCardId ? 'underline' : 'none',
                    textDecorationColor: `${DRIFTWOOD}44`, textUnderlineOffset: '3px',
                  }}
                >
                  {pulseData.latestCardName}
                </span>
                {' · '}{pulseData.latestRelDate}
              </p>
              {pulseData.uniqueProductCount > 1 && (
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: `${DRIFTWOOD}88`, lineHeight: 1.4 }}>
                  I {pulseData.uniqueProductCount} olika samtalsprodukter
                </p>
              )}
            </div>
          )}

          {/* Par Privacy Row */}
          {showParPrivacy && (
            <div
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
                <span style={{ fontSize: '14px', color: DRIFTWOOD, textAlign: 'left' }}>
                  {parExpanded ? 'Dölj parsamtal' : `Ni har ${stillUsSessions.length} parsamtal sparade`}
                </span>
                <motion.span
                  animate={{ rotate: parExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ color: DRIFTWOOD, display: 'flex' }}
                >
                  <ChevronDown size={18} strokeWidth={1.5} />
                </motion.span>
              </button>
            </div>
          )}

          {/* Timeline */}
          {monthGroups.map((group, gi) => (
            <div key={group.key}>
              {/* Month header */}
              <div style={{
                margin: `${gi === 0 ? '28px' : '36px'} 16px 14px`,
                display: 'flex', alignItems: 'center', gap: '10px',
              }}>
                <span style={{
                  fontSize: '11px', fontWeight: 600,
                  letterSpacing: '2px', color: `${DRIFTWOOD}aa`, lineHeight: 1,
                }}>
                  {group.label}
                </span>
                <div style={{
                  flex: 1, height: '1px',
                  background: `linear-gradient(90deg, ${DRIFTWOOD}33, transparent)`,
                }} />
              </div>

              {/* Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '0 16px' }}>
                {group.items.map((item, idx) =>
                  item.type === 'note' ? (
                    <NoteEntryCard key={item.id} entry={item} navigate={navigate} index={idx} />
                  ) : (
                    <CompletedMarkerRow key={item.id} marker={item} index={idx} />
                  )
                )}
              </div>
            </div>
          ))}

          {/* ── Still Us empty sessions (collapsible) ── */}
          {emptyStillUsSessions.length > 0 && (
            <div style={{ marginTop: '24px', padding: '0 16px' }}>
              <button
                onClick={() => setEmptySessionsOpen(prev => !prev)}
                style={{
                  width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '6px 0', WebkitTapHighlightColor: 'transparent',
                }}
              >
                <span style={{
                  fontSize: '11px', fontWeight: 600, letterSpacing: '2px',
                  color: `${DRIFTWOOD}aa`, textTransform: 'uppercase', lineHeight: 1,
                }}>
                  Samtal utan anteckningar ({emptyStillUsSessions.length})
                </span>
                <motion.span
                  animate={{ rotate: emptySessionsOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ color: `${DRIFTWOOD}88`, display: 'flex' }}
                >
                  <ChevronDown size={14} strokeWidth={1.5} />
                </motion.span>
              </button>
              <AnimatePresence>
                {emptySessionsOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: EASE }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingTop: '8px' }}>
                      {emptyStillUsSessions.map(m => (
                        <div key={m.id} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          opacity: 0.5, fontSize: '13px', padding: '4px 0',
                        }}>
                          <span style={{ color: DRIFTWOOD }}>{m.cardName}</span>
                          <span style={{ color: `${DRIFTWOOD}99` }}>
                            {new Date(m.date).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}


          {/* ── Bookmarked Questions ── */}
          {filteredBookmarks.length > 0 && (
            <div>
              <div style={{
                margin: '40px 16px 14px',
                display: 'flex', alignItems: 'center', gap: '10px',
              }}>
                <Bookmark size={13} strokeWidth={2} style={{ color: `${DRIFTWOOD}88` }} />
                <span style={{
                  fontSize: '11px', fontWeight: 600,
                  letterSpacing: '2px', color: `${DRIFTWOOD}aa`, lineHeight: 1, textTransform: 'uppercase',
                }}>
                  Sparade frågor
                </span>
                <div style={{
                  flex: 1, height: '1px',
                  background: `linear-gradient(90deg, ${DRIFTWOOD}33, transparent)`,
                }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '0 16px' }}>
                {filteredBookmarks.map((b, idx) => {
                  const cardName = getCardTitle(b.card_id);
                  const catName = getCategoryName(null, b.card_id);

                  return (
                    <motion.button
                      key={b.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05, duration: 0.35, ease: EASE }}
                      onClick={() => navigate(`/card/${b.card_id}`)}
                      style={{
                        width: '100%', backgroundColor: DEEP_DUSK, borderRadius: '16px',
                        padding: '14px 16px', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        textAlign: 'left', WebkitTapHighlightColor: 'transparent',
                      }}
                    >
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <span style={{
                          fontFamily: 'var(--font-serif)',
                          fontSize: '15px', color: LANTERN_GLOW,
                          display: 'block', lineHeight: 1.5,
                          fontStyle: 'italic',
                        }}>
                          "{b.question_text}"
                        </span>
                        <span style={{
                          fontSize: '12px', color: `${DRIFTWOOD}99`, display: 'block', marginTop: '8px',
                        }}>
                          {cardName} · {catName}
                        </span>
                      </div>
                      <ChevronRight size={16} strokeWidth={1.5} style={{ color: `${DRIFTWOOD}66`, flexShrink: 0, marginLeft: '8px' }} />
                    </motion.button>
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
