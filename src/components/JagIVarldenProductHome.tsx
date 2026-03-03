import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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

const ACCENT_GREEN = '#84C289';
const TEXT_COLOR = 'hsl(158, 35%, 18%)';
const PILL_BORDER = `2px solid ${ACCENT_GREEN}`;

export default function JagIVarldenProductHome({ product }: { product: ProductManifest }) {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: '#EEFFF3' }}
    >
      {/* Background illustration — peacock, zoomed in to fill screen */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        style={{
          position: 'absolute',
          top: '-80%',
          right: '-40%',
          width: '140%',
          height: '130%',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        <img
          src={peacockImage}
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'right top',
            opacity: 0.35,
            transform: 'rotate(180deg)',
          }}
        />
      </motion.div>

      {/* Second peacock — bottom-left, right-side up */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
        style={{
          position: 'absolute',
          bottom: '-12%',
          left: '-40%',
          width: '140%',
          height: '130%',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        <img
          src={peacockImage}
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'left bottom',
            opacity: 0.35,
          }}
        />
      </motion.div>

      {/* Content — centered */}
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
          {/* Title pill */}
          <motion.div
            variants={pillVariants}
            style={{
              background: 'rgba(238, 255, 243, 0.88)',
              backdropFilter: 'blur(16px)',
              border: PILL_BORDER,
              borderRadius: '28px',
              padding: '26px 16px',
              textAlign: 'center',
              boxShadow: '0 2px 16px -2px hsla(140, 30%, 40%, 0.1)',
              marginBottom: '2vh',
              width: '100%',
            }}
          >
            <h1
              className="font-serif"
              style={{
                fontSize: 'clamp(28px, 7.5vw, 38px)',
                fontWeight: 700,
                color: TEXT_COLOR,
                letterSpacing: '-0.01em',
                whiteSpace: 'nowrap',
              }}
            >
              Jag i världen
            </h1>
            <p
              className="font-serif"
              style={{
                fontSize: 'clamp(14px, 4vw, 18px)',
                fontWeight: 400,
                color: TEXT_COLOR,
                opacity: 0.7,
                marginTop: '6px',
              }}
            >
              stärk identitet och mod
            </p>
          </motion.div>

          {/* Category pills */}
          {product.categories.map((cat, index) => {
            const widths = ['74%', '70%', '67%', '64%', '61%'];
            const paddings = ['20px', '19px', '18px', '18px', '18px'];
            return (
              <motion.button
                key={cat.id}
                variants={pillVariants}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(`/category/${cat.id}`)}
                style={{
                  background: 'rgba(238, 255, 243, 0.88)',
                  backdropFilter: 'blur(16px)',
                  border: PILL_BORDER,
                  borderRadius: '28px',
                  padding: `${paddings[index] || '18px'} 28px`,
                  textAlign: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px -4px hsla(140, 20%, 28%, 0.15), 0 1px 3px hsla(140, 20%, 28%, 0.1)',
                  whiteSpace: 'normal' as const,
                  width: widths[index] || '61%',
                }}
              >
                <span
                  className="font-serif"
                  style={{
                    fontSize: 'clamp(18px, 5vw, 24px)',
                    fontWeight: 400,
                    color: TEXT_COLOR,
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
