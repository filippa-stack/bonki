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
const PILL_BORDER = '2px solid hsla(55, 50%, 55%, 0.6)';

export default function JagIMigProductHome({ product }: { product: ProductManifest }) {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: 'var(--surface-base)' }}
    >
      {/* Background illustration — natural, warm, large face */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        style={{
          position: 'absolute',
          top: '7%',
          left: '-30%',
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
            opacity: 0.75,
          }}
        />
      </motion.div>

      {/* Content — centered in right portion */}
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
          paddingRight: '6vw',
          paddingBottom: '48px',
          paddingLeft: '26vw',
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
            gap: '7vh',
            width: '100%',
          }}
        >
          {/* Title pill — wide, full available width */}
          <motion.div
            variants={pillVariants}
            style={{
              background: 'hsla(45, 40%, 96%, 0.92)',
              backdropFilter: 'blur(12px)',
              border: PILL_BORDER,
              borderRadius: '16px',
              padding: '26px 0',
              textAlign: 'center',
              boxShadow: '0 2px 16px -2px hsla(45, 30%, 40%, 0.1)',
              marginBottom: '0.5vh',
              width: '100%',
            }}
          >
            <h1
              className="font-serif"
              style={{
                fontSize: 'clamp(32px, 9vw, 44px)',
                fontWeight: 700,
                color: FOREST_GREEN,
                letterSpacing: '-0.01em',
                whiteSpace: 'nowrap',
              }}
            >
              Jag i mig
            </h1>
          </motion.div>

          {/* Category pills — wide, centered */}
          {product.categories.map((cat) => (
            <motion.button
              key={cat.id}
              variants={pillVariants}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(`/category/${cat.id}`)}
              style={{
                background: 'hsla(45, 40%, 97%, 0.9)',
                backdropFilter: 'blur(12px)',
                border: PILL_BORDER,
                borderRadius: '28px',
                padding: '14px 24px',
                textAlign: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 10px -2px hsla(45, 30%, 40%, 0.08)',
                whiteSpace: 'nowrap' as const,
                width: '90%',
              }}
            >
              <span
                className="font-serif"
                style={{
                  fontSize: 'clamp(18px, 5vw, 24px)',
                  fontWeight: 600,
                  color: FOREST_GREEN,
                }}
              >
                {cat.title}
              </span>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
