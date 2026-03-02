import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { allProducts } from '@/data/products';
import bonkiLogo from '@/assets/bonki-logo.png';

/**
 * Short taglines per product — shown below the title on each tile.
 */
const TAGLINES: Record<string, string> = {
  jag_i_mig: 'Förstå det som händer inuti',
  jag_med_andra: 'Om vänskap, gränser och tillhörighet',
  jag_i_varlden: 'Identitet, ansvar och världen runt dig',
  vardagskort: 'Små samtal som gör skillnad',
  syskonkort: 'Bandet som både skaver och håller',
  sexualitetskort: 'Kropp, relationer och gränser',
};

const PASTEL_COLORS: Record<string, string> = {
  jag_i_mig: 'hsl(45, 30%, 90%)',
  jag_med_andra: 'hsl(260, 25%, 90%)',
  jag_i_varlden: 'hsl(185, 30%, 89%)',
  sexualitetskort: 'hsl(330, 25%, 90%)',
  vardagskort: 'hsl(140, 25%, 88%)',
  syskonkort: 'hsl(200, 25%, 88%)',
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

/** Poetic section header — warm, editorial feel */
function SectionHeader({ title, subtitle, delay = 0 }: { title: string; subtitle?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.6 }}
      style={{ textAlign: 'center', marginBottom: '14px' }}
    >
      <p
        className="font-sans"
        style={{
          fontSize: '10px',
          fontWeight: 600,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--color-text-tertiary)',
          opacity: 0.4,
        }}
      >
        {title}
      </p>
      {subtitle && (
        <p
          className="font-serif"
          style={{
            fontSize: '12px',
            fontStyle: 'italic',
            color: 'var(--color-text-secondary)',
            opacity: 0.45,
            marginTop: '2px',
          }}
        >
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}

/** Premium pastel tile */
function PastelTile({
  name, bg, ageLabel, tagline, onClick, aspectRatio = '4 / 3',
}: {
  name: string; bg: string; ageLabel?: string; tagline?: string;
  onClick?: () => void; aspectRatio?: string;
}) {
  const subtleDarker = bg.replace(/(\d+)%\)$/, (_, l) => `${Math.max(Number(l) - 3, 80)}%)`);
  const shadowColor = bg.replace(/hsl\(([^,]+),\s*([^,]+),\s*[^)]+\)/, 'hsla($1, $2, 45%, 0.18)');

  return (
    <motion.div
      variants={tileVariants}
      whileHover={{ scale: 1.03, y: -3 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="cursor-pointer"
      style={{
        borderRadius: '20px',
        background: `linear-gradient(165deg, ${bg} 0%, ${subtleDarker} 100%)`,
        aspectRatio,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '14px 12px',
        position: 'relative',
        boxShadow: `
          0 1px 3px 0 ${shadowColor},
          0 6px 20px -4px ${shadowColor},
          0 16px 44px -8px ${shadowColor}
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
            fontWeight: 700,
            letterSpacing: '0.04em',
            color: 'var(--text-primary)',
            opacity: 0.35,
            background: 'hsla(0, 0%, 100%, 0.5)',
            borderRadius: '8px',
            padding: '2px 6px',
          }}
        >
          {ageLabel}
        </span>
      )}
      <h3
        className="font-serif"
        style={{
          fontSize: '17px',
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
            fontSize: '10px',
            fontWeight: 400,
            color: 'var(--text-primary)',
            opacity: 0.4,
            marginTop: '3px',
            lineHeight: 1.3,
          }}
        >
          {tagline}
        </p>
      )}
    </motion.div>
  );
}

export default function ProductLibrary() {
  const navigate = useNavigate();

  const trio = allProducts.filter(p => ['jag_i_mig', 'jag_med_andra', 'jag_i_varlden'].includes(p.id));
  const extras = allProducts.filter(p => ['vardagskort', 'syskonkort', 'sexualitetskort'].includes(p.id));

  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{ backgroundColor: 'var(--surface-base)' }}
    >
      {/* Background logo */}
      <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 0 }}>
        <img src={bonkiLogo} alt="" style={{ width: '130vw', maxWidth: '130vw', height: 'auto', objectFit: 'contain', opacity: 0.07, transform: 'translateY(8vh)' }} />
      </div>

      {/* Overlay logo */}
      <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 10 }}>
        <img src={bonkiLogo} alt="" style={{ width: '130vw', maxWidth: '130vw', height: 'auto', objectFit: 'contain', opacity: 0.045, transform: 'translateY(8vh)', filter: 'saturate(0)', maskImage: 'linear-gradient(to bottom, black 40%, transparent 90%)', WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 90%)' }} />
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Hero */}
        <motion.div
          className="pt-12 pb-1 px-6 text-center"
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
              opacity: 0.55,
              lineHeight: 1.5,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Samtalskort som öppnar dörrar
          </p>
        </motion.div>

        {/* ── Still Us ── */}
        <motion.div
          className="px-5 mt-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <SectionHeader title="Vuxna" delay={0.08} />
          <motion.div
            variants={tileVariants}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/')}
            className="cursor-pointer"
            style={{
              borderRadius: '18px',
              padding: '24px 20px',
              background: `linear-gradient(155deg, hsla(158, 35%, 18%, 0.92) 0%, hsla(158, 35%, 14%, 0.88) 100%)`,
              textAlign: 'center',
              boxShadow: `
                0 1px 2px 0 hsla(0, 0%, 0%, 0.06),
                0 4px 12px -2px hsla(0, 0%, 0%, 0.12),
                0 12px 32px -4px hsla(0, 0%, 0%, 0.14)
              `,
            }}
          >
            <h2
              className="font-serif"
              style={{
                fontSize: '24px',
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
                fontSize: '11px',
                color: 'var(--accent-saffron, hsla(38, 80%, 55%, 0.7))',
                marginTop: '4px',
                fontStyle: 'italic',
              }}
            >
              Djupa samtal för par som vill förstå varandra bättre
            </p>
          </motion.div>
        </motion.div>

        {/* ── Emotionella resan (trio) ── */}
        <div className="px-5 mt-8">
          <SectionHeader title="Emotionella resan" subtitle="Inifrån och ut — i tre steg" delay={0.12} />
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
          >
            {/* Jag i Mig — full width hero */}
            {trio.filter(p => p.id === 'jag_i_mig').map(p => (
              <PastelTile
                key={p.id}
                name={p.name}
                bg={PASTEL_COLORS[p.id]!}
                ageLabel={p.ageLabel}
                tagline={TAGLINES[p.id]}
                onClick={() => navigate(`/product/${p.slug}`)}
                aspectRatio="5 / 2"
              />
            ))}
            {/* Jag med Andra + Jag i Världen */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {trio.filter(p => p.id !== 'jag_i_mig').map(p => (
                <PastelTile
                  key={p.id}
                  name={p.name}
                  bg={PASTEL_COLORS[p.id]!}
                  ageLabel={p.ageLabel}
                  tagline={TAGLINES[p.id]}
                  onClick={() => navigate(`/product/${p.slug}`)}
                  aspectRatio="1 / 1"
                />
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Samtalskort ── */}
        <div className="px-5 mt-8">
          <SectionHeader title="Samtalskort" subtitle="Vardagsnära samtal för hela familjen" delay={0.20} />
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '10px',
              paddingBottom: '24px',
            }}
          >
            {extras.map(p => (
              <PastelTile
                key={p.id}
                name={p.name}
                bg={PASTEL_COLORS[p.id]!}
                ageLabel={p.ageLabel}
                tagline={TAGLINES[p.id]}
                onClick={() => navigate(`/product/${p.slug}`)}
                aspectRatio="3 / 4"
              />
            ))}
          </motion.div>
        </div>

        {/* Sign-off */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          style={{ textAlign: 'center', paddingBottom: '48px' }}
        >
          <p
            className="font-serif"
            style={{
              fontStyle: 'italic',
              fontSize: '13px',
              color: 'var(--accent-text)',
              opacity: 0.2,
            }}
          >
            Varje samtal räknas.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
