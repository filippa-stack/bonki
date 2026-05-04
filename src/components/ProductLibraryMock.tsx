/**
 * ProductLibraryMock — sandboxed v4 lobby at /library-mock.
 *
 * v4 corrections (vs the live ProductLibrary):
 *  - Per-product saturated linear gradients as tile bg (not flat colors).
 *  - Portrait 1 / 1.05 aspect (not landscape fixed-height).
 *  - Pill state machine, three states, NO ✦ symbol, NO "utforskade" word:
 *      untouched   → "{N} samtal"
 *      tasted      → 9px BonkiLogoMark + " Du har provat"
 *      purchased   → "{completed} av {total}"
 *  - Tile-corner Resume overlay removed; resume affordance lives only in the
 *    top MockResumeBanner with product-color wash + just the product name.
 *
 * The live ProductLibrary.tsx is untouched.
 */

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import BonkiLoadingScreen from '@/components/BonkiLoadingScreen';
import KontoIcon from '@/components/KontoIcon';
import KontoSheet from '@/components/KontoSheet';
import { usePageBackground } from '@/hooks/usePageBackground';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { allProducts, getProductById } from '@/data/products';
import { useAllProductAccess } from '@/hooks/useAllProductAccess';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import { supabase } from '@/integrations/supabase/client';
import { isProductHiddenOnPlatform } from '@/lib/platform';
import { isDemoMode } from '@/lib/demoMode';
import BonkiLogoMark from '@/components/BonkiLogoMark';

import bonkiWordmark from '@/assets/bonki-wordmark.png';
import illustrationStillUs from '@/assets/illustration-still-us-tile.png';
import illustrationJagIMig from '@/assets/illustration-jag-i-mig.png';
import illustrationJagMedAndra from '@/assets/illustration-jag-med-andra.png';
import illustrationJagIVarlden from '@/assets/illustration-jag-i-varlden.png';
import illustrationSexualitet from '@/assets/illustration-sexualitet.png';
import illustrationSyskon from '@/assets/illustration-syskon.png';
import illustrationVardag from '@/assets/illustration-vardag.png';

const LANTERN_GLOW = '#FDF6E3';
const BONKI_ORANGE = '#E85D2C';
const LIBRARY_BG = '#0B1026';

const ILLUSTRATIONS: Record<string, string> = {
  still_us: illustrationStillUs,
  jag_i_mig: illustrationJagIMig,
  jag_med_andra: illustrationJagMedAndra,
  jag_i_varlden: illustrationJagIVarlden,
  sexualitetskort: illustrationSexualitet,
  syskonkort: illustrationSyskon,
  vardagskort: illustrationVardag,
};

const TAGLINES: Record<string, string> = {
  still_us: 'Förbli ett vi medan ni uppfostrar dem',
  jag_i_mig: 'När känslor får ord',
  jag_med_andra: 'Att vara sig själv och samspela med andra',
  jag_i_varlden: 'Att utveckla sig själv i en värld som vidgas',
  vardagskort: 'Det vanliga, på djupet',
  syskonkort: 'Band för livet',
  sexualitetskort: 'Kropp, gränser och identitet',
};

/** Map product id → CSS-var slug. Sexualitet keeps a flat fallback color. */
const PRODUCT_SLUG: Record<string, string> = {
  still_us: 'vartvi',
  jag_i_mig: 'jim',
  jag_med_andra: 'jma',
  jag_i_varlden: 'varlden',
  vardagskort: 'vardag',
  syskonkort: 'syskon',
};

/** Per-product accent (gradient bg-1) used by resume banner dot + wash. */
const PRODUCT_ACCENT: Record<string, string> = {
  still_us: '#A8B5C9',
  jag_i_mig: '#2A6B65',
  jag_med_andra: '#B85A8A',
  jag_i_varlden: '#BAC03E',
  vardagskort: '#6FB498',
  syskonkort: '#C4A5D6',
  sexualitetskort: '#DD958B',
};

/** v4 gradient spec — saturated, high-chroma stops for vibrant tile bg. */
const GRADIENT_TOKENS_CSS = `
  .v4-mock-root {
    --vartvi-bg-1:#C5D0E2; --vartvi-bg-2:#647892;
    --jim-bg-1:#3A9088;    --jim-bg-2:#175048;
    --jma-bg-1:#D86BA0;    --jma-bg-2:#7A2E5A;
    --varlden-bg-1:#D8E04A; --varlden-bg-2:#7A8019;
    --vardag-bg-1:#7FCEAB;  --vardag-bg-2:#3E8868;
    --syskon-bg-1:#D7B5EC;  --syskon-bg-2:#8868A8;
  }
`;

function tileBackground(productId: string): string {
  const slug = PRODUCT_SLUG[productId];
  if (slug) {
    return `linear-gradient(165deg, var(--${slug}-bg-1), var(--${slug}-bg-2))`;
  }
  return PRODUCT_ACCENT[productId] ?? '#1A2538';
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Tile                                                                       */
/* ─────────────────────────────────────────────────────────────────────────── */

interface PastelTileProps {
  product: { id: string; name: string; cards: { id: string }[] };
  onClick?: () => void;
  completedCount: number;
  isPurchased: boolean;
}

function PastelTile({ product, onClick, completedCount, isPurchased }: PastelTileProps) {
  const tagline = TAGLINES[product.id];
  const illustration = ILLUSTRATIONS[product.id];
  const totalCards = product.cards.length;
  const tasted = !isPurchased && completedCount > 0;
  const accent = PRODUCT_ACCENT[product.id] ?? '#1A2538';

  return (
    <motion.div
      whileHover={{ scale: 1.025, y: -3 }}
      whileTap={{ scale: 0.96, y: 2 }}
      onClick={onClick}
      className="cursor-pointer"
      style={{
        borderRadius: 22,
        background: tileBackground(product.id),
        aspectRatio: '1 / 1.05',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.10)',
        boxShadow: `0 4px 28px ${hexToRgba(accent, 0.20)}, 0 2px 8px rgba(0, 0, 0, 0.18)`,
      }}
    >
      {/* Illustration — full-bleed, bottom anchored */}
      {illustration && (
        <img
          src={illustration}
          alt=""
          draggable={false}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'right bottom',
            opacity: 1,
            pointerEvents: 'none',
            zIndex: 0,
            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.10))',
          }}
        />
      )}

      {/* Bottom scrim */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: 0, right: 0, bottom: 0,
          height: '55%',
          background:
            'linear-gradient(to top, rgba(0,0,0,0.32) 0%, rgba(0,0,0,0.08) 50%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 1,
          borderRadius: '0 0 22px 22px',
        }}
      />

      {/* Text — lower-left, max-width 75%, 14px from bottom */}
      <div
        style={{
          position: 'absolute',
          left: 16,
          bottom: 14,
          right: 16,
          maxWidth: '75%',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <h3
          style={{
            fontFamily: 'Fraunces, serif',
            fontSize: 26,
            fontWeight: 500,
            lineHeight: 1.1,
            color: '#FFFFFF',
            letterSpacing: '-0.005em',
            textShadow: '0 2px 14px rgba(0,0,0,0.45)',
            margin: '0 0 5px',
          }}
        >
          {product.name}
        </h3>
        {tagline && (
          <p
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 12,
              fontWeight: 400,
              color: 'rgba(253, 246, 227, 0.92)',
              lineHeight: 1.3,
              textShadow: '0 1px 6px rgba(0,0,0,0.35)',
              margin: '0 0 9px',
            }}
          >
            {tagline}
          </p>
        )}
        {/* Pill — three states only, no decorative symbols */}
        <span
          style={{
            display: 'inline-flex',
            alignSelf: 'flex-start',
            alignItems: 'center',
            gap: 6,
            padding: '5px 11px',
            borderRadius: 999,
            background: 'rgba(255, 255, 255, 0.18)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '0.5px solid rgba(255, 255, 255, 0.25)',
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: 11.5,
            fontWeight: 600,
            letterSpacing: '0.02em',
            color: LANTERN_GLOW,
          }}
        >
          {isPurchased ? (
            `${completedCount} av ${totalCards}`
          ) : tasted ? (
            <>
              <BonkiLogoMark size={9} style={{ color: LANTERN_GLOW }} />
              Du har provat
            </>
          ) : (
            `${totalCards} samtal`
          )}
        </span>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* MockResumeBanner — 64px, product-color wash, name only, "Fortsätt" pill    */
/* ─────────────────────────────────────────────────────────────────────────── */

interface ResumeData {
  productId: string;
  productName: string;
  cardId: string;
  cardTitle: string;
  stepLabel: string; // e.g. "Pausad vid Fråga 2 av 5"
}

function MockResumeBanner() {
  const navigate = useNavigate();
  const { space } = useCoupleSpaceContext();
  const [resume, setResume] = useState<ResumeData | null>(null);

  useEffect(() => {
    if (isDemoMode()) {
      // Dev-friendly mock for /library-mock previews
      setResume({
        productId: 'still_us',
        productName: 'Vårt Vi',
        cardId: 'su-kommunikation-1',
        cardTitle: 'Att lyssna på riktigt',
        stepLabel: 'Pausad vid Fråga 2 av 5',
      });
      return;
    }
    if (!space?.id) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('couple_sessions')
        .select('id, card_id, product_id, last_activity_at')
        .eq('couple_space_id', space.id)
        .eq('status', 'active')
        .order('last_activity_at', { ascending: false })
        .limit(1);

      if (cancelled || !data || data.length === 0) return;
      const row = data[0];
      const product = getProductById(row.product_id);
      if (!product) return;
      const card = product.cards.find(c => c.id === row.card_id);
      const cardIdx = product.cards.findIndex(c => c.id === row.card_id);
      setResume({
        productId: row.product_id,
        productName: product.name,
        cardId: row.card_id,
        cardTitle: card?.title ?? '',
        stepLabel: `Pausad vid Fråga ${cardIdx + 1} av ${product.cards.length}`,
      });
    })();
    return () => { cancelled = true; };
  }, [space?.id]);

  if (!resume) return null;

  const accent = PRODUCT_ACCENT[resume.productId] ?? '#A8B5C9';
  const accentRgba = (a: number) => {
    const r = parseInt(accent.slice(1, 3), 16);
    const g = parseInt(accent.slice(3, 5), 16);
    const b = parseInt(accent.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  };

  return (
    <div
      style={{
        height: 64,
        borderRadius: 14,
        background: `linear-gradient(90deg, ${accentRgba(0.55)} 0%, ${accentRgba(0.18)} 38%, rgba(26,37,56,0.95) 70%), #1A2538`,
        border: '0.5px solid rgba(253,246,227,0.14)',
        padding: '0 8px 0 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: accent,
          boxShadow: `0 0 12px ${accentRgba(0.6)}`,
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: 'Fraunces, serif',
            fontSize: 14.5,
            fontWeight: 500,
            lineHeight: 1.15,
            color: '#FFFFFF',
          }}
        >
          {resume.productName}
        </div>
        <div
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: 10.5,
            lineHeight: 1.3,
            color: 'rgba(253,246,227,0.65)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {resume.stepLabel} · {resume.cardTitle}
        </div>
      </div>
      <button
        onClick={() => navigate(`/card/${resume.cardId}`)}
        style={{
          background: BONKI_ORANGE,
          color: LANTERN_GLOW,
          padding: '9px 16px',
          borderRadius: 999,
          border: 'none',
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 12.5,
          fontWeight: 600,
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        Fortsätt
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* ProductLibraryMock                                                         */
/* ─────────────────────────────────────────────────────────────────────────── */

export default function ProductLibraryMock() {
  useLayoutEffect(() => {
    document.documentElement.classList.remove('theme-verdigris');
    document.body.classList.remove('verdigris-grain', 'verdigris-lightleak');
  }, []);
  usePageBackground(LIBRARY_BG);
  const navigate = useNavigate();
  const tracked = useRef(false);

  const { purchased, loading: accessLoading } = useAllProductAccess();
  const { space } = useCoupleSpaceContext();
  const [kontoOpen, setKontoOpen] = useState(false);
  const [completedCountMap, setCompletedCountMap] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!tracked.current) {
      tracked.current = true;
      import('@/lib/trackOnboarding').then(m => m.trackOnboardingEvent('lobby_view'));
    }
  }, []);

  // Fetch completed-card counts per product (status = 'completed' — matches useKidsProductProgress)
  useEffect(() => {
    if (!space?.id) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('couple_sessions')
        .select('product_id, card_id')
        .eq('couple_space_id', space.id)
        .eq('status', 'completed');
      if (cancelled || !data) return;
      const sets: Record<string, Set<string>> = {};
      for (const s of data) {
        if (!s.product_id || !s.card_id) continue;
        if (!sets[s.product_id]) sets[s.product_id] = new Set();
        sets[s.product_id].add(s.card_id);
      }
      const counts: Record<string, number> = {};
      for (const [pid, ids] of Object.entries(sets)) {
        const manifest = allProducts.find(p => p.id === pid);
        counts[pid] = manifest
          ? [...ids].filter(id => manifest.cards.some(c => c.id === id)).length
          : ids.size;
      }
      setCompletedCountMap(counts);
    })();
    return () => { cancelled = true; };
  }, [space?.id]);

  const couplesProducts = useMemo(
    () => allProducts.filter(p => p.id === 'still_us' && !isProductHiddenOnPlatform(p.id)),
    [],
  );
  const kidsProducts = useMemo(
    () =>
      ['jag_i_mig', 'jag_med_andra', 'jag_i_varlden', 'vardagskort', 'syskonkort', 'sexualitetskort']
        .map(id => allProducts.find(p => p.id === id))
        .filter((p): p is NonNullable<typeof p> => !!p && !isProductHiddenOnPlatform(p.id)),
    [],
  );

  if (accessLoading) {
    return <BonkiLoadingScreen />;
  }

  return (
    <div
      className="v4-mock-root min-h-screen flex flex-col relative"
      style={{
        background: LIBRARY_BG,
        ['--surface-base' as string]: LIBRARY_BG,
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <style>{GRADIENT_TOKENS_CSS}</style>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <KontoIcon onClick={() => setKontoOpen(true)} />
        <KontoSheet open={kontoOpen} onClose={() => setKontoOpen(false)} />

        {/* Hero */}
        <div
          style={{
            textAlign: 'center',
            padding: 'calc(env(safe-area-inset-top, 0px) + 56px) 32px 0',
          }}
        >
          <img
            src={bonkiWordmark}
            alt="BONKI"
            style={{
              maxHeight: 20,
              width: 'auto',
              objectFit: 'contain',
              margin: '0 auto',
              display: 'block',
              filter: 'drop-shadow(0 0 30px hsla(100, 60%, 80%, 0.2))',
            }}
          />
          <p
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 14,
              color: 'hsla(100, 40%, 80%, 0.65)',
              lineHeight: 1.6,
              margin: '12px 0 0',
            }}
          >
            Samtalen som bygger närhet.
          </p>
        </div>

        {/* Resume banner */}
        <div className="px-5" style={{ marginTop: 32, marginBottom: 24 }}>
          <MockResumeBanner />
        </div>

        {/* Föräldrar */}
        <SectionLabel label="Föräldrar" />
        <div className="px-5" style={{ marginBottom: 28 }}>
          {couplesProducts.map(product => (
            <PastelTile
              key={product.id}
              product={product}
              completedCount={completedCountMap[product.id] || 0}
              isPurchased={purchased.has(product.id)}
              onClick={() => navigate(`/product/${product.slug}`)}
            />
          ))}
        </div>

        {/* Barn & Familj */}
        <SectionLabel label="Barn & Familj" />
        <div
          className="px-5"
          style={{ display: 'flex', flexDirection: 'column', gap: 28 }}
        >
          {kidsProducts.map(product => (
            <PastelTile
              key={product.id}
              product={product}
              completedCount={completedCountMap[product.id] || 0}
              isPurchased={purchased.has(product.id)}
              onClick={() => navigate(`/product/${product.slug}`)}
            />
          ))}
        </div>

        <div style={{ paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 0px))' }} />
      </div>
    </div>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="px-5" style={{ marginTop: 8 }}>
      <div style={{ position: 'relative', paddingTop: 20 }}>
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: 0,
            left: '10%',
            right: '10%',
            height: 1,
            background:
              'linear-gradient(90deg, transparent 0%, rgba(110, 201, 184, 0.15) 30%, rgba(110, 201, 184, 0.20) 50%, rgba(110, 201, 184, 0.15) 70%, transparent 100%)',
          }}
        />
        <p
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: LANTERN_GLOW,
            opacity: 0.55,
            marginBottom: 20,
          }}
        >
          {label}
        </p>
      </div>
    </div>
  );
}
