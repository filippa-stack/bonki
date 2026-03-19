/**
 * Still Us Home — v3.0 linear layout.
 *
 * Layout: Hero → Title → JourneyProgress → ActionCard → BottomNav
 * Implements States 1-6 (core weekly rhythm).
 * States 7-10 (maintenance, return ritual, locked, migration) are placeholders.
 */

import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import { useStillUsHome, type ActionCardKind } from '@/hooks/useStillUsHome';
import { TOTAL_PROGRAM_CARDS } from '@/data/stillUsSequence';
import { COLORS, getLayerForCard } from '@/lib/stillUsTokens';
import { pollCoupleState } from '@/lib/stillUsRpc';
import JourneyProgress from '@/components/still-us/JourneyProgress';
import MaintenanceActionCard from '@/components/still-us/MaintenanceActionCard';
import ReturnRitual from '@/components/still-us/ReturnRitual';
import ProductHomeBackButton from '@/components/ProductHomeBackButton';
import stillUsIllustration from '@/assets/illustration-still-us-home.png';

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── Main Home component ── */
export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { space } = useCoupleSpaceContext();
  const homeState = useStillUsHome();
  const [showReturnRitual, setShowReturnRitual] = useState(false);

  const shouldShowRitual = homeState.isDormant && !homeState.returnRitualShown && !homeState.loading;
  const layer = getLayerForCard(homeState.cardIndex);

  // ── Ceremony redirect guard (highest priority) ──
  useEffect(() => {
    if (homeState.coupleState?.phase === 'ceremony') {
      navigate('/ceremony', { replace: true });
    }
  }, [homeState.coupleState?.phase, navigate]);

  // ── Polling via pollCoupleState every 15s ──
  useEffect(() => {
    if (!space?.id) return;
    const stop = pollCoupleState(space.id, 15_000, () => {
      homeState.refetch();
    });
    return stop;
  }, [space?.id]);

  const handleAction = (action: string) => {
    const cardId = homeState.cardId;
    switch (action) {
      case 'start_slider':
        navigate(`/check-in/${cardId}`);
        break;
      case 'send_link':
        navigate('/share');
        break;
      case 'start_session1':
        if (homeState.partnerTier === 'tier_2' && !homeState.partnerName) {
          navigate('/tier2-setup');
        } else {
          navigate(`/session/${cardId}/start`);
        }
        break;
      case 'resume_session':
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
      case 'next_week':
        // Advance card handled by RPC, just refetch
        homeState.refetch();
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
    <div style={{ minHeight: '100dvh', position: 'relative', overflow: 'hidden', backgroundColor: COLORS.emberNight }}>

      {/* ── Return ritual overlay (States 7-10 placeholder) ── */}
      <AnimatePresence>
        {shouldShowRitual && (
          <ReturnRitual
            daysSinceLastActivity={homeState.dormancyDays}
            cardTitle={homeState.cardTitle}
            onContinue={() => setShowReturnRitual(false)}
            onRestart={() => {
              setShowReturnRitual(false);
              // TODO: call reset_slider_checkin RPC
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Zone 1: Hero — atmospheric radial glow + illustration ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-5vh',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '140vw',
          height: '55vh',
          background: `radial-gradient(ellipse 60% 50% at 50% 45%, ${COLORS.emberMid}30 0%, ${COLORS.deepSaffron}10 50%, transparent 100%)`,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <motion.div
        initial={REDUCED ? false : { opacity: 0 }}
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
        {/* Scrim gradient */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '85%',
          background: `linear-gradient(to top, ${COLORS.emberNight} 0%, ${COLORS.emberNight}F2 18%, rgba(46,34,51,0.85) 35%, rgba(71,52,84,0.4) 60%, rgba(71,52,84,0.1) 80%, transparent 100%)`,
          pointerEvents: 'none',
        }} />
      </motion.div>

      {/* Back button */}
      <ProductHomeBackButton color={COLORS.lanternGlow} />

      {/* ── Content layer ── */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        paddingTop: 'clamp(28px, 8vh, 80px)',
        paddingLeft: '5vw',
        paddingRight: '5vw',
        paddingBottom: '100px',
      }}>

        {/* ── Zone 2: Title ── */}
        <motion.div
          initial={REDUCED ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.4, 0, 0.2, 1] }}
          style={{ textAlign: 'center', width: '100%' }}
        >
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(34px, 10vw, 50px)',
            fontWeight: 700,
            color: COLORS.lanternGlow,
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            textShadow: `0 2px 20px rgba(0,0,0,0.7), 0 0 60px ${COLORS.emberNight}`,
            margin: 0,
          }}>
            Ert utrymme
          </h1>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '14px',
            fontWeight: 400,
            color: COLORS.deepSaffron,
            opacity: 0.9,
            marginTop: '6px',
            textShadow: `0 1px 16px rgba(0,0,0,0.8)`,
          }}>
            Vecka {homeState.cardIndex + 1} av {TOTAL_PROGRAM_CARDS}
          </p>
        </motion.div>

        {/* Spacer */}
        <div style={{ height: 'clamp(24px, 6vh, 48px)' }} />

        {/* ── Zone 3: Journey Progress (22 dots) ── */}
        <motion.div
          initial={REDUCED ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          style={{ padding: '0 3vw' }}
        >
          <JourneyProgress currentCardIndex={homeState.cardIndex} dark />
          {/* Layer label below dots */}
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            color: COLORS.driftwood,
            textAlign: 'center',
            margin: '8px 0 0',
          }}>
            {layer.name}
          </p>
        </motion.div>

        {/* Spacer */}
        <div style={{ height: 'clamp(20px, 5vh, 40px)' }} />

        {/* ── Zone 4: Action Card ── */}
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
              cardIndex={homeState.cardIndex}
              cardTitle={homeState.cardTitle}
              layerName={layer.name}
              partnerName={homeState.partnerName}
              partnerTier={homeState.partnerTier}
              sessionPaused={homeState.sessionPaused}
              onAction={handleAction}
            />
          )}
        </div>
      </div>

      {/* ── Zone 5: Bottom Navigation ── */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: '64px',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        backgroundColor: `${COLORS.emberNight}F5`,
        backdropFilter: 'blur(12px)',
        borderTop: `1px solid ${COLORS.emberMid}60`,
      }}>
        <NavTab label="BIBLIOTEKET" active={false} onClick={() => navigate('/')} />
        <NavTab label="ERT RUM" active onClick={() => {}} />
        <NavTab label="ERA SAMTAL" active={false} onClick={() => navigate('/journey')} />
      </div>
    </div>
  );
}

/* ── Bottom nav tab ── */
function NavTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        fontFamily: 'var(--font-sans)',
        fontSize: '10px',
        fontWeight: 600,
        letterSpacing: '1px',
        textTransform: 'uppercase',
        color: active ? COLORS.deepSaffron : COLORS.driftwood,
        cursor: active ? 'default' : 'pointer',
        padding: '8px 16px',
        opacity: active ? 1 : 0.7,
        transition: 'color 0.2s, opacity 0.2s',
      }}
    >
      {label}
    </button>
  );
}

/* ── Action Card rendering (States 1-6) ── */
function ActionCard({
  kind,
  cardIndex,
  cardTitle,
  layerName,
  partnerName,
  partnerTier,
  sessionPaused,
  onAction,
}: {
  kind: ActionCardKind;
  cardIndex: number;
  cardTitle: string;
  layerName: string;
  partnerName: string | null;
  partnerTier: string;
  sessionPaused: boolean;
  onAction: (action: string) => void;
}) {
  const weekNum = cardIndex + 1;

  if (kind === 'loading') {
    return (
      <div
        style={{
          height: '120px',
          borderRadius: '22px',
          background: `${COLORS.emberMid}60`,
        }}
        className="animate-pulse"
      />
    );
  }

  // ── State configs ──
  let label = '';
  let title = '';
  let body = '';
  let ctaLabel = '';
  let ctaAction = '';
  let isAccent = false;
  let belowCard: React.ReactNode = null;

  switch (kind) {
    case 'slider_not_started': // State 1
      label = `VECKA ${weekNum}`;
      title = cardTitle;
      body = 'Veckans ämne väntar. Börja med en check-in.';
      ctaLabel = 'Check-in';
      ctaAction = 'start_slider';
      isAccent = true;
      break;

    case 'slider_waiting': // State 2
      label = `VECKA ${weekNum} · DIN CHECK-IN ÄR KLAR`;
      title = '';
      body = `${partnerName ?? 'Din partner'} har inte gjort sin check-in ännu.`;
      // No CTA
      if (partnerTier === 'tier_1') {
        belowCard = (
          <button
            onClick={() => onAction('send_link')}
            style={{
              display: 'block',
              margin: '12px auto 0',
              background: 'none',
              border: 'none',
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
              color: COLORS.driftwood,
              cursor: 'pointer',
              padding: '8px 0',
              textDecoration: 'underline',
            }}
          >
            Skicka check-in-länken?
          </button>
        );
      }
      break;

    case 'slider_ready': // State 3
      label = `VECKA ${weekNum} · SAMTAL 1`;
      title = '';
      body = 'Ni har båda gjort er check-in. Dags att prata.';
      ctaLabel = 'Börja ert samtal';
      ctaAction = 'start_session1';
      isAccent = true;
      break;

    case 'session1_active': // State 4 (paused or active)
      label = sessionPaused ? `VECKA ${weekNum} · PAUS` : `VECKA ${weekNum} · SAMTAL 1`;
      title = '';
      body = sessionPaused
        ? 'Ni pausade samtalet. Fortsätt där ni slutade.'
        : 'Samtal 1 pågår.';
      ctaLabel = 'Fortsätt';
      ctaAction = 'resume_session';
      isAccent = true;
      break;

    case 'session1_complete': // State 5
      label = `VECKA ${weekNum} · SAMTAL 2`;
      title = '';
      body = 'Ni har öppnat ämnet. Nu väntar scenariot.';
      ctaLabel = 'Fortsätt ert samtal';
      ctaAction = 'start_session2';
      isAccent = true;
      break;

    case 'session2_active': // State 5 variant (session 2 in progress)
      label = sessionPaused ? `VECKA ${weekNum} · PAUS` : `VECKA ${weekNum} · SAMTAL 2`;
      title = '';
      body = sessionPaused
        ? 'Ni pausade samtalet. Fortsätt där ni slutade.'
        : 'Samtal 2 pågår.';
      ctaLabel = 'Fortsätt';
      ctaAction = 'resume_session2';
      isAccent = true;
      break;

    case 'card_complete': // State 6
      label = `VECKA ${weekNum} · KLART`;
      title = '';
      body = 'Veckans samtal är klart.';
      if (cardIndex < TOTAL_PROGRAM_CARDS - 1) {
        belowCard = (
          <button
            onClick={() => onAction('next_week')}
            style={{
              display: 'block',
              margin: '12px auto 0',
              background: 'none',
              border: 'none',
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
              color: COLORS.driftwood,
              cursor: 'pointer',
              padding: '8px 0',
            }}
          >
            Börja nästa vecka nu
          </button>
        );
      }
      break;

    case 'tier2_setup':
      label = `VECKA ${weekNum}`;
      title = 'Vad heter din partner?';
      body = 'Vi behöver ett namn för att personalisera upplevelsen.';
      ctaLabel = 'Fortsätt';
      ctaAction = 'tier2_setup';
      break;

    case 'ceremony':
      label = 'PROGRAMMET KLART';
      title = 'Ni har gått hela vägen.';
      body = '22 veckor av samtal — det är stort.';
      ctaLabel = 'Se er resa';
      ctaAction = 'ceremony';
      isAccent = true;
      break;

    case 'migration_pending':
      label = 'UPPDATERING PÅGÅR';
      title = '';
      body = 'Vi uppgraderar er resa. Det här tar bara en stund.';
      break;

    // TODO: States 7-10 (maintenance, return ritual, partner locked, migration)
    // These will be implemented in later phases.

    default:
      break;
  }

  const hasCta = !!ctaLabel;

  return (
    <>
      <motion.div
        initial={REDUCED ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: '100%',
          position: 'relative',
          padding: '22px',
          borderRadius: '22px',
          overflow: 'hidden',
          background: `linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 35%, transparent 55%, rgba(0,0,0,0.08) 100%), ${COLORS.emberMid}`,
          border: isAccent
            ? `1.5px solid ${COLORS.deepSaffron}50`
            : `1.5px solid rgba(255,255,255,0.20)`,
          borderLeft: isAccent ? `3.5px solid ${COLORS.deepSaffron}` : undefined,
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          boxShadow: isAccent
            ? `0 6px 20px rgba(0,0,0,0.30), inset 0 2px 4px rgba(255,255,255,0.20), 0 0 32px ${COLORS.deepSaffron}22`
            : '0 6px 20px rgba(0,0,0,0.30), inset 0 2px 4px rgba(255,255,255,0.15)',
        }}
      >
        {/* Label */}
        <span style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          color: kind === 'slider_waiting' ? COLORS.driftwood : COLORS.deepSaffron,
          opacity: 0.85,
        }}>
          {label}
        </span>

        {/* Card title (State 1 only) */}
        {title && (
          <span style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '20px',
            fontWeight: 500,
            color: COLORS.lanternGlow,
            lineHeight: 1.3,
          }}>
            {title}
          </span>
        )}

        {/* Layer name (State 1 only) */}
        {kind === 'slider_not_started' && (
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            color: COLORS.driftwood,
          }}>
            {layerName}
          </span>
        )}

        {/* State 2: two circles visual */}
        {kind === 'slider_waiting' && (
          <div style={{ display: 'flex', gap: '8px', margin: '6px 0' }}>
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: COLORS.deepSaffron,
            }} />
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              border: `2px solid ${COLORS.driftwood}`,
              backgroundColor: 'transparent',
            }} />
          </div>
        )}

        {/* Body */}
        {body && (
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            color: `${COLORS.lanternGlow}B3`,
            marginTop: '2px',
            lineHeight: 1.5,
          }}>
            {body}
          </span>
        )}

        {/* CTA */}
        {hasCta && (
          <button
            onClick={() => onAction(ctaAction)}
            style={{
              marginTop: '10px',
              alignSelf: 'flex-start',
              width: '100%',
              height: '48px',
              borderRadius: '14px',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              fontSize: '16px',
              fontWeight: 600,
              backgroundColor: isAccent ? COLORS.bonkiOrange : `${COLORS.lanternGlow}15`,
              color: isAccent ? COLORS.emberNight : COLORS.lanternGlow,
              boxShadow: isAccent ? `0 4px 16px ${COLORS.deepSaffron}40` : 'none',
              transition: 'transform 140ms ease',
            }}
            onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.97)'; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            {ctaLabel}
          </button>
        )}
      </motion.div>

      {/* Below-card actions */}
      {belowCard}
    </>
  );
}
