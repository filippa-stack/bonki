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

const ILLUSTRATIONS: Record<string, string> = {
  jag_i_mig: illustrationJagIMig,
  jag_med_andra: illustrationJagMedAndra,
  jag_i_varlden: illustrationJagIVarlden,
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
  jag_i_mig: 'hsl(43, 100%, 99%)',        // #FFFDF8
  jag_med_andra: 'hsl(318, 63%, 97%)',     // #FCF2F9
  jag_i_varlden: 'hsl(138, 100%, 97%)',    // #EEFFF3
  sexualitetskort: 'hsl(318, 63%, 97%)',   // #FCF2F9
  vardagskort: 'hsl(180, 63%, 97%)',       // #F2FCFC
  syskonkort: 'hsl(204, 63%, 97%)',        // #F2F8FC
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
        marginBottom: '10px',
        marginTop: '4px',
      }}
    >
      <div style={{ width: '48px', height: '1px', background: 'var(--color-text-tertiary)', opacity: 0.35 }} />
      <p
        className="font-sans"
        style={{
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--color-text-tertiary)',
          opacity: 0.8,
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </p>
      <div style={{ width: '48px', height: '1px', background: 'var(--color-text-tertiary)', opacity: 0.35 }} />
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
          color: 'var(--text-primary)',
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
                    style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}
                  >
                    {p.name}
                  </span>
                  <span
                    className="font-serif"
                    style={{ fontSize: '10px', color: 'var(--text-primary)', opacity: 0.6, lineHeight: 1.3 }}
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

/** Premium pastel tile with radial inner glow */
function PastelTile({
  name, bg, ageLabel, tagline, onClick, aspectRatio = '4 / 3', isHero = false, illustration,
}: {
  name: string; bg: string; ageLabel?: string; tagline?: string;
  onClick?: () => void; aspectRatio?: string; isHero?: boolean; illustration?: string;
}) {
  const subtleDarker = bg.replace(/(\d+)%\)$/, (_, l) => `${Math.max(Number(l) - 3, 80)}%)`);
  const glowCenter = bg.replace(/(\d+)%\)$/, (_, l) => `${Math.min(Number(l) + 5, 97)}%)`);
  const shadowColor = bg.replace(/hsl\(([^,]+),\s*([^,]+),\s*[^)]+\)/, 'hsla($1, $2, 45%, 0.18)');

  return (
    <motion.div
      variants={tileVariants}
      whileHover={{ scale: isHero ? 1.02 : 1.03, y: isHero ? -2 : -3 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="cursor-pointer"
      style={{
        borderRadius: '20px',
        background: `radial-gradient(ellipse at 50% 40%, ${glowCenter} 0%, ${bg} 55%, ${subtleDarker} 100%)`,
        aspectRatio,
        display: 'flex',
        flexDirection: isHero ? 'row' : 'column',
        alignItems: 'center',
        justifyContent: isHero ? 'flex-start' : 'center',
        textAlign: isHero ? 'left' : 'center',
        padding: isHero ? '0 24px 0 0' : '14px 12px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: `
          0 1px 2px 0 ${shadowColor},
          0 4px 12px -2px ${shadowColor},
          0 12px 32px -4px ${shadowColor}
        `,
      }}
    >
      {ageLabel && (
        <span
          className="font-sans"
          style={{
            position: 'absolute',
            top: '8px',
            right: '10px',
            fontSize: '9px',
            fontWeight: 600,
            letterSpacing: '0.06em',
            color: 'var(--text-primary)',
            opacity: 0.35,
            zIndex: 2,
          }}
        >
          {ageLabel}
        </span>
      )}
      {/* Illustration */}
      {illustration && (
        <div style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...(isHero
            ? { width: '100px', height: '100%', padding: '8px 0 8px 12px' }
            : { width: '52px', height: '52px', marginBottom: '4px' }),
        }}>
          <img
            src={illustration}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              opacity: 0.85,
              filter: 'drop-shadow(0 2px 6px hsla(0, 0%, 0%, 0.08))',
            }}
          />
        </div>
      )}
      <div style={{ zIndex: 1, ...(isHero ? { flex: 1 } : {}) }}>
        <h3
          className="font-serif"
          style={{
            fontSize: isHero ? '22px' : '15px',
            fontWeight: 700,
            lineHeight: 1.2,
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
          }}
        >
          {name}
        </h3>
        {tagline && (
          <p
            className="font-serif"
            style={{
              fontSize: isHero ? '12px' : '10px',
              fontWeight: 400,
              color: 'var(--text-primary)',
              opacity: 0.55,
              marginTop: '4px',
              lineHeight: 1.3,
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
      style={{ backgroundColor: 'var(--surface-base)' }}
    >
      {/* Background watermark */}
      <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 0 }}>
        <img src={watermarkMamma} alt="" style={{ width: '110vw', maxWidth: '110vw', height: 'auto', objectFit: 'contain', opacity: 0.75, transform: 'translateY(-12vh)' }} />
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Hero */}
        <motion.div
          className="pt-5 pb-1 px-6 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1
            className="type-h1"
            style={{ color: 'var(--text-primary)', marginBottom: '4px' }}
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
          className="px-5 mt-2 mb-4"
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
                borderRadius: '18px',
                padding: '20px 16px',
                background: `radial-gradient(ellipse at 50% 35%, hsla(158, 40%, 22%, 0.95) 0%, hsla(158, 35%, 14%, 0.92) 100%)`,
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                aspectRatio: '3 / 2',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `
                  0 1px 2px 0 hsla(0, 0%, 0%, 0.06),
                  0 4px 14px -2px hsla(158, 35%, 20%, 0.18),
                  0 14px 36px -4px hsla(158, 35%, 15%, 0.16),
                  0 0 0 1px hsla(158, 30%, 40%, 0.08) inset
                `,
              }}
            >
              <div style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '18px',
                border: '1px solid hsla(158, 40%, 50%, 0.1)',
                pointerEvents: 'none',
              }} />
              <h2
                className="font-serif"
                style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: 'hsla(0, 0%, 100%, 0.95)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                Still Us
              </h2>
              <p
                className="font-serif"
                style={{
                  fontSize: '10px',
                  color: 'hsla(38, 80%, 55%, 0.7)',
                  marginTop: '4px',
                  fontStyle: 'italic',
                }}
              >
                För samtalen som aldrig blir av
              </p>
            </motion.div>

            {/* Coming Soon — Still Fair */}
            <motion.div
              variants={tileVariants}
              style={{
                borderRadius: '18px',
                padding: '16px 14px',
                background: 'hsla(14, 40%, 66%, 0.18)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                aspectRatio: '3 / 2',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid hsla(14, 40%, 66%, 0.2)',
              }}
            >
              <span
                className="font-sans"
                style={{
                  fontSize: '9px',
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'hsla(14, 40%, 45%, 0.7)',
                  marginBottom: '4px',
                }}
              >
                Coming soon
              </span>
              <h3
                className="font-serif"
                style={{
                  fontSize: '17px',
                  fontWeight: 700,
                  color: 'hsla(14, 35%, 35%, 0.8)',
                  letterSpacing: '0.02em',
                }}
              >
                Still Fair
              </h3>
              <p
                className="font-serif"
                style={{
                  fontSize: '10px',
                  color: 'hsla(14, 30%, 35%, 0.55)',
                  marginTop: '3px',
                  fontStyle: 'italic',
                  lineHeight: 1.3,
                }}
              >
                För allt som görs men aldrig syns
              </p>
              <button
                className="font-sans"
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: implement reminder logic
                }}
                style={{
                  marginTop: '10px',
                  fontSize: '10px',
                  fontWeight: 400,
                  fontStyle: 'italic',
                  letterSpacing: '0.02em',
                  color: 'hsla(38, 70%, 48%, 0.65)',
                  background: 'none',
                  border: 'none',
                  borderBottom: '1px solid hsla(38, 70%, 48%, 0.3)',
                  padding: '0 0 1px 0',
                  cursor: 'pointer',
                }}
              >
                Påminn mig
              </button>
            </motion.div>
          </div>
        </motion.div>

        {/* ── Emotionella resan (trio) ── */}
        <div className="px-5">
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
                onClick={() => navigate(`/product/${p.slug}`)}
                aspectRatio="3 / 2"
              />
            ))}
          </motion.div>
        </div>

        {/* ── Hela familjen ── */}
        <div className="px-5 mt-4">
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
              fontStyle: 'italic',
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
