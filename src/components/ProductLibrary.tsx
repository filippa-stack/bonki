import React, { useEffect, useMemo, useRef, useState } from 'react';
import { usePageBackground } from '@/hooks/usePageBackground';
import { useDefaultTheme } from '@/hooks/useDefaultTheme';
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

/** Bright saturated tile backgrounds — vibrant flat-color aesthetic */
const TILE_COLORS: Record<string, string> = {
  jag_i_mig: '#27A69C',
  jag_med_andra: '#CB7AB2',
  jag_i_varlden: '#C6D423',
  sexualitetskort: '#DD958B',
  vardagskort: '#8BDDB0',
  syskonkort: '#CF8BDD',
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
  jag_i_varlden: { top: '-42%', right: '0%', bottom: '-2%' },
  sexualitetskort: { top: '-25%', right: '0%', bottom: '-20%' },
  vardagskort: { top: '-25%', right: '0%', bottom: '-20%' },
  syskonkort: { top: '-25%', right: '0%', bottom: '-20%' },
};

/** Illustration opacities — subtle presence on bright backgrounds */
const ILLUSTRATION_OPACITY: Record<string, number> = {
  jag_i_mig: 1,
  jag_med_andra: 1,
  jag_i_varlden: 1,
  sexualitetskort: 1,
  vardagskort: 1,
  syskonkort: 1,
};

/** Per-tile radial glow — disabled for flat bright aesthetic */
const ILLUSTRATION_GLOW: Record<string, string> = {};

/** Per-tile drop-shadow — subtle grounding, no saturation/brightness boost */
const ILLUSTRATION_SHADOW: Record<string, string> = {
  jag_i_mig: 'drop-shadow(0 4px 12px rgba(0,0,0,0.10))',
  jag_med_andra: 'drop-shadow(0 4px 12px rgba(0,0,0,0.10))',
  jag_i_varlden: 'drop-shadow(0 4px 12px rgba(0,0,0,0.10))',
  sexualitetskort: 'drop-shadow(0 4px 12px rgba(0,0,0,0.10))',
  vardagskort: 'drop-shadow(0 4px 12px rgba(0,0,0,0.10))',
  syskonkort: 'drop-shadow(0 4px 12px rgba(0,0,0,0.10))',
};

/** Title colors — white on all tiles for max readability */
const ACCENT_COLORS: Record<string, string> = {
  jag_i_mig: '#FFFFFF',
  jag_med_andra: '#FFFFFF',
  jag_i_varlden: '#FFFFFF',
  sexualitetskort: '#FFFFFF',
  vardagskort: '#FFFFFF',
  syskonkort: '#FFFFFF',
};

/** Tagline colors — white with slight transparency */
const TAGLINE_COLORS: Record<string, string> = {
  jag_i_mig: 'hsla(0, 0%, 100%, 0.85)',
  jag_med_andra: 'hsla(0, 0%, 100%, 0.85)',
  jag_i_varlden: 'hsla(0, 0%, 100%, 0.85)',
  sexualitetskort: 'hsla(0, 0%, 100%, 0.85)',
  vardagskort: 'hsla(0, 0%, 100%, 0.85)',
  syskonkort: 'hsla(0, 0%, 100%, 0.85)',
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
    </div>
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
}, ref) {
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
          ? '1px solid rgba(0, 0, 0, 0.08)'
          : '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: [
          `0 8px 24px rgba(0, 0, 0, 0.12)`,
          `0 2px 6px rgba(0, 0, 0, 0.06)`,
        ].join(', '),
      }}
    >
      {/* Illustration — right-aligned, bleeds off edge dramatically */}
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
            fontSize: '28px',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            lineHeight: 1.15,
            color: accentColor || '#FDF6E3',
            letterSpacing: '-0.01em',
            textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.7), 0 0 20px rgba(0,0,0,0.5), 0 0 40px rgba(0,0,0,0.3)',
          }}
        >
          {name}
        </h3>
        {tagline && (
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: '15px',
              fontWeight: 500,
              color: taglineColor || '#FDF6E3',
              opacity: 0.9,
              marginTop: '4px',
              lineHeight: 1.4,
              textShadow: '0 1px 3px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6), 0 0 20px rgba(0,0,0,0.4)',
            }}
          >
            {tagline}
          </p>
          )}
          {/* Free badge marker with age label */}
          <span
            style={{
              display: 'inline-flex',
              alignSelf: 'flex-start',
              alignItems: 'center',
              gap: '4px',
              marginTop: '8px',
              padding: '4px 12px',
              borderRadius: '20px',
              background: 'hsla(0, 0%, 100%, 0.15)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid hsla(0, 0%, 100%, 0.25)',
              boxShadow: '0 0 12px hsla(0, 0%, 100%, 0.08), inset 0 1px 0 hsla(0, 0%, 100%, 0.15)',
              fontFamily: "var(--font-body)",
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.03em',
              color: 'hsla(0, 0%, 100%, 0.92)',
            }}
          >
            ✦ Samtal 1 gratis{ageLabel ? ` · ${ageLabel}` : ''}
          </span>
        </div>
    </motion.div>
  );
});
export default function ProductLibrary() {
  useDefaultTheme();
  usePageBackground('#0B1026');
  const navigate = useNavigate();
  const tracked = useRef(false);
  
  const { purchased, loading: accessLoading } = useAllProductAccess();
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

  // Loading gate — prevent flash of incomplete content
  if (accessLoading) {
    return <div style={{ minHeight: '100vh', backgroundColor: '#0B1026' }} />;
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
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
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
          initial={{ scaleX: 1, opacity: 1 }}
          animate={{ scaleX: 1, opacity: 1 }}
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
              {/* Illustration */}
              <div style={{
                position: 'absolute',
                top: '0%',
                left: '-15%',
                right: '-15%',
                bottom: '-45%',
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
                    objectPosition: 'center 12%',
                    opacity: 1,
                    filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.10))',
                  }}
                />
              </div>


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
                  Still Us
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
                    fontSize: '11px',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    color: 'hsla(0, 0%, 100%, 0.9)',
                    background: 'hsla(0, 0%, 100%, 0.15)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    border: '1px solid hsla(0, 0%, 100%, 0.25)',
                    borderRadius: '20px',
                    padding: '4px 12px',
                    boxShadow: '0 0 12px hsla(0, 0%, 100%, 0.08), inset 0 1px 0 hsla(0, 0%, 100%, 0.15)',
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
            initial={false}
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
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
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
        <div style={{ paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 0px))' }} />
      </div>
    </div>
  );
}
