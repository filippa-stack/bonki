import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { allProducts } from '@/data/products';
import bonkiLogo from '@/assets/bonki-logo.png';
import illustrationStillUs from '@/assets/illustration-still-us.png';
import illustrationJagIMig from '@/assets/monster-jag-i-mig.png';
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

/**
 * Short taglines per product — shown below the title on each tile.
 */
const TAGLINES: Record<string, string> = {
  jag_i_mig: 'Hjälp ditt barn hitta ord för det som känns',
  jag_med_andra: 'När världen utanför börjar betyda allt',
  jag_i_varlden: 'De stora frågorna, på riktigt',
  vardagskort: 'Bättre samtal runt middagsbordet',
  syskonkort: 'Allt som finns mellan dem',
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

/** Per-product illustration opacity overrides (default 0.10) */
const ILLUSTRATION_OPACITY: Record<string, number> = {
  jag_i_varlden: 0.10,
  jag_i_mig: 0.075,
  syskonkort: 0.10,
};

const ACCENT_COLORS: Record<string, string> = {
  jag_i_mig: '#8A9A10',
  jag_med_andra: '#9825D6',
  jag_i_varlden: '#3D7A45',
  sexualitetskort: '#B5646E',
  vardagskort: '#0F6B99',
  syskonkort: '#0F4E99',
};

/** Darkened background tones for taglines — quiet, printed-on-paper feel */
const TAGLINE_COLORS: Record<string, string> = {
  jag_i_mig: '#6B6742',
  jag_med_andra: '#5E4058',
  jag_i_varlden: '#3A6B48',
  sexualitetskort: '#6B4858',
  vardagskort: '#2A5858',
  syskonkort: '#2A3E68',
};

/* ── Stagger orchestration ── */
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05, delayChildren: 0.15 },
  },
};

const tileVariants = {
  hidden: { opacity: 0, y: 14, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/** Audience label with flanking lines */
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
        className="font-sans"
        style={{
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

/** Premium pastel tile with top-to-bottom light gradient */
function PastelTile({
  name, bg, ageLabel, tagline, onClick, aspectRatio = '4 / 3', isHero = false, illustration, accentColor, taglineColor, illustrationOpacity = 0.10,
}: {
  name: string; bg: string; ageLabel?: string; tagline?: string;
  onClick?: () => void; aspectRatio?: string; isHero?: boolean; illustration?: string;
  accentColor?: string; taglineColor?: string; illustrationOpacity?: number;
}) {
  // Darken hex bg by ~4% for bottom gradient
  const darkenHex = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const d = 0.91;
    return `rgb(${Math.round(r * d)}, ${Math.round(g * d)}, ${Math.round(b * d)})`;
  };
  const bottomColor = darkenHex(bg);

  return (
    <motion.div
      variants={tileVariants}
      whileHover={{ scale: isHero ? 1.02 : 1.03, y: isHero ? -2 : -3 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="cursor-pointer"
      style={{
        borderRadius: '13px',
        background: `linear-gradient(180deg, ${bg} 0%, ${bottomColor} 100%)`,
        aspectRatio,
        display: 'flex',
        flexDirection: isHero ? 'row' : 'column',
        alignItems: isHero ? 'center' : 'flex-start',
        justifyContent: 'flex-start',
        textAlign: 'left',
        padding: isHero ? '16px 20px 16px 0' : '24px 16px 16px',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(44, 36, 32, 0.05)',
        boxShadow: '0px 1px 3px rgba(44, 36, 32, 0.12), 0px 4px 8px rgba(44, 36, 32, 0.08)',
      }}
    >
      {ageLabel && (
        <span
          className="font-sans"
          style={{
            position: 'absolute',
            top: '10px',
            right: '12px',
            fontSize: '9px',
            fontWeight: 600,
            letterSpacing: '0.06em',
            color: accentColor || 'var(--text-library)',
            opacity: 0.6,
            zIndex: 2,
          }}
        >
          {ageLabel}
        </span>
      )}
      {/* Watermark illustration — ghosted on the right */}
      {illustration && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${illustration})`,
            backgroundSize: '65% auto',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right center',
            opacity: illustrationOpacity,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      )}
      <div style={{ zIndex: 1, ...(isHero ? { flex: 1 } : {}) }}>
        <h3
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: isHero ? '24px' : '22px',
            fontWeight: 400,
            lineHeight: 1.2,
            color: accentColor || 'var(--text-library)',
            letterSpacing: '-0.01em',
          }}
        >
          {name}
        </h3>
        {tagline && (
          <p
            className="font-serif"
            style={{
              fontSize: isHero ? '13px' : '11px',
              fontWeight: 400,
              fontStyle: 'normal',
              color: taglineColor || '#8A8078',
              marginTop: '5px',
              lineHeight: 1.4,
            }}
          >
            {tagline}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default function ProductLibrary() {
  const navigate = useNavigate();

  const trio = allProducts.filter(p => ['jag_i_mig', 'jag_med_andra', 'jag_i_varlden', 'sexualitetskort'].includes(p.id));
  const extras = allProducts.filter(p => ['vardagskort', 'syskonkort'].includes(p.id));

  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{ backgroundColor: 'var(--surface-library)' }}
    >
      {/* Background watermark — Bonki logo */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '70vw',
          height: '70vw',
          backgroundImage: `url(${bonkiLogo})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          opacity: 0.04,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Hero */}
        <motion.div
          className="pt-8 pb-2 px-6 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1
            className="type-h1"
            style={{ color: 'var(--text-library)', marginBottom: '4px' }}
          >
            Bonki
          </h1>
          <p
            className="font-serif"
            style={{
              fontSize: '13px',
              fontWeight: 400,
              color: 'var(--color-text-secondary)',
              opacity: 0.7,
              lineHeight: 1.5,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Välj det samtal ni behöver just nu
          </p>
        </motion.div>

        {/* ── Still Us ── */}
        <motion.div
          className="px-5 mt-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AudienceLabel label="Ni två" delay={0.08} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {/* Still Us tile */}
            <motion.div
              variants={tileVariants}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/product/still-us')}
              className="cursor-pointer"
              style={{
                borderRadius: '13px',
                padding: '24px 16px 16px',
                background: `linear-gradient(135deg, #35564A 0%, #243E34 100%)`,
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                aspectRatio: '3 / 2',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                boxShadow: '0px 4px 16px rgba(44, 36, 32, 0.15), 0px 2px 4px rgba(44, 36, 32, 0.08)',
              }}
            >
              {/* Noise texture overlay */}
              <div style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '13px',
                opacity: 0.03,
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                backgroundSize: '128px 128px',
                pointerEvents: 'none',
                mixBlendMode: 'overlay',
              }} />
              {/* Watermark illustration */}
              <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url(${illustrationStillUs})`,
                backgroundSize: '65% auto',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right center',
                opacity: 0.12,
                pointerEvents: 'none',
                zIndex: 0,
              }} />
              <h2
                style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: '24px',
                  fontWeight: 400,
                  color: '#FAF3E8',
                  letterSpacing: '0.02em',
                }}
              >
                Still Us
              </h2>
              <p
                className="font-serif"
                style={{
                  fontSize: '11px',
                  color: 'var(--accent-saffron)',
                  marginTop: '6px',
                  fontStyle: 'normal',
                }}
              >
                För samtalen som aldrig blir av
              </p>
            </motion.div>

            {/* Coming Soon — Still Fair */}
            <motion.div
              variants={tileVariants}
              style={{
                borderRadius: '13px',
                padding: '24px 16px 16px',
                background: 'linear-gradient(135deg, #9B7264 0%, #7A5545 100%)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                aspectRatio: '3 / 2',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                boxShadow: '0px 4px 16px rgba(44, 36, 32, 0.15), 0px 2px 4px rgba(44, 36, 32, 0.08)',
              }}
            >
              {/* Noise texture overlay */}
              <div style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '13px',
                opacity: 0.03,
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                backgroundSize: '128px 128px',
                pointerEvents: 'none',
                mixBlendMode: 'overlay',
              }} />
              {/* Watermark illustration */}
              <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url(${illustrationStillUs})`,
                backgroundSize: '65% auto',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right center',
                opacity: 0.12,
                pointerEvents: 'none',
                zIndex: 0,
              }} />
              <h3
                style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: '24px',
                  fontWeight: 400,
                  color: '#FAF3E8',
                  letterSpacing: '0.02em',
                }}
              >
                Still Fair
              </h3>
              <p
                className="font-serif"
                style={{
                  fontSize: '11px',
                  color: '#E8C4B4',
                  fontStyle: 'normal',
                  lineHeight: 1.4,
                  marginTop: '6px',
                }}
              >
                För allt som görs<br />men aldrig syns
              </p>
              <button
                className="font-serif"
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: implement reminder logic
                }}
                style={{
                  marginTop: 'auto',
                  fontSize: '11px',
                  fontWeight: 400,
                  fontStyle: 'normal',
                  color: 'var(--accent-saffron)',
                  background: 'none',
                  border: 'none',
                  padding: '0',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  borderBottom: '1px solid transparent',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderBottomColor = 'var(--accent-saffron)')}
                onMouseLeave={e => (e.currentTarget.style.borderBottomColor = 'transparent')}
              >
                kommer snart — påminn
              </button>
            </motion.div>
          </div>
        </motion.div>

        {/* ── Emotionella resan (trio) ── */}
        <div className="px-5 mt-10">
          <AudienceLabel label="Ert barn" delay={0.12} />
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
            {trio.map(p => (
              <PastelTile
                key={p.id}
                name={p.name}
                bg={PASTEL_COLORS[p.id]!}
                tagline={TAGLINES[p.id]}
                ageLabel={p.ageLabel}
                accentColor={ACCENT_COLORS[p.id]}
                taglineColor={TAGLINE_COLORS[p.id]}
                illustration={ILLUSTRATIONS[p.id]}
                illustrationOpacity={ILLUSTRATION_OPACITY[p.id]}
                onClick={() => navigate(`/product/${p.slug}`)}
                aspectRatio="3 / 2"
              />
            ))}
          </motion.div>
        </div>

        {/* ── Hela familjen ── */}
        <div className="px-5 mt-10">
          <AudienceLabel label="Er familj" delay={0.20} />
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '10px',
              paddingBottom: '32px',
            }}
          >
            {extras.map(p => (
              <PastelTile
                key={p.id}
                name={p.name}
                bg={PASTEL_COLORS[p.id]!}
                tagline={TAGLINES[p.id]}
                ageLabel={p.ageLabel}
                accentColor={ACCENT_COLORS[p.id]}
                taglineColor={TAGLINE_COLORS[p.id]}
                illustration={ILLUSTRATIONS[p.id]}
                illustrationOpacity={ILLUSTRATION_OPACITY[p.id]}
                onClick={() => navigate(`/product/${p.slug}`)}
                aspectRatio="3 / 2"
              />
            ))}
          </motion.div>
        </div>

        {/* Sign-off */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          style={{ textAlign: 'center', padding: '0 20px', paddingBottom: 'calc(40px + env(safe-area-inset-bottom, 0px))' }}
        >
          <p
            className="font-serif"
            style={{
              fontStyle: 'normal',
              fontSize: '13px',
              color: 'var(--accent-text)',
              opacity: 0.55,
            }}
          >
            Utvecklat av psykolog med 20+ års klinisk erfarenhet.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
