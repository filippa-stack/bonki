import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { ProductManifest } from '@/types/product';
import slothImage from '@/assets/sloth-jag-med-andra.png';
import nyckelpiganImage from '@/assets/nyckelpiga-jag-med-andra.png';

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

const DEEP_PURPLE = '#9825D6';

export default function JagMedAndraProductHome({ product }: { product: ProductManifest }) {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: 'var(--surface-base)' }}
    >
      {/* Background illustration — sloth */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        style={{
          position: 'absolute',
          top: '-4%',
          left: '-40%',
          width: '160%',
          height: '130%',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        <img
          src={slothImage}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'left top', opacity: 0.35 }}
        />
      </motion.div>

      {/* Secondary illustration — nyckelpiga */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
        style={{
          position: 'absolute',
          bottom: '2%',
          right: '-25%',
          width: '55%',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        <img
          src={nyckelpiganImage}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: 0.35, transform: 'rotate(-30deg)' }}
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
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3.5vh', width: '100%' }}
        >
          {/* Title */}
          <motion.div
            variants={pillVariants}
            style={{ textAlign: 'center', marginBottom: '2vh', width: '100%' }}
          >
            <h1
              style={{
                fontFamily: "'DM Serif Display', var(--font-serif)",
                fontSize: 'clamp(28px, 7.5vw, 38px)',
                fontWeight: 400,
                color: DEEP_PURPLE,
                letterSpacing: '-0.01em',
                whiteSpace: 'normal',
              }}
            >
              Jag med andra
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
              starkare tillsammans
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
                  width: widths[index] || '64%',
                  lineHeight: 1.3,
                }}
              >
                <span
                  style={{
                    fontFamily: "'DM Serif Display', var(--font-serif)",
                    fontSize: 'clamp(18px, 5vw, 24px)',
                    fontWeight: 400,
                    color: DEEP_PURPLE,
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
