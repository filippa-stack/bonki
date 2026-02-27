import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { allProducts } from '@/data/products';
import bonkiLogo from '@/assets/bonki-logo.png';

/** Still Us — forest green */
const STILL_US_COLOR = 'hsl(158, 35%, 18%)';
const STILL_US_TAGLINE = 'Djupa samtal för par som vill förstå varandra bättre';

const childProducts = allProducts;

/* ── Stagger orchestration ── */
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.25 },
  },
};

const tileVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/* ── Tile ── */
interface TileProps {
  name: string;
  tagline: string;
  color: string;
  large?: boolean;
  onClick?: () => void;
}

/** Convert 'hsl(h, s%, l%)' to 'hsla(h, s%, l%, a)' */
function withAlpha(hsl: string, alpha: number): string {
  return hsl.replace('hsl(', 'hsla(').replace(')', `, ${alpha})`);
}

function Tile({ name, tagline, color, large, onClick }: TileProps) {
  return (
    <motion.div
      variants={tileVariants}
      whileHover={{ scale: 1.04, y: -4 }}
      whileTap={{ scale: 0.975 }}
      onClick={onClick}
      className="cursor-pointer"
      style={{
        borderRadius: '20px',
        padding: large ? '28px 24px' : '20px 18px',
        background: `linear-gradient(155deg, ${withAlpha(color, 0.85)} 0%, ${withAlpha(color, 0.75)} 100%)`,
        backdropFilter: 'blur(1px)',
        WebkitBackdropFilter: 'blur(1px)',
        position: 'relative',
        overflow: 'hidden',
        minHeight: large ? '130px' : '120px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        boxShadow: `
          0 1px 2px 0 hsla(0, 0%, 0%, 0.06),
          0 4px 12px -2px hsla(0, 0%, 0%, 0.12),
          0 12px 32px -4px hsla(0, 0%, 0%, 0.14),
          0 28px 72px -8px hsla(0, 0%, 0%, 0.10)
        `,
        transition: 'box-shadow 0.4s ease',
      }}
    >
      {/* Glass highlight sweep */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(145deg, hsla(0,0%,100%,0.22) 0%, hsla(0,0%,100%,0.08) 30%, transparent 55%, hsla(0,0%,0%,0.06) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Soft inner border */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '20px',
          border: '1px solid hsla(0, 0%, 100%, 0.18)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <h3
          className="font-serif"
          style={{
            fontSize: large ? '26px' : '19px',
            fontWeight: 700,
            lineHeight: 1.2,
            color: 'hsla(0, 0%, 100%, 0.95)',
            marginBottom: '6px',
            letterSpacing: '-0.01em',
          }}
        >
          {name}
        </h3>
        <p
          className="font-serif"
          style={{
            fontSize: large ? '13px' : '11.5px',
            fontWeight: 400,
            color: 'hsla(0, 0%, 100%, 0.65)',
            lineHeight: 1.5,
            maxWidth: '20ch',
            margin: '0 auto',
          }}
        >
          {tagline}
        </p>
      </div>
    </motion.div>
  );
}

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
          <Tile
            name="Still Us"
            tagline={STILL_US_TAGLINE}
            color={STILL_US_COLOR}
            large
            onClick={() => navigate('/')}
          />
        </motion.div>

        {/* ── Barn & Unga ── */}
        <div className="px-5 mt-10">
          <SectionLabel label="Barn & Unga" delay={0.14} />
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
              paddingBottom: '32px',
            }}
          >
            {childProducts.map((p) => (
              <Tile
                key={p.id}
                name={p.name}
                tagline={p.tagline}
                color={p.accentColor}
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
