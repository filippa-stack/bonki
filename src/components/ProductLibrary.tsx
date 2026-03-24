import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { allProducts } from '@/data/products';
import { useAllProductAccess } from '@/hooks/useAllProductAccess';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { isDemoMode } from '@/lib/demoMode';

import LibraryResumeCard from '@/components/LibraryResumeCard';
import watermarkMamma from '@/assets/watermark-mamma.png';
import creaturesTrio from '@/assets/creatures-trio.png';
import creatureLionGirl from '@/assets/creature-lion-girl.png';
import creatureGirl from '@/assets/creature-girl.png';
import creatureLionSolo from '@/assets/creature-lion-solo.png';

import illustrationStillUs from '@/assets/illustration-still-us-tile.png';
import illustrationJagIMig from '@/assets/illustration-jag-i-mig.png';
import illustrationJagMedAndra from '@/assets/illustration-jag-med-andra.png';
import illustrationJagIVarlden from '@/assets/illustration-jag-i-varlden.png';
import illustrationSexualitet from '@/assets/illustration-sexualitet.png';
import illustrationSyskon from '@/assets/illustration-syskon.png';
import illustrationVardag from '@/assets/illustration-vardag.png';
// illustrationStillFair removed — Still Fair section moved to future release

const ILLUSTRATIONS: Record<string, string> = {
  jag_i_mig: illustrationJagIMig,
  jag_med_andra: illustrationJagMedAndra,
  jag_i_varlden: illustrationJagIVarlden,
  sexualitetskort: illustrationSexualitet,
  syskonkort: illustrationSyskon,
  vardagskort: illustrationVardag,
};

const TAGLINES: Record<string, string> = {
  jag_i_mig: 'När känslor får ord',
  jag_med_andra: 'Det trygga och det svåra',
  jag_i_varlden: 'Världen vidgas',
  vardagskort: 'Det vanliga, på djupet',
  syskonkort: 'Band för livet',
  sexualitetskort: 'Kropp, gränser och identitet',
};

/** Creature-color tile backgrounds — chosen to complement each illustration */
const TILE_COLORS: Record<string, string> = {
  jag_i_mig: '#2D6B62',       // Deep chromatic teal — matches character clothing
  jag_med_andra: '#B07A3A',   // Warm amber-orange — resonant, not dusty
  jag_i_varlden: '#2A4A6B',   // Richer dusk blue — more saturated, separates from Still Us
  sexualitetskort: '#A8766D',  // Warm terracotta-rose
  vardagskort: '#0A1A18',      // Charcoal-green — separates from blue family
  syskonkort: '#3A1820',       // Deep cherry — warm complement to yellow/orange characters
};

/** Luminance helper — determines if a tile needs light or dark treatment.
 *  Threshold 0.38 so only truly light tiles (amber, dusty rose) get dark borders. */
function isLightTile(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return L > 0.38;
}

/** Helper: hex → rgba */
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Per-product illustration scale — large enough for dramatic presence */
const ILLUSTRATION_SCALE: Record<string, { width: string; height: string }> = {
  jag_i_mig: { width: '75%', height: '105%' },
  jag_med_andra: { width: '75%', height: '100%' },
  jag_i_varlden: { width: '80%', height: '180%' },
  sexualitetskort: { width: '75%', height: '175%' },
  vardagskort: { width: '75%', height: '175%' },
  syskonkort: { width: '75%', height: '175%' },
};

/** Per-product offset — characters visible and dramatic, bleeding right */
const ILLUSTRATION_OFFSET: Record<string, { top: string; right: string; bottom: string }> = {
  jag_i_mig: { top: '-3%', right: '-5%', bottom: '-2%' },
  jag_med_andra: { top: '-5%', right: '-8%', bottom: '-5%' },
  jag_i_varlden: { top: '-22%', right: '0%', bottom: '-22%' },
  sexualitetskort: { top: '-25%', right: '0%', bottom: '-20%' },
  vardagskort: { top: '-25%', right: '0%', bottom: '-20%' },
  syskonkort: { top: '-25%', right: '0%', bottom: '-20%' },
};

/** Illustration opacities — pushed high for max POP */
const ILLUSTRATION_OPACITY: Record<string, number> = {
  jag_i_mig: 0.92,
  jag_med_andra: 0.92,
  jag_i_varlden: 0.92,
  sexualitetskort: 0.92,
  vardagskort: 0.92,
  syskonkort: 0.92,
};

/** Per-tile radial glow color behind illustration — creates 3D depth
 *  Calibrated for mid-tone tile palette (Mar 2026): complementary hue glow */
const ILLUSTRATION_GLOW: Record<string, string> = {
  jag_i_mig: 'rgba(240, 190, 80, 0.12)',
  jag_med_andra: 'rgba(160, 130, 220, 0.10)',
  jag_i_varlden: 'rgba(140, 200, 230, 0.12)',
  sexualitetskort: 'rgba(180, 130, 200, 0.12)',
  vardagskort: 'rgba(200, 180, 100, 0.12)',
  syskonkort: 'rgba(220, 180, 80, 0.14)',
};

/** Per-tile drop-shadow + saturation boost — makes character pop from bg
 *  Shadow colors derived from each tile's own bg for natural grounding */
const ILLUSTRATION_SHADOW: Record<string, string> = {
  jag_i_mig: 'saturate(1.3) brightness(1.15) drop-shadow(0 6px 20px rgba(30, 50, 48, 0.5)) drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
  jag_med_andra: 'saturate(1.3) contrast(1.1) brightness(1.1) drop-shadow(0 6px 20px rgba(86, 61, 34, 0.5)) drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
  jag_i_varlden: 'saturate(1.3) brightness(1.2) drop-shadow(0 6px 20px rgba(21, 37, 54, 0.6)) drop-shadow(0 2px 4px rgba(0,0,0,0.25))',
  sexualitetskort: 'saturate(1.3) brightness(1.25) drop-shadow(0 6px 20px rgba(30, 20, 40, 0.6)) drop-shadow(0 2px 4px rgba(0,0,0,0.25))',
  vardagskort: 'saturate(1.3) brightness(1.2) drop-shadow(0 8px 24px rgba(7, 30, 40, 0.6)) drop-shadow(0 2px 4px rgba(0,0,0,0.25))',
  syskonkort: 'saturate(1.35) brightness(1.2) drop-shadow(0 6px 20px rgba(42, 16, 24, 0.5)) drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
};

/** Title colors — dark text on lighter tiles, light on darker ones */
const ACCENT_COLORS: Record<string, string> = {
  jag_i_mig: '#FDF6E3',       // Light on deep teal
  jag_med_andra: '#FDF6E3',   // Light on warm amber
  jag_i_varlden: '#FDF6E3',   // Light on dusk blue
  sexualitetskort: '#FDF6E3', // Light on bark brown
  vardagskort: '#FDF6E3',     // Light on dark petrol
  syskonkort: '#FDF6E3',      // Light on sienna
};

/** Tagline colors — tinted to each tile's family */
const TAGLINE_COLORS: Record<string, string> = {
  jag_i_mig: 'hsla(178, 30%, 82%, 0.90)',
  jag_med_andra: 'hsla(30, 30%, 85%, 0.90)',
  jag_i_varlden: 'hsla(210, 35%, 82%, 0.90)',
  sexualitetskort: 'hsla(300, 30%, 82%, 0.90)',
  vardagskort: 'hsla(190, 25%, 80%, 0.90)',
  syskonkort: 'hsla(15, 30%, 82%, 0.90)',
};

/** Tile height rhythm — alternating for visual breathing */
const TILE_HEIGHTS: Record<string, string> = {
  jag_i_mig: '260px',
  jag_med_andra: '240px',
  jag_i_varlden: '260px',
  sexualitetskort: '220px',
  vardagskort: '240px',
  syskonkort: '220px',
};

/** Build badge text: "X ämnen" — no pricing on individual tiles */
function buildBadgeText(product: { cards: unknown[]; id: string }): string {
  const count = product.cards.length;
  return `${count} ämnen`;
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
  visible: {
    transition: { staggerChildren: 0.08 * ANIM_SPEED, delayChildren: 0.25 * ANIM_SPEED },
  },
};

const tileVariants = {
  hidden: { opacity: 0, y: 40 * ANIM_SPEED, scale: 0.88 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7 * ANIM_SPEED, ease: [0.22, 1, 0.36, 1] as const },
  },
};

function AudienceLabel({ label, subtitle, delay = 0 }: { label: string; subtitle?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.6 }}
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
          color: '#A09890',
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
    </motion.div>
  );
}

/** Portal tile — illustration bleeds right, text anchored left */
const PastelTile = React.forwardRef<HTMLDivElement, {
  name: string; bg: string; ageLabel?: string; tagline?: string;
  onClick?: () => void; illustration?: string; productId?: string;
  accentColor?: string; taglineColor?: string; illustrationOpacity?: number;
  illustrationSize?: string; illustrationPosition?: string; wide?: boolean;
  showFreeBadge?: boolean; badgeText?: string; ageCount?: number;
  hasActiveSession?: boolean; tileHeight?: string;
}>(function PastelTile({
  name, bg, ageLabel, tagline, onClick, illustration, productId, accentColor, taglineColor,
  illustrationOpacity = 0.90, wide = false,
  hasActiveSession = false, tileHeight = '240px',
}) {
  const toShadowColor = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${Math.round(r * 0.5)}, ${Math.round(g * 0.5)}, ${Math.round(b * 0.5)}, ${alpha})`;
  };

  const bgR = parseInt(bg.slice(1, 3), 16);
  const bgG = parseInt(bg.slice(3, 5), 16);
  const bgB = parseInt(bg.slice(5, 7), 16);
  const bgRgba = (a: number) => `rgba(${bgR}, ${bgG}, ${bgB}, ${a})`;

  const scale = productId ? ILLUSTRATION_SCALE[productId] : undefined;
  const offset = productId ? ILLUSTRATION_OFFSET[productId] : undefined;
  const opacity = productId ? ILLUSTRATION_OPACITY[productId] ?? illustrationOpacity : illustrationOpacity;

  const light = isLightTile(bg);

  return (
    <motion.div
      variants={tileVariants}
      whileHover={{ scale: 1.025, y: -3 }}
      whileTap={{ scale: 0.94, y: 3 }}
      onClick={onClick}
      className="cursor-pointer"
      style={{
        borderRadius: '22px',
        backgroundColor: bg,
        height: tileHeight,
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
        backgroundImage: 'none',
        border: light
          ? '1.5px solid rgba(0, 0, 0, 0.10)'
          : '1.5px solid rgba(255, 255, 255, 0.30)',
        boxShadow: light
          ? [
              `0 16px 40px ${toShadowColor(bg, 0.35)}`,
              `0 6px 16px ${toShadowColor(bg, 0.2)}`,
              '0 1px 3px rgba(0, 0, 0, 0.08)',
              `0 0 60px ${toShadowColor(bg, 0.15)}`,
              `inset 0 3px 6px rgba(255, 255, 255, 0.25)`,
              `inset 0 -4px 10px ${toShadowColor(bg, 0.10)}`,
            ].join(', ')
          : [
              `0 16px 40px ${toShadowColor(bg, 0.4)}`,
              `0 6px 16px ${toShadowColor(bg, 0.25)}`,
              '0 1px 3px rgba(0, 0, 0, 0.10)',
              `0 0 72px ${toShadowColor(bg, 0.18)}`,
              'inset 0 3px 6px rgba(255, 255, 255, 0.45)',
              `inset 0 -4px 10px ${toShadowColor(bg, 0.14)}`,
            ].join(', '),
      }}
    >
      {/* Dual-layer radial glow behind illustration — wide ambient + tight concentrated */}
      {illustration && productId && ILLUSTRATION_GLOW[productId] && (
        <>
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 0,
              pointerEvents: 'none',
              background: `radial-gradient(ellipse 80% 90% at 65% 55%, ${ILLUSTRATION_GLOW[productId]} 0%, transparent 65%)`,
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 0,
              pointerEvents: 'none',
              background: `radial-gradient(ellipse 45% 55% at 70% 50%, ${ILLUSTRATION_GLOW[productId].replace(/[\d.]+\)$/, '0.30)')} 0%, transparent 70%)`,
            }}
          />
        </>
      )}
      {/* Illustration — right-aligned, bleeds off edge dramatically, with depth shadow */}
      {illustration && (
        <div
          style={{
            position: 'absolute',
            top: offset?.top ?? '-15%',
            right: offset?.right ?? '-12%',
            bottom: offset?.bottom ?? '-10%',
            width: scale?.width ?? '70%',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        >
          <img
            src={illustration}
            alt=""
            draggable={false}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              objectPosition: 'center bottom',
              opacity,
              filter: productId ? (ILLUSTRATION_SHADOW[productId] ?? '') : '',
            }}
          />
        </div>
      )}

      {/* Localized text backdrop — bottom-left corner protection */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: 0,
          bottom: 0,
          width: '60%',
          height: '70%',
          zIndex: 1,
          pointerEvents: 'none',
          borderRadius: '0 0 0 22px',
          background: `linear-gradient(to top right, ${bgRgba(0.92)} 0%, ${bgRgba(0.65)} 35%, ${bgRgba(0.25)} 60%, transparent 100%)`,
        }}
      />

      {/* Age badge — Parchment circle, top-right */}
      {ageLabel && (
        <span
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "var(--font-body)",
            fontSize: '12px',
            fontWeight: 600,
            color: '#2C2420',
            background: '#F5EDD2',
            zIndex: 3,
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          }}
        >
          {ageLabel}
        </span>
      )}

      {/* Resume indicator */}
      {hasActiveSession && (
        <div
          style={{
            position: 'absolute',
            top: ageLabel ? '50px' : '12px',
            right: '14px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3px',
            zIndex: 4,
          }}
        >
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#D4A03A',
            boxShadow: '0 0 6px rgba(212, 160, 58, 0.5)',
          }} />
          <span style={{
            fontFamily: "var(--font-body)",
            fontSize: '11px',
            fontWeight: 500,
            color: '#FDF6E3',
            opacity: 0.7,
          }}>
            Fortsätt
          </span>
        </div>
      )}

      {/* Text — left-aligned, lower-third emphasis */}
      <div style={{
        position: 'absolute',
        left: 0, bottom: 0, top: 0,
        width: '55%',
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '20px',
        paddingBottom: '24px',
      }}>
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontVariationSettings: "'opsz' 24",
            fontSize: '26px',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            lineHeight: 1.15,
            color: accentColor || '#FDF6E3',
            letterSpacing: '-0.01em',
            textShadow: `0 2px 8px ${bgRgba(1)}, 0 0 20px ${bgRgba(0.9)}, 0 0 40px ${bgRgba(0.5)}`,
          }}
        >
          {name}
        </h3>
        {tagline && (
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: '14px',
              fontWeight: 400,
              color: taglineColor || '#FDF6E3',
              opacity: 0.8,
              marginTop: '4px',
              lineHeight: 1.4,
              textShadow: `0 0 10px ${bgRgba(0.8)}`,
            }}
          >
            {tagline}
          </p>
          )}
          {/* Free badge marker */}
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: '10px',
              fontWeight: 500,
              letterSpacing: '0.04em',
              color: taglineColor || 'hsla(100, 40%, 80%, 0.50)',
              opacity: 0.7,
              marginTop: '6px',
              textShadow: `0 0 10px ${bgRgba(0.8)}`,
            }}
          >
            ✦ Samtal 1 gratis
          </p>
        </div>
    </motion.div>
  );
});
export default function ProductLibrary() {
  const navigate = useNavigate();
  const tracked = useRef(false);
  const { purchased } = useAllProductAccess();
  const { user } = useAuth();
  // Still Fair interest tracking (kept for future use)
  const [notifySignedUp, setNotifySignedUp] = useState(false);
  const [notifyLoading, setNotifyLoading] = useState(false);
  const handleNotifyMe = async () => {};
  void notifySignedUp; void notifyLoading; void handleNotifyMe;

  useEffect(() => {
    if (!tracked.current) {
      tracked.current = true;
      import('@/lib/trackOnboarding').then(m => m.trackOnboardingEvent('lobby_view'));
    }
  }, []);

  // Fetch active sessions across all products for resume indicators
  const { space } = useCoupleSpaceContext();
  const [activeProductIds, setActiveProductIds] = useState<Set<string>>(new Set());
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
    supabase
      .from('couple_sessions')
      .select('product_id, last_activity_at')
      .eq('couple_space_id', space.id)
      .eq('status', 'active')
      .order('last_activity_at', { ascending: false })
      .then(({ data }) => {
        if (!cancelled && data) {
          setActiveProductIds(new Set(data.map(s => s.product_id)));
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

  // Default kids product order
  const defaultKidsOrder = [jagIMig, jagMedAndra, jagIVarlden, vardag, syskon, sexualitet];

  // Smart ordering: products with active sessions first
  const sortedKidsProducts = useMemo(() => {
    const active = defaultKidsOrder.filter(p => activeProductIds.has(p.id));
    const inactive = defaultKidsOrder.filter(p => !activeProductIds.has(p.id));
    return [...active, ...inactive];
  }, [activeProductIds]);

  const isDark = true; // Both tabs now use Midnight Ink

  const libraryBg = '#0B1026';

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
        {/* Hero zone — compact cinematic */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{
            textAlign: 'center',
            padding: '56px 32px 0',
          }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '52px',
              fontWeight: 400,
              color: '#D4F5C0',
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              marginBottom: '12px',
              transition: 'color 400ms ease',
              textShadow: '0 0 30px hsla(100, 60%, 80%, 0.2), 0 2px 24px hsla(230, 25%, 10%, 0.9), 0 0 60px hsla(230, 25%, 10%, 0.5)',
            }}
          >
            BONKI
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            style={{
              fontFamily: "var(--font-body)",
              fontStyle: 'normal',
              fontSize: '14px',
              fontWeight: 400,
              color: 'hsla(100, 40%, 80%, 0.45)',
              lineHeight: 1.6,
              transition: 'color 400ms ease',
              textShadow: '0 1px 16px hsla(230, 25%, 10%, 0.8)',
            }}
          >
            Verktyg för samtalen som inte blir av
          </motion.p>
        </motion.div>

        {/* Ghost glow accent divider */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{
            width: '32px',
            height: '1.5px',
            backgroundColor: 'hsla(100, 50%, 75%, 0.30)',
            margin: '24px auto 32px',
          }}
        />

        

        {/* Resume card — product-colored, above Föräldrar */}
        <div className="px-5" style={{ marginBottom: '8px' }}>
          <LibraryResumeCard global />
        </div>

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
              color: '#D4F5C0',
              marginBottom: '20px',
            }}>
              Föräldrar
            </p>
            <motion.div
              variants={tileVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.015, y: -2 }}
              whileTap={{ scale: 0.97, y: 2 }}
              onClick={() => navigate('/product/still-us')}
              className="cursor-pointer"
              style={{
                borderRadius: '22px',
                backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.12) 100%)',
                backgroundColor: '#1A1A22',
                height: '260px',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden',
                border: '1.5px solid rgba(255, 255, 255, 0.12)',
                boxShadow: [
                  '0 20px 60px rgba(0, 0, 0, 0.55)',
                  '0 8px 24px rgba(0, 0, 0, 0.35)',
                  '0 0 72px rgba(200, 160, 120, 0.18)',
                  'inset 0 3px 6px rgba(255, 255, 255, 0.15)',
                  'inset 0 -4px 10px rgba(0, 0, 0, 0.25)',
                ].join(', '),
              }}
            >
              {/* Warm radial glow behind illustration */}
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 0,
                  pointerEvents: 'none',
                  background: 'radial-gradient(ellipse 80% 70% at 50% 35%, rgba(200, 150, 100, 0.15) 0%, rgba(200, 150, 100, 0.05) 50%, transparent 75%)',
                }}
              />
              {/* Illustration — centered, filling tile */}
              <div style={{
                position: 'absolute',
                top: '-15%',
                left: '-25%',
                right: '-25%',
                bottom: '-50%',
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
                    objectPosition: 'center top',
                    opacity: 0.95,
                    filter: 'brightness(1.2) saturate(1.4) contrast(1.08)',
                  }}
                />
              </div>

              {/* Bottom gradient scrim — text legibility */}
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  left: 0, right: 0, bottom: 0,
                  height: '55%',
                  zIndex: 2,
                  pointerEvents: 'none',
                  background: `linear-gradient(to top, rgba(26, 26, 34, 0.92) 0%, rgba(26, 26, 34, 0.6) 40%, rgba(26, 26, 34, 0.1) 75%, transparent 100%)`,
                }}
              />

              {/* Text — left-aligned, lower-third emphasis */}
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
                  fontWeight: 600,
                  color: '#FDF6E3',
                  lineHeight: 1.15,
                  letterSpacing: '-0.01em',
                  textShadow: '0 1px 8px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 0, 0, 0.5)',
                }}>
                  Still Us
                </h3>
                <p style={{
                  fontFamily: "var(--font-body)",
                  fontSize: '14px',
                  fontWeight: 400,
                  color: 'hsla(100, 40%, 85%, 0.7)',
                  marginTop: '4px',
                  lineHeight: 1.4,
                  textShadow: '0 0 12px rgba(0, 0, 0, 0.8)',
                }}>
                  22 samtalsövningar för er som vill stanna kvar
                </p>
                {/* Trust signal badges */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '8px',
                  flexWrap: 'wrap',
                }}>
                  <span style={{
                    fontFamily: "var(--font-body)",
                    fontSize: '10px',
                    fontWeight: 500,
                    letterSpacing: '0.04em',
                    color: 'hsla(100, 35%, 85%, 0.6)',
                    background: 'hsla(100, 20%, 50%, 0.08)',
                    borderRadius: '12px',
                    padding: '3px 10px',
                  }}>
                    ✦ Samtal 1 gratis
                  </span>
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
              color: '#D4F5C0',
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
            initial="hidden"
            animate="visible"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '28px',
            }}
          >
            {sortedKidsProducts.map((product) => (
              <PastelTile
                key={product.id}
                name={product.name}
                bg={TILE_COLORS[product.id]!}
                productId={product.id}
                tagline={TAGLINES[product.id]}
                ageLabel={product.ageLabel}
                accentColor={ACCENT_COLORS[product.id]}
                taglineColor={TAGLINE_COLORS[product.id]}
                illustration={ILLUSTRATIONS[product.id]}
                illustrationOpacity={ILLUSTRATION_OPACITY[product.id]}
                onClick={() => navigate(`/product/${product.slug}`)}
                badgeText={buildBadgeText(product)}
                hasActiveSession={activeProductIds.has(product.id)}
                tileHeight={TILE_HEIGHTS[product.id] ?? '240px'}
                wide
              />
            ))}
          </motion.div>
        </div>

        {/* Era samtal — compact return-loop hook */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 * ANIM_SPEED, duration: 0.7 * ANIM_SPEED, ease: [0.22, 1, 0.36, 1] }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/journal')}
          className="cursor-pointer"
          style={{
            margin: '28px 20px 16px',
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
            boxShadow: [
              '0 12px 36px rgba(0, 0, 0, 0.40)',
              '0 4px 12px rgba(0, 0, 0, 0.25)',
              'inset 0 1px 0 rgba(255, 255, 255, 0.12)',
              'inset 0 -2px 6px rgba(0, 0, 0, 0.12)',
            ].join(', '),
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#D4F5C0', opacity: 0.6, flexShrink: 0 }}>
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
          </svg>
          <div style={{ flex: 1 }}>
            <p style={{
              fontFamily: "var(--font-display)",
              fontVariationSettings: "'opsz' 16",
              fontSize: '15px',
              fontWeight: 400,
              color: '#FDF6E3',
              lineHeight: 1.3,
            }}>
              Era samtal
            </p>
            <p style={{
              fontFamily: "var(--font-body)",
              fontSize: '10px',
              color: 'hsla(100, 40%, 80%, 0.45)',
              marginTop: '2px',
            }}>
              Varje samtal sparas
            </p>
          </div>
          <span style={{
            fontFamily: "var(--font-body)",
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '0.06em',
            color: '#D4F5C0',
            opacity: 0.4,
          }}>
            →
          </span>
        </motion.div>
        </div>

        {/* Bottom safe-area spacing */}
        <div style={{ paddingBottom: 'calc(48px + env(safe-area-inset-bottom, 0px))' }} />
      </div>
    </div>
  );
}
