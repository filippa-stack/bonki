import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { allProducts } from '@/data/products';
import { useAllProductAccess } from '@/hooks/useAllProductAccess';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import LibraryResumeBanner from '@/components/LibraryResumeBanner';
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
  jag_med_andra: 'Det svåra och det trygga',
  jag_i_varlden: 'De stora frågorna',
  vardagskort: 'Det vanliga, på djupet',
  syskonkort: 'Band för livet',
  sexualitetskort: 'Kropp, gränser och identitet',
};

/** Creature-color tile backgrounds — chosen to complement each illustration */
const TILE_COLORS: Record<string, string> = {
  jag_i_mig: '#3A6260',       // Deep teal — from the character's clothing
  jag_med_andra: '#AC7A44',   // Warm amber — relational/togetherness theme
  jag_i_varlden: '#6C7362',   // Sage-olive — earthy, lets city scene pop
  sexualitetskort: '#A8766C',  // Dusty rose — contrast separates figures at thumbnail
  vardagskort: '#20484E',      // Dark petrol — lets bright pinks/greens/yellows sing
  syskonkort: '#8E5234',       // Sienna — warm wool blanket, from illustration palette
};

/** Luminance helper — determines if a tile needs light or dark treatment */
function isLightTile(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return L > 0.25;
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
  jag_i_mig: { width: '80%', height: '180%' },
  jag_med_andra: { width: '80%', height: '180%' },
  jag_i_varlden: { width: '80%', height: '180%' },
  sexualitetskort: { width: '75%', height: '175%' },
  vardagskort: { width: '75%', height: '175%' },
  syskonkort: { width: '75%', height: '175%' },
};

/** Per-product offset — characters visible and dramatic, bleeding right */
const ILLUSTRATION_OFFSET: Record<string, { top: string; right: string; bottom: string }> = {
  jag_i_mig: { top: '-25%', right: '-5%', bottom: '-25%' },
  jag_med_andra: { top: '-25%', right: '0%', bottom: '-25%' },
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

/** Per-tile radial glow color behind illustration — creates 3D depth */
const ILLUSTRATION_GLOW: Record<string, string> = {
  jag_i_mig: 'rgba(255, 220, 120, 0.55)',         // Warm golden halo — bright glow on light tile creates luminous lift
  jag_med_andra: 'rgba(100, 110, 220, 0.65)',      // Boosted indigo-blue glow for depth on midnight bg
  jag_i_varlden: 'rgba(60, 200, 100, 0.60)',       // Boosted emerald glow against dark forest bg
  sexualitetskort: 'rgba(240, 100, 60, 0.70)',     // Very strong warm orange — lifts off near-black bg
  vardagskort: 'rgba(200, 80, 200, 0.65)',          // Boosted magenta glow — needs punch on #060A0E
  syskonkort: 'rgba(80, 180, 255, 0.65)',           // Bright cyan-blue — contrasts #001B44 navy
};

/** Per-tile drop-shadow + saturation boost — makes character pop from bg */
const ILLUSTRATION_SHADOW: Record<string, string> = {
  jag_i_mig: 'saturate(1.35) contrast(1.2) drop-shadow(0 6px 18px rgba(180, 130, 20, 0.5)) drop-shadow(0 12px 36px rgba(200, 160, 40, 0.25)) drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
  jag_med_andra: 'saturate(1.4) brightness(1.3) drop-shadow(0 8px 24px rgba(0, 0, 40, 0.7)) drop-shadow(0 16px 48px rgba(70, 80, 180, 0.4)) drop-shadow(0 2px 4px rgba(0,0,0,0.45))',
  jag_i_varlden: 'saturate(1.4) brightness(1.3) drop-shadow(0 8px 24px rgba(0, 20, 8, 0.7)) drop-shadow(0 16px 48px rgba(50, 140, 70, 0.35)) drop-shadow(0 2px 4px rgba(0,0,0,0.45))',
  sexualitetskort: 'saturate(1.45) brightness(1.35) drop-shadow(0 8px 24px rgba(40, 8, 5, 0.75)) drop-shadow(0 16px 48px rgba(200, 70, 40, 0.4)) drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
  vardagskort: 'saturate(1.4) brightness(1.3) drop-shadow(0 8px 24px rgba(30, 6, 30, 0.75)) drop-shadow(0 16px 48px rgba(160, 60, 160, 0.4)) drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
  syskonkort: 'saturate(1.4) brightness(1.3) drop-shadow(0 8px 24px rgba(0, 15, 50, 0.75)) drop-shadow(0 16px 48px rgba(50, 120, 240, 0.4)) drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
};

/** Title colors — dark text on light tiles, light on dark */
const ACCENT_COLORS: Record<string, string> = {
  jag_i_mig: '#2C2420',       // Bark on gold
  jag_med_andra: '#FDF6E3',
  jag_i_varlden: '#FDF6E3',
  sexualitetskort: '#FDF6E3',
  vardagskort: '#FDF6E3',
  syskonkort: '#FDF6E3',
};

/** Tagline colors for tiles */
const TAGLINE_COLORS: Record<string, string> = {
  jag_i_mig: 'hsla(30, 25%, 22%, 0.70)',
  jag_med_andra: 'hsla(280, 40%, 85%, 0.75)',
  jag_i_varlden: 'hsla(140, 35%, 80%, 0.75)',
  sexualitetskort: 'hsla(5, 50%, 82%, 0.75)',
  vardagskort: 'hsla(25, 30%, 78%, 0.75)',
  syskonkort: 'hsla(100, 30%, 82%, 0.75)',
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
  hasActiveSession?: boolean;
}>(function PastelTile({
  name, bg, ageLabel, tagline, onClick, illustration, productId, accentColor, taglineColor,
  illustrationOpacity = 0.90, wide = false,
  hasActiveSession = false,
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
        height: '240px',
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
        backgroundImage: light
          ? 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.12) 100%)'
          : 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.08) 100%)',
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

      {/* Horizontal gradient scrim — text anchor left */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0, left: 0, bottom: 0,
          width: '55%',
          zIndex: 1,
          pointerEvents: 'none',
          background: `linear-gradient(to right, ${bgRgba(1)} 0%, ${bgRgba(0.9)} 30%, ${bgRgba(0.4)} 65%, transparent 100%)`,
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
            fontSize: '28px',
            fontWeight: 600,
            lineHeight: 1.15,
            color: accentColor || '#FDF6E3',
            letterSpacing: '-0.01em',
            textShadow: `0 1px 6px ${bgRgba(0.8)}, 0 0 16px ${bgRgba(0.6)}`,
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
              color: taglineColor || 'hsla(38, 50%, 75%, 0.55)',
              opacity: 0.7,
              marginTop: '6px',
              textShadow: `0 0 10px ${bgRgba(0.8)}`,
            }}
          >
            ✦ Första kortet gratis
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

  const libraryBg = '#1A1A2E';

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

      {/* ── Bold creature illustrations — hero-level, full color ── */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        {/* Radial saffron glow — atmospheric warmth behind title */}
        <div style={{
          position: 'absolute',
          top: '-20px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '120vw',
          height: '340px',
          background: 'radial-gradient(ellipse 55% 60% at 50% 35%, hsla(38, 78%, 48%, 0.14) 0%, hsla(38, 78%, 48%, 0.06) 45%, transparent 100%)',
          zIndex: 0,
        }} />
        {/* Girl — top left, smaller and softer for hierarchy */}
        <motion.img
          src={creatureGirl}
          alt=""
          draggable={false}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 0.42, y: 0 }}
          transition={{ delay: 0.4, duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'absolute',
            top: '10px',
            left: '-20px',
            width: '150px',
            height: 'auto',
            filter: 'brightness(1.1) saturate(0.75)',
          }}
        />
        {/* Lion — top right, dominant hero focal point */}
        <motion.img
          src={creatureLionSolo}
          alt=""
          draggable={false}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 0.6, y: 0 }}
          transition={{ delay: 0.5, duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'absolute',
            top: '-5px',
            right: '-25px',
            width: '290px',
            height: 'auto',
            filter: 'brightness(1.12) saturate(0.9)',
          }}
        />
        {/* Hero gradient scrim — ensures title legibility over creatures */}
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
        {/* Trio — bottom zone, watching from below */}
        <motion.img
          src={creaturesTrio}
          alt=""
          draggable={false}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.18 }}
          transition={{ delay: 1.0, duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'absolute',
            bottom: '-60px',
            left: '-80px',
            width: '460px',
            height: 'auto',
          }}
        />
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
              fontFamily: "var(--font-display)",
              fontVariationSettings: "'opsz' 36",
              fontSize: '44px',
              fontWeight: 400,
              color: 'hsla(38, 78%, 58%, 1)',
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              marginBottom: '12px',
              transition: 'color 400ms ease',
              textShadow: '0 0 30px hsla(38, 78%, 48%, 0.35), 0 2px 24px hsla(230, 25%, 10%, 0.9), 0 0 60px hsla(230, 25%, 10%, 0.5)',
            }}
          >
            Bonki
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
              color: 'hsla(38, 50%, 65%, 0.5)',
              lineHeight: 1.6,
              transition: 'color 400ms ease',
              textShadow: '0 1px 16px hsla(230, 25%, 10%, 0.8)',
            }}
          >
            Verktyg för samtalen som inte blir av
          </motion.p>
        </motion.div>

        {/* Saffron accent divider */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{
            width: '32px',
            height: '1.5px',
            backgroundColor: 'hsla(38, 78%, 50%, 0.35)',
            margin: '24px auto 32px',
          }}
        />

        

        {/* Resume banner — returning user hook */}
        <div className="px-5">
          <LibraryResumeBanner />
        </div>

        <div>
        {/* ── Still Us cross-discovery ── */}
        <div className="px-5" style={{ marginTop: '0px' }}>
          <div style={{
            borderTop: '1px solid hsla(38, 50%, 50%, 0.12)',
            paddingTop: '20px',
          }}>
            <p style={{
              fontFamily: "var(--font-body)",
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              color: '#6B5E52',
              marginBottom: '16px',
            }}>
              För er som par
            </p>
            <p style={{
              fontFamily: "var(--font-display)",
              fontVariationSettings: "'opsz' 15",
              fontSize: '15px',
              fontWeight: 400,
              color: '#E9B44C',
              opacity: 0.7,
              lineHeight: 1.6,
              textAlign: 'center',
              marginBottom: '20px',
            }}>
              Du tar hand om samtalen med barnen — nu är det er tur
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
                backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.08) 100%)',
                backgroundColor: '#263041',
                height: '240px',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden',
                border: '2px solid rgba(255, 255, 255, 0.45)',
                boxShadow: [
                  '0 16px 40px rgba(23, 17, 26, 0.4)',
                  '0 6px 16px rgba(23, 17, 26, 0.25)',
                  '0 1px 3px rgba(0, 0, 0, 0.10)',
                  '0 0 72px rgba(23, 17, 26, 0.18)',
                  'inset 0 3px 6px rgba(255, 255, 255, 0.45)',
                  'inset 0 -4px 10px rgba(23, 17, 26, 0.14)',
                ].join(', '),
              }}
            >
              {/* Inner warmth glow — saffron-tinted radial for life */}
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 0,
                  pointerEvents: 'none',
                  background: 'radial-gradient(ellipse 80% 90% at 65% 50%, rgba(212, 160, 58, 0.18) 0%, rgba(212, 160, 58, 0.06) 40%, transparent 70%)',
                }}
              />
              {/* Illustration — right-aligned, oversized like kids tiles */}
              <div style={{
                position: 'absolute',
                top: '-45%',
                right: '-15%',
                bottom: '-40%',
                width: '85%',
                pointerEvents: 'none',
                zIndex: 0,
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
                    opacity: 0.95,
                    filter: 'brightness(1.1) saturate(1.1)',
                  }}
                />
              </div>

              {/* Horizontal gradient scrim — text anchor left */}
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: 0, left: 0, bottom: 0,
                  width: '55%',
                  zIndex: 1,
                  pointerEvents: 'none',
                  background: `linear-gradient(to right, rgba(46, 34, 51, 1) 0%, rgba(46, 34, 51, 0.9) 30%, rgba(46, 34, 51, 0.4) 65%, transparent 100%)`,
                }}
              />

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
                <h3 style={{
                  fontFamily: "var(--font-display)",
                  fontVariationSettings: "'opsz' 24",
                  fontSize: '28px',
                  fontWeight: 600,
                  color: '#FDF6E3',
                  lineHeight: 1.15,
                  letterSpacing: '-0.01em',
                  textShadow: '0 1px 6px rgba(46, 34, 51, 0.8), 0 0 16px rgba(46, 34, 51, 0.6)',
                }}>
                  Still Us
                </h3>
                <p style={{
                  fontFamily: "var(--font-body)",
                  fontSize: '14px',
                  fontWeight: 400,
                  color: 'hsla(38, 55%, 75%, 0.8)',
                  marginTop: '4px',
                  lineHeight: 1.4,
                  textShadow: '0 0 10px rgba(46, 34, 51, 0.8)',
                }}>
                  22 samtal för er som vill stanna kvar
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
                    color: 'hsla(38, 40%, 80%, 0.65)',
                    background: 'hsla(38, 20%, 50%, 0.1)',
                    borderRadius: '12px',
                    padding: '3px 10px',
                  }}>
                    ca 20 min per samtal
                  </span>
                  <span style={{
                    fontFamily: "var(--font-body)",
                    fontSize: '10px',
                    fontWeight: 500,
                    letterSpacing: '0.04em',
                    color: 'hsla(38, 40%, 80%, 0.65)',
                    background: 'hsla(38, 20%, 50%, 0.1)',
                    borderRadius: '12px',
                    padding: '3px 10px',
                  }}>
                    ✦ 1a gratis
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Barn & Familj section anchor ── */}
        <div className="px-5" style={{ marginTop: '36px' }}>
          <div style={{
            borderTop: '1px solid hsla(38, 50%, 50%, 0.12)',
            paddingTop: '20px',
          }}>
            <p style={{
              fontFamily: "var(--font-body)",
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              color: '#6B5E52',
              marginBottom: '16px',
            }}>
              Barn & Familj
            </p>
          </div>
        </div>

        {/* Bridge sentence — children's products */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          style={{
            textAlign: 'center',
            padding: '4px 32px 4px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontVariationSettings: "'opsz' 15",
              fontStyle: 'normal',
              fontSize: '15px',
              fontWeight: 400,
              color: '#E9B44C',
              opacity: 0.7,
              lineHeight: 1.6,
            }}
          >
            Det barnet inte säger själv — börjar här
          </p>
        </motion.div>

        <div className="px-5" style={{ scrollMarginTop: '8px' }}>
          {/* Free-trial mention removed — now shown per-tile */}
          <LibraryResumeCard activeTab="barn" />
          <div style={{ height: '24px' }} />
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
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
          onClick={() => navigate('/diary/jag_i_mig')}
          className="cursor-pointer"
          style={{
            margin: '28px 20px 16px',
            padding: '16px 20px',
            borderRadius: '16px',
            background: 'hsla(230, 30%, 16%, 0.6)',
            border: '1px solid hsla(38, 60%, 50%, 0.12)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#E9B44C', opacity: 0.6, flexShrink: 0 }}>
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
              color: 'hsla(38, 50%, 65%, 0.5)',
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
            color: '#E9B44C',
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
