/**
 * Still Us Home — v2.5 linear layout.
 *
 * Layout: Hero → Title → JourneyProgress → ActionCard
 * No accordion layers. No category tiles.
 * Action card derives from 10 possible states via useStillUsHome.
 */

import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import { useStillUsHome, type ActionCardKind } from '@/hooks/useStillUsHome';
import { EASE, EMOTION, PRESS, BEAT_1 } from '@/lib/motion';
import {
  MIDNIGHT_INK, EMBER_NIGHT, EMBER_MID, EMBER_GLOW,
  DEEP_SAFFRON, LANTERN_GLOW, DRIFTWOOD,
} from '@/lib/palette';
import { TOTAL_PROGRAM_CARDS, CARD_SEQUENCE } from '@/data/stillUsSequence';
import JourneyProgress from '@/components/still-us/JourneyProgress';
import MaintenanceActionCard from '@/components/still-us/MaintenanceActionCard';
import ReturnRitual from '@/components/still-us/ReturnRitual';
import ProductHomeBackButton from '@/components/ProductHomeBackButton';
import stillUsIllustration from '@/assets/illustration-still-us-home.png';

/* ── Animation presets ── */
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [...EASE] } },
};
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.11, delayChildren: 0.35 } },
};

/* ── Action Card rendering ── */
function ActionCard({
  kind,
  cardTitle,
  partnerName,
  sessionPaused,
  onAction,
}: {
  kind: ActionCardKind;
  cardTitle: string;
  partnerName: string | null;
  sessionPaused: boolean;
  onAction: (action: string) => void;
}) {
  if (kind === 'loading') {
    return (
      <div
        style={{
          height: '100px',
          borderRadius: '22px',
          background: `${EMBER_MID}60`,
        }}
        className="animate-pulse"
      />
    );
  }

  const configs: Record<ActionCardKind, {
    label: string;
    title: string;
    subtitle?: string;
    cta: string;
    action: string;
    accent?: boolean;
  }> = {
    loading: { label: '', title: '', cta: '', action: '' },
    slider_not_started: {
      label: 'Veckans check-in',
      title: cardTitle,
      subtitle: 'Reflektera var för sig — kort och stilla.',
      cta: 'Starta check-in',
      action: 'start_slider',
      accent: true,
    },
    slider_waiting: {
      label: 'Väntar på partner',
      title: `${partnerName ?? 'Din partner'} har inte reflekterat ännu.`,
      subtitle: 'Ni fortsätter så snart ni båda är klara.',
      cta: '',
      action: '',
    },
    slider_ready: {
      label: 'Redo att prata',
      title: cardTitle,
      subtitle: 'Ni har båda reflekterat. Dags att prata.',
      cta: 'Starta samtal',
      action: 'start_session1',
      accent: true,
    },
    session1_active: {
      label: sessionPaused ? 'Pausat samtal' : 'Samtal pågår',
      title: cardTitle,
      subtitle: sessionPaused ? 'Fortsätt där ni slutade.' : 'Del 1 av 2.',
      cta: sessionPaused ? 'Fortsätt' : 'Öppna samtal',
      action: 'resume_session1',
    },
    session1_complete: {
      label: 'Del 1 klar',
      title: cardTitle,
      subtitle: 'Redo för del 2 — ta er tid.',
      cta: 'Starta del 2',
      action: 'start_session2',
      accent: true,
    },
    session2_active: {
      label: sessionPaused ? 'Pausat samtal' : 'Del 2 pågår',
      title: cardTitle,
      subtitle: sessionPaused ? 'Fortsätt där ni slutade.' : 'Djupare in.',
      cta: sessionPaused ? 'Fortsätt' : 'Öppna samtal',
      action: 'resume_session2',
    },
    card_complete: {
      label: 'Kort klart!',
      title: cardTitle,
      subtitle: 'Bra jobbat. Nästa vecka väntar.',
      cta: 'Se sammanfattning',
      action: 'view_complete',
    },
    tier2_setup: {
      label: 'Bjud in din partner',
      title: 'Vad heter din partner?',
      subtitle: 'Vi behöver ett namn för att personalisera upplevelsen.',
      cta: 'Fortsätt',
      action: 'tier2_setup',
    },
    ceremony: {
      label: 'Programmet klart',
      title: 'Ni har gått hela vägen.',
      subtitle: '22 veckor av samtal — det är stort.',
      cta: 'Se er resa',
      action: 'ceremony',
      accent: true,
    },
    maintenance: {
      label: 'Tillbaka',
      title: '',
      cta: '',
      action: 'maintenance',
    },
    migration_pending: {
      label: 'Uppdatering pågår',
      title: 'Vi uppgraderar er resa.',
      subtitle: 'Det här tar bara en stund.',
      cta: '',
      action: '',
    },
  };

  const cfg = configs[kind];
  if (!cfg) return null;

  // Maintenance uses its own card component
  if (kind === 'maintenance') return null;

  const hasCta = !!cfg.cta;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.6, ease: [...EASE] }}
      style={{
        width: '100%',
        position: 'relative',
        padding: '22px',
        borderRadius: '22px',
        overflow: 'hidden',
        background: `linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 35%, transparent 55%, rgba(0,0,0,0.08) 100%), ${EMBER_MID}`,
        border: cfg.accent
          ? `1.5px solid ${DEEP_SAFFRON}50`
          : `1.5px solid rgba(255, 255, 255, 0.20)`,
        borderLeft: cfg.accent ? `3.5px solid ${DEEP_SAFFRON}` : undefined,
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        boxShadow: cfg.accent
          ? `0 6px 20px rgba(0,0,0,0.30), inset 0 2px 4px rgba(255,255,255,0.20), 0 0 32px ${DEEP_SAFFRON}22`
          : '0 6px 20px rgba(0,0,0,0.30), inset 0 2px 4px rgba(255,255,255,0.15)',
      }}
    >
      <span style={{
        fontFamily: 'var(--font-body)',
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '1.5px',
        textTransform: 'uppercase',
        color: kind === 'slider_waiting' ? DRIFTWOOD : DEEP_SAFFRON,
        opacity: 0.85,
      }}>
        {cfg.label}
      </span>

      <span style={{
        fontFamily: 'var(--font-display)',
        fontVariationSettings: "'opsz' 20",
        fontSize: '20px',
        fontWeight: 500,
        color: LANTERN_GLOW,
        lineHeight: 1.3,
      }}>
        {cfg.title}
      </span>

      {cfg.subtitle && (
        <span style={{
          fontFamily: 'var(--font-body)',
          fontSize: '13px',
          color: `${LANTERN_GLOW}70`,
          marginTop: '2px',
        }}>
          {cfg.subtitle}
        </span>
      )}

      {hasCta && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          transition={{ duration: PRESS, ease: [...EASE] }}
          onClick={() => onAction(cfg.action)}
          style={{
            marginTop: '10px',
            alignSelf: 'flex-start',
            padding: '10px 24px',
            borderRadius: '14px',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            fontWeight: 600,
            backgroundColor: cfg.accent ? DEEP_SAFFRON : `${LANTERN_GLOW}15`,
            color: cfg.accent ? MIDNIGHT_INK : LANTERN_GLOW,
            boxShadow: cfg.accent ? `0 4px 16px ${DEEP_SAFFRON}40` : 'none',
          }}
        >
          {cfg.cta}
        </motion.button>
      )}
    </motion.div>
  );
}

/* ── Main Home component ── */
export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { space } = useCoupleSpaceContext();
  const homeState = useStillUsHome();
  const [showReturnRitual, setShowReturnRitual] = useState(false);

  // Show return ritual if dormant and not yet shown for this card
  const shouldShowRitual = homeState.isDormant && !homeState.returnRitualShown && !homeState.loading;

  const handleAction = (action: string) => {
    const cardId = homeState.cardId;
    switch (action) {
      case 'start_slider':
        navigate(`/check-in/${cardId}`);
        break;
      case 'start_session1':
        navigate(`/session/${cardId}/start`);
        break;
      case 'resume_session1':
        navigate(`/session/${cardId}/start`);
        break;
      case 'start_session2':
        navigate(`/session/${cardId}/session2-start`);
        break;
      case 'resume_session2':
        navigate(`/session/${cardId}/live-session2`);
        break;
      case 'view_complete':
        navigate(`/session/${cardId}/complete`);
        break;
      case 'tier2_setup':
        navigate('/tier2-setup');
        break;
      case 'ceremony':
        navigate('/ceremony');
        break;
      default:
        break;
    }
  };

  const handleMaintenanceStart = () => {
    navigate(`/session/tillbaka-${homeState.maintenanceCardIndex}/tillbaka`);
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: EMBER_NIGHT }}>

      {/* ── Return ritual overlay ── */}
      <AnimatePresence>
        {shouldShowRitual && (
          <ReturnRitual
            weeksAway={homeState.dormancyDays}
            cardTitle={homeState.cardTitle}
            onContinue={() => setShowReturnRitual(false)}
            onResetSlider={() => {
              setShowReturnRitual(false);
              // TODO: call reset_slider_checkin RPC
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Atmospheric radial glow ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-5vh',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '140vw',
          height: '55vh',
          background: `radial-gradient(ellipse 60% 50% at 50% 45%, ${EMBER_MID}30 0%, ${DEEP_SAFFRON}10 50%, transparent 100%)`,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* ── Hero illustration (45vh) ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        style={{
          position: 'absolute',
          top: '-6vh',
          left: '-5vw',
          right: '-5vw',
          height: '45vh',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        <img
          src={stillUsIllustration}
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: '50% 25%',
          }}
        />
        {/* Scrim */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '85%',
          background: `linear-gradient(to top, ${EMBER_NIGHT} 0%, ${EMBER_NIGHT}F2 18%, rgba(46,34,51,0.85) 35%, rgba(71,52,84,0.4) 60%, rgba(71,52,84,0.1) 80%, transparent 100%)`,
          pointerEvents: 'none',
        }} />
      </motion.div>

      <ProductHomeBackButton color={LANTERN_GLOW} />

      {/* ── Content layer ── */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        paddingTop: 'clamp(28px, 8vh, 80px)',
        paddingLeft: '5vw',
        paddingRight: '5vw',
        paddingBottom: '120px',
      }}>

        {/* ── Title zone ── */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ textAlign: 'center', width: '100%' }}>
          <motion.div variants={fadeUp}>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(34px, 10vw, 50px)',
              fontWeight: 700,
              color: LANTERN_GLOW,
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
              textShadow: `0 2px 20px rgba(0,0,0,0.7), 0 0 60px ${EMBER_NIGHT}, 0 0 120px ${EMBER_NIGHT}`,
              fontVariationSettings: "'opsz' 36",
            }}>
              Ert utrymme
            </h1>
            <p className="font-serif" style={{
              fontSize: 'clamp(15px, 4vw, 19px)',
              fontWeight: 400,
              color: DEEP_SAFFRON,
              opacity: 0.9,
              marginTop: '6px',
              textShadow: `0 1px 16px rgba(0,0,0,0.8), 0 0 40px ${EMBER_NIGHT}`,
            }}>
              Vecka {homeState.cardIndex + 1} av {TOTAL_PROGRAM_CARDS}
            </p>
          </motion.div>
        </motion.div>

        {/* Spacer */}
        <div style={{ height: 'clamp(24px, 6vh, 48px)' }} />

        {/* ── Journey Progress (22 dots) ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: EMOTION }}
          style={{ padding: '0 3vw' }}
        >
          <JourneyProgress
            currentCardIndex={homeState.cardIndex}
            dark
          />
        </motion.div>

        {/* Spacer */}
        <div style={{ height: 'clamp(20px, 5vh, 40px)' }} />

        {/* ── Action Card zone ── */}
        <div style={{ paddingLeft: '3vw', paddingRight: '3vw' }}>
          {homeState.actionCard === 'maintenance' ? (
            <MaintenanceActionCard
              tillbakaIndex={homeState.maintenanceCardIndex}
              tillbakaTitle={homeState.maintenanceTillbakaTitle}
              available={homeState.maintenanceAvailable}
              daysUntilNext={homeState.maintenanceDaysUntilNext ?? undefined}
              onStart={handleMaintenanceStart}
            />
          ) : (
            <ActionCard
              kind={homeState.actionCard}
              cardTitle={homeState.cardTitle}
              partnerName={homeState.partnerName}
              sessionPaused={homeState.sessionPaused}
              onAction={handleAction}
            />
          )}
        </div>
      </div>
    </div>
  );
}
