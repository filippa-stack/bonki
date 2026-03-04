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
const PILL_BORDER = '2px solid #9825D6';

export default function JagMedAndraProductHome({ product }: { product: ProductManifest }) {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: '#FCF2F9' }}
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
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'left top',
            opacity: 0.35,
          }}
        />
      </motion.div>

      {/* Secondary illustration — nyckelpiga, bottom-right */}
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
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            opacity: 0.35,
            transform: 'rotate(-30deg)',
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
          {/* Title — plain heading */}
          <motion.div
            variants={pillVariants}
            style={{
              textAlign: 'center',
              marginBottom: '2vh',
              width: '100%',
            }}
          >
            <h1
              className="font-serif"
              style={{
                fontSize: 'clamp(28px, 7.5vw, 38px)',
                fontWeight: 700,
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
                color: '#2C2420',
                opacity: 0.7,
                marginTop: '8px',
              }}
            >
              starkare tillsammans
            </p>
          </motion.div>

          {/* Category buttons — filled, soft */}
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
                  background: 'rgba(255, 255, 255, 0.85)',
                  borderRadius: '12px',
                  padding: '14px 24px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  border: 'none',
                  boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.08)',
                  whiteSpace: 'normal' as const,
                  width: widths[index] || '64%',
                  lineHeight: 1.3,
                }}
              >
                <span
                  className="font-serif"
                  style={{
                    fontSize: 'clamp(18px, 5vw, 24px)',
                    fontWeight: 500,
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
