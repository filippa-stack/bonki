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
import { MIDNIGHT_INK } from '@/lib/palette';


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

// Tiles render as uniform dark elevated surfaces against the library bg.
// Per-product color now lives entirely in the illustration.


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
        borderRadius: 18,
        background: '#2A2D3A',
        aspectRatio: '1 / 1.05',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        border: '0.5px solid rgba(255, 255, 255, 0.06)',
        boxShadow: 'none',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Title block — top zone, solid dark surface */}
      <div
        style={{
          padding: '16px 16px 14px',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <h3
          style={{
            fontFamily: 'Fraunces, serif',
            fontSize: 24,
            fontWeight: 500,
            lineHeight: 1.1,
            color: '#FFFFFF',
            letterSpacing: '-0.005em',
            margin: '0 0 4px',
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
              color: 'rgba(255, 255, 255, 0.78)',
              lineHeight: 1.3,
              margin: 0,
            }}
          >
            {tagline}
          </p>
        )}
      </div>

      {/* Illustration zone — fills remaining space, full color, no overlay */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
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
              objectPosition: 'center bottom',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Pill — bottom-left of illustration zone */}
        <span
          style={{
            position: 'absolute',
            bottom: 14,
            left: 14,
            zIndex: 2,
            display: 'inline-flex',
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
  usePageBackground(MIDNIGHT_INK);
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

  const libraryBg = MIDNIGHT_INK;

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
                    {lastProduct.name}
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
            <PastelTile
              name="Vårt Vi"
              productId="still_us"
              tagline={TAGLINES['still_us']}
              illustration={illustrationStillUs}
              onClick={() => navigate('/product/still-us')}
              completedCount={completedCountMap['still_us'] || 0}
              isPurchased={purchased.has('still_us')}
              totalCards={stillUsProduct?.cards.length ?? 22}
            />
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
