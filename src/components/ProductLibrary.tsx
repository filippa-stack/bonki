import { motion } from 'framer-motion';
import { allProducts } from '@/data/products';
import bonkiLogo from '@/assets/bonki-logo.png';

/** Still Us — forest green, the app's primary color */
const STILL_US_COLOR = 'hsl(158, 35%, 18%)';
const STILL_US_TAGLINE = 'Djupa samtal för par som vill förstå varandra bättre';

/* ── Helpers ── */

const childProducts = allProducts; // all current products are Barn & Unga

interface TileProps {
  name: string;
  tagline: string;
  color: string;
  index: number;
  large?: boolean;
}

function Tile({ name, tagline, color, index, large }: TileProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 + index * 0.055, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="cursor-pointer group"
      style={{
        borderRadius: '16px',
        padding: large ? '28px 24px' : '20px 18px',
        backgroundColor: color,
        opacity: 0.72,
        position: 'relative',
        overflow: 'hidden',
        minHeight: large ? '110px' : undefined,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
    >
      {/* Glass sheen */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(160deg, hsla(0,0%,100%,0.14) 0%, hsla(0,0%,100%,0.04) 40%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <h3
          className="font-serif"
          style={{
            fontSize: large ? '22px' : '17px',
            fontWeight: 600,
            lineHeight: 1.25,
            color: 'hsla(0, 0%, 100%, 0.95)',
            marginBottom: '3px',
          }}
        >
          {name}
        </h3>
        <p
          className="font-serif"
          style={{
            fontSize: large ? '13px' : '12px',
            fontWeight: 400,
            color: 'hsla(0, 0%, 100%, 0.55)',
            lineHeight: 1.45,
          }}
        >
          {tagline}
        </p>
      </div>
    </motion.div>
  );
}

/** Section divider with label */
function SectionLabel({ label, delay = 0 }: { label: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.5 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        margin: '0 0 14px',
      }}
    >
      <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, hsla(30,8%,50%,0.18), transparent)' }} />
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
      <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, hsla(30,8%,50%,0.18), transparent)' }} />
    </motion.div>
  );
}

export default function ProductLibrary() {
  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{ backgroundColor: 'var(--surface-base)' }}
    >
      {/* Full-screen centred background logo */}
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
            width: '100vw',
            maxWidth: '100vw',
            height: 'auto',
            objectFit: 'contain',
            opacity: 0.04,
          }}
        />
      </div>

      {/* Content layer */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Hero */}
        <motion.div
          className="pt-14 pb-2 px-6 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
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
              opacity: 0.7,
              lineHeight: 1.55,
            }}
          >
            Samtalskort som öppnar dörrar
          </p>
        </motion.div>

        {/* ── Vuxna ── */}
        <div className="px-6 mt-10">
          <SectionLabel label="Vuxna" delay={0.08} />
          <Tile
            name="Still Us"
            tagline={STILL_US_TAGLINE}
            color={STILL_US_COLOR}
            index={0}
            large
          />
        </div>

        {/* ── Barn & Unga — 2-column grid ── */}
        <div className="px-6 mt-10">
          <SectionLabel label="Barn & Unga" delay={0.14} />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '10px',
              paddingBottom: '32px',
            }}
          >
            {childProducts.map((p, i) => (
              <Tile
                key={p.id}
                name={p.name}
                tagline={p.tagline}
                color={p.accentColor}
                index={i + 1}
              />
            ))}
          </div>
        </div>

        {/* Editorial sign-off */}
        <div style={{ textAlign: 'center', paddingBottom: '64px' }}>
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
        </div>
      </div>
    </div>
  );
}
