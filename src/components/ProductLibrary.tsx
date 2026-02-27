import { motion } from 'framer-motion';
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
    transition: { staggerChildren: 0.07, delayChildren: 0.2 },
  },
};

const tileVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/* ── Tile ── */
interface TileProps {
  name: string;
  tagline: string;
  color: string;
  large?: boolean;
}

function Tile({ name, tagline, color, large }: TileProps) {
  return (
    <motion.div
      variants={tileVariants}
      whileHover={{ scale: 1.025, y: -2 }}
      whileTap={{ scale: 0.985 }}
      className="cursor-pointer"
      style={{
        borderRadius: '18px',
        padding: large ? '30px 26px' : '22px 20px',
        background: `linear-gradient(155deg, ${color} 0%, ${color} 100%)`,
        opacity: 0.6,
        position: 'relative',
        overflow: 'hidden',
        minHeight: large ? '120px' : '105px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        boxShadow: `
          0 2px 8px -2px hsla(0, 0%, 0%, 0.12),
          0 8px 24px -4px hsla(0, 0%, 0%, 0.10),
          0 20px 48px -8px hsla(0, 0%, 0%, 0.08)
        `,
      }}
    >
      {/* Glass highlight sweep */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(145deg, hsla(0,0%,100%,0.18) 0%, hsla(0,0%,100%,0.06) 35%, transparent 60%, hsla(0,0%,0%,0.04) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Soft inner border */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '18px',
          border: '1px solid hsla(0, 0%, 100%, 0.12)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <h3
          className="font-serif"
          style={{
            fontSize: large ? '24px' : '18px',
            fontWeight: 600,
            lineHeight: 1.2,
            color: 'hsla(0, 0%, 100%, 0.95)',
            marginBottom: '5px',
          }}
        >
          {name}
        </h3>
        <p
          className="font-serif"
          style={{
            fontSize: large ? '13.5px' : '12px',
            fontWeight: 400,
            color: 'hsla(0, 0%, 100%, 0.55)',
            lineHeight: 1.5,
            maxWidth: '22ch',
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
        margin: '0 0 14px',
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
  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{ backgroundColor: 'var(--surface-base)' }}
    >
      {/* Full-screen background logo — strong enough to see through tiles */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        <img
          src={bonkiLogo}
          alt=""
          style={{
            width: '110vw',
            maxWidth: '110vw',
            height: 'auto',
            objectFit: 'contain',
            opacity: 0.07,
          }}
        />
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
              gap: '10px',
              paddingBottom: '32px',
            }}
          >
            {childProducts.map((p) => (
              <Tile
                key={p.id}
                name={p.name}
                tagline={p.tagline}
                color={p.accentColor}
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
