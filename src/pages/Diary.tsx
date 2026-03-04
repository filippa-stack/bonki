import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import { getProductById } from '@/data/products';
import { useCardImage } from '@/hooks/useCardImage';
import Header from '@/components/Header';
import { BEAT_1, BEAT_2, EASE, EMOTION } from '@/lib/motion';

// ─── Individual card tile ───────────────────────────────────

interface DiaryCardProps {
  card: { id: string; title: string };
  takeaway: string | null;
  completedAt: string | null;
  explored: boolean;
  index: number;
}

function DiaryCard({ card, takeaway, completedAt, explored, index }: DiaryCardProps) {
  const imageUrl = useCardImage(card.id);
  const navigate = useNavigate();

  const formatMonth = (iso: string) => {
    const d = new Date(iso);
    const m = d.toLocaleString('sv-SE', { month: 'long' });
    return `${m.charAt(0).toUpperCase() + m.slice(1)} ${d.getFullYear()}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: explored ? 1 : 0.35, y: 0 }}
      transition={{ delay: BEAT_1 + index * 0.04, duration: 0.5, ease: [...EASE] }}
      onClick={() => explored ? null : navigate(`/card/${card.id}`)}
      role={explored ? undefined : 'button'}
      tabIndex={explored ? undefined : 0}
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '16px',
        background: explored ? 'var(--surface-raised)' : 'var(--surface-base)',
        boxShadow: explored
          ? '0 2px 8px hsla(30, 15%, 25%, 0.06), 0 6px 20px -6px hsla(30, 18%, 28%, 0.08)'
          : 'none',
        overflow: 'hidden',
        cursor: explored ? 'default' : 'pointer',
        minHeight: '160px',
      }}
    >
      {/* Illustration */}
      <div
        style={{
          height: '100px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px',
          background: explored
            ? 'linear-gradient(180deg, hsla(36, 25%, 96%, 0.6) 0%, transparent 100%)'
            : 'hsla(36, 15%, 94%, 0.3)',
        }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            draggable={false}
            style={{
              maxHeight: '76px',
              maxWidth: '76px',
              objectFit: 'contain',
              opacity: explored ? 0.85 : 0.25,
              filter: explored ? 'none' : 'saturate(0.2)',
              userSelect: 'none',
            }}
          />
        ) : (
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--surface-raised)', opacity: 0.3 }} />
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '12px 14px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <p
          className="font-serif"
          style={{
            fontSize: '15px',
            fontWeight: 600,
            color: explored ? 'var(--text-primary)' : 'var(--text-tertiary)',
            lineHeight: 1.2,
          }}
        >
          {card.title}
        </p>

        {explored && takeaway && takeaway.trim() ? (
          <p
            className="font-serif italic"
            style={{
              fontSize: '13px',
              lineHeight: 1.5,
              color: 'var(--text-secondary)',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            "{takeaway.trim()}"
          </p>
        ) : explored ? (
          <p
            className="font-sans"
            style={{ fontSize: '11px', color: 'var(--text-tertiary)', opacity: 0.5 }}
          >
            Utan anteckning
          </p>
        ) : null}

        {completedAt && (
          <p
            className="font-sans"
            style={{
              fontSize: '10px',
              color: 'var(--text-tertiary)',
              opacity: 0.45,
              marginTop: 'auto',
              textAlign: 'right',
            }}
          >
            {formatMonth(completedAt)}
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main diary page ────────────────────────────────────────

export default function Diary() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { space } = useCoupleSpaceContext();

  const product = productId ? getProductById(productId) : null;

  const [completedCards, setCompletedCards] = useState<Map<string, { takeaway: string | null; completedAt: string }>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!space || !product) { setLoading(false); return; }

    let cancelled = false;

    const fetch = async () => {
      // Get completed sessions for this product
      const { data: sessions } = await supabase
        .from('couple_sessions')
        .select('id, card_id, ended_at')
        .eq('couple_space_id', space.id)
        .eq('product_id', product.id)
        .eq('status', 'completed')
        .order('ended_at', { ascending: false });

      if (cancelled || !sessions) { setLoading(false); return; }

      // Deduplicate: keep latest session per card
      const latestByCard = new Map<string, { sessionId: string; endedAt: string }>();
      for (const s of sessions) {
        if (s.card_id && !latestByCard.has(s.card_id)) {
          latestByCard.set(s.card_id, { sessionId: s.id, endedAt: s.ended_at ?? s.id });
        }
      }

      if (latestByCard.size === 0) { setLoading(false); return; }

      // Fetch takeaways for those sessions
      const sessionIds = [...latestByCard.values()].map(v => v.sessionId);
      const { data: takeaways } = await supabase
        .from('couple_takeaways')
        .select('session_id, content')
        .in('session_id', sessionIds);

      if (cancelled) return;

      const takeawayMap = new Map<string, string>();
      for (const t of takeaways || []) {
        if (t.content?.trim()) takeawayMap.set(t.session_id, t.content);
      }

      const result = new Map<string, { takeaway: string | null; completedAt: string }>();
      for (const [cardId, { sessionId, endedAt }] of latestByCard) {
        result.set(cardId, {
          takeaway: takeawayMap.get(sessionId) ?? null,
          completedAt: endedAt,
        });
      }

      if (!cancelled) {
        setCompletedCards(result);
        setLoading(false);
      }
    };

    fetch();
    return () => { cancelled = true; };
  }, [space?.id, product?.id]);

  const allCards = product?.cards ?? [];
  const exploredCount = allCards.filter(c => completedCards.has(c.id)).length;

  if (!product) {
    return (
      <div className="min-h-screen page-bg">
        <Header title="Dagbok" showBack backTo="/" />
        <div className="px-6 pt-12 text-center">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Produkten hittades inte.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-bg">
      <Header title="" showBack backTo={`/product/${product.slug}`} />

      <div className="px-6 pb-12" style={{ paddingTop: '24px' }}>
        <div className="max-w-md mx-auto">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [...EASE] }}
            style={{ marginBottom: '32px' }}
          >
            {/* Saffron accent line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.15, duration: 0.7, ease: [...EASE] }}
              style={{
                width: '28px',
                height: '2px',
                borderRadius: '1px',
                background: 'var(--accent-saffron)',
                opacity: 0.45,
                marginBottom: '12px',
                transformOrigin: 'left',
              }}
            />
            <h1
              className="font-serif"
              style={{
                fontSize: 'clamp(28px, 7.5vw, 36px)',
                fontWeight: 600,
                color: 'var(--text-primary)',
                lineHeight: 1.15,
                letterSpacing: '-0.01em',
              }}
            >
              Vår dagbok
            </h1>
            <p
              className="font-sans"
              style={{
                fontSize: '13px',
                color: 'var(--text-tertiary)',
                opacity: 0.6,
                marginTop: '6px',
              }}
            >
              {product.name}
            </p>
          </motion.div>

          {/* Loading state */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="animate-pulse" style={{ height: '180px', borderRadius: '16px', background: 'var(--surface-raised)', opacity: 0.3 }} />
              ))}
            </div>
          ) : (
            <>
              {/* Card grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                {allCards.map((card, idx) => {
                  const data = completedCards.get(card.id);
                  return (
                    <DiaryCard
                      key={card.id}
                      card={card}
                      takeaway={data?.takeaway ?? null}
                      completedAt={data?.completedAt ?? null}
                      explored={!!data}
                      index={idx}
                    />
                  );
                })}
              </div>

              {/* Progress counter */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: BEAT_2, duration: EMOTION }}
                style={{
                  textAlign: 'center',
                  marginTop: '40px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                <p
                  className="font-sans"
                  style={{ fontSize: '13px', color: 'var(--text-tertiary)', opacity: 0.55 }}
                >
                  {exploredCount === 0
                    ? 'Ni har inte pratat om något ämne ännu'
                    : exploredCount === 1
                    ? 'Ni har pratat om 1 ämne'
                    : `Ni har pratat om ${exploredCount} ämnen`}
                  {exploredCount > 0 && ' 🌟'}
                </p>

                {exploredCount < allCards.length && (
                  <button
                    onClick={() => navigate(`/product/${product.slug}`)}
                    className="font-sans"
                    style={{
                      fontSize: '13px',
                      color: 'var(--text-secondary)',
                      opacity: 0.5,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      textUnderlineOffset: '3px',
                    }}
                  >
                    Fortsätt utforska
                  </button>
                )}
              </motion.div>

              {/* Footer back link */}
              <div style={{ textAlign: 'center', marginTop: '48px', paddingBottom: '24px' }}>
                <button
                  onClick={() => navigate(`/product/${product.slug}`)}
                  className="font-sans"
                  style={{
                    fontSize: '12px',
                    color: 'var(--text-tertiary)',
                    opacity: 0.4,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  ← Tillbaka till {product.name}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
