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

const PILL_STYLE = {
  background: 'hsla(45, 40%, 97%, 0.9)',
  backdropFilter: 'blur(12px)',
  border: PILL_BORDER,
  borderRadius: '28px',
  padding: '14px 24px',
  textAlign: 'center' as const,
  cursor: 'pointer',
  boxShadow: '0 2px 10px -2px hsla(45, 30%, 40%, 0.08)',
  whiteSpace: 'nowrap' as const,
  width: '100%',
};

export default function JagIMigProductHome({ product }: { product: ProductManifest }) {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: 'var(--surface-base)' }}
    >
      {/* Baboon illustration — positioned in the RIGHT third */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        style={{
          position: 'absolute',
          top: '0',
          right: '-20%',
          width: '90%',
          height: '100%',
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
            objectPosition: 'right top',
            opacity: 0.9,
          }}
        />
      </motion.div>

      {/* Button column — aligned just left of baboon's eye, right-of-center */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          paddingTop: '10vh',
          paddingLeft: '28vw',
          paddingRight: '30vw',
          paddingBottom: '48px',
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
            gap: '5vh',
            width: '100%',
            maxWidth: '220px',
          }}
        >
          {/* Title pill — "Jag i mig" */}
          <motion.div
            variants={pillVariants}
            style={{
              ...PILL_STYLE,
              borderRadius: '16px',
              padding: '22px 0',
              boxShadow: '0 2px 16px -2px hsla(45, 30%, 40%, 0.1)',
              marginBottom: '1vh',
              cursor: 'default',
            }}
          >
            <h1
              className="font-serif"
              style={{
                fontSize: 'clamp(28px, 8vw, 40px)',
                fontWeight: 700,
                color: FOREST_GREEN,
                letterSpacing: '-0.01em',
                whiteSpace: 'nowrap',
              }}
            >
              Jag i mig
            </h1>
          </motion.div>

          {/* Category pills */}
          {product.categories.map((cat) => (
            <motion.button
              key={cat.id}
              variants={pillVariants}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(`/category/${cat.id}`)}
              style={PILL_STYLE}
            >
              <span
                className="font-serif"
                style={{
                  fontSize: 'clamp(16px, 4.5vw, 22px)',
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
