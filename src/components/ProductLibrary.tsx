import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { allProducts } from '@/data/products';
import { useAllProductAccess } from '@/hooks/useAllProductAccess';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
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

const PASTEL_COLORS: Record<string, string> = {
  jag_i_mig: '#F5EDD2',
  jag_med_andra: '#F0D9EA',
  jag_i_varlden: '#D0EDDA',
  sexualitetskort: '#F0D9E2',
  vardagskort: '#D6ECF0',
  syskonkort: '#DAEAF6',
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
  jag_i_mig: 0.92,
  jag_med_andra: 0.88,
  jag_i_varlden: 0.85,
  sexualitetskort: 0.90,
  vardagskort: 0.85,
  syskonkort: 0.88,
};

/** Per-product illustration placement — individually tuned to each motif's center of gravity */
const ILLUSTRATION_POSITION: Record<string, string> = {
  jag_i_mig: 'center 45%',
  jag_med_andra: 'center 25%',
  jag_i_varlden: 'center 15%',
  sexualitetskort: 'center 30%',
  vardagskort: 'center 25%',
  syskonkort: 'center 25%',
};

/** Per-product object-fit mode */
const ILLUSTRATION_FIT: Record<string, string> = {
  jag_i_mig: 'cover',
  jag_med_andra: 'contain',
  jag_i_varlden: 'contain',
  sexualitetskort: 'contain',
  vardagskort: 'contain',
  syskonkort: 'contain',
};

/** Per-product illustration container bounds — {top, left, right, bottom} as % */
const ILLUSTRATION_BOUNDS: Record<string, { top: string; left: string; right: string; bottom: string }> = {
  jag_i_mig: { top: '-8%', left: '-2%', right: '-2%', bottom: '18%' },
  jag_med_andra: { top: '-8%', left: '-5%', right: '-5%', bottom: '22%' },
  jag_i_varlden: { top: '-20%', left: '-12%', right: '-12%', bottom: '12%' },
  sexualitetskort: { top: '-5%', left: '3%', right: '-2%', bottom: '20%' },
  vardagskort: { top: '-5%', left: '-5%', right: '-5%', bottom: '22%' },
  syskonkort: { top: '-5%', left: '-2%', right: '-2%', bottom: '22%' },
};

/** Darkened accent colors for WCAG AA compliance on pastel backgrounds */
const ACCENT_COLORS: Record<string, string> = {
  jag_i_mig: '#3D3D06',
  jag_med_andra: '#520C78',
  jag_i_varlden: '#14401E',
  sexualitetskort: '#6E2838',
  vardagskort: '#042C44',
  syskonkort: '#082654',
};

/** Darkened tagline colors for better readability */
const TAGLINE_COLORS: Record<string, string> = {
  jag_i_mig: '#524E30',
  jag_med_andra: '#4A3048',
  jag_i_varlden: '#2A5438',
  sexualitetskort: '#5A3848',
  vardagskort: '#143434',
  syskonkort: '#162844',
};

/** Build badge text: "X ämnen · Y kr · Första gratis" */
function buildBadgeText(product: { cards: unknown[]; id: string }): string {
  const count = product.cards.length;
  const prices: Record<string, number> = {
    jag_i_mig: 195, jag_med_andra: 195, jag_i_varlden: 195,
    vardagskort: 195, syskonkort: 195, sexualitetskort: 195,
  };
  const price = prices[product.id] ?? 195;
  return `${count} ämnen · ${price} kr · 1a gratis`;
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
}>(function PastelTile({
  name, bg, ageLabel, tagline, onClick, illustration, productId, accentColor, taglineColor,
  illustrationOpacity = 0.78, illustrationSize, illustrationPosition = 'center 30%', wide = false,
  showFreeBadge = false, badgeText = 'Första kortet gratis', ageCount,
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
            color: accentColor || 'var(--text-library)',
            background: 'rgba(255, 255, 255, 0.65)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            zIndex: 3,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          {ageLabel}
        </span>
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
          {tagline}{showFreeBadge ? ` · ✦ 1a gratis` : ''}
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
  const [activeTab, setActiveTab] = useState<'barn' | 'par'>(() => {
    const saved = localStorage.getItem('bonki-initial-tab');
    if (saved === 'par' || saved === 'barn') {
      localStorage.removeItem('bonki-initial-tab');
      return saved;
    }
    return 'barn';
  });
  const [swipeDirection, setSwipeDirection] = useState<1 | -1>(1);

  const switchTab = (tab: 'barn' | 'par') => {
    setSwipeDirection(tab === 'par' ? 1 : -1);
    setActiveTab(tab);
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

  // Split products for layout
  const jagIMig = allProducts.find(p => p.id === 'jag_i_mig')!;
  const jagMedAndra = allProducts.find(p => p.id === 'jag_med_andra')!;
  const jagIVarlden = allProducts.find(p => p.id === 'jag_i_varlden')!;
  const sexualitet = allProducts.find(p => p.id === 'sexualitetskort')!;
  const vardag = allProducts.find(p => p.id === 'vardagskort')!;
  const syskon = allProducts.find(p => p.id === 'syskonkort')!;

  const isDark = activeTab === 'par';

  const libraryBg = isDark ? '#1A1A2E' : '#33656D';

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

        {/* Segment control — pill switcher with swipe affordance */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            margin: '0 auto 20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              background: isDark ? 'hsla(230, 35%, 18%, 0.6)' : 'hsla(0, 0%, 100%, 0.12)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              borderRadius: '20px',
              padding: '3px',
              gap: '2px',
              position: 'relative',
              transition: 'background 400ms ease',
              border: isDark ? 'none' : '0.5px solid hsla(0, 0%, 100%, 0.2)',
              boxShadow: isDark ? 'none' : '0 2px 8px hsla(0, 0%, 0%, 0.12)',
            }}
          >
            {(['barn', 'par'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => switchTab(tab)}
                style={{
                  fontFamily: "'Lato', sans-serif",
                  fontSize: '9px',
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                   color: activeTab === tab
                    ? (isDark ? '#F5EFE6' : '#F5EFE6')
                    : (isDark ? 'hsla(30, 20%, 85%, 0.4)' : 'hsla(0, 0%, 100%, 0.4)'),
                  background: activeTab === tab
                    ? (isDark ? 'hsla(230, 35%, 25%, 0.7)' : 'hsla(0, 0%, 100%, 0.18)')
                    : 'transparent',
                  border: 'none',
                  outline: 'none',
                  borderRadius: '17px',
                  padding: '7px 18px',
                  cursor: 'pointer',
                  transition: 'all 260ms ease',
                  WebkitTapHighlightColor: 'transparent',
                  boxShadow: activeTab === tab
                    ? (isDark ? '0 1px 4px hsla(220, 40%, 10%, 0.3)' : '0 1px 4px hsla(0, 0%, 0%, 0.15)')
                    : 'none',
                }}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Swipe hint — subtle arrow nudge on first view */}
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
                color: isDark ? 'hsla(30, 20%, 80%, 0.3)' : 'hsla(0, 0%, 100%, 0.3)',
                textTransform: 'uppercase',
                transition: 'color 400ms ease',
              }}
            >
              ← swipa →
            </motion.p>
          )}
        </motion.div>

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
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px',
            }}
          >
            <PastelTile
              name={jagIMig.name}
              bg={PASTEL_COLORS[jagIMig.id]!}
              productId={jagIMig.id}
              tagline={TAGLINES[jagIMig.id]}
              ageLabel={jagIMig.ageLabel}
              accentColor={ACCENT_COLORS[jagIMig.id]}
              taglineColor={TAGLINE_COLORS[jagIMig.id]}
              illustration={ILLUSTRATIONS[jagIMig.id]}
              illustrationOpacity={ILLUSTRATION_OPACITY[jagIMig.id]}
              illustrationPosition={ILLUSTRATION_POSITION[jagIMig.id]}
              onClick={() => navigate(`/product/${jagIMig.slug}`)}
              showFreeBadge={!purchased.has(jagIMig.id)}
              badgeText={buildBadgeText(jagIMig)}
              wide
            />
            <PastelTile
              name={jagMedAndra.name}
              bg={PASTEL_COLORS[jagMedAndra.id]!}
              productId={jagMedAndra.id}
              tagline={TAGLINES[jagMedAndra.id]}
              ageLabel={jagMedAndra.ageLabel}
              accentColor={ACCENT_COLORS[jagMedAndra.id]}
              taglineColor={TAGLINE_COLORS[jagMedAndra.id]}
              illustration={ILLUSTRATIONS[jagMedAndra.id]}
              illustrationOpacity={ILLUSTRATION_OPACITY[jagMedAndra.id]}
              illustrationPosition={ILLUSTRATION_POSITION[jagMedAndra.id]}
              onClick={() => navigate(`/product/${jagMedAndra.slug}`)}
              showFreeBadge={!purchased.has(jagMedAndra.id)}
              badgeText={buildBadgeText(jagMedAndra)}
            />
            <PastelTile
              name={jagIVarlden.name}
              bg={PASTEL_COLORS[jagIVarlden.id]!}
              productId={jagIVarlden.id}
              tagline={TAGLINES[jagIVarlden.id]}
              ageLabel={jagIVarlden.ageLabel}
              accentColor={ACCENT_COLORS[jagIVarlden.id]}
              taglineColor={TAGLINE_COLORS[jagIVarlden.id]}
              illustration={ILLUSTRATIONS[jagIVarlden.id]}
              illustrationOpacity={ILLUSTRATION_OPACITY[jagIVarlden.id]}
              illustrationPosition={ILLUSTRATION_POSITION[jagIVarlden.id]}
              onClick={() => navigate(`/product/${jagIVarlden.slug}`)}
              showFreeBadge={!purchased.has(jagIVarlden.id)}
              badgeText={buildBadgeText(jagIVarlden)}
            />
            <PastelTile
              name={vardag.name}
              bg={PASTEL_COLORS[vardag.id]!}
              productId={vardag.id}
              tagline={TAGLINES[vardag.id]}
              ageLabel={vardag.ageLabel}
              accentColor={ACCENT_COLORS[vardag.id]}
              taglineColor={TAGLINE_COLORS[vardag.id]}
              illustration={ILLUSTRATIONS[vardag.id]}
              illustrationOpacity={ILLUSTRATION_OPACITY[vardag.id]}
              illustrationPosition={ILLUSTRATION_POSITION[vardag.id]}
              onClick={() => navigate(`/product/${vardag.slug}`)}
              showFreeBadge={!purchased.has(vardag.id)}
              badgeText={buildBadgeText(vardag)}
            />
            <PastelTile
              name={syskon.name}
              bg={PASTEL_COLORS[syskon.id]!}
              productId={syskon.id}
              tagline={TAGLINES[syskon.id]}
              ageLabel={syskon.ageLabel}
              accentColor={ACCENT_COLORS[syskon.id]}
              taglineColor={TAGLINE_COLORS[syskon.id]}
              illustration={ILLUSTRATIONS[syskon.id]}
              illustrationOpacity={ILLUSTRATION_OPACITY[syskon.id]}
              illustrationPosition={ILLUSTRATION_POSITION[syskon.id]}
              onClick={() => navigate(`/product/${syskon.slug}`)}
              showFreeBadge={!purchased.has(syskon.id)}
              badgeText={buildBadgeText(syskon)}
            />
            <PastelTile
              name={sexualitet.name}
              bg={PASTEL_COLORS[sexualitet.id]!}
              productId={sexualitet.id}
              tagline={TAGLINES[sexualitet.id]}
              ageLabel={sexualitet.ageLabel}
              accentColor={ACCENT_COLORS[sexualitet.id]}
              taglineColor={TAGLINE_COLORS[sexualitet.id]}
              illustration={ILLUSTRATIONS[sexualitet.id]}
              illustrationOpacity={ILLUSTRATION_OPACITY[sexualitet.id]}
              illustrationPosition={ILLUSTRATION_POSITION[sexualitet.id]}
              onClick={() => navigate(`/product/${sexualitet.slug}`)}
              showFreeBadge={!purchased.has(sexualitet.id)}
              badgeText={buildBadgeText(sexualitet)}
              wide
            />
          </motion.div>
        </div>

        {/* Visual pause before diary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.9 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            margin: '32px 40px 8px',
          }}
        >
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, hsla(38, 60%, 55%, 0.25))' }} />
          <span style={{
            fontFamily: "'Lato', sans-serif",
            fontSize: '8px',
            fontWeight: 700,
            letterSpacing: '0.15em',
            textTransform: 'uppercase' as const,
            color: '#E9B44C',
            opacity: 0.5,
          }}>
            ✦
          </span>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, hsla(38, 60%, 55%, 0.25), transparent)' }} />
        </motion.div>

        {/* Diary — magical emotional anchor */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 * ANIM_SPEED, duration: 0.9 * ANIM_SPEED, ease: [0.22, 1, 0.36, 1] }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/diary/jag_i_mig')}
          className="cursor-pointer"
          style={{
            margin: '20px 20px 16px',
            padding: '28px 22px 22px',
            borderRadius: '20px',
            background: 'linear-gradient(180deg, hsla(185, 25%, 30%, 0.35) 0%, hsla(185, 20%, 25%, 0.25) 100%)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 2px 8px hsla(185, 20%, 10%, 0.08), 0 12px 32px -8px hsla(185, 18%, 8%, 0.12)',
            border: '1px solid hsla(185, 30%, 50%, 0.12)',
          }}
        >
          {/* Ambient glow */}
          <div style={{
            position: 'absolute',
            top: '-30%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, hsla(38, 70%, 70%, 0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* Book icon with saffron tint */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.0, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#E9B44C', opacity: 0.5, margin: '0 auto 10px', display: 'block' }}>
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            </svg>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.05, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: '18px',
              fontWeight: 400,
              color: '#F5EFE6',
              lineHeight: 1.4,
              marginBottom: '4px',
            }}
          >
            Dagboken
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.15, duration: 0.6 }}
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontStyle: 'italic',
              fontSize: '12px',
              fontWeight: 400,
               color: '#E9B44C',
              opacity: 0.55,
              lineHeight: 1.5,
              marginBottom: '20px',
            }}
          >
            Varje samtal sparas. Varje tanke samlas.
          </motion.p>

          {/* Visual mockup — stacked diary entries with stagger */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            maxWidth: '280px',
            margin: '0 auto',
          }}>
            {[
              { color: 'hsla(45, 50%, 92%, 0.15)', accent: '#C4B882', title: 'Jag i Mig', date: '12 mar', text: '"Hon sa att hon ibland känner sig osynlig i skolan..."' },
              { color: 'hsla(145, 30%, 89%, 0.12)', accent: '#7DB88A', title: 'Jag i Världen', date: '8 mar', text: '"Vi pratade om mod — att våga säga ifrån"' },
              { color: 'hsla(215, 35%, 91%, 0.12)', accent: '#8AA0C8', title: 'Syskon', date: '3 mar', text: '"De skrattade åt minnet av sommaren..."' },
            ].map((entry, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 1.2 + i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '11px 14px',
                  borderRadius: '12px',
                  backgroundColor: entry.color,
                  textAlign: 'left',
                  boxShadow: '0 1px 4px hsla(30, 15%, 25%, 0.04)',
                }}
              >
                <div style={{
                  width: '3px',
                  height: '26px',
                  borderRadius: '2px',
                  backgroundColor: entry.accent,
                  opacity: 0.35,
                  flexShrink: 0,
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                    <span style={{
                      fontFamily: "'Lato', sans-serif",
                      fontSize: '9px',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase' as const,
                      color: entry.accent,
                    }}>
                      {entry.title}
                    </span>
                    <span style={{
                      fontFamily: "'Lato', sans-serif",
                      fontSize: '8px',
                      color: entry.accent,
                      opacity: 0.5,
                    }}>
                      {entry.date}
                    </span>
                  </div>
                  <p style={{
                    fontFamily: "'DM Serif Display', serif",
                    fontStyle: 'italic',
                    fontSize: '11px',
                    color: entry.accent,
                    opacity: 0.65,
                    lineHeight: 1.3,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap' as const,
                  }}>
                    {entry.text}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom fade + CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.55, duration: 0.6 }}
          >
            <div style={{
              height: '16px',
              background: 'linear-gradient(to bottom, transparent, hsla(185, 20%, 25%, 0.3))',
              marginTop: '6px',
              borderRadius: '0 0 12px 12px',
            }} />
            <p style={{
              fontFamily: "'Lato', sans-serif",
              fontSize: '9px',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase' as const,
              color: '#E9B44C',
              opacity: 0.4,
              marginTop: '8px',
            }}>
              Öppna dagboken →
            </p>
          </motion.div>
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

        {/* Bridge phrase — tightened spacing */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          style={{
            textAlign: 'center',
            padding: '8px 28px 8px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <p
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontStyle: 'normal',
              fontSize: '15px',
              fontWeight: 400,
              color: '#E9B44C',
              opacity: 0.7,
              lineHeight: 1.6,
            }}
          >
            Barnens trygghet börjar med deras vuxna
          </p>
        </motion.div>

        {/* ── Par tiles ── */}
        <motion.div
          className="px-5 mt-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ position: 'relative', zIndex: 1 }}
        >
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '16px' }}>
            {/* Still Us — portal tile matching BARN ceramic style */}
            <motion.div
              variants={tileVariants}
              whileHover={{ scale: 1.025, y: -3 }}
              whileTap={{ scale: 0.94, y: 3 }}
              onClick={() => navigate('/product/still-us')}
              className="cursor-pointer"
              style={{
                borderRadius: '22px',
                backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.12) 100%)',
                backgroundColor: '#1E5A68',
                minHeight: '220px',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden',
                border: '1.5px solid rgba(255, 255, 255, 0.15)',
                boxShadow: [
                  '0 12px 32px rgba(15, 45, 52, 0.40)',
                  '0 4px 12px rgba(15, 45, 52, 0.25)',
                  '0 1px 3px rgba(0, 0, 0, 0.08)',
                  'inset 0 3px 6px rgba(255, 255, 255, 0.12)',
                  'inset 0 -4px 10px rgba(15, 45, 52, 0.20)',
                ].join(', '),
              }}
            >
              {/* Illustration — <img> tag like BARN tiles */}
              <div
                style={{
                  position: 'absolute',
                  top: '-8%',
                  left: '15%',
                  right: '-5%',
                  bottom: '20%',
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
                    objectFit: 'contain' as React.CSSProperties['objectFit'],
                    objectPosition: 'center 30%',
                    opacity: 0.85,
                  }}
                />
              </div>

              {/* Bottom gradient scrim — rgba-based like BARN */}
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  bottom: 0, left: 0, right: 0,
                  height: '65%',
                  zIndex: 1,
                  pointerEvents: 'none',
                  background: `linear-gradient(to top, rgba(30, 90, 104, 1) 0%, rgba(30, 90, 104, 0.93) 25%, rgba(30, 90, 104, 0.6) 50%, rgba(30, 90, 104, 0.2) 70%, transparent 100%)`,
                  borderRadius: '0 0 22px 22px',
                }}
              />

              {/* Text content — anchored to bottom like BARN */}
              <div style={{
                position: 'absolute',
                bottom: 0, left: 0, right: 0,
                zIndex: 2,
                padding: '0 20px 20px',
              }}>
                <h3
                  style={{
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: '28px',
                    fontWeight: 700,
                    lineHeight: 1.15,
                    color: '#F5EFE6',
                    letterSpacing: '-0.01em',
                    textShadow: '0 1px 6px rgba(30, 90, 104, 1), 0 0 16px rgba(30, 90, 104, 0.9), 0 0 32px rgba(30, 90, 104, 0.8)',
                  }}
                >
                  Still Us
                </h3>
                <p
                  style={{
                    fontFamily: "'Lato', sans-serif",
                    fontSize: '11px',
                    fontWeight: 400,
                    color: 'hsla(192, 20%, 75%, 0.9)',
                    marginTop: '4px',
                    lineHeight: 1.4,
                    textShadow: '0 0 10px rgba(30, 90, 104, 1), 0 0 20px rgba(30, 90, 104, 0.8)',
                  }}
                >
                  Vi finns kvar{!purchased.has('still_us') ? ' · 184 frågor · ✦ 1a gratis' : ''}
                </p>
              </div>
            </motion.div>

            {/* Still Fair — portal tile matching BARN ceramic style, desaturated */}
            <motion.div
              variants={tileVariants}
              style={{
                borderRadius: '22px',
                backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.12) 100%)',
                backgroundColor: 'hsl(327, 24%, 28%)',
                minHeight: '180px',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden',
                border: '1.5px solid rgba(255, 255, 255, 0.10)',
                boxShadow: [
                  '0 12px 32px rgba(60, 30, 50, 0.35)',
                  '0 4px 12px rgba(60, 30, 50, 0.20)',
                  '0 1px 3px rgba(0, 0, 0, 0.08)',
                  'inset 0 3px 6px rgba(255, 255, 255, 0.08)',
                  'inset 0 -4px 10px rgba(60, 30, 50, 0.15)',
                ].join(', '),
                filter: 'saturate(0.7)',
              }}
            >
              {/* Illustration — <img> tag like BARN tiles */}
              <div
                style={{
                  position: 'absolute',
                  top: '-5%',
                  left: '20%',
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
                    objectFit: 'contain' as React.CSSProperties['objectFit'],
                    objectPosition: 'center 30%',
                    opacity: 0.75,
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
                  background: `linear-gradient(to top, hsl(327, 24%, 28%) 0%, hsla(327, 24%, 28%, 0.93) 25%, hsla(327, 24%, 28%, 0.6) 50%, hsla(327, 24%, 28%, 0.2) 70%, transparent 100%)`,
                  borderRadius: '0 0 22px 22px',
                }}
              />

              {/* Text content — anchored to bottom */}
              <div style={{
                position: 'absolute',
                bottom: 0, left: 0, right: 0,
                zIndex: 2,
                padding: '0 20px 18px',
              }}>
                <h3
                  style={{
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: '26px',
                    fontWeight: 700,
                    lineHeight: 1.15,
                    color: '#F5EFE6',
                    letterSpacing: '-0.01em',
                    opacity: 0.85,
                    textShadow: '0 1px 6px hsl(327, 24%, 28%), 0 0 16px hsla(327, 24%, 28%, 0.9)',
                  }}
                >
                  Still Fair
                </h3>
                <p
                  style={{
                    fontFamily: "'Lato', sans-serif",
                    fontSize: '11px',
                    fontWeight: 400,
                    color: 'hsla(327, 15%, 75%, 0.85)',
                    marginTop: '4px',
                    lineHeight: 1.4,
                    textShadow: '0 0 10px hsl(327, 24%, 28%), 0 0 20px hsla(327, 24%, 28%, 0.8)',
                  }}
                >
                  Det osynliga arbetet, synligt för båda
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontFamily: "'Lato', sans-serif",
                      fontSize: '9px',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: 'hsla(38, 78%, 58%, 0.9)',
                      background: 'hsla(38, 70%, 50%, 0.10)',
                      borderRadius: '20px',
                      padding: '4px 10px',
                      lineHeight: 1.4,
                    }}
                  >
                    <span style={{ fontSize: '10px' }}>✦</span> Kommer snart
                  </span>
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
                      color: notifySignedUp ? 'hsla(38, 78%, 58%, 0.8)' : '#0A0A1A',
                      background: notifySignedUp ? 'hsla(38, 70%, 50%, 0.08)' : 'linear-gradient(135deg, hsla(38, 78%, 58%, 0.9) 0%, hsla(38, 65%, 50%, 0.85) 100%)',
                      border: notifySignedUp ? '1px solid hsla(38, 70%, 50%, 0.15)' : 'none',
                      borderRadius: '20px',
                      padding: notifySignedUp ? '4px 12px' : '5px 14px',
                      cursor: notifySignedUp ? 'default' : 'pointer',
                      opacity: notifyLoading ? 0.6 : 1,
                      transition: 'all 200ms ease',
                      boxShadow: notifySignedUp ? 'none' : '0 2px 12px hsla(38, 70%, 40%, 0.3)',
                    }}
                  >
                    {notifySignedUp ? '✓ Du blir meddelad' : '🔔 Meddela mig'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
          </motion.div>
        )}
        </AnimatePresence>
        </motion.div>

        {/* Sign-off — elevated */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{
            textAlign: 'center',
            padding: '0 28px',
            marginTop: isDark ? '0' : '32px',
            paddingTop: isDark ? '8px' : '0',
            paddingBottom: 'calc(48px + env(safe-area-inset-bottom, 0px))',
          }}
        >
          <div style={{
            width: '40px',
            height: '1px',
            background: isDark
              ? 'linear-gradient(90deg, transparent, hsla(38, 60%, 50%, 0.35), transparent)'
              : 'linear-gradient(90deg, transparent, hsla(30, 20%, 60%, 0.3), transparent)',
            margin: '0 auto 18px',
          }} />
          <p
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontStyle: 'normal',
              fontSize: '14px',
              color: isDark ? 'hsla(38, 55%, 70%, 1)' : '#E9B44C',
              opacity: 0.9,
              lineHeight: 1.7,
              letterSpacing: '-0.01em',
            }}
          >
            Utvecklat av psykolog med 20+ års klinisk erfarenhet.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
