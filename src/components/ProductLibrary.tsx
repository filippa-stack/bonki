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
import watermarkMamma from '@/assets/watermark-mamma.png';

import illustrationStillUs from '@/assets/illustration-still-us-tile.png';
import illustrationJagIMig from '@/assets/mirror-jag-i-mig.png';
import illustrationJagMedAndra from '@/assets/annorlunda-jag-med-andra.png';
import illustrationJagIVarlden from '@/assets/aktivism-jag-i-varlden.png';
import illustrationSexualitet from '@/assets/illustration-sexualitet.png';
import illustrationSyskon from '@/assets/illustration-syskon.png';
import illustrationVardag from '@/assets/illustration-vardag.png';
import illustrationStillFair from '@/assets/illustration-still-fair.png';

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

/** Creature-color tile backgrounds — dark/mid values from master palette */
const TILE_COLORS: Record<string, string> = {
  jag_i_mig: '#3A4210',       // Lichen deep
  jag_med_andra: '#4A1870',   // Wild Violet deep
  jag_i_varlden: '#1A4022',   // Deep Canopy deep
  sexualitetskort: '#6A1F18', // Ember Red deep
  vardagskort: '#0F3D58',     // River Blue deep
  syskonkort: '#144544',      // Twin Teal deep
};

/** Helper: hex → rgba */
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Hero-level illustration opacities — individually calibrated */
const ILLUSTRATION_OPACITY: Record<string, number> = {
  jag_i_mig: 0.90,
  jag_med_andra: 0.88,
  jag_i_varlden: 0.90,
  sexualitetskort: 0.88,
  vardagskort: 0.85,
  syskonkort: 0.88,
};

/** Per-product illustration placement — individually tuned to each motif's center of gravity */
const ILLUSTRATION_POSITION: Record<string, string> = {
  jag_i_mig: 'center 30%',
  jag_med_andra: 'center 35%',
  jag_i_varlden: 'center 30%',
  sexualitetskort: 'center 25%',
  vardagskort: 'center 30%',
  syskonkort: 'center 35%',
};

/** Per-product object-fit mode */
const ILLUSTRATION_FIT: Record<string, string> = {
  jag_i_mig: 'contain',
  jag_med_andra: 'contain',
  jag_i_varlden: 'contain',
  sexualitetskort: 'contain',
  vardagskort: 'contain',
  syskonkort: 'contain',
};

/** Per-product illustration container bounds — {top, left, right, bottom} as % */
const ILLUSTRATION_BOUNDS: Record<string, { top: string; left: string; right: string; bottom: string }> = {
  jag_i_mig: { top: '-5%', left: '-2%', right: '-2%', bottom: '22%' },
  jag_med_andra: { top: '-8%', left: '-5%', right: '-5%', bottom: '20%' },
  jag_i_varlden: { top: '-5%', left: '-2%', right: '-2%', bottom: '22%' },
  sexualitetskort: { top: '-5%', left: '-2%', right: '-2%', bottom: '20%' },
  vardagskort: { top: '-5%', left: '-5%', right: '-5%', bottom: '20%' },
  syskonkort: { top: '-5%', left: '-2%', right: '-2%', bottom: '22%' },
};

/** Light title colors for dark creature-color tiles — Lantern Glow variants */
const ACCENT_COLORS: Record<string, string> = {
  jag_i_mig: '#FDF6E3',
  jag_med_andra: '#FDF6E3',
  jag_i_varlden: '#FDF6E3',
  sexualitetskort: '#FDF6E3',
  vardagskort: '#FDF6E3',
  syskonkort: '#FDF6E3',
};

/** Light tagline colors for dark tiles */
const TAGLINE_COLORS: Record<string, string> = {
  jag_i_mig: 'hsla(46, 60%, 85%, 0.75)',
  jag_med_andra: 'hsla(280, 40%, 85%, 0.75)',
  jag_i_varlden: 'hsla(140, 35%, 80%, 0.75)',
  sexualitetskort: 'hsla(5, 50%, 82%, 0.75)',
  vardagskort: 'hsla(205, 45%, 82%, 0.75)',
  syskonkort: 'hsla(178, 40%, 80%, 0.75)',
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
  hidden: { opacity: 0, y: 20 * ANIM_SPEED, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55 * ANIM_SPEED, ease: [0.22, 1, 0.36, 1] as const },
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
          fontFamily: "'Lato', sans-serif",
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
            fontFamily: "'DM Serif Display', serif",
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

/*
 * ┌─────────────────────────────────────────────────────┐
 * │  🔒 LOCKED DESIGN — ProductLibrary                  │
 * │  Approved 2026-03-04. Do NOT change layout, colors, │
 * │  typography, spacing, opacity or illustrations       │
 * │  without explicit approval.                         │
 * │  To unlock: remove this comment block.               │
 * └─────────────────────────────────────────────────────┘
 */
/** Portal tile — prominent illustration with strong bottom text */
const PastelTile = React.forwardRef<HTMLDivElement, {
  name: string; bg: string; ageLabel?: string; tagline?: string;
  onClick?: () => void; illustration?: string; productId?: string;
  accentColor?: string; taglineColor?: string; illustrationOpacity?: number;
  illustrationSize?: string; illustrationPosition?: string; wide?: boolean;
  showFreeBadge?: boolean; badgeText?: string; ageCount?: number;
  hasActiveSession?: boolean;
}>(function PastelTile({
  name, bg, ageLabel, tagline, onClick, illustration, productId, accentColor, taglineColor,
  illustrationOpacity = 0.78, illustrationSize, illustrationPosition = 'center 30%', wide = false,
  showFreeBadge = false, badgeText = 'Första kortet gratis', ageCount, hasActiveSession = false,
}, ref) {
  const toShadowColor = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${Math.round(r * 0.5)}, ${Math.round(g * 0.5)}, ${Math.round(b * 0.5)}, ${alpha})`;
  };

  // Parse bg hex for robust rgba scrim
  const bgR = parseInt(bg.slice(1, 3), 16);
  const bgG = parseInt(bg.slice(3, 5), 16);
  const bgB = parseInt(bg.slice(5, 7), 16);
  const bgRgba = (a: number) => `rgba(${bgR}, ${bgG}, ${bgB}, ${a})`;

    return (
      <motion.div
        variants={tileVariants}
        whileHover={{ scale: 1.025, y: -3 }}
        whileTap={{ scale: 0.94, y: 3 }}
        onClick={onClick}
        className="cursor-pointer"
        style={{
          borderRadius: '22px',
          backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.06) 100%)`,
          backgroundColor: bg,
          minHeight: wide ? '240px' : '210px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          border: '1.5px solid rgba(255, 255, 255, 0.30)',
          boxShadow: [
            `0 12px 32px ${toShadowColor(bg, 0.30)}`,
            `0 4px 12px ${toShadowColor(bg, 0.18)}`,
            '0 1px 3px rgba(0, 0, 0, 0.08)',
            'inset 0 3px 6px rgba(255, 255, 255, 0.45)',
            `inset 0 -4px 10px ${toShadowColor(bg, 0.12)}`,
          ].join(', '),
          gridColumn: wide ? 'span 2' : undefined,
        }}
      >
      {/* Illustration — individually calibrated hero */}
      {illustration && (() => {
        const bounds = productId ? ILLUSTRATION_BOUNDS[productId] : undefined;
        const defaultBounds = { top: '-12%', left: '-5%', right: '-5%', bottom: '22%' };
        const b = bounds || defaultBounds;
        return (
          <div
            style={{
              position: 'absolute',
              top: b.top,
              left: b.left,
              right: b.right,
              bottom: b.bottom,
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
                objectFit: (productId && ILLUSTRATION_FIT[productId] || 'contain') as React.CSSProperties['objectFit'],
                objectPosition: illustrationPosition,
                opacity: illustrationOpacity,
              }}
            />
          </div>
        );
      })()}

      {/* Age label badge — enlarged for readability */}
      {ageLabel && (
        <span
          style={{
            position: 'absolute',
            top: '10px',
            right: '12px',
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Lato', sans-serif",
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.02em',
            color: '#2C2420',
            background: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            zIndex: 3,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          {ageLabel}
        </span>
      )}

      {/* Resume indicator — saffron dot + "Fortsätt" */}
      {hasActiveSession && (
        <div
          style={{
            position: 'absolute',
            top: ageLabel ? '54px' : '10px',
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
            fontFamily: "'Lato', sans-serif",
            fontSize: '11px',
            fontWeight: 500,
            color: '#6B5E52',
          }}>
            Fortsätt
          </span>
        </div>
      )}

      {/* Bottom gradient scrim — rgba-based for robustness */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          height: '65%',
          zIndex: 1,
          pointerEvents: 'none',
          background: `linear-gradient(to top, ${bgRgba(1)} 0%, ${bgRgba(0.93)} 25%, ${bgRgba(0.6)} 50%, ${bgRgba(0.2)} 70%, transparent 100%)`,
          borderRadius: '0 0 22px 22px',
        }}
      />

      {/* Text content — anchored to bottom, single secondary line */}
      <div style={{ 
        position: 'absolute', 
        bottom: 0, left: 0, right: 0, 
        zIndex: 2,
        padding: wide ? '0 20px 20px' : '0 16px 18px',
      }}>
        <h3
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: wide ? '28px' : '22px',
            fontWeight: 700,
            lineHeight: 1.15,
            color: accentColor || 'var(--text-library)',
            letterSpacing: '-0.01em',
            textShadow: `0 1px 6px ${bgRgba(1)}, 0 0 16px ${bgRgba(0.9)}, 0 0 32px ${bgRgba(0.8)}`,
          }}
        >
          {name}
        </h3>
        {/* Single secondary line: tagline + count merged */}
        <p
          style={{
            fontFamily: "'Lato', sans-serif",
            fontSize: '11px',
            fontWeight: 400,
            color: taglineColor || '#8A8078',
            marginTop: '4px',
            lineHeight: 1.4,
            textShadow: `0 0 10px ${bgRgba(1)}, 0 0 20px ${bgRgba(0.8)}`,
          }}
        >
          {tagline}
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
  const TAB_KEY = 'bonki-library-tab';
  const [activeTab, setActiveTab] = useState<'barn' | 'par'>(() => {
    // 1. Check onboarding redirect
    const initial = localStorage.getItem('bonki-initial-tab');
    if (initial === 'par' || initial === 'barn') {
      localStorage.removeItem('bonki-initial-tab');
      localStorage.setItem(TAB_KEY, initial);
      return initial;
    }
    // 2. Remember last selection
    const saved = localStorage.getItem(TAB_KEY);
    if (saved === 'par' || saved === 'barn') return saved;
    return 'barn';
  });
  const [swipeDirection, setSwipeDirection] = useState<1 | -1>(1);

  const switchTab = (tab: 'barn' | 'par') => {
    setSwipeDirection(tab === 'par' ? 1 : -1);
    setActiveTab(tab);
    try { localStorage.setItem(TAB_KEY, tab); } catch {}
  };
  const [notifySignedUp, setNotifySignedUp] = useState(false);
  const [notifyLoading, setNotifyLoading] = useState(false);

  // Check if user already signed up for Still Fair interest
  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from('product_interest' as any)
      .select('id')
      .eq('product_id', 'still_fair')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setNotifySignedUp(true);
      });
  }, [user?.id]);

  const handleNotifyMe = async () => {
    if (!user?.id) {
      toast('Du behöver vara inloggad för att bli påmind');
      return;
    }
    setNotifyLoading(true);
    const { error } = await supabase
      .from('product_interest' as any)
      .insert({ product_id: 'still_fair', user_id: user.id } as any);
    setNotifyLoading(false);
    if (error?.code === '23505') {
      // Already exists
      setNotifySignedUp(true);
      return;
    }
    if (error) {
      toast('Något gick fel, försök igen');
      return;
    }
    setNotifySignedUp(true);
    toast('Vi meddelar dig när Still Fair lanseras!');
  };

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
        fontFamily: "'Lato', sans-serif",
        transition: 'background 600ms ease',
      }}
    >

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Hero zone — compact cinematic */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{
            textAlign: 'center',
            padding: '24px 32px 0',
          }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: '34px',
              fontWeight: 400,
              color: isDark ? 'hsla(38, 78%, 55%, 0.95)' : '#E9B44C',
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              marginBottom: '8px',
              transition: 'color 400ms ease',
            }}
          >
            Bonki
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontStyle: 'italic',
              fontSize: '14px',
              fontWeight: 400,
              color: isDark ? 'hsla(38, 50%, 65%, 0.5)' : 'hsla(38, 78%, 55%, 0.7)',
              opacity: isDark ? 1 : 0.5,
              lineHeight: 1.6,
              transition: 'color 400ms ease',
            }}
          >
            Verktyg för samtalen som inte blir av
          </motion.p>
        </motion.div>

        {/* Saffron accent divider — matching onboarding */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{
            width: '32px',
            height: '1.5px',
            backgroundColor: isDark ? 'hsla(38, 78%, 50%, 0.35)' : 'hsla(38, 88%, 46%, 0.3)',
            margin: '14px auto 18px',
          }}
        />

        {/* World switcher — prominent BARN/PAR toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            margin: '0 auto 12px',
          }}
        >
          <div
            style={{
              display: 'flex',
              background: 'hsla(230, 35%, 18%, 0.7)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              borderRadius: '24px',
              padding: '4px',
              gap: '3px',
              position: 'relative',
              border: '1px solid hsla(38, 50%, 50%, 0.1)',
              boxShadow: '0 4px 16px hsla(230, 40%, 8%, 0.4)',
            }}
          >
            {(['barn', 'par'] as const).map((tab) => {
              const isActive = activeTab === tab;
              const labels = { barn: 'BARN & FAMILJ', par: 'PAR' };
              return (
                <button
                  key={tab}
                  onClick={() => switchTab(tab)}
                  style={{
                    fontFamily: "'Lato', sans-serif",
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    color: isActive ? '#FDF6E3' : 'hsla(30, 20%, 85%, 0.35)',
                    background: isActive
                      ? 'linear-gradient(135deg, hsla(38, 60%, 45%, 0.25) 0%, hsla(230, 30%, 22%, 0.8) 100%)'
                      : 'transparent',
                    border: isActive ? '1px solid hsla(38, 60%, 50%, 0.2)' : '1px solid transparent',
                    outline: 'none',
                    borderRadius: '20px',
                    padding: '9px 24px',
                    cursor: 'pointer',
                    transition: 'all 280ms ease',
                    WebkitTapHighlightColor: 'transparent',
                    boxShadow: isActive ? '0 2px 8px hsla(38, 50%, 30%, 0.2)' : 'none',
                  }}
                >
                  {labels[tab]}
                </button>
              );
            })}
          </div>

          {/* Swipe hint — only on first visit */}
          {!IS_RETURN_VISIT && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 * ANIM_SPEED, duration: 0.8 }}
              style={{
                fontFamily: "'Lato', sans-serif",
                fontSize: '8px',
                fontWeight: 500,
                letterSpacing: '0.08em',
                color: 'hsla(30, 20%, 80%, 0.25)',
                textTransform: 'uppercase',
              }}
            >
              ← swipa →
            </motion.p>
          )}
        </motion.div>

        {/* Resume banner — returning user hook */}
        <div className="px-5">
          <LibraryResumeBanner />
        </div>

        <motion.div
          key="swipe-container"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.15}
          onDragEnd={(_e, info) => {
            if (info.offset.x < -50 && activeTab === 'barn') switchTab('par');
            if (info.offset.x > 50 && activeTab === 'par') switchTab('barn');
          }}
          style={{ touchAction: 'pan-y' }}
        >
        <AnimatePresence mode="wait">

        {activeTab === 'barn' && (
          <motion.div
            key="barn"
            initial={{ opacity: 0, x: swipeDirection * 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: swipeDirection * -30 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
        {/* ── Barn — broken grid layout ── */}
        <div className="px-5" style={{ scrollMarginTop: '8px' }}>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontStyle: 'normal',
              fontSize: '15px',
              fontWeight: 400,
              color: '#E9B44C',
              opacity: 0.7,
              lineHeight: 1.6,
              textAlign: 'center',
              marginBottom: '24px',
            }}
          >
            Det barnet inte säger själv — börjar här
          </motion.p>
          {/* Single free-trial mention */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={{
              fontFamily: "'Lato', sans-serif",
              fontSize: '10px',
              fontWeight: 500,
              letterSpacing: '0.06em',
              color: 'hsla(38, 78%, 60%, 0.45)',
              textAlign: 'center',
              marginBottom: '20px',
              marginTop: '-16px',
            }}
          >
            ✦ Första kortet i varje produkt är gratis
          </motion.p>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
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
                illustrationPosition={ILLUSTRATION_POSITION[product.id]}
                onClick={() => navigate(`/product/${product.slug}`)}
                badgeText={buildBadgeText(product)}
                hasActiveSession={activeProductIds.has(product.id)}
                wide
              />
            ))}
          </motion.div>
        </div>

        {/* ── Still Us cross-discovery — visible on BARN tab ── */}
        <div className="px-5" style={{ marginTop: '28px' }}>
          <div style={{
            borderTop: '1px solid hsla(38, 50%, 50%, 0.12)',
            paddingTop: '16px',
          }}>
            <p style={{
              fontFamily: "'Lato', sans-serif",
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              color: '#6B5E52',
              marginBottom: '12px',
            }}>
              För er som par
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
                backgroundColor: '#2E2233',
                minHeight: '140px',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden',
                border: '1.5px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
              }}
            >
              {/* Illustration */}
              <div style={{
                position: 'absolute',
                top: '-15%',
                right: '-8%',
                width: '55%',
                height: '130%',
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
                    objectPosition: 'center 30%',
                    opacity: 0.55,
                  }}
                />
              </div>

              {/* Bottom gradient scrim */}
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  bottom: 0, left: 0, right: 0,
                  height: '60%',
                  zIndex: 1,
                  pointerEvents: 'none',
                  background: 'linear-gradient(to top, rgba(46, 34, 51, 1) 0%, rgba(46, 34, 51, 0.7) 50%, transparent 100%)',
                  borderRadius: '0 0 22px 22px',
                }}
              />

              <div style={{
                position: 'absolute',
                bottom: 0, left: 0, right: 0,
                zIndex: 2,
                padding: '0 18px 16px',
              }}>
                <h3 style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: '22px',
                  fontWeight: 700,
                  color: '#FDF6E3',
                  lineHeight: 1.15,
                  textShadow: '0 2px 8px rgba(46, 34, 51, 1)',
                }}>
                  Still Us
                </h3>
                <p style={{
                  fontFamily: "'Lato', sans-serif",
                  fontSize: '11px',
                  color: 'hsla(38, 55%, 65%, 0.7)',
                  marginTop: '4px',
                }}>
                  22 samtal för er relation
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Dagboken — compact return-loop hook */}
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
              fontFamily: "'DM Serif Display', serif",
              fontSize: '15px',
              fontWeight: 400,
              color: '#FDF6E3',
              lineHeight: 1.3,
            }}>
              Dagboken
            </p>
            <p style={{
              fontFamily: "'Lato', sans-serif",
              fontSize: '10px',
              color: 'hsla(38, 50%, 65%, 0.5)',
              marginTop: '2px',
            }}>
              Varje samtal sparas
            </p>
          </div>
          <span style={{
            fontFamily: "'Lato', sans-serif",
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '0.06em',
            color: '#E9B44C',
            opacity: 0.4,
          }}>
            →
          </span>
        </motion.div>
          </motion.div>
        )}

        {activeTab === 'par' && (
          <motion.div
            key="par"
            initial={{ opacity: 0, x: swipeDirection * 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: swipeDirection * -30 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{
              padding: '0',
              minHeight: '60vh',
              position: 'relative',
            }}
          >

        {/* Bridge phrase — contextual for parents coming from BARN */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          style={{
            textAlign: 'center',
            padding: '4px 32px 20px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <p
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontStyle: 'italic',
              fontSize: '14px',
              fontWeight: 400,
              color: 'hsla(38, 55%, 65%, 0.55)',
              lineHeight: 1.6,
            }}
          >
            Du tar hand om samtalen med barnen — här tar ni hand om era egna
          </p>
        </motion.div>

        {/* ── Still Us — immersive hero card ── */}
        <motion.div
          className="px-5"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ position: 'relative', zIndex: 1 }}
        >
          <motion.div
            variants={tileVariants}
            whileHover={{ scale: 1.015, y: -2 }}
            whileTap={{ scale: 0.97, y: 2 }}
            onClick={() => navigate('/product/still-us')}
            className="cursor-pointer"
            style={{
              borderRadius: '22px',
              backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.12) 100%)',
              backgroundColor: '#1E5A68',
              minHeight: '340px',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'hidden',
              border: '1.5px solid rgba(255, 255, 255, 0.30)',
              boxShadow: [
                '0 16px 48px rgba(0, 0, 0, 0.35)',
                '0 6px 16px rgba(0, 0, 0, 0.25)',
                '0 1px 3px rgba(0, 0, 0, 0.08)',
                'inset 0 3px 6px rgba(255, 255, 255, 0.45)',
                'inset 0 -4px 10px rgba(15, 45, 52, 0.20)',
              ].join(', '),
            }}
          >
            {/* Illustration — large hero */}
            <div
              style={{
                position: 'absolute',
                top: '-12%',
                left: '10%',
                right: '-8%',
                bottom: '30%',
                pointerEvents: 'none',
                zIndex: 0,
              }}
            >
              <img
                src={illustrationStillUs}
                alt=""
                draggable={false}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  objectPosition: 'center 25%',
                  opacity: 0.9,
                }}
              />
            </div>

            {/* Extended gradient scrim for text legibility */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                bottom: 0, left: 0, right: 0,
                height: '70%',
                zIndex: 1,
                pointerEvents: 'none',
                background: `linear-gradient(to top, rgba(30, 90, 104, 1) 0%, rgba(30, 90, 104, 0.97) 20%, rgba(30, 90, 104, 0.85) 40%, rgba(30, 90, 104, 0.4) 65%, transparent 100%)`,
                borderRadius: '0 0 22px 22px',
              }}
            />

            {/* Text content — rich bottom section */}
            <div style={{
              position: 'absolute',
              bottom: 0, left: 0, right: 0,
              zIndex: 2,
              padding: '0 22px 22px',
            }}>
              <h3
                style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: '32px',
                  fontWeight: 700,
                  lineHeight: 1.1,
                  color: '#FDF6E3',
                  letterSpacing: '-0.02em',
                  textShadow: '0 2px 8px rgba(30, 90, 104, 1), 0 0 20px rgba(30, 90, 104, 0.9)',
                }}
              >
                Still Us
              </h3>

              {/* Emotional hook */}
              <p
                style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontStyle: 'italic',
                  fontSize: '14px',
                  fontWeight: 400,
                  color: 'hsla(38, 78%, 60%, 0.85)',
                  marginTop: '6px',
                  lineHeight: 1.4,
                  textShadow: '0 0 12px rgba(30, 90, 104, 1)',
                }}
              >
                22 samtal för er som vill stanna kvar
              </p>

              {/* Session format + credential — trust signals */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '12px',
                flexWrap: 'wrap',
              }}>
                <span style={{
                  fontFamily: "'Lato', sans-serif",
                  fontSize: '10px',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  color: 'hsla(192, 25%, 80%, 0.7)',
                  background: 'hsla(192, 20%, 50%, 0.12)',
                  borderRadius: '12px',
                  padding: '4px 10px',
                }}>
                  ca 20 min per samtal
                </span>
                <span style={{
                  fontFamily: "'Lato', sans-serif",
                  fontSize: '10px',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  color: 'hsla(192, 25%, 80%, 0.7)',
                  background: 'hsla(192, 20%, 50%, 0.12)',
                  borderRadius: '12px',
                  padding: '4px 10px',
                }}>
                  ✦ 1a gratis
                </span>
              </div>

              {/* CTA button */}
              <div
                style={{
                  marginTop: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span
                  style={{
                    fontFamily: "'Lato', sans-serif",
                    fontSize: '13px',
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                    color: '#1A1A2E',
                    background: 'linear-gradient(135deg, hsla(38, 78%, 58%, 0.95) 0%, hsla(38, 65%, 50%, 0.9) 100%)',
                    borderRadius: '14px',
                    padding: '10px 22px',
                    boxShadow: '0 4px 16px hsla(38, 70%, 40%, 0.3)',
                  }}
                >
                  Öppna Still Us
                </span>
                {/* Credential — integrated trust signal */}
                <span style={{
                  fontFamily: "'Lato', sans-serif",
                  fontSize: '8px',
                  fontWeight: 500,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase' as const,
                  color: 'hsla(192, 20%, 70%, 0.45)',
                  textAlign: 'right',
                  lineHeight: 1.4,
                  maxWidth: '120px',
                }}>
                  Utvecklat av psykolog · 20+ års erfarenhet
                </span>
              </div>
            </div>
          </motion.div>

          {/* ── Coming soon section ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            style={{ marginTop: '28px' }}
          >
            {/* Section label */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '14px',
              padding: '0 4px',
            }}>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, hsla(38, 60%, 50%, 0.15))' }} />
              <span style={{
                fontFamily: "'Lato', sans-serif",
                fontSize: '8px',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase' as const,
                color: 'hsla(38, 55%, 60%, 0.4)',
              }}>
                Kommer snart
              </span>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, hsla(38, 60%, 50%, 0.15), transparent)' }} />
            </div>

            {/* Still Fair — compact coming-soon card */}
            <motion.div
              variants={tileVariants}
              style={{
                borderRadius: '18px',
                backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.08) 100%)',
                backgroundColor: 'hsl(327, 24%, 22%)',
                minHeight: '140px',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: [
                  '0 8px 24px rgba(60, 30, 50, 0.25)',
                  '0 2px 8px rgba(60, 30, 50, 0.15)',
                  'inset 0 2px 4px rgba(255, 255, 255, 0.06)',
                ].join(', '),
                filter: 'saturate(0.65)',
              }}
            >
              {/* Illustration */}
              <div
                style={{
                  position: 'absolute',
                  top: '-5%',
                  left: '25%',
                  right: '-5%',
                  bottom: '18%',
                  pointerEvents: 'none',
                  zIndex: 0,
                }}
              >
                <img
                  src={illustrationStillFair}
                  alt=""
                  draggable={false}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    objectPosition: 'center 30%',
                    opacity: 0.6,
                  }}
                />
              </div>

              {/* Bottom gradient scrim */}
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  bottom: 0, left: 0, right: 0,
                  height: '65%',
                  zIndex: 1,
                  pointerEvents: 'none',
                  background: `linear-gradient(to top, hsl(327, 24%, 22%) 0%, hsla(327, 24%, 22%, 0.93) 25%, hsla(327, 24%, 22%, 0.5) 55%, transparent 100%)`,
                  borderRadius: '0 0 18px 18px',
                }}
              />

              {/* Text content */}
              <div style={{
                position: 'absolute',
                bottom: 0, left: 0, right: 0,
                zIndex: 2,
                padding: '0 18px 16px',
              }}>
                <h3
                  style={{
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: '22px',
                    fontWeight: 700,
                    lineHeight: 1.15,
                    color: '#F5EFE6',
                    letterSpacing: '-0.01em',
                    opacity: 0.8,
                    textShadow: '0 1px 6px hsl(327, 24%, 22%), 0 0 16px hsla(327, 24%, 22%, 0.9)',
                  }}
                >
                  Still Fair
                </h3>
                <p
                  style={{
                    fontFamily: "'Lato', sans-serif",
                    fontSize: '11px',
                    fontWeight: 400,
                    color: 'hsla(327, 15%, 75%, 0.7)',
                    marginTop: '3px',
                    lineHeight: 1.4,
                    textShadow: '0 0 10px hsl(327, 24%, 22%)',
                  }}
                >
                  Det osynliga arbetet, synligt för båda
                </p>
                <div style={{ marginTop: '8px' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!notifySignedUp && !notifyLoading) handleNotifyMe();
                    }}
                    disabled={notifySignedUp || notifyLoading}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontFamily: "'Lato', sans-serif",
                      fontSize: '10px',
                      fontWeight: 600,
                      letterSpacing: '0.02em',
                      color: notifySignedUp ? 'hsla(38, 78%, 58%, 0.7)' : '#0A0A1A',
                      background: notifySignedUp ? 'hsla(38, 70%, 50%, 0.08)' : 'linear-gradient(135deg, hsla(38, 78%, 58%, 0.85) 0%, hsla(38, 65%, 50%, 0.8) 100%)',
                      border: notifySignedUp ? '1px solid hsla(38, 70%, 50%, 0.12)' : 'none',
                      borderRadius: '14px',
                      padding: notifySignedUp ? '4px 12px' : '6px 14px',
                      cursor: notifySignedUp ? 'default' : 'pointer',
                      opacity: notifyLoading ? 0.6 : 1,
                      transition: 'all 200ms ease',
                      boxShadow: notifySignedUp ? 'none' : '0 2px 10px hsla(38, 70%, 40%, 0.25)',
                    }}
                  >
                    {notifySignedUp ? '✓ Du blir meddelad' : '🔔 Meddela mig'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
          </motion.div>
        )}
        </AnimatePresence>
        </motion.div>

        {/* Bottom safe-area spacing */}
        <div style={{ paddingBottom: 'calc(48px + env(safe-area-inset-bottom, 0px))' }} />
      </div>
    </div>
  );
}
