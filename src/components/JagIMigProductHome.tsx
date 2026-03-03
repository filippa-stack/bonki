import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { ProductManifest } from '@/types/product';
import apaImage from '@/assets/apa-jag-i-mig.png';

const EMOTION = 0.32;
const EASE = [0.4, 0.0, 0.2, 1] as const;

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } },
};

const pillVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.95 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.5, ease: EASE },
  },
};

export default function JagIMigProductHome({ product }: { product: ProductManifest }) {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: 'var(--surface-base)' }}
    >
      {/* Background illustration — left-aligned, full height */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
        }}
      >
        <img
          src={apaImage}
          alt=""
          style={{
            height: '88vh',
            width: 'auto',
            objectFit: 'contain',
            objectPosition: 'left center',
            transform: 'translateX(-8%)',
            opacity: 0.85,
          }}
        />
      </motion.div>

      {/* Content overlay */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 24px 48px',
          gap: '20px',
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
            gap: '18px',
            width: '100%',
            maxWidth: '320px',
          }}
        >
          {/* Title pill */}
          <motion.div
            variants={pillVariants}
            style={{
              background: 'hsla(45, 40%, 96%, 0.92)',
              backdropFilter: 'blur(12px)',
              border: '1.5px solid hsla(55, 45%, 62%, 0.5)',
              borderRadius: '18px',
              padding: '20px 36px',
              textAlign: 'center',
              boxShadow: '0 2px 12px -2px hsla(45, 30%, 40%, 0.1)',
            }}
          >
            <h1
              className="font-serif"
              style={{
                fontSize: '32px',
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: '-0.01em',
              }}
            >
              {product.name}
            </h1>
          </motion.div>

          {/* Category pills */}
          {product.categories.map((cat) => (
            <motion.button
              key={cat.id}
              variants={pillVariants}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(`/category/${cat.id}`)}
              style={{
                background: 'hsla(45, 40%, 97%, 0.9)',
                backdropFilter: 'blur(12px)',
                border: '1.5px solid hsla(55, 45%, 62%, 0.45)',
                borderRadius: '28px',
                padding: '14px 32px',
                textAlign: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 10px -2px hsla(45, 30%, 40%, 0.08)',
                width: 'auto',
                minWidth: '200px',
              }}
            >
              <span
                className="font-serif"
                style={{
                  fontSize: '20px',
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
