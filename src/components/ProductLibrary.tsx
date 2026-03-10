import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { allProducts } from '@/data/products';
import { useAllProductAccess } from '@/hooks/useAllProductAccess';
import watermarkMamma from '@/assets/watermark-mamma.png';

import illustrationStillUs from '@/assets/illustration-still-us.png';
import illustrationJagIMig from '@/assets/mirror-jag-i-mig.png';
import illustrationJagMedAndra from '@/assets/annorlunda-jag-med-andra.png';
import illustrationJagIVarlden from '@/assets/aktivism-jag-i-varlden.png';
import illustrationSexualitet from '@/assets/illustration-sexualitet.png';
import illustrationSyskon from '@/assets/illustration-syskon.png';
import illustrationVardag from '@/assets/illustration-vardag.png';

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
  jag_i_varlden: 'De stora frågorna, på riktigt',
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
  jag_med_andra: 0.28,
  jag_i_varlden: 0.25,
  sexualitetskort: 0.25,
  vardagskort: 0.25,
  syskonkort: 0.25,
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
  return `${count} ämnen · ${price} kr · Första gratis`;
}


const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.15 },
  },
};

const tileVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

function AudienceLabel({ label, delay = 0 }: { label: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.6 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '14px',
        marginBottom: '16px',
        marginTop: '4px',
      }}
    >
      <div style={{ width: '48px', height: '1px', background: '#A09890', opacity: 0.2 }} />
      <p
        style={{
          fontFamily: "'Lato', sans-serif",
          fontSize: '10px',
          fontWeight: 600,
          letterSpacing: '0.15em',
          fontVariant: 'small-caps',
          textTransform: 'lowercase',
          color: '#A09890',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </p>
      <div style={{ width: '48px', height: '1px', background: '#A09890', opacity: 0.2 }} />
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
      whileHover={{ scale: 1.03, y: -3 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="cursor-pointer"
      style={{
        borderRadius: '16px',
        background: `linear-gradient(180deg, ${bg} 0%, ${darkenHex(bg)} 100%)`,
        minHeight: wide ? '140px' : '150px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-end',
        textAlign: 'left',
        padding: wide ? '20px 20px' : '16px 16px',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(44, 36, 32, 0.05)',
        boxShadow: '0px 2px 6px rgba(44, 36, 32, 0.10), 0px 8px 20px rgba(44, 36, 32, 0.08)',
        gridColumn: wide ? 'span 2' : undefined,
      }}
    >
      {ageLabel && (
        <span
          style={{
            position: 'absolute',
            top: '10px',
            right: '12px',
            fontFamily: "'Lato', sans-serif",
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.06em',
            color: accentColor || 'var(--text-library)',
            opacity: 0.65,
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
      <div style={{ zIndex: 1 }}>
        <h3
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: wide ? '26px' : '22px',
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
              fontSize: wide ? '13px' : '11px',
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
              marginTop: '8px',
              fontFamily: "'Lato', sans-serif",
              fontSize: '8px',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: accentColor || 'var(--text-library)',
              opacity: 0.55,
              lineHeight: 1.4,
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
  const [activeTab, setActiveTab] = useState<'barn' | 'par'>('barn');
  const barnRef = useRef<HTMLDivElement>(null);
  const parRef = useRef<HTMLDivElement>(null);

  const scrollTo = (tab: 'barn' | 'par') => {
    setActiveTab(tab);
    const ref = tab === 'barn' ? barnRef : parRef;
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
      style={{ backgroundColor: 'var(--surface-library)', fontFamily: "'Lato', sans-serif" }}
    >
      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Hero — BONKI title + mamma illustration */}
        <motion.div
          className="pt-4 pb-2 px-6 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: 'relative' }}
        >
          <h1
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              color: 'var(--text-library)',
              marginBottom: '4px',
              fontSize: '48px',
              letterSpacing: '0.06em',
            }}
          >
            Bonki
          </h1>
          <p
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontStyle: 'italic',
              fontSize: '12px',
              fontWeight: 400,
              color: 'var(--color-text-secondary)',
              opacity: 0.5,
              lineHeight: 1.5,
              marginBottom: '6px',
            }}
          >
            Samtalsverktyg utvecklade av psykolog
          </p>
          <p
            style={{
              fontFamily: "'Lato', sans-serif",
              fontSize: '12px',
              fontWeight: 400,
              color: 'var(--color-text-secondary)',
              opacity: 0.6,
              lineHeight: 1.5,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
            }}
          >
            Välj det samtal ni behöver just nu
          </p>
        </motion.div>

          {/* Tab navigation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '16px',
              marginBottom: '8px',
            }}
          >
            {(['barn', 'par'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => scrollTo(tab)}
                style={{
                  fontFamily: "'Lato', sans-serif",
                  fontSize: '13px',
                  fontWeight: activeTab === tab ? 700 : 400,
                  letterSpacing: '0.04em',
                  color: activeTab === tab ? 'var(--text-library)' : '#A09890',
                  background: activeTab === tab ? 'rgba(44, 36, 32, 0.06)' : 'transparent',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '6px 18px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {tab === 'barn' ? 'Barn' : 'Par'}
              </button>
            ))}
          </motion.div>

        {/* ── Barn — broken grid layout ── */}
        <div ref={barnRef} className="px-5 mt-3" style={{ scrollMarginTop: '8px' }}>
          <AudienceLabel label="Barn" delay={0.08} />
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '10px',
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

        {/* Bridge phrase */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          style={{
            textAlign: 'center',
            padding: '32px 20px 0',
          }}
        >
          <div style={{ width: '32px', height: '1px', background: '#A09890', opacity: 0.2, margin: '0 auto 16px' }} />
          <p
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontStyle: 'italic',
              fontSize: '14px',
              color: 'var(--accent-saffron)',
              opacity: 0.45,
              lineHeight: 1.6,
            }}
          >
            Barnens trygghet börjar med
            <br />
            deras vuxna
          </p>
        </motion.div>

        {/* ── Par ── */}
        <motion.div
          ref={parRef}
          className="px-5 mt-5"
          style={{ scrollMarginTop: '8px' }}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AudienceLabel label="Par" delay={0.20} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingBottom: '32px' }}>
            <motion.div
              variants={tileVariants}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/product/still-us')}
              className="cursor-pointer"
              style={{
                borderRadius: '16px',
                padding: '24px 20px 16px',
                background: 'linear-gradient(135deg, #35564A 0%, #243E34 100%)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                minHeight: '120px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                boxShadow: '0px 4px 16px rgba(44, 36, 32, 0.18), 0px 2px 4px rgba(44, 36, 32, 0.10)',
              }}
            >
              <h2 style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: '26px', fontWeight: 400,
                color: '#FAF3E8', letterSpacing: '0.01em', zIndex: 1,
              }}>
                Still Us
              </h2>
              <p style={{
                fontFamily: "'Lato', sans-serif",
                fontSize: '13px', color: 'var(--accent-saffron)',
                marginTop: '4px', zIndex: 1,
              }}>
                För samtalen som aldrig blir av
              </p>
              {!purchased.has('still_us') && (
                <span
                  style={{
                    marginTop: '8px',
                    fontFamily: "'Lato', sans-serif",
                    fontSize: '9px',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--accent-saffron)',
                    opacity: 0.7,
                    background: 'rgba(255, 255, 255, 0.08)',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    zIndex: 1,
                    whiteSpace: 'nowrap',
                  }}
                >
                  184 frågor & övningar · 395 kr · Första gratis
                </span>
              )}
            </motion.div>

            <motion.div
              variants={tileVariants}
              style={{
                borderRadius: '16px',
                padding: '24px 20px 16px',
                background: 'linear-gradient(135deg, #7A4A6B 0%, #5C3650 100%)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                minHeight: '120px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                border: '1px solid rgba(255, 255, 255, 0.04)',
                boxShadow: '0px 2px 8px rgba(44, 36, 32, 0.08)',
                opacity: 0.3,
                filter: 'saturate(0.15) blur(0.7px)',
              }}
            >
              <h3 style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: '26px', fontWeight: 400,
                color: '#FAF3E8', letterSpacing: '0.01em', zIndex: 1,
              }}>
                Still Fair
              </h3>
              <p style={{
                fontFamily: "'Lato', sans-serif",
                fontSize: '13px', color: '#E8C4D4',
                lineHeight: 1.4, marginTop: '4px', zIndex: 1,
              }}>
                För allt som görs men aldrig syns
              </p>
              <span
                style={{
                  marginTop: '10px',
                  fontFamily: "'Lato', sans-serif",
                  fontSize: '9px',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#E8C4D4',
                  background: 'rgba(255, 255, 255, 0.08)',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  zIndex: 1,
                }}
              >
                Kommer snart
              </span>
            </motion.div>
          </div>
        </motion.div>



        {/* Sign-off */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          style={{ textAlign: 'center', padding: '0 20px', marginTop: '24px', paddingBottom: 'calc(40px + env(safe-area-inset-bottom, 0px))' }}
        >
          <div style={{ width: '32px', height: '1px', background: '#A09890', opacity: 0.2, margin: '0 auto 14px' }} />
          <p
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontStyle: 'italic',
              fontSize: '13px',
              color: 'var(--accent-text)',
              opacity: 0.5,
              lineHeight: 1.6,
            }}
          >
            Utvecklat av psykolog med 20+ års klinisk erfarenhet.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
