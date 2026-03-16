/**
 * LibraryResumeBanner — "Välkommen tillbaka" resume surface at top of library.
 * Fetches the most recent active session across all products and shows a
 * one-tap return to where the user left off.
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import { allProducts, getProductById } from '@/data/products';

interface ResumeTarget {
  productId: string;
  productName: string;
  cardId: string;
  cardTitle: string;
  categoryTitle: string;
  sessionId: string;
}

export default function LibraryResumeBanner() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { space } = useCoupleSpaceContext();
  const [target, setTarget] = useState<ResumeTarget | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!space?.id) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      // Find most recent active session across all products
      const { data } = await supabase
        .from('couple_sessions')
        .select('id, card_id, category_id, product_id, last_activity_at')
        .eq('couple_space_id', space.id)
        .eq('status', 'active')
        .order('last_activity_at', { ascending: false })
        .limit(1);

      if (cancelled) return;

      if (data && data.length > 0) {
        const session = data[0];
        const product = getProductById(session.product_id);
        if (product && session.card_id) {
          const card = product.cards.find(c => c.id === session.card_id);
          const category = product.categories.find(c => c.id === session.category_id);
          if (card) {
            setTarget({
              productId: product.id,
              productName: product.name,
              cardId: session.card_id,
              cardTitle: card.title,
              categoryTitle: category?.title ?? '',
              sessionId: session.id,
            });
          }
        }
      }

      if (!cancelled) setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [space?.id]);

  if (loading || !target) return null;

  return (
    <motion.button
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => navigate(`/card/${target.cardId}`, { state: { resumed: true } })}
      style={{
        width: '100%',
        padding: '14px 18px',
        margin: '0 0 8px',
        background: 'hsla(230, 30%, 18%, 0.7)',
        border: '1px solid hsla(38, 60%, 50%, 0.15)',
        borderRadius: '16px',
        cursor: 'pointer',
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
      }}
    >
      {/* Saffron accent bar */}
      <div style={{
        width: '3px',
        height: '32px',
        borderRadius: '2px',
        background: 'linear-gradient(180deg, hsla(38, 78%, 55%, 0.7), hsla(38, 78%, 55%, 0.2))',
        flexShrink: 0,
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: "var(--font-body)",
          fontSize: '9px',
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase' as const,
          color: 'hsla(38, 55%, 60%, 0.6)',
          marginBottom: '3px',
        }}>
          Fortsätt där ni slutade
        </p>
        <p style={{
          fontFamily: "var(--font-display)",
          fontSize: '15px',
          fontWeight: 400,
          color: '#FDF6E3',
          lineHeight: 1.3,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap' as const,
        }}>
          {target.productName} → {target.cardTitle}
        </p>
      </div>
      <span style={{
        fontFamily: "'Lato', sans-serif",
        fontSize: '10px',
        fontWeight: 700,
        letterSpacing: '0.04em',
        color: '#E9B44C',
        opacity: 0.7,
        flexShrink: 0,
      }}>
        Fortsätt →
      </span>
    </motion.button>
  );
}
