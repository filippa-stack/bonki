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
  jag_i_mig: 'Hjälp ditt barn hitta ord för det som känns',
  jag_med_andra: 'När omvärlden växer',
  jag_i_varlden: 'De stora frågorna',
  vardagskort: 'Samtal runt middagsbordet',
  syskonkort: 'Det som finns mellan dem',
  sexualitetskort: 'Det svåra samtalet, utan att det behöver vara svårt',
};

const PASTEL_COLORS: Record<string, string> = {
  jag_i_mig: '#F5EDD2',
  jag_med_andra: '#F0D9EA',
  jag_i_varlden: '#C8E6D0',
  sexualitetskort: '#F0D9E2',
  vardagskort: '#D2E8E8',
  syskonkort: '#D6E2F0',
};

/** Raised illustration opacities — illustrations are a feature, not a ghost */
const ILLUSTRATION_OPACITY: Record<string, number> = {
  jag_i_mig: 0.22,
  jag_med_andra: 0.20,
  jag_i_varlden: 0.18,
  sexualitetskort: 0.25,
  vardagskort: 0.18,
  syskonkort: 0.20,
};

const ILLUSTRATION_SIZE: Record<string, string> = {
  jag_i_mig: '90% auto',
  jag_med_andra: '70% auto',
};

const ILLUSTRATION_POSITION: Record<string, string> = {
  jag_i_mig: '80% 60%',
};

/** Restored strong accent colors for tile titles */
const ACCENT_COLORS: Record<string, string> = {
  jag_i_mig: '#6B6B10',
  jag_med_andra: '#7A1BA8',
  jag_i_varlden: '#2D6B35',
  sexualitetskort: '#A04858',
  vardagskort: '#0A4A6A',
  syskonkort: '#0C3D7A',
};

const TAGLINE_COLORS: Record<string, string> = {
  jag_i_mig: '#6B6742',
  jag_med_andra: '#5E4058',
  jag_i_varlden: '#3A6B48',
  sexualitetskort: '#6B4858',
  vardagskort: '#1A4040',
  syskonkort: '#1A2E50',
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


const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.14, delayChildren: 0.45 },
  },
};

const tileVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.93 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] as const },
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
/** Pastel tile — illustration as right-aligned feature, text left */
const PastelTile = React.forwardRef<HTMLDivElement, {
  name: string; bg: string; ageLabel?: string; tagline?: string;
  onClick?: () => void; illustration?: string;
  accentColor?: string; taglineColor?: string; illustrationOpacity?: number;
  illustrationSize?: string; illustrationPosition?: string; wide?: boolean;
  showFreeBadge?: boolean; badgeText?: string;
}>(function PastelTile({
  name, bg, ageLabel, tagline, onClick, illustration, accentColor, taglineColor,
  illustrationOpacity = 0.25, illustrationSize = 'contain', illustrationPosition = 'right center', wide = false,
  showFreeBadge = false, badgeText = 'Första kortet gratis',
}, ref) {
  const darkenHex = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const d = 0.91;
    return `rgb(${Math.round(r * d)}, ${Math.round(g * d)}, ${Math.round(b * d)})`;
  };

    return (
      <motion.div
        variants={tileVariants}
        whileHover={{ scale: 1.025, y: -3 }}
        whileTap={{ scale: 0.985 }}
        onClick={onClick}
        className="cursor-pointer"
        style={{
          borderRadius: '20px',
          background: `linear-gradient(180deg, ${bg} 0%, ${darkenHex(bg)} 100%)`,
          minHeight: wide ? '140px' : '150px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          textAlign: 'left',
          padding: wide ? '36px 20px 16px' : '36px 16px 14px',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid hsla(30, 15%, 80%, 0.3)',
          boxShadow: '0 2px 6px hsla(30, 18%, 20%, 0.08), 0 10px 28px -6px hsla(30, 20%, 18%, 0.10)',
          gridColumn: wide ? 'span 2' : undefined,
        }}
      >
      {ageLabel && (
        <span
          style={{
            position: 'absolute',
            top: '10px',
            right: '12px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Lato', sans-serif",
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.02em',
            color: accentColor || 'var(--text-library)',
            opacity: 0.7,
            background: 'rgba(255, 255, 255, 0.45)',
            zIndex: 2,
          }}
        >
          {ageLabel}
        </span>
      )}
      {/* Illustration — right-aligned, visible */}
      {illustration && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: wide ? '50%' : '65%',
            backgroundImage: `url(${illustration})`,
            backgroundSize: illustrationSize,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: illustrationPosition,
            opacity: illustrationOpacity,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      )}
      <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1, width: '100%' }}>
        <h3
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: wide ? '26px' : '19px',
            fontWeight: 400,
            lineHeight: 1.15,
            color: accentColor || 'var(--text-library)',
            letterSpacing: '-0.01em',
          }}
        >
          {name}
        </h3>
        {tagline && (
          <p
            style={{
              fontFamily: "'Lato', sans-serif",
              fontSize: '11px',
              fontWeight: 400,
              color: taglineColor || '#8A8078',
              marginTop: '4px',
              lineHeight: 1.4,
              maxWidth: wide ? '55%' : '75%',
            }}
          >
            {tagline}
          </p>
        )}
        {showFreeBadge && (
          <span
            style={{
              display: 'inline-block',
              marginTop: 'auto',
              paddingTop: '6px',
              fontFamily: "'Lato', sans-serif",
              fontSize: wide ? '9px' : '8px',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: accentColor || 'var(--text-library)',
              opacity: 0.55,
              lineHeight: 1.4,
              whiteSpace: 'nowrap',
            }}
          >
            {badgeText}
          </span>
        )}
      </div>
    </motion.div>
  );
});

export default function ProductLibrary() {
  const navigate = useNavigate();
  const tracked = useRef(false);
  const { purchased } = useAllProductAccess();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'barn' | 'par'>('barn');
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

  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{
        background: `
          radial-gradient(ellipse 130% 50% at 50% -5%, hsla(37, 55%, 88%, 0.5) 0%, transparent 50%),
          radial-gradient(ellipse 80% 70% at 85% 90%, hsla(30, 35%, 88%, 0.25) 0%, transparent 50%),
          var(--surface-library)
        `,
        fontFamily: "'Lato', sans-serif",
      }}
    >
      {/* ── Background watermark — cinematic depth ── */}
      <img
        src={watermarkMamma}
        alt=""
        aria-hidden
        style={{
          position: 'absolute',
          width: '300px',
          height: '400px',
          left: '50%',
          top: '0',
          transform: 'translateX(-50%)',
          opacity: 0.07,
          filter: 'sepia(1) saturate(0.2) brightness(1.8) hue-rotate(-10deg)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

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
              color: '#1A1A2E',
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              marginBottom: '8px',
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
              color: 'var(--color-text-secondary)',
              opacity: 0.5,
              lineHeight: 1.6,
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
            backgroundColor: 'hsla(38, 88%, 46%, 0.3)',
            margin: '14px auto 18px',
          }}
        />

        {/* Segment control — tab switcher */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          style={{
            display: 'flex',
            margin: '0 auto 20px',
            width: 'fit-content',
            background: 'transparent',
            padding: '0',
            gap: '20px',
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
                color: '#1A1A2E',
                background: 'transparent',
                opacity: activeTab === tab ? 1 : 0.35,
                border: 'none',
                outline: 'none',
                borderBottom: activeTab === tab ? '2px solid #1A1A2E' : '2px solid transparent',
                borderRadius: '0',
                padding: '6px 4px',
                cursor: 'pointer',
                transition: 'all 260ms ease',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {tab.toUpperCase()}
            </button>
          ))}
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
              fontStyle: 'italic',
              fontSize: '15px',
              fontWeight: 400,
              color: 'var(--color-text-secondary)',
              opacity: 0.5,
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
              gap: '12px',
            }}
          >
            <PastelTile
              name={jagIMig.name}
              bg={PASTEL_COLORS[jagIMig.id]!}
              tagline={TAGLINES[jagIMig.id]}
              ageLabel={jagIMig.ageLabel}
              accentColor={ACCENT_COLORS[jagIMig.id]}
              taglineColor={TAGLINE_COLORS[jagIMig.id]}
              illustration={ILLUSTRATIONS[jagIMig.id]}
              illustrationOpacity={ILLUSTRATION_OPACITY[jagIMig.id]}
              illustrationSize={ILLUSTRATION_SIZE[jagIMig.id]}
              illustrationPosition={ILLUSTRATION_POSITION[jagIMig.id]}
              onClick={() => navigate(`/product/${jagIMig.slug}`)}
              showFreeBadge={!purchased.has(jagIMig.id)}
              badgeText={buildBadgeText(jagIMig)}
              wide
            />
            <PastelTile
              name={jagMedAndra.name}
              bg={PASTEL_COLORS[jagMedAndra.id]!}
              tagline={TAGLINES[jagMedAndra.id]}
              ageLabel={jagMedAndra.ageLabel}
              accentColor={ACCENT_COLORS[jagMedAndra.id]}
              taglineColor={TAGLINE_COLORS[jagMedAndra.id]}
              illustration={ILLUSTRATIONS[jagMedAndra.id]}
              illustrationOpacity={ILLUSTRATION_OPACITY[jagMedAndra.id]}
              illustrationSize={ILLUSTRATION_SIZE[jagMedAndra.id]}
              onClick={() => navigate(`/product/${jagMedAndra.slug}`)}
              showFreeBadge={!purchased.has(jagMedAndra.id)}
              badgeText={buildBadgeText(jagMedAndra)}
            />
            <PastelTile
              name={jagIVarlden.name}
              bg={PASTEL_COLORS[jagIVarlden.id]!}
              tagline={TAGLINES[jagIVarlden.id]}
              ageLabel={jagIVarlden.ageLabel}
              accentColor={ACCENT_COLORS[jagIVarlden.id]}
              taglineColor={TAGLINE_COLORS[jagIVarlden.id]}
              illustration={ILLUSTRATIONS[jagIVarlden.id]}
              illustrationOpacity={ILLUSTRATION_OPACITY[jagIVarlden.id]}
              onClick={() => navigate(`/product/${jagIVarlden.slug}`)}
              showFreeBadge={!purchased.has(jagIVarlden.id)}
              badgeText={buildBadgeText(jagIVarlden)}
            />
            <PastelTile
              name={vardag.name}
              bg={PASTEL_COLORS[vardag.id]!}
              tagline={TAGLINES[vardag.id]}
              ageLabel={vardag.ageLabel}
              accentColor={ACCENT_COLORS[vardag.id]}
              taglineColor={TAGLINE_COLORS[vardag.id]}
              illustration={ILLUSTRATIONS[vardag.id]}
              illustrationOpacity={ILLUSTRATION_OPACITY[vardag.id]}
              onClick={() => navigate(`/product/${vardag.slug}`)}
              showFreeBadge={!purchased.has(vardag.id)}
              badgeText={buildBadgeText(vardag)}
            />
            <PastelTile
              name={syskon.name}
              bg={PASTEL_COLORS[syskon.id]!}
              tagline={TAGLINES[syskon.id]}
              ageLabel={syskon.ageLabel}
              accentColor={ACCENT_COLORS[syskon.id]}
              taglineColor={TAGLINE_COLORS[syskon.id]}
              illustration={ILLUSTRATIONS[syskon.id]}
              illustrationOpacity={ILLUSTRATION_OPACITY[syskon.id]}
              onClick={() => navigate(`/product/${syskon.slug}`)}
              showFreeBadge={!purchased.has(syskon.id)}
              badgeText={buildBadgeText(syskon)}
            />
            <PastelTile
              name={sexualitet.name}
              bg={PASTEL_COLORS[sexualitet.id]!}
              tagline={TAGLINES[sexualitet.id]}
              ageLabel={sexualitet.ageLabel}
              accentColor={ACCENT_COLORS[sexualitet.id]}
              taglineColor={TAGLINE_COLORS[sexualitet.id]}
              illustration={ILLUSTRATIONS[sexualitet.id]}
              illustrationOpacity={ILLUSTRATION_OPACITY[sexualitet.id]}
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
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, hsla(38, 50%, 60%, 0.2))' }} />
          <span style={{
            fontFamily: "'Lato', sans-serif",
            fontSize: '8px',
            fontWeight: 700,
            letterSpacing: '0.15em',
            textTransform: 'uppercase' as const,
            color: 'var(--accent-text)',
            opacity: 0.45,
          }}>
            ✦
          </span>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, hsla(38, 50%, 60%, 0.2), transparent)' }} />
        </motion.div>

        {/* Diary — magical emotional anchor */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/diary/jag_i_mig')}
          className="cursor-pointer"
          style={{
            margin: '16px 20px 16px',
            padding: '28px 22px 22px',
            borderRadius: '20px',
            background: 'linear-gradient(180deg, hsla(30, 20%, 96%, 0.9) 0%, hsla(37, 30%, 93%, 0.7) 100%)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 2px 8px hsla(30, 20%, 20%, 0.04), 0 12px 32px -8px hsla(30, 18%, 16%, 0.08)',
            border: '1px solid hsla(30, 20%, 80%, 0.3)',
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
            background: 'radial-gradient(circle, hsla(38, 70%, 70%, 0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* Book icon with saffron tint */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.0, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent-text)', opacity: 0.4, margin: '0 auto 10px', display: 'block' }}>
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
              color: '#1A1A2E',
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
              color: 'var(--accent-text)',
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
              { color: 'hsla(45, 50%, 92%, 0.8)', accent: '#6B6742', title: 'Jag i Mig', date: '12 mar', text: '"Hon sa att hon ibland känner sig osynlig i skolan..."' },
              { color: 'hsla(145, 30%, 89%, 0.8)', accent: '#3A6B48', title: 'Jag i Världen', date: '8 mar', text: '"Vi pratade om mod — att våga säga ifrån"' },
              { color: 'hsla(215, 35%, 91%, 0.8)', accent: '#2A3E68', title: 'Syskon', date: '3 mar', text: '"De skrattade åt minnet av sommaren..."' },
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
              background: 'linear-gradient(to bottom, transparent, hsla(30, 20%, 93%, 0.5))',
              marginTop: '6px',
              borderRadius: '0 0 12px 12px',
            }} />
            <p style={{
              fontFamily: "'Lato', sans-serif",
              fontSize: '9px',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase' as const,
              color: 'var(--accent-text)',
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
          >
        {/* Bridge phrase — inline, no card */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          style={{
            textAlign: 'center',
            padding: '4px 28px 12px',
          }}
        >
          <p
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontStyle: 'italic',
              fontSize: '15px',
              fontWeight: 400,
              color: 'var(--color-text-secondary)',
              opacity: 0.5,
              lineHeight: 1.6,
            }}
          >
            Barnens trygghet börjar med deras vuxna
          </p>
        </motion.div>

        {/* ── Par ── */}
        <motion.div
          className="px-5 mt-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingBottom: '32px' }}>
            <motion.div
              variants={tileVariants}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/product/still-us')}
              className="cursor-pointer"
              style={{
                borderRadius: '16px',
                padding: '24px 20px 18px',
                background: 'linear-gradient(180deg, #D6E8DE 0%, #CADBC4 100%)',
                textAlign: 'left',
                position: 'relative',
                overflow: 'hidden',
                minHeight: '160px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'flex-end',
                border: '1px solid rgba(44, 36, 32, 0.05)',
                boxShadow: '0px 2px 6px rgba(44, 36, 32, 0.10), 0px 8px 20px rgba(44, 36, 32, 0.08)',
              }}
            >
              {/* Illustration */}
              <div
                style={{
                  position: 'absolute',
                  top: '-10%', right: '-5%', bottom: '-10%',
                  width: '55%',
                  backgroundImage: `url(${illustrationStillUs})`,
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center center',
                  opacity: 0.22,
                  pointerEvents: 'none',
                  zIndex: 0,
                }}
              />
              <div style={{ zIndex: 1 }}>
                <h3 style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: '26px', fontWeight: 400,
                  lineHeight: 1.15,
                  color: '#2A5040', letterSpacing: '-0.01em',
                }}>
                  Still Us
                </h3>
                <p style={{
                  fontFamily: "'Lato', sans-serif",
                  fontSize: '11px', color: '#4A7A5E',
                  marginTop: '4px',
                  lineHeight: 1.4,
                }}>
                  Vi finns kvar
                </p>
                <p style={{
                  fontFamily: "'Lato', sans-serif",
                  fontSize: '11px', color: '#4A7A5E',
                  marginTop: '4px',
                  lineHeight: 1.4,
                  maxWidth: '55%',
                  opacity: 0.85,
                }}>
                  Ett strukturerat sätt att ta de svåra samtalen innan tystnaden växer sig för stor.
                </p>
                {!purchased.has('still_us') && (
                  <span
                    style={{
                      display: 'inline-block',
                      marginTop: '4px',
                      fontFamily: "'Lato', sans-serif",
                      fontSize: '8px',
                      fontWeight: 600,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: '#1E3D30',
                      opacity: 0.55,
                      lineHeight: 1.4,
                    }}
                  >
                    184 frågor & övningar · 395 kr · Första gratis
                  </span>
                )}
              </div>
            </motion.div>

            <motion.div
              variants={tileVariants}
              style={{
                borderRadius: '16px',
                padding: '24px 20px 18px',
                background: 'linear-gradient(180deg, #EDDCE6 0%, #E0CCd8 100%)',
                textAlign: 'left',
                position: 'relative',
                overflow: 'hidden',
                minHeight: '120px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'flex-end',
                border: '1px solid rgba(44, 36, 32, 0.05)',
                boxShadow: '0px 2px 6px rgba(44, 36, 32, 0.10), 0px 8px 20px rgba(44, 36, 32, 0.08)',
                opacity: 0.85,
                filter: 'saturate(0.7)',
              }}
            >
              {/* Illustration */}
              <div
                style={{
                  position: 'absolute',
                  top: '5%', right: '2%', bottom: '5%',
                  width: '40%',
                  backgroundImage: `url(${illustrationStillFair})`,
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right center',
                  opacity: 0.15,
                  pointerEvents: 'none',
                  zIndex: 0,
                }}
              />
              <div style={{ zIndex: 1 }}>
                <h3 style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: '26px', fontWeight: 400,
                  lineHeight: 1.15,
                  color: '#6B3A58', letterSpacing: '-0.01em',
                }}>
                  Still Fair
                </h3>
                <p style={{
                  fontFamily: "'Lato', sans-serif",
                  fontSize: '11px', color: '#8A5A74',
                  marginTop: '4px',
                  lineHeight: 1.4,
                  maxWidth: '55%',
                  opacity: 0.85,
                }}>
                  Ett kartläggningsverktyg som gör det osynliga arbetet i familjelivet synligt för båda
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
                      color: '#6B3A58',
                      background: 'rgba(107,58,88,0.10)',
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
                      color: notifySignedUp ? '#6B3A58' : '#fff',
                      background: notifySignedUp ? 'rgba(107,58,88,0.08)' : 'linear-gradient(135deg, #6B3A58 0%, #8A5A74 100%)',
                      border: notifySignedUp ? '1px solid rgba(107,58,88,0.15)' : 'none',
                      borderRadius: '20px',
                      padding: notifySignedUp ? '4px 12px' : '5px 14px',
                      cursor: notifySignedUp ? 'default' : 'pointer',
                      opacity: notifyLoading ? 0.6 : 1,
                      transition: 'all 200ms ease',
                      boxShadow: notifySignedUp ? 'none' : '0 2px 8px rgba(107,58,88,0.25)',
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
          style={{ textAlign: 'center', padding: '0 28px', marginTop: '32px', paddingBottom: 'calc(48px + env(safe-area-inset-bottom, 0px))' }}
        >
          <div style={{
            width: '40px',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, hsla(30, 20%, 60%, 0.3), transparent)',
            margin: '0 auto 18px',
          }} />
          <p
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontStyle: 'italic',
              fontSize: '14px',
              color: 'var(--accent-text)',
              opacity: 0.45,
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
