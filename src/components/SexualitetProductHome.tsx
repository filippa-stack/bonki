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

const BG_COLOR = '#FCF2F9';
const ACCENT_PINK = '#FBB1B8';
const TEXT_COLOR = 'hsl(330, 35%, 22%)';
const PILL_BORDER = `2px solid ${ACCENT_PINK}`;

export default function SexualitetProductHome({ product }: { product: ProductManifest }) {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: BG_COLOR }}
    >
      {/* Illustration — bottom-right */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        style={{
          position: 'absolute',
          bottom: '-8%',
          right: '-10%',
          width: '70%',
          height: '60%',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        <img
          src={illustrationImage}
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'right bottom',
            opacity: 0.22,
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
              background: 'rgba(252, 242, 249, 0.88)',
              backdropFilter: 'blur(16px)',
              border: PILL_BORDER,
              borderRadius: '28px',
              padding: '26px 16px',
              textAlign: 'center',
              boxShadow: '0 2px 16px -2px hsla(330, 30%, 40%, 0.1)',
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
              Sexualitet
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
              Närhet & respekt
            </p>
          </motion.div>

          {/* Category pills */}
          {product.categories.map((cat, index) => {
            const widths = ['72%', '68%', '66%', '66%'];
            return (
              <motion.button
                key={cat.id}
                variants={pillVariants}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(`/category/${cat.id}`)}
                style={{
                  background: 'rgba(252, 242, 249, 0.88)',
                  backdropFilter: 'blur(16px)',
                  border: PILL_BORDER,
                  borderRadius: '28px',
                  padding: '16px 32px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px -4px hsla(330, 20%, 28%, 0.15), 0 1px 3px hsla(330, 20%, 28%, 0.1)',
                  whiteSpace: 'normal' as const,
                  width: widths[index] || '66%',
                  lineHeight: 1.3,
                }}
              >
                <span
                  className="font-serif"
                  style={{
                    fontSize: 'clamp(17px, 4.5vw, 22px)',
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
