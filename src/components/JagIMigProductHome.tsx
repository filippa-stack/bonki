import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { ProductManifest } from '@/types/product';
import apaImage from '@/assets/apa-jag-i-mig.png';

const EASE = [0.4, 0.0, 0.2, 1] as const;

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.35 } },
};

const pillVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.55, ease: EASE },
  },
};

const FOREST_GREEN = 'hsl(158, 35%, 18%)';

export default function JagIMigProductHome({ product }: { product: ProductManifest }) {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: 'var(--surface-base)' }}
    >
      {/* Background illustration */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        style={{
          position: 'absolute',
          top: '7%',
          left: '-42%',
          width: '135%',
          height: '125%',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        <img
          src={apaImage}
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'left top',
            opacity: 0.35,
          }}
        />
      </motion.div>

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingTop: '12vh',
          paddingRight: '16vw',
          paddingBottom: '48px',
          paddingLeft: '16vw',
        }}
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3.5vh',
            width: '100%',
          }}
        >
          {/* Title */}
          <motion.div
            variants={pillVariants}
            style={{ textAlign: 'center', marginBottom: '2vh', width: '100%' }}
          >
            <h1
              style={{
                fontFamily: "'DM Serif Display', var(--font-serif)",
                fontSize: 'clamp(36px, 10vw, 48px)',
                fontWeight: 400,
                color: FOREST_GREEN,
                letterSpacing: '-0.01em',
                whiteSpace: 'nowrap',
              }}
            >
              Jag i mig
            </h1>
            <p
              className="font-serif"
              style={{
                fontSize: 'clamp(15px, 4.2vw, 19px)',
                fontWeight: 400,
                color: 'var(--product-subtitle-color)',
                marginTop: '8px',
              }}
            >
              när känslor får ord
            </p>
          </motion.div>

          {/* Category buttons */}
          {product.categories.map((cat, index) => {
            const widths = ['74%', '70%', '67%', '64%'];
            return (
              <motion.button
                key={cat.id}
                variants={pillVariants}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(`/category/${cat.id}`)}
                style={{
                  background: 'var(--product-button-bg)',
                  borderRadius: 'var(--product-button-radius)',
                  padding: '14px 24px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  border: 'none',
                  boxShadow: 'var(--product-button-shadow)',
                  whiteSpace: 'normal' as const,
                  width: widths[index] || '60%',
                  lineHeight: 1.3,
                }}
              >
                <span
                  style={{
                    fontFamily: "'DM Serif Display', var(--font-serif)",
                    fontSize: 'clamp(18px, 5vw, 24px)',
                    fontWeight: 400,
                    color: FOREST_GREEN,
                  }}
                >
                  {cat.title}
                </span>
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
