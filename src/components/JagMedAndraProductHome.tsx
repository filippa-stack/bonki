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
          top: '4%',
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
              boxShadow: '0 2px 16px -2px hsla(280, 30%, 40%, 0.1)',
              marginBottom: '2vh',
              width: '100%',
            }}
          >
            <h1
              className="font-serif"
              style={{
                fontSize: 'clamp(28px, 7.5vw, 38px)',
                fontWeight: 700,
                color: '#000000',
                letterSpacing: '-0.01em',
                whiteSpace: 'normal',
              }}
            >
              Jag med andra
            </h1>
            <p
              className="font-serif"
              style={{
                fontSize: 'clamp(14px, 4vw, 18px)',
                fontWeight: 400,
                color: '#000000',
                opacity: 0.7,
                marginTop: '6px',
              }}
            >
              starkare tillsammans
            </p>
          </motion.div>

          {/* Category pills */}
          {product.categories.map((cat, index) => {
            const widths = ['74%', '70%', '67%', '64%'];
            const paddings = ['20px', '19px', '18px', '18px'];
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
                  padding: `${paddings[index] || '18px'} 24px`,
                  textAlign: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px -4px hsla(280, 20%, 28%, 0.15), 0 1px 3px hsla(280, 20%, 28%, 0.1)',
                  whiteSpace: 'nowrap' as const,
                  width: widths[index] || '64%',
                }}
              >
                <span
                  className="font-serif"
                  style={{
                    fontSize: 'clamp(18px, 5vw, 24px)',
                    fontWeight: 400,
                    color: '#000000',
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
