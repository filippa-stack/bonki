/**
 * Still Us Home — v3.0 linear layout.
 *
 * Layout: Hero → Title → JourneyProgress → ActionCard → BottomNav
 * Implements States 1-6 (core weekly rhythm).
 * States 7-10 (maintenance, return ritual, locked, migration) are placeholders.
 */

import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import { useStillUsHome, type ActionCardKind } from '@/hooks/useStillUsHome';
import { TOTAL_PROGRAM_CARDS } from '@/data/stillUsSequence';
import { COLORS, getLayerForCard } from '@/lib/stillUsTokens';
import { pollCoupleState, resetSliderCheckin, skipCard } from '@/lib/stillUsRpc';
import { supabase } from '@/integrations/supabase/client';
import { cardIdFromIndex } from '@/lib/stillUsTokens';
import JourneyProgress from '@/components/still-us/JourneyProgress';
import tillbakaCards from '@/data/tillbakaCards';
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
  const [dismissedInactivity, setDismissedInactivity] = useState(false);
  const [resharePromptDismissed, setResharePromptDismissed] = useState(false);

  const showResharePrompt = useMemo(() => {
    if (resharePromptDismissed) return false;
    if (homeState.loading) return false;
    if (homeState.partnerId) return false;
    if (!homeState.partnerLinkToken) return false;
    if (!homeState.coupleCreatedAt) return false;
    const created = new Date(homeState.coupleCreatedAt);
    const daysSince = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince >= 7;
  }, [homeState.partnerId, homeState.partnerLinkToken, homeState.coupleCreatedAt, homeState.loading, resharePromptDismissed]);

  const showInactivityOverlay = homeState.dormancyDays > 7 && !dismissedInactivity && !homeState.loading;
  const shouldShowRitual = homeState.isDormant && !homeState.returnRitualShown && !homeState.loading && !showInactivityOverlay;
  const layer = getLayerForCard(homeState.cardIndex);

  // ── Ceremony redirect guard (highest priority) ──
  useEffect(() => {
    if (homeState.phase === 'ceremony') {
      navigate('/ceremony', { replace: true });
    }
  }, [homeState.phase, navigate]);

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
      case 'unlock_self':
        navigate('/unlock');
        break;
      case 'start_tillbaka':
        navigate(`/session/tillbaka-${homeState.maintenanceCardIndex}/tillbaka`);
        break;
      case 'resume_tillbaka':
        navigate(`/session/tillbaka-${homeState.maintenanceCardIndex}/tillbaka?resume=true`);
        break;
      default:
        break;
    }
  };

  // ── Dissolved state guard (second highest priority after ceremony) ──
  if (homeState.dissolvedAt) {
    return (
      <div style={{
        minHeight: '100vh',
        background: COLORS.emberNight,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: '20px',
          color: COLORS.driftwood,
          marginBottom: '12px',
        }}>
          Ert gemensamma utrymme är avslutat.
        </h1>
        <p style={{
          fontFamily: "'Nunito', sans-serif",
          fontSize: '15px',
          color: COLORS.driftwoodBody,
          lineHeight: '1.6',
          marginBottom: '32px',
        }}>
          Er resa finns kvar.
        </p>
        <button
          onClick={() => navigate('/journey')}
          style={{
            background: 'transparent',
            border: `1px solid ${COLORS.driftwood}`,
            color: COLORS.driftwood,
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 700,
            fontSize: '16px',
            borderRadius: '12px',
            padding: '14px 28px',
            cursor: 'pointer',
          }}
        >
          Se er resa
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100dvh', position: 'relative', overflow: 'hidden', backgroundColor: COLORS.emberNight }}>

      {/* ── Inactivity overlay (7+ days) ── */}
      <AnimatePresence>
        {showInactivityOverlay && (
          <motion.div
            key="inactivity-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 50,
              backgroundColor: COLORS.emberNight,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
            }}
          >
            <h1 style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: '28px',
              color: COLORS.lanternGlow,
              textAlign: 'center',
              margin: 0,
            }}>
              Välkomna tillbaka.
            </h1>

            <p style={{
              fontSize: '16px',
              color: COLORS.lanternGlow,
              opacity: 0.7,
              textAlign: 'center',
              marginTop: '16px',
              fontFamily: 'var(--font-sans)',
            }}>
              Ni pausade vid Vecka {homeState.cardIndex + 1}: {homeState.cardTitle}.
            </p>

            {(() => {
              const touch = homeState.currentTouch;
              let contextText: string | null = null;
              if (touch === 'slider' || touch === 'slider_checkin') {
                contextText = 'Ni började inte veckans check-in.';
              } else if (touch === 'session_1') {
                contextText = 'Ni hade gjort er check-in men inte börjat prata.';
              } else if (touch === 'session_2') {
                contextText = 'Ni hade gjort Samtal 1. Samtal 2 väntar.';
              }
              return contextText ? (
                <p style={{
                  fontSize: '14px',
                  color: COLORS.lanternGlow,
                  opacity: 0.6,
                  textAlign: 'center',
                  marginTop: '8px',
                  fontFamily: 'var(--font-sans)',
                }}>
                  {contextText}
                </p>
              ) : null;
            })()}

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setDismissedInactivity(true)}
              style={{
                marginTop: '40px',
                width: '100%',
                maxWidth: '320px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: COLORS.deepSaffron,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                fontSize: '16px',
                fontWeight: 600,
                color: '#FFFFFF',
              }}
            >
              Fortsätt där ni slutade
            </motion.button>

            <button
              onClick={async () => {
                if (homeState.coupleId) {
                  try {
                    await resetSliderCheckin({ couple_id: homeState.coupleId, card_id: `card_${homeState.cardIndex + 1}` });
                  } catch (err) {
                    console.warn('Reset slider failed:', err);
                  }
                  homeState.refetch();
                }
                setDismissedInactivity(true);
              }}
              style={{
                marginTop: '16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: COLORS.driftwood,
                fontSize: '14px',
                fontFamily: 'var(--font-sans)',
              }}
            >
              Börja om med en ny check-in
            </button>
          </motion.div>
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
          <ActionCard
            kind={homeState.actionCard}
            cardIndex={homeState.cardIndex}
            cardTitle={homeState.cardTitle}
            layerName={layer.name}
            partnerName={homeState.partnerName}
            partnerTier={homeState.partnerTier}
            sessionPaused={homeState.sessionPaused}
            initiatorName={homeState.initiatorName}
            partnerNudgeSentAt={homeState.partnerNudgeSentAt}
            coupleId={homeState.coupleId}
            cycleId={homeState.cycleId}
            maintenanceCardIndex={homeState.maintenanceCardIndex}
            maintenanceTillbakaTitle={homeState.maintenanceTillbakaTitle}
            maintenanceAvailable={homeState.maintenanceAvailable}
            maintenanceDaysUntilNext={homeState.maintenanceDaysUntilNext}
            pausedReason={homeState.pausedReason}
            lastActivityAt={homeState.lastActivityAt}
            onAction={handleAction}
            onRefetch={homeState.refetch}
          />
        </div>

        {/* ── Partner re-share prompt ── */}
        {showResharePrompt && (
          <div style={{ padding: '20px 24px', textAlign: 'center' }}>
            <p style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: '18px',
              color: COLORS.lanternGlow,
              marginBottom: '8px',
            }}>
              Din partner har inte anslutit sig än
            </p>
            <p style={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: '14px',
              color: COLORS.driftwoodBody,
              marginBottom: '20px',
            }}>
              Det kan vara värt att skicka länken igen.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button
                onClick={() => navigate('/share')}
                style={{
                  background: COLORS.deepSaffron,
                  color: COLORS.emberNight,
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 700,
                  fontSize: '16px',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px 28px',
                  cursor: 'pointer',
                }}
              >
                Skicka igen
              </button>
              <button
                onClick={() => setResharePromptDismissed(true)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: COLORS.driftwood,
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: '14px',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  padding: '14px 12px',
                }}
              >
                Vänta lite till
              </button>
            </div>
          </div>
        )}
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

/* ── Action Card rendering (States 1-6, 7/7b, 9, 10) ── */
function ActionCard({
  kind,
  cardIndex,
  cardTitle,
  layerName,
  partnerName,
  partnerTier,
  sessionPaused,
  initiatorName,
  partnerNudgeSentAt,
  coupleId,
  cycleId,
  maintenanceCardIndex,
  maintenanceTillbakaTitle,
  maintenanceAvailable,
  maintenanceDaysUntilNext,
  pausedReason,
  lastActivityAt,
  onAction,
  onRefetch,
}: {
  kind: ActionCardKind;
  cardIndex: number;
  cardTitle: string;
  layerName: string;
  partnerName: string | null;
  partnerTier: string;
  sessionPaused: boolean;
  initiatorName: string | null;
  partnerNudgeSentAt: string | null;
  coupleId: string | null;
  cycleId: number;
  maintenanceCardIndex: number;
  maintenanceTillbakaTitle: string;
  maintenanceAvailable: boolean;
  maintenanceDaysUntilNext: number | null;
  pausedReason: string | null;
  lastActivityAt: string | null;
  onAction: (action: string) => void;
  onRefetch: () => Promise<void>;
}) {
  const navigate = useNavigate();
  const weekNum = cardIndex + 1;
  const [staleDismissed, setStaleDismissed] = useState(false);
  const [skipping, setSkipping] = useState(false);
  const [showPacingModal, setShowPacingModal] = useState(false);
  const [pacingMomentShown, setPacingMomentShown] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [recentCompletions, setRecentCompletions] = useState(0);

  // Fetch recent completion count for pacing guard
  useEffect(() => {
    if (!coupleId || kind !== 'card_complete') return;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    supabase
      .from('session_state')
      .select('card_id', { count: 'exact', head: true })
      .eq('couple_id', coupleId)
      .eq('cycle_id', cycleId)
      .not('completed_at', 'is', null)
      .gte('completed_at', sevenDaysAgo)
      .then(({ count }) => setRecentCompletions(count ?? 0));
  }, [coupleId, cycleId, kind]);

  const shouldShowPacingMoment = recentCompletions >= 3;

  const doAdvance = async () => {
    if (!coupleId) return;
    setAdvancing(true);
    try {
      const result = await skipCard({
        couple_id: coupleId,
        card_id: cardIdFromIndex(cardIndex),
        skip_type: 'auto_advanced',
      });
      if (result.status === 'ceremony') {
        navigate('/ceremony');
      } else {
        await onRefetch();
      }
    } catch (err) {
      console.warn('Advance failed:', err);
    } finally {
      setAdvancing(false);
    }
  };

  const handleAdvanceNow = () => {
    if (shouldShowPacingMoment && !pacingMomentShown) {
      setShowPacingModal(true);
      return;
    }
    doAdvance();
  };

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

    case 'session1_complete': { // State 5
      label = `VECKA ${weekNum} · SAMTAL 2`;
      title = '';
      body = 'Ni har öppnat ämnet. Nu väntar scenariot.';
      ctaLabel = 'Fortsätt ert samtal';
      ctaAction = 'start_session2';
      isAccent = true;

      const daysSinceActivity = lastActivityAt
        ? (Date.now() - new Date(lastActivityAt).getTime()) / (1000 * 60 * 60 * 24)
        : 0;
      const showStale = daysSinceActivity >= 14 && !staleDismissed;

      if (showStale) {
        belowCard = (
          <div style={{ marginTop: '16px' }}>
            <div style={{ height: '1px', backgroundColor: COLORS.emberMid, width: '100%' }} />
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
              color: COLORS.lanternGlow,
              opacity: 0.7,
              textAlign: 'center',
              margin: '16px 0 12px',
            }}>
              Det har gått ett tag sedan Samtal 1. Vill ni fortsätta {cardTitle} eller gå vidare?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <button
                disabled={skipping}
                onClick={() => setStaleDismissed(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '14px',
                  color: COLORS.deepSaffron,
                  cursor: skipping ? 'default' : 'pointer',
                  opacity: skipping ? 0.5 : 1,
                }}
              >
                Fortsätta {cardTitle}
              </button>
              <button
                disabled={skipping}
                onClick={async () => {
                  if (!coupleId) return;
                  setSkipping(true);
                  try {
                    const result = await skipCard({
                      couple_id: coupleId,
                      card_id: cardIdFromIndex(cardIndex),
                      skip_type: 'user_skipped',
                    });
                    if (result.status === 'ceremony') {
                      navigate('/ceremony');
                    } else {
                      await onRefetch();
                    }
                  } catch (err) {
                    console.warn('Skip card failed:', err);
                  } finally {
                    setSkipping(false);
                  }
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '14px',
                  color: COLORS.driftwood,
                  cursor: skipping ? 'default' : 'pointer',
                  opacity: skipping ? 0.5 : 1,
                }}
              >
                {skipping ? 'Hoppar över...' : 'Gå vidare till nästa vecka'}
              </button>
            </div>
          </div>
        );
      }
      break;
    }

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
          <>
            <button
              disabled={advancing}
              onClick={handleAdvanceNow}
              style={{
                display: 'block',
                margin: '12px auto 0',
                background: 'none',
                border: 'none',
                fontFamily: 'var(--font-sans)',
                fontSize: '14px',
                color: COLORS.driftwood,
                cursor: advancing ? 'default' : 'pointer',
                padding: '8px 0',
                textDecoration: 'underline',
                opacity: advancing ? 0.5 : 1,
              }}
            >
              {advancing ? 'Laddar...' : 'Börja nästa vecka nu'}
            </button>

            {/* Pacing modal */}
            <AnimatePresence>
              {showPacingModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 100,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px',
                  }}
                >
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    style={{
                      backgroundColor: COLORS.emberNight,
                      border: `1px solid ${COLORS.emberMid}60`,
                      borderRadius: '22px',
                      padding: '28px 24px',
                      maxWidth: '340px',
                      width: '100%',
                      textAlign: 'center',
                    }}
                  >
                    <p style={{
                      fontFamily: "'DM Serif Display', serif",
                      fontSize: '22px',
                      color: COLORS.lanternGlow,
                      marginBottom: '12px',
                    }}>
                      Ni har bra fart
                    </p>
                    <p style={{
                      fontFamily: "'Nunito', sans-serif",
                      fontSize: '14px',
                      color: COLORS.driftwoodBody,
                      marginBottom: '24px',
                      lineHeight: 1.5,
                    }}>
                      Ibland behöver samtalen tid att landa. Men om det känns rätt — kör vidare.
                    </p>
                    <button
                      disabled={advancing}
                      onClick={() => {
                        setPacingMomentShown(true);
                        setShowPacingModal(false);
                        doAdvance();
                      }}
                      style={{
                        background: COLORS.deepSaffron,
                        color: COLORS.emberNight,
                        fontFamily: "'Nunito', sans-serif",
                        fontWeight: 700,
                        fontSize: '16px',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '14px 28px',
                        cursor: 'pointer',
                        width: '100%',
                        marginBottom: '12px',
                      }}
                    >
                      Fortsätt ändå
                    </button>
                    <button
                      onClick={() => {
                        setPacingMomentShown(true);
                        setShowPacingModal(false);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: COLORS.driftwood,
                        fontFamily: "'Nunito', sans-serif",
                        fontSize: '14px',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        padding: '8px',
                      }}
                    >
                      Vänta till nästa vecka
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
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
      label = '';
      title = '';
      body = 'Er data uppdateras. Vänta en stund.';
      break;

    case 'maintenance': {
      const completedCount = maintenanceCardIndex;
      const progressText = `${completedCount} av 12 tillbaka-samtal`;

      if (sessionPaused) {
        // State 7b: Tillbaka session paused
        const reasonBody = pausedReason === 'emotional'
          ? 'Ni stannade upp. Det är okej. Fortsätt när ni är redo.'
          : 'Ni pausade ert tillbaka-samtal. Fortsätt där ni slutade.';

        return (
          <motion.div
            initial={REDUCED ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{
              width: '100%',
              padding: '22px',
              borderRadius: '22px',
              overflow: 'hidden',
              backgroundColor: `${COLORS.emberMid}40`,
              backdropFilter: 'blur(12px)',
            }}
          >
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              color: COLORS.driftwood,
              margin: 0,
            }}>
              TILLBAKA · PAUS
            </p>
            <p style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: '20px',
              color: COLORS.lanternGlow,
              margin: '8px 0 0',
            }}>
              {maintenanceTillbakaTitle}
            </p>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
              color: COLORS.lanternGlow,
              opacity: 0.7,
              margin: '12px 0 0',
            }}>
              {reasonBody}
            </p>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => onAction('resume_tillbaka')}
              style={{
                display: 'block',
                margin: '20px auto 0',
                width: '100%',
                maxWidth: '320px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: COLORS.deepSaffron,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                fontSize: '16px',
                fontWeight: 600,
                color: '#FFFFFF',
              }}
            >
              Fortsätt
            </motion.button>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              color: COLORS.driftwood,
              textAlign: 'center',
              margin: '16px 0 0',
            }}>
              {progressText}
            </p>
            <button
              onClick={() => navigate('/journey')}
              style={{
                display: 'block',
                margin: '12px auto 0',
                background: 'none',
                border: 'none',
                fontFamily: 'var(--font-sans)',
                fontSize: '14px',
                color: COLORS.driftwood,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Se er resa
            </button>
          </motion.div>
        );
      }

      // State 7: Standard maintenance
      if (maintenanceAvailable) {
        return (
          <motion.div
            initial={REDUCED ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{
              width: '100%',
              padding: '22px',
              borderRadius: '22px',
              overflow: 'hidden',
              backgroundColor: `${COLORS.emberMid}40`,
              backdropFilter: 'blur(12px)',
            }}
          >
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              color: COLORS.driftwood,
              margin: 0,
            }}>
              TILLBAKA
            </p>
            <p style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: '20px',
              color: COLORS.lanternGlow,
              margin: '8px 0 0',
            }}>
              {maintenanceTillbakaTitle}
            </p>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => onAction('start_tillbaka')}
              style={{
                display: 'block',
                margin: '20px auto 0',
                width: '100%',
                maxWidth: '320px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: COLORS.deepSaffron,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                fontSize: '16px',
                fontWeight: 600,
                color: '#FFFFFF',
              }}
            >
              Börja
            </motion.button>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              color: COLORS.driftwood,
              textAlign: 'center',
              margin: '16px 0 0',
            }}>
              {progressText}
            </p>
            <button
              onClick={() => navigate('/journey')}
              style={{
                display: 'block',
                margin: '12px auto 0',
                background: 'none',
                border: 'none',
                fontFamily: 'var(--font-sans)',
                fontSize: '14px',
                color: COLORS.driftwood,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Se er resa
            </button>
          </motion.div>
        );
      }

      // Between deliveries — no card available
      const daysLeft = maintenanceDaysUntilNext;
      const countdownText = (daysLeft !== null && daysLeft > 0)
        ? `Nästa samtal kommer om ${daysLeft} dagar`
        : 'Ert nästa samtal är redo snart.';

      return (
        <motion.div
          initial={REDUCED ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{
            width: '100%',
            padding: '22px',
            borderRadius: '22px',
            overflow: 'hidden',
            backgroundColor: `${COLORS.emberMid}40`,
            backdropFilter: 'blur(12px)',
          }}
        >
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            color: COLORS.driftwood,
            margin: 0,
          }}>
            TILLBAKA
          </p>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '14px',
            color: COLORS.driftwood,
            margin: '12px 0 0',
          }}>
            {countdownText}
          </p>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            color: COLORS.driftwood,
            textAlign: 'center',
            margin: '16px 0 0',
          }}>
            {progressText}
          </p>
          <button
            onClick={() => navigate('/journey')}
            style={{
              display: 'block',
              margin: '12px auto 0',
              background: 'none',
              border: 'none',
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
              color: COLORS.driftwood,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Se er resa
          </button>
        </motion.div>
      );
    }

    case 'partner_locked': {
      const nudgeSentAt = partnerNudgeSentAt ? new Date(partnerNudgeSentAt).getTime() : 0;
      const cooldownMs = 48 * 60 * 60 * 1000;
      const isNudgeDisabled = Date.now() - nudgeSentAt < cooldownMs;
      const hoursRemaining = Math.ceil((cooldownMs - (Date.now() - nudgeSentAt)) / (1000 * 60 * 60));
      const initName = initiatorName || 'din partner';

      label = 'VECKA 2 · LÅST';
      title = cardTitle;

      return (
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
            backgroundColor: `${COLORS.emberMid}40`,
            backdropFilter: 'blur(12px)',
          }}
        >
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            color: COLORS.driftwood,
            margin: 0,
          }}>
            {label}
          </p>

          <p style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: '20px',
            color: COLORS.lanternGlow,
            opacity: 0.5,
            margin: '8px 0 0',
          }}>
            {cardTitle}
          </p>

          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '14px',
            color: COLORS.lanternGlow,
            opacity: 0.7,
            margin: '12px 0 0',
          }}>
            {initName} kan låsa upp resten av Still Us.
          </p>

          <motion.button
            whileTap={!isNudgeDisabled ? { scale: 0.97 } : undefined}
            onClick={async () => {
              if (isNudgeDisabled || !coupleId) return;
              try {
                const { supabase } = await import('@/integrations/supabase/client');
                await supabase.functions.invoke('send-notification-email', {
                  body: { couple_id: coupleId, notification_type: 'N6', deep_link: '/unlock' },
                });
                // Refetch to pick up updated partner_nudge_sent_at
                onAction('next_week');
              } catch (err) {
                console.warn('Nudge send failed:', err);
              }
            }}
            style={{
              display: 'block',
              margin: '20px auto 0',
              width: '100%',
              maxWidth: '320px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: COLORS.deepSaffron,
              border: 'none',
              cursor: isNudgeDisabled ? 'default' : 'pointer',
              opacity: isNudgeDisabled ? 0.5 : 1,
              pointerEvents: isNudgeDisabled ? 'none' : 'auto',
              fontFamily: 'var(--font-sans)',
              fontSize: '16px',
              fontWeight: 600,
              color: '#FFFFFF',
            }}
          >
            Påminn {initName}
          </motion.button>

          {isNudgeDisabled && (
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '12px',
              color: COLORS.driftwood,
              textAlign: 'center',
              margin: '8px 0 0',
            }}>
              Påminnelse skickad ✓ (åter om {hoursRemaining}h)
            </p>
          )}

          <button
            onClick={() => onAction('unlock_self')}
            style={{
              display: 'block',
              margin: '16px auto 0',
              background: 'none',
              border: 'none',
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
              color: COLORS.driftwood,
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            Jag vill låsa upp själv
          </button>
        </motion.div>
      );
    }

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
