import { motion } from 'framer-motion';
import { allProducts } from '@/data/products';
import bonkiLogo from '@/assets/bonki-logo.png';

/** Still Us constants */
const STILL_US_ID = 'still_us';
const STILL_US_COLOR = 'hsl(158, 35%, 18%)';
const STILL_US_COLOR_MUTED = 'hsl(158, 18%, 90%)';
const STILL_US_TAGLINE = 'Djupa samtal för par som vill förstå varandra bättre';

interface ProductTileProps {
  name: string;
  tagline: string;
  accentColor: string;
  index: number;
}

function ProductTile({ name, tagline, accentColor, index }: ProductTileProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="tile-door cursor-pointer"
      style={{
        borderRadius: '14px',
        padding: '22px 20px',
        backgroundColor: accentColor,
        opacity: 0.88,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle inner glow */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, hsla(0,0%,100%,0.08) 0%, transparent 50%, hsla(0,0%,0%,0.06) 100%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <h3
          className="font-serif"
          style={{
            fontSize: '18px',
            fontWeight: 600,
            lineHeight: 1.3,
            color: 'hsla(0, 0%, 100%, 0.95)',
            marginBottom: '4px',
          }}
        >
          {name}
        </h3>
        <p
          className="font-serif"
          style={{
            fontSize: '12.5px',
            fontWeight: 400,
            color: 'hsla(0, 0%, 100%, 0.6)',
            lineHeight: 1.45,
          }}
        >
          {tagline}
        </p>
      </div>
    </motion.div>
  );
}

/** Section header with flanking lines */
function SectionLabel({ label, delay = 0 }: { label: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.5 }}
      style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '0 0 12px' }}
    >
      <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, var(--text-ghost), transparent)', opacity: 0.25 }} />
      <p
        className="font-sans"
        style={{
          fontSize: '10px',
          fontWeight: 600,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--color-text-tertiary)',
          opacity: 0.5,
          flexShrink: 0,
        }}
      >
        {label}
      </p>
      <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, var(--text-ghost), transparent)', opacity: 0.25 }} />
    </motion.div>
  );
}

export default function ProductLibrary() {
  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{ backgroundColor: 'var(--surface-base)' }}
    >
      {/* Full-screen background logo */}
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
            width: '85vw',
            maxWidth: '500px',
            height: 'auto',
            objectFit: 'contain',
            opacity: 0.045,
          }}
        />
      </div>

      {/* Content over logo */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <motion.div
          className="pt-14 pb-2 px-6 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <img
            src={bonkiLogo}
            alt="Bonki"
            className="mx-auto mb-4"
            style={{ width: '48px', height: '48px', objectFit: 'contain', opacity: 0.85 }}
          />
          <h1
            className="type-h1"
            style={{ color: 'var(--text-primary)', marginBottom: '8px' }}
          >
            Bonki
          </h1>
          <p
            className="font-serif"
            style={{
              fontSize: '15px',
              fontWeight: 400,
              color: 'var(--color-text-secondary)',
              opacity: 0.75,
              lineHeight: 1.55,
            }}
          >
            Samtalskort som öppnar dörrar
          </p>
        </motion.div>

        {/* Vuxna section */}
        <div className="px-6 mt-10">
          <SectionLabel label="Vuxna" delay={0.1} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <ProductTile
              name="Still Us"
              tagline={STILL_US_TAGLINE}
              accentColor={STILL_US_COLOR}
              index={0}
            />
          </div>
        </div>

        {/* Barn & Unga section */}
        <div className="px-6 mt-8">
          <SectionLabel label="Barn & Unga" delay={0.15} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '32px' }}>
            {allProducts.map((product, index) => (
              <ProductTile
                key={product.id}
                name={product.name}
                tagline={product.tagline}
                accentColor={product.accentColor}
                index={index + 1}
              />
            ))}
          </div>
        </div>

        {/* Editorial signoff */}
        <div style={{ textAlign: 'center', paddingBottom: '64px' }}>
          <p
            className="font-serif"
            style={{
              fontStyle: 'italic',
              fontSize: '14px',
              color: 'var(--accent-text)',
              opacity: 0.30,
            }}
          >
            Varje samtal räknas.
          </p>
        </div>
      </div>
    </div>
  );
}
