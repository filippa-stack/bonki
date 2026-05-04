import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import BonkiLoadingScreen from '@/components/BonkiLoadingScreen';
import KontoIcon from '@/components/KontoIcon';
import KontoSheet from '@/components/KontoSheet';
import { usePageBackground } from '@/hooks/usePageBackground';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { allProducts } from '@/data/products';
import { useAllProductAccess } from '@/hooks/useAllProductAccess';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { isDemoMode } from '@/lib/demoMode';
import { isIOSNative, isProductHiddenOnPlatform } from '@/lib/platform';


import LibraryResumeCard from '@/components/LibraryResumeCard';
import BonkiLogoMark from '@/components/BonkiLogoMark';
import watermarkMamma from '@/assets/watermark-mamma.png';
import creaturesTrio from '@/assets/creatures-trio.png';
import creatureLionGirl from '@/assets/creature-lion-girl.png';
import creatureGirl from '@/assets/creature-girl.png';
import creatureLionSolo from '@/assets/creature-lion-solo.png';
import bonkiWordmark from '@/assets/bonki-wordmark.png';

import illustrationStillUs from '@/assets/illustration-still-us-tile.png';
import illustrationJagIMig from '@/assets/illustration-jag-i-mig.png';
import illustrationJagMedAndra from '@/assets/illustration-jag-med-andra.png';
import illustrationJagIVarlden from '@/assets/illustration-jag-i-varlden.png';
import illustrationSexualitet from '@/assets/illustration-sexualitet.png';
import illustrationSyskon from '@/assets/illustration-syskon.png';
import illustrationVardag from '@/assets/illustration-vardag.png';
// illustrationStillFair removed — Still Fair section moved to future release

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
  still_us: 'Förbli ett vi medan ni uppfostrar dem',
  jag_i_mig: 'När känslor får ord',
  jag_med_andra: 'Att vara sig själv och samspela med andra',
  jag_i_varlden: 'Att utveckla sig själv i en värld som vidgas',
  vardagskort: 'Det vanliga, på djupet',
  syskonkort: 'Band för livet',
  sexualitetskort: 'Kropp, gränser och identitet',
};

/** Sexualitetskort keeps a flat fallback color (no gradient palette yet). */
const TILE_COLORS: Record<string, string> = {
  sexualitetskort: '#DD958B',
};

/** Map product id → CSS-var slug for gradient tile background. */
const PRODUCT_SLUG: Record<string, string> = {
  still_us: 'vartvi',
  jag_i_mig: 'jim',
  jag_med_andra: 'jma',
  jag_i_varlden: 'varlden',
  vardagskort: 'vardag',
  syskonkort: 'syskon',
};

/** v4 gradient tokens — saturated, high-chroma stops for vibrant tile bg. */
const GRADIENT_TOKENS_CSS = `
  .v4-library-root {
    --vartvi-bg-1:#C5D0E2; --vartvi-bg-2:#647892;
    --jim-bg-1:#3A9088;    --jim-bg-2:#175048;
    --jma-bg-1:#D86BA0;    --jma-bg-2:#7A2E5A;
    --varlden-bg-1:#D8E04A; --varlden-bg-2:#7A8019;
    --vardag-bg-1:#7FCEAB;  --vardag-bg-2:#3E8868;
    --syskon-bg-1:#D7B5EC;  --syskon-bg-2:#8868A8;
  }
`;

function tileBackground(productId: string, fallback: string): string {
  const slug = PRODUCT_SLUG[productId];
  return slug
    ? `linear-gradient(165deg, var(--${slug}-bg-1), var(--${slug}-bg-2))`
    : fallback;
}

/** Helper: hex → rgba */
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}


/** Detect return visit for faster animations */
const IS_RETURN_VISIT = (() => {
  try {
    const key = 'bonki_library_visited';
    const visited = sessionStorage.getItem(key);
    sessionStorage.setItem(key, '1');
    return !!visited;
  } catch { return false; }
})();

const ANIM_SPEED = IS_RETURN_VISIT ? 0.5 : 1;

const containerVariants = {
  hidden: {},
  visible: {},
};

const tileVariants = {
  hidden: { opacity: 1, y: 0, scale: 1 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

function AudienceLabel({ label, subtitle, delay = 0 }: { label: string; subtitle?: string; delay?: number }) {
  return (
    <div
      style={{
        textAlign: 'center',
        marginBottom: '16px',
        marginTop: '4px',
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: '10px',
          fontWeight: 600,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'rgba(253, 246, 227, 0.45)',
          marginBottom: subtitle ? '10px' : '0',
        }}
      >
        {label}
      </p>
      {subtitle && (
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontSize: '14px',
            fontWeight: 400,
            color: 'var(--color-text-secondary)',
            opacity: 0.55,
            lineHeight: 1.5,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

/** Library tile — full-bleed illustration, lower-left text, three-state pill */
const PastelTile = React.forwardRef<HTMLDivElement, {
  name: string;
  productId: string;
  tagline?: string;
  onClick?: () => void;
  illustration?: string;
  totalCards?: number;
  completedCount?: number;
  isPurchased?: boolean;
}>(function PastelTile({
  name, productId, tagline, onClick, illustration,
  totalCards = 0, completedCount = 0, isPurchased = false,
}, ref) {
  const fallbackBg = TILE_COLORS[productId] ?? '#1A2538';
  const tasted = !isPurchased && completedCount > 0;

  return (
    <motion.div
      ref={ref}
      variants={tileVariants}
      whileHover={{ scale: 1.025, y: -3 }}
      whileTap={{ scale: 0.96, y: 2 }}
      onClick={onClick}
      className="cursor-pointer"
      style={{
        borderRadius: 22,
        background: tileBackground(productId, fallbackBg),
        aspectRatio: '1 / 1.05',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.10)',
        boxShadow: `0 4px 28px ${hexToRgba(fallbackBg, 0.20)}, 0 2px 8px rgba(0, 0, 0, 0.18)`,
      }}
    >
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

      {/* Text — lower-left */}
      <div
        style={{
          position: 'absolute',
          left: 14,
          bottom: 14,
          right: 14,
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
          {name}
        </h3>
        {tagline && (
          <p
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 12,
              fontWeight: 400,
              color: 'rgba(255, 255, 255, 0.92)',
              lineHeight: 1.3,
              textShadow: '0 1px 6px rgba(0,0,0,0.35)',
              margin: '0 0 9px',
            }}
          >
            {tagline}
          </p>
        )}
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
});

export default function ProductLibrary() {
  useLayoutEffect(() => {
    document.documentElement.classList.remove('theme-verdigris');
    document.body.classList.remove('verdigris-grain', 'verdigris-lightleak');
  }, []);
  usePageBackground('#0B1026');
  const navigate = useNavigate();
  const tracked = useRef(false);
  
  const { purchased, loading: accessLoading } = useAllProductAccess();
  const { user } = useAuth();
  // Still Fair interest tracking (kept for future use)
  const [notifySignedUp, setNotifySignedUp] = useState(false);
  const [notifyLoading, setNotifyLoading] = useState(false);
  const [kontoOpen, setKontoOpen] = useState(false);
  const handleNotifyMe = async () => {};
   void notifySignedUp; void notifyLoading; void handleNotifyMe;
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
  const [lastActivityMap, setLastActivityMap] = useState<Record<string, string>>({});
  const [completedCountMap, setCompletedCountMap] = useState<Record<string, number>>({});
  const [completedCardSets, setCompletedCardSets] = useState<Record<string, Set<string>>>({});
  useEffect(() => {
    const syncLocalPreview = () => {
      if (!isDemoMode()) return;
      import('@/lib/demoSession').then(({ getAllDemoSessions }) => {
        setActiveProductIds(new Set(getAllDemoSessions().map(session => session.productId)));
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
        const timestamps: Record<string, string> = {};
        for (const s of activeRes.data) {
          if (s.product_id && s.last_activity_at) {
            timestamps[s.product_id] = s.last_activity_at;
          }
        }
        setLastActivityMap(timestamps);
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
        setCompletedCardSets(sets);
      }
    });

    return () => { cancelled = true; };
  }, [space?.id]);

  // Split products for layout
  const jagIMig = allProducts.find(p => p.id === 'jag_i_mig')!;
  const jagMedAndra = allProducts.find(p => p.id === 'jag_med_andra')!;
  const jagIVarlden = allProducts.find(p => p.id === 'jag_i_varlden')!;
  const sexualitet = allProducts.find(p => p.id === 'sexualitetskort')!;
  const vardag = allProducts.find(p => p.id === 'vardagskort')!;
  const syskon = allProducts.find(p => p.id === 'syskonkort')!;

  // Default kids product order (sexualitetskort hidden on iOS native for App Store 1.0)
  const defaultKidsOrder = [jagIMig, jagMedAndra, jagIVarlden, vardag, syskon, sexualitet]
    .filter(p => !isProductHiddenOnPlatform(p.id));

  // Smart ordering: products with active sessions first
  const sortedKidsProducts = useMemo(() => {
    const active = defaultKidsOrder.filter(p => activeProductIds.has(p.id));
    const inactive = defaultKidsOrder.filter(p => !activeProductIds.has(p.id));
    return [...active, ...inactive];
  }, [activeProductIds]);


  const isDark = true; // Both tabs now use Midnight Ink

  const libraryBg = '#0B1026';

  // Loading gate — prevent flash of incomplete content
  if (accessLoading) {
    return <BonkiLoadingScreen />;
  }

  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{
        background: libraryBg,
        ['--surface-base' as string]: libraryBg,
        fontFamily: "var(--font-body)",
        transition: 'background 600ms ease',
      }}
    >

      {/* ── Atmospheric background layers ── */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        {/* Radial ghost glow — atmospheric warmth behind title */}
        <div style={{
          position: 'absolute',
          top: '-20px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '120vw',
          height: '340px',
          background: 'radial-gradient(ellipse 55% 60% at 50% 35%, hsla(100, 60%, 80%, 0.10) 0%, hsla(100, 60%, 80%, 0.04) 45%, transparent 100%)',
          zIndex: 0,
        }} />

        {/* Twilight vignette — top corners, adds purple depth to night sky */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '50%',
          height: '400px',
          background: 'radial-gradient(ellipse 80% 70% at 0% 0%, rgba(74, 58, 107, 0.06) 0%, transparent 70%)',
          zIndex: 0,
        }} />
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '50%',
          height: '400px',
          background: 'radial-gradient(ellipse 80% 70% at 100% 0%, rgba(74, 58, 107, 0.06) 0%, transparent 70%)',
          zIndex: 0,
        }} />

        {/* Mid-zone warmth — Deep Navy bleed behind Föräldrar section */}
        <div style={{
          position: 'absolute',
          top: '350px',
          left: 0,
          right: 0,
          height: '600px',
          background: 'linear-gradient(180deg, transparent 0%, rgba(26, 39, 68, 0.08) 30%, rgba(74, 58, 107, 0.05) 60%, transparent 100%)',
          zIndex: 0,
        }} />

        {/* Forest floor emergence — Dark Forest tone behind Barn & Familj */}
        <div style={{
          position: 'absolute',
          top: '900px',
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(180deg, transparent 0%, rgba(28, 43, 26, 0.10) 25%, rgba(45, 69, 40, 0.08) 60%, rgba(28, 43, 26, 0.12) 100%)',
          zIndex: 0,
        }} />

        {/* Hero gradient scrim — ensures title legibility */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '360px',
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
        {/* Hero zone — compact cinematic */}
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          style={{
            textAlign: 'center',
            padding: 'calc(env(safe-area-inset-top, 0px) + 56px) 32px 0',
          }}
        >
          <motion.h1
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginBottom: '12px' }}
          >
            <img
              src={bonkiWordmark}
              alt="BONKI"
              style={{ maxHeight: '20px', width: 'auto', objectFit: 'contain', margin: '0 auto', display: 'block', filter: 'drop-shadow(0 0 30px hsla(100, 60%, 80%, 0.2))' }}
            />
          </motion.h1>
          <motion.p
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              fontFamily: "var(--font-body)",
              fontStyle: 'normal',
              fontSize: '14px',
              fontWeight: 400,
              color: 'hsla(100, 40%, 80%, 0.65)',
              lineHeight: 1.6,
              transition: 'color 400ms ease',
              textShadow: '0 1px 16px hsla(230, 25%, 10%, 0.8)',
            }}
          >
            Samtalen som bygger närhet.
          </motion.p>
        </motion.div>

        {/* Ghost glow accent divider */}
        <motion.div
          initial={{ scaleX: 1, opacity: 1 }}
          animate={{ scaleX: 1, opacity: 1 }}
          style={{
            width: '32px',
            height: '1.5px',
            backgroundColor: 'hsla(100, 50%, 75%, 0.45)',
            margin: '24px auto 32px',
          }}
        />
        



        {/* Resume card — product-colored, above Föräldrar */}
        <div className="px-5" style={{ marginBottom: '8px' }}>
          <LibraryResumeCard global />
        </div>

        {/* Next step suggestion — only for returning users with no active session */}
        {activeProductIds.size === 0 && Object.keys(completedCountMap).length > 0 && (() => {
          const untriedProduct = defaultKidsOrder.find(p => !completedCountMap[p.id]);
          if (!untriedProduct) return null;
          const isUntriedFree = false;
          return (
            <div className="px-5" style={{ marginBottom: '8px' }}>
              <button
                onClick={() => navigate(`/product/${untriedProduct.slug}`)}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  borderRadius: '16px',
                  background: 'rgba(15, 15, 15, 0.7)',
                  backdropFilter: 'blur(22px)',
                  WebkitBackdropFilter: 'blur(22px)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.08) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  boxShadow: '0 12px 36px rgba(0, 0, 0, 0.40), 0 4px 12px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.12), inset 0 -2px 6px rgba(0, 0, 0, 0.12)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(212, 160, 58, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <span style={{ fontSize: '16px', color: '#D4A03A' }}>✦</span>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontFamily: 'var(--font-display)',
                    fontVariationSettings: "'opsz' 16",
                    fontSize: '15px',
                    fontWeight: 400,
                    color: '#FDF6E3',
                    lineHeight: 1.3,
                    margin: 0,
                  }}>
                    Prova {untriedProduct.name}
                  </p>
                  <p style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '11px',
                    color: 'hsla(100, 40%, 80%, 0.45)',
                    marginTop: '2px',
                    margin: '2px 0 0',
                  }}>
                    {isUntriedFree ? 'Ert första samtal är gratis' : `${untriedProduct.cards.length} samtal`}
                  </p>
                </div>
                <span style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '10px',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  color: '#D4F5C0',
                  opacity: 0.4,
                }}>
                  →
                </span>
              </button>
            </div>
          );
        })()}

        {/* Return user nudge — when no active session and all products tried */}
        {activeProductIds.size === 0 &&
         Object.keys(completedCountMap).length > 0 &&
         !defaultKidsOrder.find(p => !completedCountMap[p.id]) && (() => {
          const lastSlug = localStorage.getItem('bonki-last-active-product');
          if (!lastSlug) return null;
          const lastProduct = allProducts.find(p => p.slug === lastSlug);
          if (!lastProduct) return null;
          return (
            <div className="px-5" style={{ marginBottom: '8px' }}>
              <button
                onClick={() => navigate(`/product/${lastSlug}`)}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  borderRadius: '16px',
                  background: 'rgba(15, 15, 15, 0.7)',
                  backdropFilter: 'blur(22px)',
                  WebkitBackdropFilter: 'blur(22px)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.08) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  boxShadow: '0 12px 36px rgba(0, 0, 0, 0.40), 0 4px 12px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.12), inset 0 -2px 6px rgba(0, 0, 0, 0.12)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontFamily: 'var(--font-display)',
                    fontVariationSettings: "'opsz' 16",
                    fontSize: '15px',
                    fontWeight: 400,
                    color: '#FDF6E3',
                    lineHeight: 1.3,
                    margin: 0,
                  }}>
                    Fortsätt utforska {lastProduct.name}
                  </p>
                  <p style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '11px',
                    color: 'rgba(253, 246, 227, 0.4)',
                    marginTop: '2px',
                    margin: '2px 0 0',
                  }}>
                    {completedCountMap[lastProduct.id] || 0} av {lastProduct.cards.length} samtal
                  </p>
                </div>
                <span style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '10px',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  color: '#D4F5C0',
                  opacity: 0.4,
                }}>
                  →
                </span>
              </button>
            </div>
          );
        })()}

        <div>
        {/* ── Still Us cross-discovery ── */}
        <div className="px-5" style={{ marginTop: '0px' }}>
          <div style={{
            borderTop: 'none',
            paddingTop: '20px',
            position: 'relative',
          }}>
            {/* Mushroom-tinted section divider */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: '10%',
              right: '10%',
              height: '1px',
              background: 'linear-gradient(90deg, transparent 0%, rgba(110, 201, 184, 0.15) 30%, rgba(110, 201, 184, 0.20) 50%, rgba(110, 201, 184, 0.15) 70%, transparent 100%)',
            }} />
            <p style={{
              fontFamily: "var(--font-body)",
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: '#FDF6E3',
              opacity: 0.55,
              marginBottom: '20px',
            }}>
              Föräldrar
            </p>
            <motion.div
              variants={tileVariants}
              initial={false}
              animate="visible"
              whileHover={{ scale: 1.015, y: -2 }}
              whileTap={{ scale: 0.97, y: 2 }}
              onClick={() => navigate('/product/still-us')}
              className="cursor-pointer"
              style={{
                borderRadius: '22px',
                backgroundColor: '#94BCE1',
                height: '260px',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.06)',
              }}
            >
              {/* Resume indicator for Still Us */}
              {activeProductIds.has('still_us') && (
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '3px',
                  zIndex: 4,
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#D4A03A',
                    boxShadow: '0 0 6px rgba(212, 160, 58, 0.5)',
                  }} />
                  <span style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '11px',
                    fontWeight: 500,
                    color: '#FDF6E3',
                    opacity: 0.7,
                  }}>
                    Fortsätt
                  </span>
                  {lastActivityMap['still_us'] && (
                    <span style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '9px',
                      fontWeight: 400,
                      color: '#FDF6E3',
                      opacity: 0.35,
                    }}>
                      {formatRelativeTime(lastActivityMap['still_us'])}
                    </span>
                  )}
                </div>
              )}
              {/* Illustration */}
              <div style={{
                position: 'absolute',
                top: '-12%',
                bottom: '-12%',
                right: '-40px',
                height: '124%',
                width: 'auto',
                aspectRatio: '1 / 1',
                maxWidth: '320px',
                pointerEvents: 'none',
                zIndex: 1,
              }}>
                <img
                  src={illustrationStillUs}
                  alt=""
                  draggable={false}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    objectPosition: 'right bottom',
                    opacity: 1,
                    filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.10))',
                  }}
                />
              </div>


              {/* Bottom scrim for text readability */}
              <div style={{
                position: 'absolute',
                left: 0, right: 0, bottom: 0,
                height: '70%',
                background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 40%, transparent 100%)',
                pointerEvents: 'none',
                zIndex: 2,
                borderRadius: '0 0 22px 22px',
              }} />

              {/* Text */}
              <div style={{
                position: 'absolute',
                left: 0, bottom: 0, right: 0,
                zIndex: 3,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '20px',
                paddingBottom: '24px',
              }}>
                <h3 style={{
                  fontFamily: "var(--font-display)",
                  fontVariationSettings: "'opsz' 24",
                  fontSize: '28px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  lineHeight: 1.15,
                  letterSpacing: '-0.01em',
                  textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.7), 0 0 20px rgba(0,0,0,0.5), 0 0 40px rgba(0,0,0,0.3)',
                }}>
                  Vårt Vi
                </h3>
                <p style={{
                  fontFamily: "var(--font-body)",
                  fontSize: '15px',
                  fontWeight: 500,
                  color: 'hsla(0, 0%, 100%, 0.85)',
                  marginTop: '4px',
                  lineHeight: 1.4,
                  textShadow: '0 1px 3px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6), 0 0 20px rgba(0,0,0,0.4)',
                }}>
                  Förbli ett vi medan ni uppfostrar dem
                </p>
                {/* Badge + progress */}
                <div style={{ marginTop: '8px' }}>
                  {(() => {
                    const suCount = completedCountMap['still_us'] || 0;
                    const suFreeCompleted = stillUsProduct?.freeCardId
                      ? (completedCardSets['still_us']?.has(stillUsProduct.freeCardId) ?? false)
                      : false;
                    const suShowFreeLabel = false;
                    const totalCards = stillUsProduct?.cards.length ?? 22;
                    return (
                      <>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          alignSelf: 'flex-start',
                          gap: '4px',
                          fontFamily: "var(--font-body)",
                          fontSize: '11px',
                          fontWeight: 600,
                          letterSpacing: '0.04em',
                          color: 'hsla(0, 0%, 100%, 0.9)',
                          background: purchased.has('still_us')
                            ? 'hsla(0, 0%, 100%, 0.15)'
                            : suFreeCompleted
                              ? 'hsla(45, 80%, 92%, 0.15)'
                              : 'hsla(0, 0%, 100%, 0.15)',
                          backdropFilter: 'blur(8px)',
                          WebkitBackdropFilter: 'blur(8px)',
                          border: purchased.has('still_us')
                            ? '1px solid hsla(0, 0%, 100%, 0.25)'
                            : suFreeCompleted
                              ? '1px solid hsla(45, 70%, 85%, 0.30)'
                              : '1px solid hsla(0, 0%, 100%, 0.25)',
                          borderRadius: '20px',
                          padding: '4px 12px',
                          boxShadow: '0 0 12px hsla(0, 0%, 100%, 0.08), inset 0 1px 0 hsla(0, 0%, 100%, 0.15)',
                        }}>
                          {purchased.has('still_us')
                            ? suCount > 0
                              ? `✦ ${suCount} av ${totalCards} utforskade`
                              : '✦ Börja er resa'
                            : suShowFreeLabel
                              ? <><span style={{ fontSize: '12px', color: 'white' }}>✦</span> Första gratis · {totalCards} samtal</>
                              : suFreeCompleted
                                ? <><svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 0 3px rgba(212,245,192,0.7)) drop-shadow(0 0 6px rgba(212,245,192,0.4))' }}><rect x="2" y="6.5" width="10" height="6.5" rx="1.5" fill="rgba(212,245,192,0.5)" stroke="#D4F5C0" strokeWidth="0.75" /><path d="M4.5 6.5V4.5C4.5 3.12 5.62 2 7 2C8.38 2 9.5 3.12 9.5 4.5V6.5" stroke="#D4F5C0" strokeWidth="1.5" strokeLinecap="round" /></svg> {totalCards} samtal</>
                                : <><svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 0 3px rgba(212,245,192,0.7)) drop-shadow(0 0 6px rgba(212,245,192,0.4))' }}><rect x="2" y="6.5" width="10" height="6.5" rx="1.5" fill="rgba(212,245,192,0.5)" stroke="#D4F5C0" strokeWidth="0.75" /><path d="M4.5 6.5V4.5C4.5 3.12 5.62 2 7 2C8.38 2 9.5 3.12 9.5 4.5V6.5" stroke="#D4F5C0" strokeWidth="1.5" strokeLinecap="round" /></svg> {totalCards} samtal</>}
                        </span>
                      </>
                    );
                  })()}
                </div>
              </div>
            </motion.div>
          </div>
        </div>


        {/* ── Barn & Familj section anchor ── */}
        <div className="px-5" style={{ marginTop: '0px' }}>
          <div style={{
            borderTop: 'none',
            paddingTop: '20px',
            position: 'relative',
          }}>
            {/* Mushroom-tinted section divider */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: '10%',
              right: '10%',
              height: '1px',
              background: 'linear-gradient(90deg, transparent 0%, rgba(110, 201, 184, 0.15) 30%, rgba(110, 201, 184, 0.20) 50%, rgba(110, 201, 184, 0.15) 70%, transparent 100%)',
            }} />
            <p style={{
              fontFamily: "var(--font-body)",
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: '#FDF6E3',
              opacity: 0.55,
              marginBottom: '20px',
            }}>
              Barn & Familj
            </p>
          </div>
        </div>


        <div className="px-5" style={{ scrollMarginTop: '8px' }}>
          {/* Free-trial mention removed — now shown per-tile */}
          {/* Resume card moved above Föräldrar */}
          <div style={{ height: '0px' }} />
          <motion.div
            variants={containerVariants}
            initial={false}
            animate="visible"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '28px',
            }}
          >
            {sortedKidsProducts.map((product) => {
              const count = completedCountMap[product.id] || 0;
              return (
                <PastelTile
                  key={product.id}
                  name={product.name}
                  productId={product.id}
                  tagline={TAGLINES[product.id]}
                  illustration={ILLUSTRATIONS[product.id]}
                  onClick={() => navigate(`/product/${product.slug}`)}
                  completedCount={count}
                  isPurchased={purchased.has(product.id)}
                  totalCards={product.cards.length}
                />
              );
            })}
          </motion.div>
        </div>

        </div>

        {/* Bottom safe-area spacing */}
        <div style={{ paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 0px))' }} />
      </div>
    </div>
  );
}
