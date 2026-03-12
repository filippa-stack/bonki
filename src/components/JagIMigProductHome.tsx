import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Check } from 'lucide-react';
import BackToLibraryButton from '@/components/BackToLibraryButton';
import type { ProductManifest } from '@/types/product';
import apaImage from '@/assets/apa-jag-i-mig.png';

/* ── Palette ── */
const ACCENT = '#CDD625';
const ACCENT_DARK = '#8A9114';   // Olive Stem — high-contrast text
const FOREST = '#606C38';        // Forest Moss — grounding

/* ── Category color system ── */
const CATEGORY_COLORS: Record<string, {
  fill: string;
  fillHover: string;
  bar: string;
  text: string;
  subtitleColor: string;
  border: string;
  borderHover: string;
}> = {
  'jim-tryggheten-inuti': {
    fill: 'rgba(233, 237, 201, 0.45)',     // Soft Sage
    fillHover: 'rgba(233, 237, 201, 0.65)',
    bar: '#A8B060',
    text: '#606C38',
    subtitleColor: '#7A8245',
    border: 'rgba(160, 176, 96, 0.35)',
    borderHover: 'rgba(160, 176, 96, 0.7)',
  },
  'jim-kanslorna-jag-bar': {
    fill: 'rgba(254, 250, 224, 0.50)',     // Warm Glow
    fillHover: 'rgba(254, 250, 224, 0.70)',
    bar: '#CDD625',
    text: '#8A9114',
    subtitleColor: '#9A9B40',
    border: 'rgba(205, 214, 37, 0.30)',
    borderHover: 'rgba(205, 214, 37, 0.6)',
  },
  'jim-nar-det-gor-ont': {
    fill: 'rgba(242, 232, 207, 0.50)',     // Parchment
    fillHover: 'rgba(242, 232, 207, 0.70)',
    bar: '#C4A86C',
    text: '#7A6840',
    subtitleColor: '#9A8A60',
    border: 'rgba(196, 168, 108, 0.30)',
    borderHover: 'rgba(196, 168, 108, 0.6)',
  },
  'jim-jag-som-helhet': {
    fill: 'rgba(96, 108, 56, 0.20)',       // Forest Moss
    fillHover: 'rgba(96, 108, 56, 0.35)',
    bar: '#606C38',
    text: '#4A5228',
    subtitleColor: '#6A7A3A',
    border: 'rgba(96, 108, 56, 0.25)',
    borderHover: 'rgba(96, 108, 56, 0.55)',
  },
};

/* ── Motion ── */
const EASE = [0.4, 0.0, 0.2, 1] as const;

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.3 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.55, ease: [...EASE] },
  },
};

export default function JagIMigProductHome({ product }: { product: ProductManifest }) {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: 'var(--surface-base)' }}
    >
      <BackToLibraryButton color={ACCENT_DARK} />

      {/* Background illustration with gradient mask */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        style={{
          position: 'absolute',
          top: '-4%',
          left: '-25%',
          width: '150%',
          height: '115%',
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
            objectPosition: 'center top',
            opacity: 0.30,
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,1) 20%, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,1) 20%, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)',
          }}
        />
      </motion.div>

      {/* Content */}
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
          paddingRight: '24px',
          paddingBottom: '48px',
          paddingLeft: '24px',
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
            gap: '0',
            width: '100%',
          }}
        >
          {/* Hero */}
          <motion.div
            variants={itemVariants}
            style={{ textAlign: 'center', marginBottom: '4vh', width: '100%' }}
          >
            <h1
              style={{
                fontFamily: "'DM Serif Display', var(--font-serif)",
                fontSize: 'clamp(38px, 11vw, 52px)',
                fontWeight: 700,
                color: ACCENT_DARK,
                letterSpacing: '-0.01em',
                whiteSpace: 'nowrap',
              }}
            >
              Jag i mig
            </h1>
            <p
              className="font-serif"
              style={{
                fontSize: 'clamp(16px, 4.5vw, 20px)',
                fontWeight: 400,
                color: '#2C2420',
                opacity: 0.75,
                marginTop: '8px',
                textShadow: '0px 1px 6px rgba(255,255,255,0.9), 0px 0px 20px rgba(255,255,255,0.4)',
              }}
            >
              när känslor får ord
            </p>
          </motion.div>

          {/* Category tiles — frosted glassmorphism with spine */}
          <div style={{ width: '100%', position: 'relative', paddingLeft: '16px' }}>
            {/* Vertical spine */}
            <div
              style={{
                position: 'absolute',
                left: '5px',
                top: '14px',
                bottom: '14px',
                width: '1.5px',
                background: `linear-gradient(180deg, ${ACCENT_DARK}22 0%, ${ACCENT_DARK}08 100%)`,
                borderRadius: '1px',
              }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {product.categories.map((cat, i) => {
                const colors = CATEGORY_COLORS[cat.id] || CATEGORY_COLORS['jim-kanslorna-jag-bar'];

                return (
                  <motion.div
                    key={cat.id}
                    variants={itemVariants}
                    style={{ position: 'relative' }}
                  >
                    {/* Spine node */}
                    <div
                      style={{
                        position: 'absolute',
                        left: '-13.5px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '5px',
                        height: '5px',
                        borderRadius: '50%',
                        backgroundColor: colors.bar,
                        opacity: 0.4,
                        zIndex: 2,
                      }}
                    />

                    <motion.button
                      onClick={() => navigate(`/category/${cat.id}`)}
                      className="w-full text-left"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.985 }}
                      style={{
                        display: 'flex',
                        alignItems: 'stretch',
                        gap: '0',
                        padding: '0',
                        background: colors.fill,
                        backdropFilter: 'blur(14px)',
                        WebkitBackdropFilter: 'blur(14px)',
                        border: `1px solid ${colors.border}`,
                        cursor: 'pointer',
                        borderRadius: '14px',
                        transition: 'background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget;
                        el.style.background = colors.fillHover;
                        el.style.border = `1px solid ${colors.borderHover}`;
                        el.style.boxShadow = `0 0 20px -4px ${colors.bar}30`;
                      }}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget;
                        el.style.background = colors.fill;
                        el.style.border = `1px solid ${colors.border}`;
                        el.style.boxShadow = 'none';
                      }}
                    >
                      {/* Accent bar */}
                      <div
                        style={{
                          width: '4px',
                          alignSelf: 'stretch',
                          backgroundColor: colors.bar,
                          flexShrink: 0,
                          borderRadius: '14px 0 0 14px',
                        }}
                      />

                      {/* Content */}
                      <div style={{ flex: 1, padding: '16px 18px' }}>
                        <h3
                          style={{
                            fontFamily: "'DM Serif Display', var(--font-serif)",
                            fontSize: '19px',
                            fontWeight: 400,
                            lineHeight: 1.3,
                            color: colors.text,
                          }}
                        >
                          {cat.title}
                        </h3>
                        {cat.subtitle && (
                          <p
                            className="font-sans"
                            style={{
                              fontSize: '12px',
                              fontWeight: 400,
                              color: colors.subtitleColor,
                              lineHeight: 1.45,
                              marginTop: '3px',
                              opacity: 0.85,
                            }}
                          >
                            {cat.subtitle}
                          </p>
                        )}
                      </div>
                    </motion.button>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Sign-off */}
          <motion.p
            variants={itemVariants}
            className="font-serif"
            style={{
              fontSize: 'clamp(14px, 3.8vw, 16px)',
              fontStyle: 'italic',
              color: ACCENT_DARK,
              opacity: 0.55,
              textAlign: 'center',
              lineHeight: 1.5,
              marginTop: '4vh',
              maxWidth: '85%',
            }}
          >
            Välj det som känns rätt just nu.
          </motion.p>

          {/* Diary entrance */}
          <motion.button
            variants={itemVariants}
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
            <BookOpen size={18} style={{ color: ACCENT_DARK, opacity: 0.7, flexShrink: 0 }} />
            <div style={{ textAlign: 'left' }}>
              <span
                style={{
                  fontFamily: "'DM Serif Display', var(--font-serif)",
                  fontSize: 'clamp(17px, 4.5vw, 20px)',
                  fontWeight: 400,
                  color: ACCENT_DARK,
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
