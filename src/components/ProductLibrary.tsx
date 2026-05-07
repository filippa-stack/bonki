import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import BonkiLoadingScreen from '@/components/BonkiLoadingScreen';
import KontoIcon from '@/components/KontoIcon';
import KontoSheet from '@/components/KontoSheet';
import { usePageBackground } from '@/hooks/usePageBackground';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { allProducts } from '@/data/products';
import { useAllProductAccess } from '@/hooks/useAllProductAccess';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import { supabase } from '@/integrations/supabase/client';
import { isDemoMode } from '@/lib/demoMode';
import { isProductHiddenOnPlatform } from '@/lib/platform';
import { MIDNIGHT_INK, productDarkText } from '@/lib/palette';
import { getCalmInterior } from '@/lib/productTileVariants';
import KidsTileFrame from '@/components/KidsTileFrame';

import LibraryResumeCard from '@/components/LibraryResumeCard';
import BonkiLogoMark from '@/components/BonkiLogoMark';

import illustrationStillUs from '@/assets/illustration-still-us-tile.png';
import illustrationJagIMig from '@/assets/illustration-jag-i-mig.png';
import illustrationJagMedAndra from '@/assets/illustration-jag-med-andra.png';
import illustrationJagIVarlden from '@/assets/illustration-jag-i-varlden.png';
import illustrationSexualitet from '@/assets/illustration-sexualitet.png';
import illustrationSyskon from '@/assets/illustration-syskon.png';
import illustrationVardag from '@/assets/illustration-vardag.png';

const LANTERN_GLOW = '#FDF6E3';

const ILLUSTRATIONS: Record<string, string> = {
  jag_i_mig: illustrationJagIMig,
  jag_med_andra: illustrationJagMedAndra,
  jag_i_varlden: illustrationJagIVarlden,
  sexualitetskort: illustrationSexualitet,
  syskonkort: illustrationSyskon,
  vardagskort: illustrationVardag,
};

const TAGLINES: Record<string, string> = {
  still_us: 'Samtalen som dagen inte gav plats för',
  jag_i_mig: 'När känslor får ord',
  jag_med_andra: 'Att höra till & vara sig själv',
  jag_i_varlden: 'Att hitta sig själv när allt blir större',
  vardagskort: 'Det vanliga, på djupet',
  syskonkort: 'När vi delar allt & inget',
  sexualitetskort: 'Kropp, gränser, identitet',
};

/** Per-product accent color. Mirrors manifest.tileLight. */
const PRODUCT_ACCENT: Record<string, string> = {
  still_us: '#6495ED',
  jag_i_mig: '#E89B6B',
  jag_med_andra: '#CB7AB2',
  jag_i_varlden: '#C6D423',
  vardagskort: '#8BDDB0',
  syskonkort: '#CF8BDD',
  sexualitetskort: '#B87560',
};

const tileVariants = {
  hidden: { opacity: 1, y: 0, scale: 1 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

/* ── Editorial library header ─────────────────────────────────────────── */
function LibraryHeader() {
  return (
    <div style={{ textAlign: 'center', marginBottom: 32 }}>
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 28,
        fontWeight: 500,
        letterSpacing: '0',
        color: LANTERN_GLOW,
        margin: '0 0 6px',
        fontVariationSettings: "'opsz' 28",
      }}>
        Biblioteket
      </h1>
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.10em',
        textTransform: 'uppercase',
        color: 'rgba(253, 246, 227, 0.55)',
        margin: 0,
      }}>
        Samtal för hela familjen
      </p>
    </div>
  );
}

/* ── Section eyebrow with mushroom-tinted divider ─────────────────────── */
function SectionEyebrow({ label }: { label: string }) {
  return (
    <p style={{
      fontFamily: 'var(--font-body)',
      fontSize: 10,
      fontWeight: 600,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: 'rgba(253, 246, 227, 0.45)',
      margin: '0 0 10px',
      padding: '0 4px',
    }}>
      {label}
    </p>
  );
}

/* ── Vårt Vi marquee — horizontal medallion composition ───────────────── */
function StillUsMarquee({
  totalCards,
  completedCount,
  isPurchased,
  onClick,
}: {
  totalCards: number;
  completedCount: number;
  isPurchased: boolean;
  onClick: () => void;
}) {
  const accent = PRODUCT_ACCENT.still_us;
  const onColorText = '#F5E8CC';
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: 16,
        borderRadius: 14,
        background: accent,
        border: 'none',
        boxShadow: '0 0 0 1px rgba(255,255,255,0.06)',
        cursor: 'pointer',
        textAlign: 'left',
        WebkitTapHighlightColor: 'transparent',
        minHeight: 97,
      }}
    >
      <div style={{
        flex: '0 0 75px',
        aspectRatio: '1 / 1',
        borderRadius: '50%',
        background: '#5A85D5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: '70%',
          height: '70%',
          borderRadius: '50%',
          background: 'rgba(15, 30, 80, 0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <img
            src={illustrationStillUs}
            alt=""
            draggable={false}
            style={{ width: '90%', height: '90%', objectFit: 'contain', pointerEvents: 'none' }}
          />
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4 }}>
        <h3 style={{
          fontFamily: 'var(--font-display)',
          color: onColorText,
          fontSize: 22,
          fontWeight: 500,
          lineHeight: 1.05,
          letterSpacing: '-0.005em',
          margin: 0,
        }}>
          Vårt Vi
        </h3>
        <p style={{
          color: onColorText,
          opacity: 0.85,
          fontSize: 13,
          margin: 0,
          fontStyle: 'italic',
          fontFamily: 'var(--font-display)',
          lineHeight: 1.35,
        }}>
          {TAGLINES.still_us}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
          <span style={{
            background: 'rgba(255,255,255,0.18)',
            borderRadius: 999,
            padding: '4px 12px',
            fontSize: 11,
            color: onColorText,
            fontWeight: 600,
          }}>
            {completedCount} av {totalCards}
          </span>
          <span style={{
            color: onColorText,
            opacity: 0.55,
            fontSize: 10,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}>
            {totalCards} samtal
          </span>
        </div>
      </div>
    </button>
  );
}

/* ── Kids tile — title strip footer carries always-visible meta row ──── */
/* ── Library kids tile — delegates to KidsTileFrame primitive ─────────── */
function LibraryKidsTile({
  product,
  illustration,
  totalCards,
  completedCount,
  isPurchased,
  onClick,
}: {
  product: { id: string; name: string; ageLabel?: string };
  illustration?: string;
  totalCards: number;
  completedCount: number;
  isPurchased: boolean;
  onClick: () => void;
}) {
  const frame = PRODUCT_ACCENT[product.id] ?? '#2A2D3A';
  const interior = product.id === 'jag_i_varlden'
    ? `color-mix(in srgb, ${frame} 72%, #FFF8DC)`
    : `color-mix(in srgb, ${frame} 75%, white)`;
  const darkText = productDarkText[product.id] ?? '#5A3A1F';
  const tasted = !isPurchased && completedCount > 0;
  const progress = isPurchased
    ? `${completedCount} AV ${totalCards}`
    : `${totalCards} SAMTAL`;
  const meta = product.ageLabel
    ? `${progress} · ${product.ageLabel.toUpperCase()}`
    : progress;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={product.name}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '3 / 4',
        borderRadius: 14,
        overflow: 'hidden',
        backgroundColor: frame,
        border: '1px solid rgba(255, 255, 255, 0.10)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)',
        padding: 0,
        cursor: 'pointer',
        display: 'block',
        textAlign: 'left',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {/* Inner zone — distinct rounded plate */}
      <div
        style={{
          position: 'absolute',
          top: 9,
          left: 9,
          right: 9,
          bottom: '20%',
          backgroundColor: interior,
          borderRadius: 12,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {illustration && (
          <img
            src={illustration}
            alt=""
            aria-hidden="true"
            draggable={false}
            style={{
              width: '92%',
              height: '92%',
              objectFit: 'contain',
              objectPosition: 'center',
              pointerEvents: 'none',
            }}
          />
        )}
      </div>

      {/* Hairline at inner-zone / title-strip seam */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: 9,
          right: 9,
          bottom: '20%',
          height: 1,
          backgroundColor: darkText,
          opacity: 0.25,
        }}
      />

      {/* Title strip — bottom 30%, sits on frame color */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '20%',
          padding: '8px 9px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 4,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontVariationSettings: "'opsz' 24",
            fontSize: 16,
            fontWeight: 600,
            color: darkText,
            lineHeight: 1.05,
            display: 'block',
          }}
        >
          {product.name}
        </span>
        {TAGLINES[product.id] && (
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: 11,
              fontWeight: 400,
              color: darkText,
              opacity: 0.7,
              lineHeight: 1.2,
              display: 'block',
            }}
          >
            {TAGLINES[product.id]}
          </span>
        )}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 6,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: darkText,
              opacity: 0.55,
              lineHeight: 1.2,
            }}
          >
            {meta}
          </span>
          {tasted && (
            <span style={{ display: 'inline-flex', color: darkText, opacity: 0.55, flexShrink: 0 }}>
              <BonkiLogoMark size={9} />
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

export default function ProductLibrary() {
  useLayoutEffect(() => {
    document.documentElement.classList.remove('theme-verdigris');
    document.body.classList.remove('verdigris-grain', 'verdigris-lightleak');
  }, []);
  usePageBackground(MIDNIGHT_INK);
  const navigate = useNavigate();
  const tracked = useRef(false);

  const { purchased, loading: accessLoading } = useAllProductAccess();
  useAuth();
  const [kontoOpen, setKontoOpen] = useState(false);
  const stillUsProduct = allProducts.find(p => p.id === 'still_us');

  useEffect(() => {
    if (!tracked.current) {
      tracked.current = true;
      import('@/lib/trackOnboarding').then(m => m.trackOnboardingEvent('lobby_view'));
    }
  }, []);

  // Fetch active sessions across all products for resume indicators
  const { space } = useCoupleSpaceContext();
  const [activeProductIds, setActiveProductIds] = useState<Set<string>>(new Set());
  const [completedCountMap, setCompletedCountMap] = useState<Record<string, number>>({});

  useEffect(() => {
    const syncLocalPreview = () => {
      if (!isDemoMode()) return;
      import('@/lib/demoSession').then(({ getAllDemoSessions }) => {
        setActiveProductIds(new Set(getAllDemoSessions().map(s => s.productId)));
      });
    };

    if (isDemoMode()) {
      syncLocalPreview();
      window.addEventListener('bonki:demo-session-changed', syncLocalPreview);
      window.addEventListener('storage', syncLocalPreview);
      return () => {
        window.removeEventListener('bonki:demo-session-changed', syncLocalPreview);
        window.removeEventListener('storage', syncLocalPreview);
      };
    }

    if (!space?.id) return;
    let cancelled = false;

    const fetchActive = supabase
      .from('couple_sessions')
      .select('product_id, last_activity_at')
      .eq('couple_space_id', space.id)
      .eq('status', 'active')
      .order('last_activity_at', { ascending: false });

    const fetchCompleted = supabase
      .from('couple_sessions')
      .select('product_id, card_id')
      .eq('couple_space_id', space.id)
      .eq('status', 'completed');

    Promise.all([fetchActive, fetchCompleted]).then(([activeRes, completedRes]) => {
      if (cancelled) return;

      if (activeRes.data) {
        setActiveProductIds(new Set(activeRes.data.map(s => s.product_id)));
      }

      if (completedRes.data) {
        const sets: Record<string, Set<string>> = {};
        const counts: Record<string, number> = {};
        for (const s of completedRes.data) {
          if (s.product_id && s.card_id) {
            if (!sets[s.product_id]) sets[s.product_id] = new Set();
            sets[s.product_id].add(s.card_id);
          }
        }
        for (const [productId, cardIds] of Object.entries(sets)) {
          const manifest = allProducts.find(p => p.id === productId);
          if (manifest) {
            counts[productId] = [...cardIds].filter(id => manifest.cards.some(c => c.id === id)).length;
          } else {
            counts[productId] = cardIds.size;
          }
        }
        setCompletedCountMap(counts);
      }
    });

    return () => { cancelled = true; };
  }, [space?.id]);

  // Locked pedagogical kids order
  const jagIMig = allProducts.find(p => p.id === 'jag_i_mig')!;
  const jagMedAndra = allProducts.find(p => p.id === 'jag_med_andra')!;
  const jagIVarlden = allProducts.find(p => p.id === 'jag_i_varlden')!;
  const sexualitet = allProducts.find(p => p.id === 'sexualitetskort')!;
  const vardag = allProducts.find(p => p.id === 'vardagskort')!;
  const syskon = allProducts.find(p => p.id === 'syskonkort')!;

  const sortedKidsProducts = useMemo(
    () => [jagIMig, jagMedAndra, vardag, syskon, jagIVarlden, sexualitet]
      .filter(p => !isProductHiddenOnPlatform(p.id)),
    [jagIMig, jagMedAndra, vardag, syskon, jagIVarlden, sexualitet],
  );
  const defaultKidsOrder = sortedKidsProducts;

  const libraryBg = MIDNIGHT_INK;

  if (accessLoading) {
    return <BonkiLoadingScreen />;
  }

  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{
        background: libraryBg,
        ['--surface-base' as string]: libraryBg,
        fontFamily: 'var(--font-body)',
        transition: 'background 600ms ease',
      }}
    >
      {/* ── Atmospheric background layers ── */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)',
          width: '120vw', height: '340px',
          background: 'radial-gradient(ellipse 55% 60% at 50% 35%, hsla(100, 60%, 80%, 0.10) 0%, hsla(100, 60%, 80%, 0.04) 45%, transparent 100%)',
        }} />
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '50%', height: '400px',
          background: 'radial-gradient(ellipse 80% 70% at 0% 0%, rgba(74, 58, 107, 0.06) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', top: 0, right: 0, width: '50%', height: '400px',
          background: 'radial-gradient(ellipse 80% 70% at 100% 0%, rgba(74, 58, 107, 0.06) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', top: '350px', left: 0, right: 0, height: '600px',
          background: 'linear-gradient(180deg, transparent 0%, rgba(26, 39, 68, 0.08) 30%, rgba(74, 58, 107, 0.05) 60%, transparent 100%)',
        }} />
        <div style={{
          position: 'absolute', top: '900px', left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(180deg, transparent 0%, rgba(28, 43, 26, 0.10) 25%, rgba(45, 69, 40, 0.08) 60%, rgba(28, 43, 26, 0.12) 100%)',
        }} />
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '360px',
          background: `linear-gradient(180deg,
            hsla(230, 25%, 10%, 0.0) 0%,
            hsla(230, 25%, 10%, 0.35) 30%,
            hsla(230, 25%, 10%, 0.75) 55%,
            ${libraryBg} 100%)`,
          zIndex: 1,
        }} />
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <KontoIcon onClick={() => setKontoOpen(true)} />
        <KontoSheet open={kontoOpen} onClose={() => setKontoOpen(false)} />

        {/* Editorial header */}
        <div className="px-5" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 56px)' }}>
          <LibraryHeader />
        </div>

        {/* Resume card */}
        <div className="px-5" style={{ marginBottom: 8 }}>
          <LibraryResumeCard global />
        </div>

        {/* ── FÖR PAR — Vårt Vi marquee ── */}
        <div className="px-5">
          <SectionEyebrow label="För er som par" />
          <StillUsMarquee
            totalCards={stillUsProduct?.cards.length ?? 22}
            completedCount={completedCountMap['still_us'] || 0}
            isPurchased={purchased.has('still_us')}
            onClick={() => navigate('/product/still-us')}
          />
        </div>

        {/* ── FÖR BARN · FÖR FAMILJEN ── */}
        <div className="px-5">
          <SectionEyebrow label="För barn · För familjen" />
          <p style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 12,
            fontWeight: 400,
            color: LANTERN_GLOW,
            opacity: 0.55,
            lineHeight: 1.5,
            textAlign: 'center',
            margin: '4px 0 18px',
          }}>
            Åldrarna är en vägledning. Ni känner ert barn bäst.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
          }}>
            {sortedKidsProducts.map((product) => (
              <LibraryKidsTile
                key={product.id}
                product={product}
                illustration={ILLUSTRATIONS[product.id]}
                totalCards={product.cards.length}
                completedCount={completedCountMap[product.id] || 0}
                isPurchased={purchased.has(product.id)}
                onClick={() => navigate(`/product/${product.slug}`)}
              />
            ))}
          </div>
        </div>

        {/* Bottom safe-area spacing */}
        <div style={{ paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 0px))' }} />
      </div>
    </div>
  );
}
