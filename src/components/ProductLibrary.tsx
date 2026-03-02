import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { allProducts } from '@/data/products';
import bonkiLogo from '@/assets/bonki-logo.png';

/** Still Us — forest green */
const STILL_US_COLOR = 'hsl(158, 35%, 18%)';
const STILL_US_TAGLINE = 'Djupa samtal för par som vill förstå varandra bättre';

/**
 * Pastel palette for child products – mapped by product id.
 * Warm, muted tones matching the reference mockup.
 */
const PASTEL_COLORS: Record<string, string> = {
  jag_i_mig: 'hsl(45, 30%, 90%)',        // warm cream
  jag_med_andra: 'hsl(260, 25%, 90%)',    // soft lavender
  jag_i_varlden: 'hsl(185, 30%, 89%)',    // ocean teal
  sexualitetskort: 'hsl(330, 25%, 90%)',  // blush pink
  vardagskort: 'hsl(140, 25%, 88%)',      // sage green
  syskonkort: 'hsl(200, 25%, 88%)',       // dusty blue
};

/* ── Stagger orchestration ── */
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.2 },
  },
};

const tileVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/** Section divider */
function SectionLabel({ label, delay = 0 }: { label: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.6 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        margin: '0 0 16px',
      }}
    >
      <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, hsla(30,8%,50%,0.2), transparent)' }} />
      <p
        className="font-sans"
        style={{
          fontSize: '10px',
          fontWeight: 600,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--color-text-tertiary)',
          opacity: 0.45,
          flexShrink: 0,
        }}
      >
        {label}
      </p>
      <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, hsla(30,8%,50%,0.2), transparent)' }} />
    </motion.div>
  );
}

/** Pastel child-product tile — pillow-style with breathing animation */
function PastelTile({ name, bg, ageLabel, onClick, aspectRatio = '4 / 3' }: { name: string; bg: string; ageLabel?: string; onClick?: () => void; aspectRatio?: string }) {
  const subtleDarker = bg.replace(/(\d+)%\)$/, (_, l) => `${Math.max(Number(l) - 3, 80)}%)`);
  const shadowColor = bg.replace(/hsl\(([^,]+),\s*([^,]+),\s*[^)]+\)/, 'hsla($1, $2, 45%, 0.18)');

  return (
    <motion.div
      variants={tileVariants}
      whileHover={{ scale: 1.04, y: -4 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className="cursor-pointer"
      style={{
        borderRadius: '24px',
        background: `linear-gradient(165deg, ${bg} 0%, ${subtleDarker} 100%)`,
        aspectRatio,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '16px',
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
            top: '10px',
            right: '12px',
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.04em',
            color: 'var(--text-primary)',
            opacity: 0.4,
            background: 'hsla(0, 0%, 100%, 0.55)',
            borderRadius: '10px',
            padding: '2px 8px',
          }}
        >
          {ageLabel}
        </span>
      )}
      <h3
        className="font-serif"
        style={{
          fontSize: '18px',
          fontWeight: 700,
          lineHeight: 1.25,
          color: 'var(--text-primary)',
          letterSpacing: '-0.01em',
          wordBreak: 'break-word',
          hyphens: 'auto',
        }}
      >
        {name}
      </h3>
    </motion.div>
  );
}

export default function ProductLibrary() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{ backgroundColor: 'var(--surface-base)' }}
    >
      {/* Background logo */}
      <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 0 }}>
        <img src={bonkiLogo} alt="" style={{ width: '130vw', maxWidth: '130vw', height: 'auto', objectFit: 'contain', opacity: 0.07, transform: 'translateY(8vh)' }} />
      </div>

      {/* Overlay logo — shines through tiles */}
      <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 10 }}>
        <img src={bonkiLogo} alt="" style={{ width: '130vw', maxWidth: '130vw', height: 'auto', objectFit: 'contain', opacity: 0.045, transform: 'translateY(8vh)', filter: 'saturate(0)', maskImage: 'linear-gradient(to bottom, black 40%, transparent 90%)', WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 90%)' }} />
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Hero */}
        <motion.div
          className="pt-14 pb-2 px-6 text-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1
            className="type-h1"
            style={{ color: 'var(--text-primary)', marginBottom: '6px' }}
          >
            Bonki
          </h1>
          <p
            className="font-serif"
            style={{
              fontSize: '15px',
              fontWeight: 400,
              color: 'var(--color-text-secondary)',
              opacity: 0.65,
              lineHeight: 1.55,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Samtalskort som öppnar dörrar
          </p>
        </motion.div>

        {/* ── Vuxna ── */}
        <motion.div
          className="px-5 mt-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <SectionLabel label="Vuxna" delay={0.08} />
          <motion.div
            variants={tileVariants}
            whileHover={{ scale: 1.03, y: -3 }}
            whileTap={{ scale: 0.975 }}
            onClick={() => navigate('/')}
            className="cursor-pointer"
            style={{
              borderRadius: '20px',
              padding: '32px 24px',
              background: `linear-gradient(155deg, hsla(158, 35%, 18%, 0.9) 0%, hsla(158, 35%, 15%, 0.85) 100%)`,
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
                fontSize: '28px',
                fontWeight: 700,
                color: 'hsla(0, 0%, 100%, 0.95)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              Still Us
            </h2>
          </motion.div>
        </motion.div>

        {/* ── Emotionella resan (trio) ── */}
        <div className="px-5 mt-10">
          <SectionLabel label="Emotionella resan" delay={0.14} />
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
          >
            {/* Jag i Mig — full width, the starting point */}
            {allProducts.filter(p => p.id === 'jag_i_mig').map(p => (
              <PastelTile
                key={p.id}
                name={p.name}
                bg={PASTEL_COLORS[p.id] ?? 'hsl(0, 0%, 92%)'}
                ageLabel={p.ageLabel}
                onClick={() => navigate(`/product/${p.slug}`)}
                aspectRatio="2 / 1"
              />
            ))}
            {/* Jag med Andra + Jag i Världen — side by side */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
              {allProducts.filter(p => p.id === 'jag_med_andra' || p.id === 'jag_i_varlden').map(p => (
                <PastelTile
                  key={p.id}
                  name={p.name}
                  bg={PASTEL_COLORS[p.id] ?? 'hsl(0, 0%, 92%)'}
                  ageLabel={p.ageLabel}
                  onClick={() => navigate(`/product/${p.slug}`)}
                />
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Övriga samtalskort ── */}
        <div className="px-5 mt-10">
          <SectionLabel label="Samtalskort" delay={0.22} />
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '14px',
              paddingBottom: '32px',
            }}
          >
            {allProducts.filter(p => ['vardagskort', 'syskonkort', 'sexualitetskort'].includes(p.id)).map(p => (
              <PastelTile
                key={p.id}
                name={p.name}
                bg={PASTEL_COLORS[p.id] ?? 'hsl(0, 0%, 92%)'}
                ageLabel={p.ageLabel}
                onClick={() => navigate(`/product/${p.slug}`)}
              />
            ))}
          </motion.div>
        </div>

        {/* Sign-off */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          style={{ textAlign: 'center', paddingBottom: '64px' }}
        >
          <p
            className="font-serif"
            style={{
              fontStyle: 'italic',
              fontSize: '14px',
              color: 'var(--accent-text)',
              opacity: 0.25,
            }}
          >
            Varje samtal räknas.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
