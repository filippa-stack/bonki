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

export default function JagIMigProductHome({ product }: { product: ProductManifest }) {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: 'var(--surface-base)' }}
    >
      {/* Background illustration — large, left-bleeding, faded */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        style={{
          position: 'absolute',
          top: '2%',
          left: '-20%',
          width: '110%',
          height: '96%',
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
            opacity: 0.45,
            filter: 'saturate(0.7)',
          }}
        />
      </motion.div>

      {/* Content — pills offset to the right */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          justifyContent: 'flex-start',
          paddingTop: '12vh',
          paddingRight: '8vw',
          paddingBottom: '48px',
          paddingLeft: '30vw',
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
            gap: '28px',
            width: '100%',
            maxWidth: '280px',
          }}
        >
          {/* Title pill — larger, more padding */}
          <motion.div
            variants={pillVariants}
            style={{
              background: 'hsla(45, 40%, 96%, 0.92)',
              backdropFilter: 'blur(12px)',
              border: '1.5px solid hsla(55, 45%, 62%, 0.5)',
              borderRadius: '18px',
              padding: '26px 44px',
              textAlign: 'center',
              boxShadow: '0 2px 16px -2px hsla(45, 30%, 40%, 0.1)',
              marginBottom: '12px',
            }}
          >
            <h1
              className="font-serif"
              style={{
                fontSize: '36px',
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: '-0.01em',
              }}
            >
              {product.name}
            </h1>
          </motion.div>

          {/* Category pills — generous spacing */}
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
                border: '1.5px solid hsla(55, 45%, 62%, 0.45)',
                borderRadius: '28px',
                padding: '15px 28px',
                textAlign: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 10px -2px hsla(45, 30%, 40%, 0.08)',
                width: '100%',
              }}
            >
              <span
                className="font-serif"
                style={{
                  fontSize: '19px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
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
