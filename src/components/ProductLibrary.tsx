import { motion } from 'framer-motion';
import { allProducts } from '@/data/products';
import bonkiLogo from '@/assets/bonki-logo.png';

/** Still Us is the couple product — shown separately at top */
const STILL_US_COLOR = 'hsl(158, 35%, 18%)';
const STILL_US_MUTED = 'hsl(158, 18%, 90%)';

interface ProductTileProps {
  name: string;
  tagline: string;
  description: string;
  cardCount: number;
  categoryCount: number;
  accentColor: string;
  accentColorMuted: string;
  index: number;
}

function ProductTile({
  name,
  tagline,
  cardCount,
  categoryCount,
  accentColor,
  accentColorMuted,
  index,
}: ProductTileProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 + index * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="tile-door row-bloom cursor-pointer"
      style={{
        borderRadius: 'var(--radius-card, 18px)',
        padding: '28px 24px',
        background: 'var(--surface-raised)',
        border: 'var(--border-card, none)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Accent stripe — left edge */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: '16px',
          bottom: '16px',
          width: '3px',
          borderRadius: '0 2px 2px 0',
          backgroundColor: accentColor,
          opacity: 0.7,
        }}
      />

      {/* Subtle accent wash in top-right */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '120px',
          height: '120px',
          background: `radial-gradient(circle at 100% 0%, ${accentColorMuted} 0%, transparent 70%)`,
          opacity: 0.5,
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <h3
          className="font-serif"
          style={{
            fontSize: '20px',
            fontWeight: 600,
            lineHeight: 1.3,
            color: accentColor,
            marginBottom: '6px',
          }}
        >
          {name}
        </h3>

        <p
          className="font-serif"
          style={{
            fontSize: '14px',
            fontWeight: 400,
            color: 'var(--color-text-secondary)',
            lineHeight: 1.5,
            opacity: 0.85,
            marginBottom: '14px',
          }}
        >
          {tagline}
        </p>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span
            className="font-sans"
            style={{
              fontSize: '11px',
              fontWeight: 500,
              color: accentColor,
              opacity: 0.6,
              letterSpacing: '0.04em',
            }}
          >
            {categoryCount} kategorier
          </span>
          <span
            style={{
              width: '3px',
              height: '3px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-text-tertiary)',
              opacity: 0.3,
            }}
          />
          <span
            className="font-sans"
            style={{
              fontSize: '11px',
              fontWeight: 500,
              color: accentColor,
              opacity: 0.6,
              letterSpacing: '0.04em',
            }}
          >
            {cardCount} kort
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function ProductLibrary() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--surface-base)' }}
    >
      {/* Header with logo */}
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

      {/* Still Us — featured hero card */}
      <motion.div
        className="px-6 mt-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className="tile-door cursor-pointer"
          style={{
            borderRadius: 'var(--radius-card, 18px)',
            padding: '32px 24px',
            background: STILL_US_COLOR,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle radial glow */}
          <div
            style={{
              position: 'absolute',
              top: '-20%',
              right: '-10%',
              width: '200px',
              height: '200px',
              background: 'radial-gradient(circle, hsla(158, 40%, 30%, 0.3) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <p
              className="font-sans uppercase"
              style={{
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '0.14em',
                color: 'hsla(36, 60%, 82%, 0.5)',
                marginBottom: '8px',
              }}
            >
              Par & relationer
            </p>
            <h2
              className="font-serif"
              style={{
                fontSize: '24px',
                fontWeight: 600,
                color: 'hsl(36, 16%, 94%)',
                lineHeight: 1.25,
                marginBottom: '8px',
              }}
            >
              Still Us
            </h2>
            <p
              className="font-serif"
              style={{
                fontSize: '14px',
                fontWeight: 400,
                color: 'hsla(36, 16%, 92%, 0.7)',
                lineHeight: 1.5,
              }}
            >
              Djupa samtal för par som vill förstå varandra bättre
            </p>
          </div>
        </div>
      </motion.div>

      {/* Section divider */}
      <div className="px-6" style={{ marginTop: '40px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, var(--text-ghost), transparent)', opacity: 0.3 }} />
          <p
            className="font-sans"
            style={{
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--color-text-tertiary)',
              opacity: 0.55,
              flexShrink: 0,
            }}
          >
            Barn & Unga
          </p>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, var(--text-ghost), transparent)', opacity: 0.3 }} />
        </div>
      </div>

      {/* Product grid */}
      <div className="px-6 pb-16" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {allProducts.map((product, index) => (
          <ProductTile
            key={product.id}
            name={product.name}
            tagline={product.tagline}
            description={product.description}
            cardCount={product.cards.length}
            categoryCount={product.categories.length}
            accentColor={product.accentColor}
            accentColorMuted={product.accentColorMuted}
            index={index}
          />
        ))}
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
  );
}
