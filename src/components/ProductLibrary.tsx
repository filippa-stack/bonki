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
import { MIDNIGHT_INK } from '@/lib/palette';

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
    <div style={{ textAlign: 'center', marginBottom: 20 }}>
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        color: 'rgba(253, 246, 227, 0.45)',
        margin: '0 0 6px',
      }}>
        Samtal för hela familjen
      </p>
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 28,
        fontWeight: 500,
        letterSpacing: '-0.005em',
        color: LANTERN_GLOW,
        margin: 0,
        fontVariationSettings: "'opsz' 28",
      }}>
        Biblioteket
      </h1>
    </div>
  );
}

/* ── Section eyebrow with mushroom-tinted divider ─────────────────────── */
function SectionEyebrow({ label }: { label: string }) {
  return (
    <div style={{ position: 'relative', paddingTop: 20, marginBottom: 16 }}>
      <div aria-hidden="true" style={{
        position: 'absolute',
        top: 0,
        left: '10%',
        right: '10%',
        height: 1,
        background: 'linear-gradient(90deg, transparent 0%, rgba(110, 201, 184, 0.15) 30%, rgba(110, 201, 184, 0.20) 50%, rgba(110, 201, 184, 0.15) 70%, transparent 100%)',
      }} />
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: '2px',
        textTransform: 'uppercase',
        color: LANTERN_GLOW,
        opacity: 0.55,
        margin: 0,
      }}>
        {label}
      </p>
    </div>
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
  const tasted = !isPurchased && completedCount > 0;
  const accent = PRODUCT_ACCENT.still_us;
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '20px 16px',
        borderRadius: 18,
        background: 'rgba(15, 15, 15, 0.55)',
        backdropFilter: 'blur(22px)',
        WebkitBackdropFilter: 'blur(22px)',
        border: '1px solid rgba(255, 255, 255, 0.10)',
        boxShadow: '0 12px 36px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)',
        cursor: 'pointer',
        textAlign: 'left',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <div style={{
        position: 'relative',
        width: 110,
        height: 110,
        borderRadius: 9999,
        background: accent,
        flexShrink: 0,
        overflow: 'hidden',
        boxShadow: 'inset 0 -6px 16px rgba(0,0,0,0.18)',
      }}>
        <img
          src={illustrationStillUs}
          alt=""
          draggable={false}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '70%',
            height: '70%',
            objectFit: 'contain',
            objectPosition: 'center',
            pointerEvents: 'none',
          }}
        />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 22,
          fontWeight: 500,
          color: LANTERN_GLOW,
          letterSpacing: '-0.005em',
          margin: 0,
          lineHeight: 1.1,
        }}>
          Vårt Vi
        </h3>
        <p style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontSize: 13,
          fontWeight: 400,
          color: 'rgba(253, 246, 227, 0.72)',
          lineHeight: 1.35,
          margin: '4px 0 0',
        }}>
          {TAGLINES.still_us}
        </p>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          marginTop: 12,
          padding: '5px 11px',
          borderRadius: 999,
          background: `color-mix(in srgb, ${accent} 18%, rgba(255,255,255,0.14))`,
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: `0.5px solid color-mix(in srgb, ${accent} 25%, rgba(255,255,255,0.22))`,
          fontFamily: 'var(--font-body)',
          fontSize: 11.5,
          fontWeight: 600,
          letterSpacing: '0.02em',
          color: LANTERN_GLOW,
        }}>
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
    </button>
  );
}

/* ── Kids tile — title strip footer carries always-visible meta row ──── */
const PastelTile = React.forwardRef<HTMLDivElement, {
  name: string;
  productId: string;
  tagline?: string;
  ageLabel?: string;
  onClick?: () => void;
  illustration?: string;
  totalCards?: number;
  completedCount?: number;
  isPurchased?: boolean;
  darkTextOnTile?: boolean;
}>(function PastelTile({
  name, productId, tagline, ageLabel, onClick, illustration,
  totalCards = 0, completedCount = 0, isPurchased = false, darkTextOnTile = false,
}, ref) {
  const tasted = !isPurchased && completedCount > 0;
  const titleColor = darkTextOnTile ? '#5A3A1F' : '#FFFFFF';
  const subtitleColor = darkTextOnTile ? '#5A3A1F' : 'rgba(255, 255, 255, 0.78)';
  const metaColor = darkTextOnTile ? 'rgba(90, 58, 31, 0.65)' : 'rgba(255, 255, 255, 0.55)';

  // Always-visible footer row content
  const progressText = isPurchased
    ? `${completedCount} AV ${totalCards}`
    : `${totalCards} SAMTAL`;
  const metaText = ageLabel
    ? `${progressText} · ${ageLabel.toUpperCase()}`
    : progressText;

  return (
    <motion.div
      ref={ref}
      variants={tileVariants}
      whileHover={{ scale: 1.025, y: -3 }}
      whileTap={{ scale: 0.96, y: 2 }}
      onClick={onClick}
      className="cursor-pointer"
      style={{
        borderRadius: 18,
        background: PRODUCT_ACCENT[productId] ?? '#2A2D3A',
        aspectRatio: '1 / 1.05',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        border: '0.5px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Title block — top zone */}
      <div style={{ padding: '14px 14px 10px', position: 'relative', zIndex: 2 }}>
        <h3 style={{
          fontFamily: 'Fraunces, serif',
          fontSize: 20,
          fontWeight: 500,
          lineHeight: 1.1,
          color: titleColor,
          letterSpacing: '-0.005em',
          margin: '0 0 3px',
        }}>
          {name}
        </h3>
        {tagline && (
          <p style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: 11,
            fontWeight: 400,
            color: subtitleColor,
            lineHeight: 1.3,
            margin: 0,
          }}>
            {tagline}
          </p>
        )}
        {/* Always-visible small-caps meta row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 8,
          gap: 6,
        }}>
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: metaColor,
            lineHeight: 1.2,
          }}>
            {metaText}
          </span>
          {tasted && (
            <BonkiLogoMark size={9} style={{ color: metaColor, flexShrink: 0 }} />
          )}
        </div>
      </div>

      {/* Illustration zone — fills remaining space */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
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
              objectPosition: 'center bottom',
              pointerEvents: 'none',
            }}
          />
        )}
      </div>
    </motion.div>
  );
});

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

        {/* Next-step / return-user nudges (unchanged logic, condensed) */}
        {activeProductIds.size === 0 && Object.keys(completedCountMap).length > 0 && (() => {
          const untriedProduct = defaultKidsOrder.find(p => !completedCountMap[p.id]);
          if (!untriedProduct) return null;
          return (
            <div className="px-5" style={{ marginBottom: 8 }}>
              <button
                onClick={() => navigate(`/product/${untriedProduct.slug}`)}
                style={{
                  width: '100%', padding: '16px 20px', borderRadius: 16,
                  background: 'rgba(15, 15, 15, 0.7)',
                  backdropFilter: 'blur(22px)', WebkitBackdropFilter: 'blur(22px)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  display: 'flex', alignItems: 'center', gap: 14,
                  boxShadow: '0 12px 36px rgba(0, 0, 0, 0.40), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
                  cursor: 'pointer', textAlign: 'left', WebkitTapHighlightColor: 'transparent',
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  backgroundColor: 'rgba(212, 160, 58, 0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <span style={{ fontSize: 16, color: '#D4A03A' }}>✦</span>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontFamily: 'var(--font-display)', fontVariationSettings: "'opsz' 16",
                    fontSize: 15, fontWeight: 400, color: LANTERN_GLOW, lineHeight: 1.3, margin: 0,
                  }}>
                    Prova {untriedProduct.name}
                  </p>
                  <p style={{
                    fontFamily: 'var(--font-body)', fontSize: 11,
                    color: 'hsla(100, 40%, 80%, 0.45)', margin: '2px 0 0',
                  }}>
                    {untriedProduct.cards.length} samtal
                  </p>
                </div>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 600, color: '#D4F5C0', opacity: 0.4 }}>→</span>
              </button>
            </div>
          );
        })()}

        {activeProductIds.size === 0 &&
         Object.keys(completedCountMap).length > 0 &&
         !defaultKidsOrder.find(p => !completedCountMap[p.id]) && (() => {
          const lastSlug = localStorage.getItem('bonki-last-active-product');
          if (!lastSlug) return null;
          const lastProduct = allProducts.find(p => p.slug === lastSlug);
          if (!lastProduct) return null;
          return (
            <div className="px-5" style={{ marginBottom: 8 }}>
              <button
                onClick={() => navigate(`/product/${lastSlug}`)}
                style={{
                  width: '100%', padding: '16px 20px', borderRadius: 16,
                  background: 'rgba(15, 15, 15, 0.7)',
                  backdropFilter: 'blur(22px)', WebkitBackdropFilter: 'blur(22px)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  display: 'flex', alignItems: 'center', gap: 14,
                  boxShadow: '0 12px 36px rgba(0, 0, 0, 0.40), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
                  cursor: 'pointer', textAlign: 'left', WebkitTapHighlightColor: 'transparent',
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontFamily: 'var(--font-display)', fontVariationSettings: "'opsz' 16",
                    fontSize: 15, fontWeight: 400, color: LANTERN_GLOW, lineHeight: 1.3, margin: 0,
                  }}>
                    {lastProduct.name}
                  </p>
                  <p style={{
                    fontFamily: 'var(--font-body)', fontSize: 11,
                    color: 'rgba(253, 246, 227, 0.4)', margin: '2px 0 0',
                  }}>
                    {completedCountMap[lastProduct.id] || 0} av {lastProduct.cards.length} samtal
                  </p>
                </div>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 600, color: '#D4F5C0', opacity: 0.4 }}>→</span>
              </button>
            </div>
          );
        })()}

        {/* ── FÖR PAR — Vårt Vi marquee ── */}
        <div className="px-5">
          <SectionEyebrow label="För par" />
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
              <PastelTile
                key={product.id}
                name={product.name}
                productId={product.id}
                tagline={TAGLINES[product.id]}
                ageLabel={product.ageLabel}
                illustration={ILLUSTRATIONS[product.id]}
                onClick={() => navigate(`/product/${product.slug}`)}
                completedCount={completedCountMap[product.id] || 0}
                isPurchased={purchased.has(product.id)}
                totalCards={product.cards.length}
                darkTextOnTile={product.darkTextOnTile ?? false}
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
