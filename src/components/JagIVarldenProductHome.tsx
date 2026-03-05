import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import type { ProductManifest } from '@/types/product';
import peacockImage from '@/assets/peacock-jag-i-varlden.png';

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

const ACCENT_COLOR = '#3D7A45';

export default function JagIVarldenProductHome({ product }: { product: ProductManifest }) {
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
        style={{ position: 'absolute', top: '-80%', right: '-40%', width: '140%', height: '130%', zIndex: 0, pointerEvents: 'none', opacity: 0.85 }}
      >
        <img src={peacockImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'right top', opacity: 0.28, transform: 'rotate(180deg)' }} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
        style={{ position: 'absolute', bottom: '-12%', left: '-40%', width: '140%', height: '130%', zIndex: 0, pointerEvents: 'none' }}
      >
        <img src={peacockImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'left bottom', opacity: 0.28 }} />
      </motion.div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: '12vh', paddingRight: '10vw', paddingBottom: '48px', paddingLeft: '10vw' }}>
        <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3vh', width: '100%' }}>
          <motion.div variants={pillVariants} style={{ textAlign: 'center', marginBottom: '2vh', width: '100%' }}>
            <h1 style={{ fontFamily: "'DM Serif Display', var(--font-serif)", fontSize: 'clamp(34px, 9vw, 48px)', fontWeight: 700, color: ACCENT_COLOR, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
              Jag i världen
            </h1>
            <p className="font-serif" style={{ fontSize: 'clamp(16px, 4.5vw, 20px)', fontWeight: 400, color: '#2C2420', opacity: 0.8, marginTop: '8px', textShadow: '0px 1px 6px rgba(255,255,255,0.9), 0px 0px 20px rgba(255,255,255,0.4)' }}>
              stärk identitet och mod
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
                background: 'hsla(0, 0%, 100%, 0.92)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
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

          {/* Sign-off line */}
          <motion.p
            variants={pillVariants}
            className="font-serif"
            style={{
              fontSize: 'clamp(14px, 3.8vw, 16px)',
              fontStyle: 'italic',
              color: ACCENT_COLOR,
              opacity: 0.65,
              textAlign: 'center',
              lineHeight: 1.5,
              marginTop: '1vh',
              maxWidth: '85%',
            }}
          >
            Välj det som känns rätt just nu.
          </motion.p>

          {/* Diary entrance */}
          <motion.button
            variants={pillVariants}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/diary/${product.id}`)}
            style={{
              background: 'rgba(255, 255, 255, 0.55)',
              border: 'none',
              cursor: 'pointer',
              marginTop: '2vh',
              padding: '16px 28px',
              borderRadius: '12px',
              boxShadow: '0px 2px 8px rgba(44, 36, 32, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              width: '70%',
            }}
          >
            <BookOpen size={18} style={{ color: ACCENT_COLOR, opacity: 0.7, flexShrink: 0 }} />
            <div style={{ textAlign: 'left' }}>
              <span
                style={{
                  fontFamily: "'DM Serif Display', var(--font-serif)",
                  fontSize: 'clamp(17px, 4.5vw, 20px)',
                  fontWeight: 400,
                  color: ACCENT_COLOR,
                  lineHeight: 1.3,
                }}
              >
                Vår dagbok
              </span>
              <p
                className="font-serif"
                style={{
                  fontSize: '12px',
                  color: '#8A8078',
                  opacity: 0.8,
                  marginTop: '2px',
                  fontStyle: 'italic',
                  lineHeight: 1.3,
                }}
              >
                Era tankar, samlade
              </p>
            </div>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
