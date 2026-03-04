import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { allProducts } from '@/data/products';
import bonkiLogo from '@/assets/bonki-logo.png';
import watermarkMamma from '@/assets/watermark-mamma.png';
import illustrationJagIMig from '@/assets/illustration-jag-i-mig.png';
import illustrationJagMedAndra from '@/assets/illustration-jag-med-andra.png';
import illustrationJagIVarlden from '@/assets/illustration-jag-i-varlden.png';
import illustrationSexualitet from '@/assets/illustration-sexualitet.png';

const ILLUSTRATIONS: Record<string, string> = {
  jag_i_mig: illustrationJagIMig,
  jag_med_andra: illustrationJagMedAndra,
  jag_i_varlden: illustrationJagIVarlden,
  sexualitetskort: illustrationSexualitet,
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
  jag_i_varlden: '#D2ECDB',
  sexualitetskort: '#F0D9E2',
  vardagskort: '#D2E8E8',
  syskonkort: '#D6E2F0',
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

const COMING_SOON_PRODUCTS = [
  { name: 'Still Fair', tagline: 'För allt som görs men aldrig syns', audience: 'Par' },
  { name: 'Still Me', tagline: 'För den du var innan du blev vi', audience: 'Par' },
  { name: 'Still Known', tagline: 'För den du tror att du känner', audience: 'Par' },
  { name: 'Still Ready', tagline: 'För er — innan barnet förändrar allt', audience: 'Blivande föräldrar' },
  { name: 'Still Ground', tagline: 'För det som händer efter bråket', audience: 'Par' },
];

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

/** Collapsible "Kommer snart" dropdown */
function ComingSoonDropdown() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ width: '100%', marginTop: '14px' }}>
      <button
        onClick={() => setOpen(v => !v)}
        className="font-sans"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          width: '100%',
          padding: '8px 0',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.16em',
          textTransform: 'uppercase' as const,
          color: 'var(--text-library)',
          opacity: 0.55,
        }}
      >
        Kommer snart
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          style={{ display: 'inline-flex' }}
        >
          <ChevronDown size={12} />
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', paddingTop: '4px' }}>
              {COMING_SOON_PRODUCTS.map(p => (
                <div
                  key={p.name}
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '8px',
                    padding: '5px 4px',
                    opacity: 0.35,
                  }}
                >
                  <span
                    className="font-serif"
                    style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-library)', whiteSpace: 'nowrap' }}
                  >
                    {p.name}
                  </span>
                  <span
                    className="font-serif"
                    style={{ fontSize: '10px', color: 'var(--text-library)', opacity: 0.6, lineHeight: 1.3 }}
                  >
                    {p.tagline}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Premium pastel tile with top-to-bottom light gradient */
function PastelTile({
  name, bg, ageLabel, tagline, onClick, aspectRatio = '4 / 3', isHero = false, illustration, accentColor, taglineColor,
}: {
  name: string; bg: string; ageLabel?: string; tagline?: string;
  onClick?: () => void; aspectRatio?: string; isHero?: boolean; illustration?: string;
  accentColor?: string; taglineColor?: string;
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
            opacity: 0.10,
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
      {/* Background watermark */}
      <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 0 }}>
        <img src={watermarkMamma} alt="" style={{ width: '110vw', maxWidth: '110vw', height: 'auto', objectFit: 'contain', opacity: 0.08, transform: 'translateY(-12vh)' }} />
      </div>

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
          className="px-5 mt-10 mb-10"
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
              onClick={() => navigate('/')}
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
          style={{ textAlign: 'center', paddingBottom: '24px' }}
        >
          <p
            className="font-serif"
            style={{
              fontStyle: 'normal',
              fontSize: '13px',
              color: 'var(--accent-text)',
              opacity: 0.35,
            }}
          >
            Utvecklat av psykolog med 20+ års klinisk erfarenhet.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
