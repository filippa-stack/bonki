import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { ProductManifest } from '@/types/product';
import illustrationImage from '@/assets/illustration-sexualitet.png';

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

const ACCENT_COLOR = '#B5646E';

export default function SexualitetProductHome({ product }: { product: ProductManifest }) {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: 'var(--surface-base)' }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        style={{ position: 'absolute', top: '-10%', right: '-25%', width: '130%', height: '135%', zIndex: 0, pointerEvents: 'none' }}
      >
        <img src={illustrationImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'right top', opacity: 0.22 }} />
      </motion.div>

      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: '12vh', paddingRight: '10vw', paddingBottom: '48px', paddingLeft: '10vw' }}>
        <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3vh', width: '100%' }}>
          <motion.div variants={pillVariants} style={{ textAlign: 'center', marginBottom: '2vh', width: '100%' }}>
            <h1 style={{ fontFamily: "'DM Serif Display', var(--font-serif)", fontSize: 'clamp(34px, 9vw, 48px)', fontWeight: 700, color: ACCENT_COLOR, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
              Sexualitet
            </h1>
            <p className="font-serif" style={{ fontSize: 'clamp(16px, 4.5vw, 20px)', fontWeight: 400, color: '#2C2420', opacity: 0.8, marginTop: '8px', textShadow: '0px 1px 3px rgba(255,255,255,0.8)' }}>
              Närhet & respekt
            </p>
          </motion.div>

          {product.categories.map((cat) => (
            <motion.button
              key={cat.id}
              variants={pillVariants}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(`/category/${cat.id}`)}
              style={{
                background: 'var(--product-button-bg)',
                borderRadius: 'var(--product-button-radius)',
                padding: '0 24px',
                textAlign: 'center',
                cursor: 'pointer',
                border: 'none',
                boxShadow: 'var(--product-button-shadow)',
                whiteSpace: 'normal' as const,
                width: '80%',
                minHeight: '56px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1.3,
              }}
            >
              <span style={{ fontFamily: "'DM Serif Display', var(--font-serif)", fontSize: 'clamp(18px, 5vw, 24px)', fontWeight: 400, color: ACCENT_COLOR }}>
                {cat.title}
              </span>
            </motion.button>
          ))}

          {/* Diary link */}
          <motion.button
            variants={pillVariants}
            onClick={() => navigate(`/diary/${product.id}`)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              marginTop: '2vh',
              padding: '8px 16px',
            }}
          >
            <span
              className="font-serif"
              style={{
                fontSize: 'clamp(16px, 4.2vw, 19px)',
                color: ACCENT_COLOR,
                opacity: 0.75,
                textDecoration: 'underline',
                textUnderlineOffset: '3px',
              }}
            >
              Vår dagbok
            </span>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
