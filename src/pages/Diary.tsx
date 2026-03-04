import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import { getProductById } from '@/data/products';
import { useCardImage } from '@/hooks/useCardImage';
import Header from '@/components/Header';
import { BEAT_1, BEAT_2, EASE, EMOTION } from '@/lib/motion';

// Product illustrations
import bonkiLogo from '@/assets/bonki-logo.png';
import illustrationJagIMig from '@/assets/mirror-jag-i-mig.png';
import illustrationJagMedAndra from '@/assets/annorlunda-jag-med-andra.png';
import illustrationJagIVarlden from '@/assets/aktivism-jag-i-varlden.png';
import illustrationSexualitet from '@/assets/illustration-sexualitet.png';
import illustrationSyskon from '@/assets/illustration-syskon.png';
import illustrationVardag from '@/assets/illustration-vardag.png';

const PRODUCT_ILLUSTRATIONS: Record<string, string> = {
  jag_i_mig: illustrationJagIMig,
  jag_med_andra: illustrationJagMedAndra,
  jag_i_varlden: illustrationJagIVarlden,
  sexualitetskort: illustrationSexualitet,
  syskonkort: illustrationSyskon,
  vardagskort: illustrationVardag,
};

/** Product tile colors from the library design */
const PRODUCT_TILE_COLORS: Record<string, string> = {
  jag_i_mig: '#F5EDD2',
  jag_med_andra: '#F0D9EA',
  jag_i_varlden: '#C8E6D0',
  sexualitetskort: '#F0D9E2',
  vardagskort: '#D2E8E8',
  syskonkort: '#D6E2F0',
};

const PRODUCT_TEXT_COLORS: Record<string, string> = {
  jag_i_mig: '#6B6742',
  jag_med_andra: '#5E4058',
  jag_i_varlden: '#3A6B48',
  sexualitetskort: '#6B4858',
  vardagskort: '#2A5858',
  syskonkort: '#2A3E68',
};

// ─── Types ──────────────────────────────────────────────────

interface DiaryEntry {
  id: string;
  type: 'reflection' | 'bookmark';
  date: Date;
  cardId: string;
  cardTitle: string;
  /** For reflections: the saved text. For bookmarks: the question text */
  text: string;
  topicLabel: string;
}

// ─── Small topic illustration ───────────────────────────────

function TopicIcon({ cardId }: { cardId: string }) {
  const imageUrl = useCardImage(cardId);
  if (!imageUrl) return null;
  return (
    <img
      src={imageUrl}
      alt=""
      draggable={false}
      style={{
        width: '24px',
        height: '24px',
        objectFit: 'contain',
        borderRadius: '4px',
        opacity: 0.75,
        userSelect: 'none',
      }}
    />
  );
}

// ─── Single diary entry card ────────────────────────────────

interface EntryCardProps {
  entry: DiaryEntry;
  tileColor: string;
  accentColor: string;
  index: number;
  onTap: (entry: DiaryEntry) => void;
}

function EntryCard({ entry, tileColor, accentColor, index, onTap }: EntryCardProps) {
  const formatDate = (d: Date) => {
    const days = ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag'];
    const months = ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september', 'oktober', 'november', 'december'];
    return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const isBookmark = entry.type === 'bookmark';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * Math.min(index, 10), duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      onClick={() => onTap(entry)}
      role="button"
      tabIndex={0}
      style={{
        position: 'relative',
        marginLeft: '36px',
        cursor: 'pointer',
      }}
    >
      {/* Timeline dot */}
      <div
        style={{
          position: 'absolute',
          left: '-28px',
          top: '20px',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: isBookmark ? accentColor : '#D4C8BC',
          border: '2px solid #F8F4EE',
          zIndex: 2,
        }}
      />

      {/* Card */}
      <div
        style={{
          background: tileColor,
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0px 2px 6px rgba(44, 36, 32, 0.08)',
          borderLeft: isBookmark ? `3px solid ${accentColor}` : 'none',
        }}
      >
        {/* Date */}
        <p style={{ fontSize: '11px', color: '#8A8078', marginBottom: '6px' }}>
          {formatDate(entry.date)}
        </p>

        {/* Topic label + icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
          <TopicIcon cardId={entry.cardId} />
          <span
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: accentColor,
              opacity: 0.6,
              letterSpacing: '0.02em',
            }}
          >
            {entry.topicLabel}
          </span>
          {isBookmark && (
            <Bookmark className="w-3.5 h-3.5" style={{ color: accentColor, opacity: 0.7, fill: accentColor }} />
          )}
        </div>

        {/* Content text */}
        {isBookmark ? (
          <>
            <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#2C2420', marginBottom: '8px' }}>
              {entry.text}
            </p>
            <p style={{ fontSize: '12px', color: accentColor, opacity: 0.5, fontStyle: 'italic' }}>
              Vill ni prata om den här igen?
            </p>
          </>
        ) : (
          <p
            style={{
              fontFamily: "'Lora', 'Georgia', serif",
              fontStyle: 'italic',
              fontSize: '14px',
              lineHeight: 1.7,
              color: '#2C2420',
              display: '-webkit-box',
              WebkitLineClamp: 5,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {entry.text}
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ─── Month divider ──────────────────────────────────────────

function MonthDivider({ label, index }: { label: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.03 * Math.min(index, 10), duration: 0.4 }}
      style={{
        position: 'relative',
        marginLeft: '36px',
        padding: '8px 0',
      }}
    >
      {/* Dot on timeline */}
      <div
        style={{
          position: 'absolute',
          left: '-30px',
          top: '12px',
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          background: '#D4C8BC',
          border: '2px solid #F8F4EE',
          zIndex: 2,
        }}
      />
      <p
        style={{
          fontSize: '11px',
          fontWeight: 600,
          color: '#A09890',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
        }}
      >
        {label}
      </p>
    </motion.div>
  );
}

// ─── Filter pill ────────────────────────────────────────────

function FilterPill({ label, active, accentColor, onClick }: { label: string; active: boolean; accentColor: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        flexShrink: 0,
        padding: '6px 14px',
        borderRadius: '20px',
        border: 'none',
        fontSize: '12px',
        fontWeight: 500,
        cursor: 'pointer',
        background: active ? accentColor : 'rgba(212, 200, 188, 0.3)',
        color: active ? '#FFFFFF' : '#8A8078',
        transition: 'all 0.2s ease',
      }}
    >
      {label}
    </button>
  );
}

// ─── Main diary page ────────────────────────────────────────

const ENTRIES_PER_PAGE = 15;

export default function Diary() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { space } = useCoupleSpaceContext();

  const product = productId ? getProductById(productId) : null;

  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(ENTRIES_PER_PAGE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const tileColor = product ? (PRODUCT_TILE_COLORS[product.id] ?? '#F5EDD2') : '#F5EDD2';
  const accentColor = product ? (PRODUCT_TEXT_COLORS[product.id] ?? '#6B6742') : '#6B6742';
  const illustration = product ? PRODUCT_ILLUSTRATIONS[product.id] : undefined;

  // Build a card title lookup
  const cardTitleMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of product?.cards ?? []) map.set(c.id, c.title);
    return map;
  }, [product?.id]);

  // Fetch diary entries
  useEffect(() => {
    if (!space || !product) { setLoading(false); return; }

    let cancelled = false;

    const fetchData = async () => {
      // 1. Completed sessions with takeaways
      const { data: sessions } = await supabase
        .from('couple_sessions')
        .select('id, card_id, ended_at')
        .eq('couple_space_id', space.id)
        .eq('product_id', product.id)
        .eq('status', 'completed')
        .order('ended_at', { ascending: false });

      if (cancelled) return;

      const sessionList = sessions ?? [];
      const sessionIds = sessionList.map(s => s.id);

      // 2. Takeaways
      let takeawayMap = new Map<string, string>();
      if (sessionIds.length > 0) {
        const { data: takeaways } = await supabase
          .from('couple_takeaways')
          .select('session_id, content')
          .in('session_id', sessionIds);
        if (!cancelled) {
          for (const t of takeaways ?? []) {
            if (t.content?.trim()) takeawayMap.set(t.session_id, t.content);
          }
        }
      }

      // 3. Bookmarked questions
      const { data: bookmarks } = await supabase
        .from('question_bookmarks')
        .select('id, card_id, question_text, bookmarked_at')
        .eq('couple_space_id', space.id)
        .eq('product_id', product.id)
        .eq('is_active', true)
        .order('bookmarked_at', { ascending: false });

      if (cancelled) return;

      // Build entries
      const result: DiaryEntry[] = [];

      // Reflection entries — one per session that has a takeaway
      for (const s of sessionList) {
        const tw = takeawayMap.get(s.id);
        if (!tw || !s.card_id) continue;
        result.push({
          id: `ref-${s.id}`,
          type: 'reflection',
          date: new Date(s.ended_at ?? new Date().toISOString()),
          cardId: s.card_id,
          cardTitle: cardTitleMap.get(s.card_id) ?? s.card_id,
          text: tw,
          topicLabel: cardTitleMap.get(s.card_id) ?? s.card_id,
        });
      }

      // Bookmark entries
      for (const b of bookmarks ?? []) {
        result.push({
          id: `bm-${b.id}`,
          type: 'bookmark',
          date: new Date(b.bookmarked_at),
          cardId: b.card_id,
          cardTitle: cardTitleMap.get(b.card_id) ?? b.card_id,
          text: b.question_text,
          topicLabel: cardTitleMap.get(b.card_id) ?? b.card_id,
        });
      }

      // Sort by date descending
      result.sort((a, b) => b.date.getTime() - a.date.getTime());

      if (!cancelled) {
        setEntries(result);
        setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [space?.id, product?.id, cardTitleMap]);

  // Infinite scroll
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount(prev => prev + ENTRIES_PER_PAGE);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loading]);

  // Derived data
  const filteredEntries = useMemo(() => {
    if (!activeFilter) return entries;
    return entries.filter(e => e.cardId === activeFilter);
  }, [entries, activeFilter]);

  const visibleEntries = filteredEntries.slice(0, visibleCount);

  const topicFilters = useMemo(() => {
    const seen = new Map<string, string>();
    for (const e of entries) {
      if (!seen.has(e.cardId)) seen.set(e.cardId, e.topicLabel);
    }
    return [...seen.entries()].map(([id, label]) => ({ id, label }));
  }, [entries]);

  // First session date
  const firstSessionDate = useMemo(() => {
    if (entries.length === 0) return null;
    const oldest = entries[entries.length - 1];
    return oldest.date;
  }, [entries]);

  const conversationCount = useMemo(() => {
    return entries.filter(e => e.type === 'reflection').length;
  }, [entries]);

  // Group entries by month/year for dividers
  const entriesWithDividers = useMemo(() => {
    const result: Array<{ type: 'divider'; label: string; key: string } | { type: 'entry'; entry: DiaryEntry; key: string }> = [];
    let lastMonth = '';

    const months = ['Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni', 'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'];

    for (const entry of visibleEntries) {
      const monthKey = `${entry.date.getFullYear()}-${entry.date.getMonth()}`;
      const monthLabel = `${months[entry.date.getMonth()]} ${entry.date.getFullYear()}`;

      if (monthKey !== lastMonth) {
        result.push({ type: 'divider', label: monthLabel, key: `div-${monthKey}` });
        lastMonth = monthKey;
      }
      result.push({ type: 'entry', entry, key: entry.id });
    }
    return result;
  }, [visibleEntries]);

  const handleTapEntry = useCallback((entry: DiaryEntry) => {
    if (entry.type === 'bookmark') {
      navigate(`/card/${entry.cardId}`);
    }
    // For reflections: could open a detail view in the future
  }, [navigate]);

  const formatDateShort = (d: Date) => {
    const months = ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september', 'oktober', 'november', 'december'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  if (!product) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#F8F4EE' }}>
        <Header title="Dagbok" showBack backTo="/" />
        <div className="px-6 pt-12 text-center">
          <p className="text-sm" style={{ color: '#8A8078' }}>Produkten hittades inte.</p>
        </div>
      </div>
    );
  }

  const isEmpty = !loading && entries.length === 0;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F4EE' }}>
      <Header title="" showBack backTo={`/product/${product.slug}`} />

      <div className="px-5 pb-16" style={{ paddingTop: '8px' }}>
        <div className="max-w-md mx-auto relative">


          {/* ── Page header ── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            style={{ marginBottom: '28px', position: 'relative', zIndex: 1 }}
          >
            <h1
              style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: 'clamp(32px, 8.5vw, 42px)',
                fontWeight: 400,
                color: '#2C2420',
                letterSpacing: '-0.01em',
                lineHeight: 1.1,
              }}
            >
              Vår dagbok
            </h1>

            {firstSessionDate && (
              <p
                style={{
                  fontSize: '13px',
                  fontStyle: 'italic',
                  color: '#8A8078',
                  marginTop: '10px',
                  lineHeight: 1.4,
                }}
              >
                Ert första samtal: {formatDateShort(firstSessionDate)}
              </p>
            )}

            {conversationCount > 0 && (
              <p
                style={{
                  fontSize: '13px',
                  color: accentColor,
                  marginTop: '4px',
                  fontWeight: 500,
                }}
              >
                {conversationCount} {conversationCount === 1 ? 'samtal' : 'samtal'} sedan dess
              </p>
            )}
          </motion.div>

          {/* ── Loading state ── */}
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginLeft: '36px' }}>
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="animate-pulse"
                  style={{
                    height: '100px',
                    borderRadius: '12px',
                    background: tileColor,
                    opacity: 0.4,
                  }}
                />
              ))}
            </div>
          )}

          {/* ── Empty state ── */}
          {isEmpty && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                paddingTop: '8vh',
                gap: '24px',
              }}
            >
              <img
                src={PRODUCT_ILLUSTRATIONS[product.id] || bonkiLogo}
                alt={product.name}
                draggable={false}
                style={{
                  width: '45vw',
                  maxWidth: '220px',
                  objectFit: 'contain',
                  opacity: 0.15,
                  userSelect: 'none',
                }}
              />
              <p
                style={{
                  fontFamily: "'Lora', Georgia, serif",
                  fontStyle: 'italic',
                  fontSize: '15px',
                  lineHeight: 1.7,
                  color: accentColor,
                  textAlign: 'center',
                  maxWidth: '280px',
                }}
              >
                Era samtal börjar här. Varje ord ni sparar hamnar i er dagbok — och stannar så länge ni vill.
              </p>

              <button
                onClick={() => navigate(`/product/${product.slug}`)}
                style={{
                  marginTop: '16px',
                  fontSize: '13px',
                  color: '#8A8078',
                  opacity: 0.6,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  textUnderlineOffset: '3px',
                }}
              >
                Börja utforska {product.name}
              </button>
            </motion.div>
          )}

          {/* ── Filter pills ── */}
          {!loading && topicFilters.length > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              style={{
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                paddingBottom: '16px',
                marginBottom: '8px',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
              className="hide-scrollbar"
            >
              <FilterPill
                label="Alla"
                active={!activeFilter}
                accentColor={accentColor}
                onClick={() => { setActiveFilter(null); setVisibleCount(ENTRIES_PER_PAGE); }}
              />
              {topicFilters.map(f => (
                <FilterPill
                  key={f.id}
                  label={f.label}
                  active={activeFilter === f.id}
                  accentColor={accentColor}
                  onClick={() => { setActiveFilter(f.id); setVisibleCount(ENTRIES_PER_PAGE); }}
                />
              ))}
            </motion.div>
          )}

          {/* ── Timeline ── */}
          {!loading && entries.length > 0 && (
            <div style={{ position: 'relative' }}>
              {/* Vertical timeline line */}
              <div
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '24px',
                  bottom: '24px',
                  width: '1px',
                  background: '#D4C8BC',
                  zIndex: 1,
                }}
              />

              {/* Timeline entries */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', zIndex: 1 }}>
                {entriesWithDividers.map((item, i) => {
                  if (item.type === 'divider') {
                    return <MonthDivider key={item.key} label={item.label} index={i} />;
                  }
                  return (
                    <EntryCard
                      key={item.key}
                      entry={item.entry}
                      tileColor={tileColor}
                      accentColor={accentColor}
                      index={i}
                      onTap={handleTapEntry}
                    />
                  );
                })}
              </div>

              {/* Infinite scroll sentinel */}
              {visibleCount < filteredEntries.length && (
                <div ref={sentinelRef} style={{ height: '40px' }} />
              )}
            </div>
          )}

          {/* ── Footer ── */}
          {!loading && entries.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              style={{ textAlign: 'center', marginTop: '48px', paddingBottom: '24px' }}
            >
              <button
                onClick={() => navigate(`/product/${product.slug}`)}
                style={{
                  fontSize: '12px',
                  color: '#8A8078',
                  opacity: 0.5,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                ← Tillbaka till {product.name}
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
