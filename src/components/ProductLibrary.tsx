import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, MessageCircle } from 'lucide-react';
import { allProducts } from '@/data/products';
import { useAllProductAccess } from '@/hooks/useAllProductAccess';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import LibraryResumeBanner from '@/components/LibraryResumeBanner';
import { productTileColors } from '@/lib/palette';

import illustrationStillUs from '@/assets/illustration-still-us-tile.png';
import illustrationJagIMig from '@/assets/mirror-jag-i-mig.png';
import illustrationJagMedAndra from '@/assets/annorlunda-jag-med-andra.png';
import illustrationJagIVarlden from '@/assets/aktivism-jag-i-varlden.png';
import illustrationSexualitet from '@/assets/illustration-sexualitet.png';
import illustrationSyskon from '@/assets/illustration-syskon.png';
import illustrationVardag from '@/assets/illustration-vardag.png';
import illustrationStillFair from '@/assets/illustration-still-fair.png';

const ILLUSTRATIONS: Record<string, string> = {
  jag_i_mig: illustrationJagIMig,
  jag_med_andra: illustrationJagMedAndra,
  jag_i_varlden: illustrationJagIVarlden,
  sexualitetskort: illustrationSexualitet,
  syskonkort: illustrationSyskon,
  vardagskort: illustrationVardag,
};

const TAGLINES: Record<string, string> = {
  jag_i_mig: 'När känslor får ord',
  jag_med_andra: 'Det svåra och det trygga',
  jag_i_varlden: 'De stora frågorna',
  vardagskort: 'Det vanliga, på djupet',
  syskonkort: 'Band för livet',
  sexualitetskort: 'Kropp, gränser och identitet',
};

/** hex → rgba */
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Detect return visit for faster animations */
const IS_RETURN_VISIT = (() => {
  try {
    const key = 'bonki_library_visited';
    const visited = sessionStorage.getItem(key);
    sessionStorage.setItem(key, '1');
    return !!visited;
  } catch { return false; }
})();

const ANIM_SPEED = IS_RETURN_VISIT ? 0.5 : 1;

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 * ANIM_SPEED, delayChildren: 0.25 * ANIM_SPEED },
  },
};

const tileVariants = {
  hidden: { opacity: 0, y: 20 * ANIM_SPEED, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55 * ANIM_SPEED, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/* ── Kids product tile ── */
function KidsTile({
  name, productId, tagline, ageLabel, illustration, onClick, hasActiveSession,
}: {
  name: string; productId: string; tagline?: string; ageLabel?: string;
  illustration?: string; onClick?: () => void; hasActiveSession?: boolean;
}) {
  const colors = productTileColors[productId];
  if (!colors) return null;
  const { tileDeep, tileMid, tileLight } = colors;

  return (
    <motion.div
      variants={tileVariants}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="cursor-pointer"
      style={{
        position: 'relative',
        borderRadius: '16px',
        overflow: 'hidden',
        minHeight: '148px',
        background: `linear-gradient(135deg, ${tileDeep} 0%, ${tileMid}cc 100%)`,
        transition: 'transform 180ms ease',
      }}
    >
      {/* Illustration — right 55% */}
      {illustration && (
        <div
          style={{
            position: 'absolute',
            top: 0, right: 0, bottom: 0,
            width: '55%',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        >
          <img
            src={illustration}
            alt=""
            draggable={false}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
            }}
          />
          {/* Left-to-right gradient overlay on illustration */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(to right, ${hexToRgba(tileDeep, 1)} 0%, ${hexToRgba(tileDeep, 0)} 60%)`,
            }}
          />
        </div>
      )}

      {/* Age badge — top-right */}
      {ageLabel && (
        <span
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            zIndex: 3,
            background: 'rgba(0,0,0,0.35)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            borderRadius: '20px',
            padding: '3px 10px',
            fontFamily: "'Lato', sans-serif",
            fontSize: '12px',
            fontWeight: 600,
            color: '#FDF6E3',
          }}
        >
          {ageLabel}
        </span>
      )}

      {/* Resume indicator */}
      {hasActiveSession && (
        <div
          style={{
            position: 'absolute',
            top: ageLabel ? '46px' : '14px',
            right: '14px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3px',
            zIndex: 4,
          }}
        >
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            backgroundColor: '#D4A03A',
            boxShadow: '0 0 6px rgba(212, 160, 58, 0.5)',
          }} />
          <span style={{
            fontFamily: "'Lato', sans-serif",
            fontSize: '11px', fontWeight: 500,
            color: '#FDF6E3', opacity: 0.7,
          }}>Fortsätt</span>
        </div>
      )}

      {/* Text — bottom-left, justify-end */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        minHeight: '148px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '20px',
        maxWidth: '55%',
      }}>
        <h3 style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: '26px',
          fontWeight: 600,
          lineHeight: 1.15,
          color: '#FDF6E3',
          textShadow: '0px 2px 12px rgba(0,0,0,0.5)',
        }}>
          {name}
        </h3>
        {tagline && (
          <p style={{
            fontFamily: "'Lato', sans-serif",
            fontSize: '14px',
            fontWeight: 400,
            color: 'rgba(253, 246, 227, 0.75)',
            marginTop: '4px',
            lineHeight: 1.4,
            maxWidth: '110%', /* allow subtitle slightly wider */
            textShadow: '0px 1px 6px rgba(0,0,0,0.4)',
          }}>
            {tagline}
          </p>
        )}
      </div>

      {/* Bottom accent — 2px gradient */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          height: '2px',
          background: `linear-gradient(90deg, ${tileLight}66, transparent)`,
          zIndex: 3,
        }}
      />
    </motion.div>
  );
}

/* ── Still Us tile (PAR view) ── */
function StillUsTile({ onClick }: { onClick?: () => void }) {
  return (
    <motion.div
      variants={tileVariants}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="cursor-pointer"
      style={{
        position: 'relative',
        borderRadius: '16px',
        overflow: 'hidden',
        minHeight: '170px',
        background: 'linear-gradient(145deg, #2E2233 0%, #473454 50%, #2E2233 100%)',
        transition: 'transform 180ms ease',
      }}
    >
      {/* Illustration — right 45% */}
      <div
        style={{
          position: 'absolute',
          top: 0, right: 0, bottom: 0,
          width: '45%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        <img
          src={illustrationStillUs}
          alt=""
          draggable={false}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            opacity: 0.85,
          }}
        />
        {/* Gradient overlay */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(to right, rgba(46, 34, 51, 1) 0%, rgba(46, 34, 51, 0) 60%)`,
          }}
        />
      </div>

      {/* Text — bottom-left */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        minHeight: '170px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '20px',
        maxWidth: '55%',
      }}>
        {/* Deep Saffron accent bar */}
        <div style={{
          width: '28px',
          height: '3px',
          borderRadius: '2px',
          background: '#D4A03A',
          opacity: 0.7,
          marginBottom: '10px',
        }} />
        <h3 style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: '28px',
          fontWeight: 600,
          lineHeight: 1.15,
          color: '#FDF6E3',
          textShadow: '0px 2px 12px rgba(0,0,0,0.5)',
        }}>
          Still Us
        </h3>
        <p style={{
          fontFamily: "'Lato', sans-serif",
          fontSize: '14px',
          fontWeight: 400,
          color: 'rgba(212, 160, 58, 0.8)',
          marginTop: '4px',
          lineHeight: 1.4,
          textShadow: '0px 1px 6px rgba(0,0,0,0.4)',
        }}>
          22 samtal för er relation
        </p>
      </div>

      {/* Bottom accent — Deep Saffron */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, #D4A03A44, transparent)',
          zIndex: 3,
        }}
      />
    </motion.div>
  );
}

/* ── Coming soon tile ── */
function ComingSoonTile({ name, illustration }: { name: string; illustration?: string }) {
  return (
    <motion.div
      variants={tileVariants}
      style={{
        borderRadius: '14px',
        border: '1px dashed rgba(107, 94, 82, 0.2)',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: '60px',
      }}
    >
      <span style={{
        fontFamily: "'DM Serif Display', serif",
        fontSize: '17px',
        fontWeight: 600,
        color: 'rgba(107, 94, 82, 0.5)',
      }}>
        {name}
      </span>
      <span style={{
        fontFamily: "'Lato', sans-serif",
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '1px',
        color: 'rgba(107, 94, 82, 0.35)',
        textTransform: 'uppercase',
      }}>
        KOMMER SNART
      </span>
    </motion.div>
  );
}

/* ── Era samtal card ── */
function EraSamtalCard({ onClick }: { onClick?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 * ANIM_SPEED, duration: 0.7 * ANIM_SPEED, ease: [0.22, 1, 0.36, 1] }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="cursor-pointer"
      style={{
        borderRadius: '12px',
        background: '#2A2D3A',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        transition: 'transform 180ms ease',
      }}
    >
      {/* Icon container */}
      <div style={{
        width: '36px',
        height: '36px',
        borderRadius: '10px',
        background: '#1A1A2E',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <MessageCircle size={16} color="#6B5E52" />
      </div>
      {/* Text */}
      <div style={{ flex: 1 }}>
        <p style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: '15px',
          fontWeight: 600,
          color: '#FDF6E3',
          lineHeight: 1.3,
        }}>
          Era samtal
        </p>
        <p style={{
          fontFamily: "'Lato', sans-serif",
          fontSize: '12px',
          color: '#6B5E52',
          marginTop: '2px',
        }}>
          Varje samtal sparas
        </p>
      </div>
      {/* Chevron */}
      <ChevronRight size={16} color="#6B5E52" />
    </motion.div>
  );
}

export default function ProductLibrary() {
  const navigate = useNavigate();
  const tracked = useRef(false);
  const { purchased } = useAllProductAccess();
  const { user } = useAuth();
  const TAB_KEY = 'bonki-library-tab';
  const [activeTab, setActiveTab] = useState<'barn' | 'par'>(() => {
    const initial = localStorage.getItem('bonki-initial-tab');
    if (initial === 'par' || initial === 'barn') {
      localStorage.removeItem('bonki-initial-tab');
      localStorage.setItem(TAB_KEY, initial);
      return initial;
    }
    const saved = localStorage.getItem(TAB_KEY);
    if (saved === 'par' || saved === 'barn') return saved;
    return 'barn';
  });
  const [swipeDirection, setSwipeDirection] = useState<1 | -1>(1);

  const switchTab = (tab: 'barn' | 'par') => {
    setSwipeDirection(tab === 'par' ? 1 : -1);
    setActiveTab(tab);
    try { localStorage.setItem(TAB_KEY, tab); } catch {}
  };
  const [notifySignedUp, setNotifySignedUp] = useState(false);
  const [notifyLoading, setNotifyLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from('product_interest' as any)
      .select('id')
      .eq('product_id', 'still_fair')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setNotifySignedUp(true);
      });
  }, [user?.id]);

  const handleNotifyMe = async () => {
    if (!user?.id) {
      toast('Du behöver vara inloggad för att bli påmind');
      return;
    }
    setNotifyLoading(true);
    const { error } = await supabase
      .from('product_interest' as any)
      .insert({ product_id: 'still_fair', user_id: user.id } as any);
    setNotifyLoading(false);
    if (error?.code === '23505') {
      setNotifySignedUp(true);
      return;
    }
    if (error) {
      toast('Något gick fel, försök igen');
      return;
    }
    setNotifySignedUp(true);
    toast('Vi meddelar dig när Still Fair lanseras!');
  };

  useEffect(() => {
    if (!tracked.current) {
      tracked.current = true;
      import('@/lib/trackOnboarding').then(m => m.trackOnboardingEvent('lobby_view'));
    }
  }, []);

  const { space } = useCoupleSpaceContext();
  const [activeProductIds, setActiveProductIds] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (!space?.id) return;
    let cancelled = false;
    supabase
      .from('couple_sessions')
      .select('product_id, last_activity_at')
      .eq('couple_space_id', space.id)
      .eq('status', 'active')
      .order('last_activity_at', { ascending: false })
      .then(({ data }) => {
        if (!cancelled && data) {
          setActiveProductIds(new Set(data.map(s => s.product_id)));
        }
      });
    return () => { cancelled = true; };
  }, [space?.id]);

  const jagIMig = allProducts.find(p => p.id === 'jag_i_mig')!;
  const jagMedAndra = allProducts.find(p => p.id === 'jag_med_andra')!;
  const jagIVarlden = allProducts.find(p => p.id === 'jag_i_varlden')!;
  const sexualitet = allProducts.find(p => p.id === 'sexualitetskort')!;
  const vardag = allProducts.find(p => p.id === 'vardagskort')!;
  const syskon = allProducts.find(p => p.id === 'syskonkort')!;

  const defaultKidsOrder = [jagIMig, jagMedAndra, jagIVarlden, vardag, syskon, sexualitet];

  const sortedKidsProducts = useMemo(() => {
    const active = defaultKidsOrder.filter(p => activeProductIds.has(p.id));
    const inactive = defaultKidsOrder.filter(p => !activeProductIds.has(p.id));
    return [...active, ...inactive];
  }, [activeProductIds]);

  const libraryBg = '#1A1A2E';

  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{
        background: libraryBg,
        fontFamily: "'Lato', sans-serif",
      }}
    >
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Hero zone */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: 'center', padding: '24px 32px 0' }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: '34px',
              fontWeight: 400,
              color: 'hsla(38, 78%, 55%, 0.95)',
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              marginBottom: '8px',
            }}
          >
            Bonki
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontStyle: 'italic',
              fontSize: '14px',
              fontWeight: 400,
              color: 'hsla(38, 50%, 65%, 0.5)',
              lineHeight: 1.6,
            }}
          >
            Verktyg för samtalen som inte blir av
          </motion.p>
        </motion.div>

        {/* Saffron accent divider */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{
            width: '32px',
            height: '1.5px',
            backgroundColor: 'hsla(38, 78%, 50%, 0.35)',
            margin: '14px auto 18px',
          }}
        />

        {/* BARN/PAR toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            margin: '0 auto 12px',
          }}
        >
          <div style={{
            display: 'flex',
            background: 'hsla(230, 35%, 18%, 0.7)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            borderRadius: '24px',
            padding: '4px',
            gap: '3px',
            border: '1px solid hsla(38, 50%, 50%, 0.1)',
            boxShadow: '0 4px 16px hsla(230, 40%, 8%, 0.4)',
          }}>
            {(['barn', 'par'] as const).map((tab) => {
              const isActive = activeTab === tab;
              const labels = { barn: 'BARN & FAMILJ', par: 'PAR' };
              return (
                <button
                  key={tab}
                  onClick={() => switchTab(tab)}
                  style={{
                    fontFamily: "'Lato', sans-serif",
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    color: isActive ? '#FDF6E3' : 'hsla(30, 20%, 85%, 0.35)',
                    background: isActive
                      ? 'linear-gradient(135deg, hsla(38, 60%, 45%, 0.25) 0%, hsla(230, 30%, 22%, 0.8) 100%)'
                      : 'transparent',
                    border: isActive ? '1px solid hsla(38, 60%, 50%, 0.2)' : '1px solid transparent',
                    outline: 'none',
                    borderRadius: '20px',
                    padding: '9px 24px',
                    cursor: 'pointer',
                    transition: 'all 280ms ease',
                    WebkitTapHighlightColor: 'transparent',
                    boxShadow: isActive ? '0 2px 8px hsla(38, 50%, 30%, 0.2)' : 'none',
                  }}
                >
                  {labels[tab]}
                </button>
              );
            })}
          </div>
          {!IS_RETURN_VISIT && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 * ANIM_SPEED, duration: 0.8 }}
              style={{
                fontFamily: "'Lato', sans-serif",
                fontSize: '8px',
                fontWeight: 500,
                letterSpacing: '0.08em',
                color: 'hsla(30, 20%, 80%, 0.25)',
                textTransform: 'uppercase',
              }}
            >
              ← swipa →
            </motion.p>
          )}
        </motion.div>

        {/* Resume banner */}
        <div className="px-5">
          <LibraryResumeBanner />
        </div>

        <motion.div
          key="swipe-container"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.15}
          onDragEnd={(_e, info) => {
            if (info.offset.x < -50 && activeTab === 'barn') switchTab('par');
            if (info.offset.x > 50 && activeTab === 'par') switchTab('barn');
          }}
          style={{ touchAction: 'pan-y' }}
        >
          <AnimatePresence mode="wait">

            {activeTab === 'barn' && (
              <motion.div
                key="barn"
                initial={{ opacity: 0, x: swipeDirection * 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: swipeDirection * -30 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="px-4">
                  {/* Freemium line */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    style={{
                      fontFamily: "'Lato', sans-serif",
                      fontSize: '12px',
                      fontWeight: 500,
                      color: 'rgba(212, 160, 58, 0.7)',
                      textAlign: 'center',
                      marginBottom: '20px',
                    }}
                  >
                    ✦ Första kortet i varje produkt är gratis
                  </motion.p>

                  {/* Kids tiles */}
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                    }}
                  >
                    {sortedKidsProducts.map((product) => (
                      <KidsTile
                        key={product.id}
                        name={product.name}
                        productId={product.id}
                        tagline={TAGLINES[product.id]}
                        ageLabel={product.ageLabel}
                        illustration={ILLUSTRATIONS[product.id]}
                        onClick={() => navigate(`/product/${product.slug}`)}
                        hasActiveSession={activeProductIds.has(product.id)}
                      />
                    ))}
                  </motion.div>
                </div>

                {/* Still Us cross-discovery on BARN tab */}
                <div className="px-4" style={{ marginTop: '28px' }}>
                  <div style={{
                    borderTop: '1px solid hsla(38, 50%, 50%, 0.12)',
                    paddingTop: '16px',
                  }}>
                    <p style={{
                      fontFamily: "'Lato', sans-serif",
                      fontSize: '12px',
                      fontWeight: 600,
                      letterSpacing: '1.5px',
                      textTransform: 'uppercase',
                      color: '#6B5E52',
                      marginBottom: '12px',
                    }}>
                      För er som par
                    </p>
                    <StillUsTile onClick={() => navigate('/product/still-us')} />
                  </div>
                </div>

                {/* Era samtal */}
                <div className="px-4" style={{ marginTop: '28px', marginBottom: '16px' }}>
                  <EraSamtalCard onClick={() => navigate('/diary/jag_i_mig')} />
                </div>
              </motion.div>
            )}

            {activeTab === 'par' && (
              <motion.div
                key="par"
                initial={{ opacity: 0, x: swipeDirection * 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: swipeDirection * -30 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                style={{ minHeight: '60vh' }}
              >
                {/* Bridge phrase */}
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.6 }}
                  style={{ textAlign: 'center', padding: '4px 32px 20px' }}
                >
                  <p style={{
                    fontFamily: "'DM Serif Display', serif",
                    fontStyle: 'italic',
                    fontSize: '14px',
                    fontWeight: 400,
                    color: 'hsla(38, 55%, 65%, 0.55)',
                    lineHeight: 1.6,
                  }}>
                    Du tar hand om samtalen med barnen — här tar ni hand om era egna
                  </p>
                </motion.div>

                <motion.div
                  className="px-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
                >
                  {/* Still Us tile */}
                  <StillUsTile onClick={() => navigate('/product/still-us')} />

                  {/* Coming soon — Still Fair */}
                  <div style={{ marginTop: '14px' }}>
                    {/* Section label */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginBottom: '14px',
                      padding: '0 4px',
                    }}>
                      <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, hsla(38, 60%, 50%, 0.15))' }} />
                      <span style={{
                        fontFamily: "'Lato', sans-serif",
                        fontSize: '8px',
                        fontWeight: 700,
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase' as const,
                        color: 'hsla(38, 55%, 60%, 0.4)',
                      }}>
                        Kommer snart
                      </span>
                      <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, hsla(38, 60%, 50%, 0.15), transparent)' }} />
                    </div>

                    <ComingSoonTile name="Still Fair" />
                  </div>
                </motion.div>

                {/* Era samtal on PAR tab */}
                <div className="px-4" style={{ marginTop: '28px', marginBottom: '16px' }}>
                  <EraSamtalCard onClick={() => navigate('/diary/jag_i_mig')} />
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>

        {/* Bottom safe-area */}
        <div style={{ paddingBottom: 'calc(48px + env(safe-area-inset-bottom, 0px))' }} />
      </div>
    </div>
  );
}
