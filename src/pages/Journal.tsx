import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import { supabase } from '@/integrations/supabase/client';
import {
  MIDNIGHT_INK,
  LANTERN_GLOW,
  DRIFTWOOD,
  DEEP_DUSK,
  DEEP_SAFFRON,
} from '@/lib/palette';
import { cards as stillUsCards } from '@/data/content';
import { allProducts } from '@/data/products';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const STILL_US_ID = 'still_us';
const KIDS_PRODUCT_IDS = allProducts.map(p => p.id);

type FilterChip = 'barn' | 'par';

interface CompletedSession {
  id: string;
  card_id: string | null;
  product_id: string;
  ended_at: string | null;
}

const SWEDISH_MONTHS = [
  'januari', 'februari', 'mars', 'april', 'maj', 'juni',
  'juli', 'augusti', 'september', 'oktober', 'november', 'december',
];

function getCardTitle(cardId: string): string | null {
  // Check Still Us cards
  const suCard = stillUsCards.find(c => c.id === cardId);
  if (suCard) return suCard.title;
  // Check kids product cards
  for (const prod of allProducts) {
    const card = prod.cards.find(c => c.id === cardId);
    if (card) return card.title;
  }
  return null;
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
    const weekdays = ['söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag'];
    return weekdays[date.getDay()];
  }
  return `${date.getDate()} ${SWEDISH_MONTHS[date.getMonth()]}`;
}

export default function Journal() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { space } = useCoupleSpaceContext();

  const [sessions, setSessions] = useState<CompletedSession[] | null>(null);
  const [activeFilters, setActiveFilters] = useState<Set<FilterChip>>(
    new Set(['barn', 'par']),
  );
  const [parExpanded, setParExpanded] = useState(false);

  // Fetch completed sessions
  useEffect(() => {
    if (!space?.id) {
      setSessions([]);
      return;
    }
    let cancelled = false;
    supabase
      .from('couple_sessions')
      .select('id, card_id, product_id, ended_at')
      .eq('couple_space_id', space.id)
      .eq('status', 'completed')
      .order('ended_at', { ascending: false })
      .then(({ data }) => {
        if (!cancelled) setSessions(data ?? []);
      });
    return () => { cancelled = true; };
  }, [space?.id]);

  const loading = sessions === null;

  // Filter sessions by active chips
  const filteredSessions = useMemo(() => {
    if (!sessions) return [];
    return sessions.filter(s => {
      const isPar = s.product_id === STILL_US_ID;
      if (isPar) return activeFilters.has('par');
      return activeFilters.has('barn');
    });
  }, [sessions, activeFilters]);

  const stillUsSessions = useMemo(() => {
    if (!sessions) return [];
    return sessions.filter(s => s.product_id === STILL_US_ID);
  }, [sessions]);

  const isEmpty = sessions !== null && sessions.length === 0;

  const toggleFilter = (chip: FilterChip) => {
    setActiveFilters((prev) => {
      if (prev.has(chip) && prev.size === 1) return prev;
      const next = new Set(prev);
      if (next.has(chip)) {
        next.delete(chip);
      } else {
        next.add(chip);
      }
      return next;
    });
  };

  // Reset par expanded when navigating back
  useEffect(() => {
    setParExpanded(false);
  }, []);

  // Pulse card data
  const pulseData = useMemo(() => {
    if (!filteredSessions.length) return null;

    const total = filteredSessions.length;
    const latest = filteredSessions[0]; // already sorted desc
    const oldest = filteredSessions[filteredSessions.length - 1];

    // First month
    const oldestDate = oldest.ended_at ? new Date(oldest.ended_at) : new Date();
    const now = new Date();
    const sameMonth = oldestDate.getMonth() === now.getMonth() && oldestDate.getFullYear() === now.getFullYear();
    const monthLabel = sameMonth ? 'den här månaden' : SWEDISH_MONTHS[oldestDate.getMonth()];

    // Latest card name
    const latestCardName = latest.card_id ? getCardTitle(latest.card_id) : null;
    const latestRelDate = latest.ended_at ? formatRelativeDate(latest.ended_at) : '';

    // Unique products
    const uniqueProducts = new Set(filteredSessions.map(s => s.product_id));

    return {
      total,
      monthLabel,
      sameMonth,
      latestCardId: latest.card_id,
      latestCardName: latestCardName ?? latest.card_id ?? 'Okänt',
      latestRelDate,
      uniqueProductCount: uniqueProducts.size,
    };
  }, [filteredSessions]);

  const showParPrivacy = activeFilters.has('barn') && activeFilters.has('par') && stillUsSessions.length > 0;

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: MIDNIGHT_INK,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
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
        <h1
          style={{
            fontFamily: "'DM Serif Display', var(--font-serif)",
            fontSize: '28px',
            fontWeight: 600,
            color: LANTERN_GLOW,
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          Era samtal
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '14px',
            fontStyle: 'italic',
            color: DRIFTWOOD,
            marginTop: '8px',
            lineHeight: 1.4,
          }}
        >
          Vad ni burit med er.
        </p>
      </motion.div>

      {/* Filter chips — hidden when empty */}
      {!isEmpty && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4, ease: EASE }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '20px',
          }}
        >
          {(['barn', 'par'] as const).map((chip) => {
            const active = activeFilters.has(chip);
            return (
              <button
                key={chip}
                onClick={() => toggleFilter(chip)}
                style={{
                  height: '32px',
                  paddingLeft: '16px',
                  paddingRight: '16px',
                  borderRadius: '12px',
                  border: `1px solid ${DRIFTWOOD}`,
                  backgroundColor: active ? DEEP_DUSK : 'transparent',
                  color: active ? LANTERN_GLOW : DRIFTWOOD,
                  fontFamily: 'var(--font-sans)',
                  fontSize: '12px',
                  fontWeight: 500,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                {chip === 'barn' ? 'Barn' : 'Par'}
              </button>
            );
          })}
        </motion.div>
      )}

      {/* Content area */}
      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: `${DRIFTWOOD}33`,
            }}
            className="animate-pulse"
          />
        </div>
      ) : isEmpty ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5, ease: EASE }}
            style={{ textAlign: 'center', padding: '0 32px' }}
          >
            <p
              style={{
                fontFamily: "'DM Serif Display', var(--font-serif)",
                fontSize: '20px',
                color: LANTERN_GLOW,
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              Det finns inget här ännu.
            </p>
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '15px',
                fontStyle: 'italic',
                color: DRIFTWOOD,
                marginTop: '16px',
                lineHeight: 1.4,
              }}
            >
              Varje samtal ni har lämnar ett spår.
            </p>
          </motion.div>
        </div>
      ) : (
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 0px))',
          }}
        >
          {/* Pulse Card */}
          {pulseData && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5, ease: EASE }}
              style={{
                margin: '24px 16px 0',
                backgroundColor: DEEP_DUSK,
                borderRadius: '16px',
                borderLeft: `3px solid ${DEEP_SAFFRON}`,
                padding: '16px',
              }}
            >
              {/* Line 1: total count */}
              <p style={{ margin: 0, fontSize: '16px', color: LANTERN_GLOW, lineHeight: 1.4 }}>
                Ni har haft{' '}
                <span style={{ fontWeight: 600 }}>{pulseData.total}</span>
                {' '}samtal sedan {pulseData.monthLabel}.
              </p>

              {/* Line 2: latest */}
              <p style={{ margin: '6px 0 0', fontSize: '14px', color: DRIFTWOOD, lineHeight: 1.4 }}>
                Senast:{' '}
                <span
                  onClick={() => {
                    if (pulseData.latestCardId) {
                      navigate(`/card/${pulseData.latestCardId}`);
                    }
                  }}
                  style={{
                    fontWeight: 600,
                    cursor: pulseData.latestCardId ? 'pointer' : 'default',
                    textDecoration: pulseData.latestCardId ? 'underline' : 'none',
                    textDecorationColor: `${DRIFTWOOD}66`,
                    textUnderlineOffset: '2px',
                  }}
                >
                  {pulseData.latestCardName}
                </span>
                {' · '}
                {pulseData.latestRelDate}.
              </p>

              {/* Line 3: multi-product */}
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
                  width: '100%',
                  backgroundColor: DEEP_DUSK,
                  borderRadius: '12px',
                  padding: '12px 14px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <span style={{ fontSize: '15px', color: DRIFTWOOD, textAlign: 'left' }}>
                  {parExpanded
                    ? 'Dölj parsamtal'
                    : `Ni har ${stillUsSessions.length} parsamtal sparade`}
                </span>
                <motion.span
                  animate={{ rotate: parExpanded ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ color: DRIFTWOOD, display: 'flex' }}
                >
                  {parExpanded ? (
                    <ChevronDown size={18} strokeWidth={1.5} />
                  ) : (
                    <ChevronRight size={18} strokeWidth={1.5} />
                  )}
                </motion.span>
              </button>

              {/* Expanded list */}
              <AnimatePresence>
                {parExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {stillUsSessions.map((session) => {
                        const title = session.card_id ? (getCardTitle(session.card_id) ?? session.card_id) : 'Okänt samtal';
                        const relDate = session.ended_at ? formatRelativeDate(session.ended_at) : '';
                        return (
                          <button
                            key={session.id}
                            onClick={() => session.card_id && navigate(`/card/${session.card_id}`)}
                            style={{
                              width: '100%',
                              backgroundColor: `${DEEP_DUSK}99`,
                              borderRadius: '10px',
                              padding: '12px 14px',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              WebkitTapHighlightColor: 'transparent',
                            }}
                          >
                            <span style={{ fontSize: '14px', color: LANTERN_GLOW, fontWeight: 500 }}>
                              {title}
                            </span>
                            <span style={{ fontSize: '12px', color: DRIFTWOOD }}>
                              {relDate}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Placeholder for future journal entries */}
          <div style={{ padding: '24px 16px 0' }}>
            {/* Future: populated journal entries go here */}
          </div>
        </div>
      )}
    </div>
  );
}
