import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { COLORS, getLayerForCard } from '@/lib/stillUsTokens';
import sliderPrompts, { getSliderSet } from '@/data/sliderPrompts';
import { computeJourneyInsights } from '@/lib/stillUsRpc';

interface CoupleStateData {
  phase: string;
  ceremony_reflection: string | null;
  couple_id: string;
  cycle_id: number;
}

export default function CompletionCeremony() {
  const navigate = useNavigate();
  const [currentScreen, setCurrentScreen] = useState(0);
  const [swipeEnabled, setSwipeEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [coupleState, setCoupleState] = useState<CoupleStateData | null>(null);
  const [insights, setInsights] = useState<{
    max_delta_card: { card_id: string; avg_delta: number } | null;
    min_delta_card: { card_id: string; avg_delta: number } | null;
    total_reflections: number;
    has_sufficient_data: boolean;
  } | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [screen3Reflection, setScreen3Reflection] = useState('');
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Entry guard ──
  useEffect(() => {
    const checkAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/'); return; }

      const { data: couple } = await supabase
        .from('couple_state')
        .select('phase, ceremony_reflection, couple_id, cycle_id')
        .eq('initiator_id', user.id)
        .single();

      if (!couple) { navigate('/'); return; }

      if (couple.phase === 'program') {
        navigate('/');
        return;
      }

      if (couple.phase === 'maintenance' || couple.phase === 'second_cycle') {
        if (couple.ceremony_reflection) {
          setCurrentScreen(4);
        } else {
          navigate('/');
          return;
        }
      }

      setCoupleState(couple);
      setLoading(false);
    };
    checkAccess();
  }, [navigate]);

  // ── Fetch journey insights ──
  useEffect(() => {
    if (!coupleState) return;
    const fetchInsights = async () => {
      try {
        const result = await computeJourneyInsights({
          couple_id: coupleState.couple_id,
          cycle_id: coupleState.cycle_id,
        });
        setInsights(result as any);
      } catch (err) {
        console.error('Failed to fetch journey insights:', err);
        setInsights({
          max_delta_card: null,
          min_delta_card: null,
          total_reflections: 0,
          has_sufficient_data: false,
        });
      } finally {
        setInsightsLoading(false);
      }
    };
    fetchInsights();
  }, [coupleState]);

  // ── Screen 1 hold timer ──
  useEffect(() => {
    if (loading) return;
    if (prefersReducedMotion) {
      setSwipeEnabled(true);
      return;
    }
    const timer = setTimeout(() => setSwipeEnabled(true), 3000);
    return () => clearTimeout(timer);
  }, [loading, prefersReducedMotion]);

  // ── Helper: resolve card title from card_id ──
  const getCardTitleFromId = (cardId: string): string => {
    const index = parseInt(cardId.replace('card_', ''), 10) - 1;
    const set = getSliderSet(index);
    return set?.cardTitle ?? `Vecka ${index + 1}`;
  };

  // ── Swipe handlers ──
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!swipeEnabled) return;
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (diff > threshold && currentScreen < 4) {
      setCurrentScreen(prev => prev + 1);
    } else if (diff < -threshold && currentScreen > 0) {
      setCurrentScreen(prev => prev - 1);
    }
  }, [swipeEnabled, currentScreen]);

  // ── Timeline data (placeholder takeaways) ──
  const timelineNodes = sliderPrompts.map((card, index) => {
    const layer = getLayerForCard(index);
    return {
      weekNumber: index + 1,
      cardTitle: card.cardTitle,
      layerName: layer.name,
      layerColor: layer.color,
      status: 'completed' as const,
      takeawayPreview: index % 2 === 0 ? 'Placeholder takeaway text…' : null,
    };
  });

  // ── Layer label dedup ──
  const layerFirstNodes: Record<string, boolean> = {};
  const shouldShowLayerLabel = (layerName: string): boolean => {
    if (layerFirstNodes[layerName]) return false;
    layerFirstNodes[layerName] = true;
    return true;
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: COLORS.emberNight,
      }} />
    );
  }

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        backgroundColor: COLORS.emberNight,
      }}
    >
      <div
        style={{
          display: 'flex',
          width: '500vw',
          height: '100%',
          transform: `translateX(-${currentScreen * 100}vw)`,
          transition: prefersReducedMotion ? 'none' : 'transform 0.4s ease',
        }}
      >
        {/* ── Screen 1: Pause ── */}
        <div style={{
          width: '100vw',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 32px',
          flexShrink: 0,
        }}>
          <h1 style={{
            fontFamily: '"DM Serif Display", serif',
            fontSize: '32px',
            fontWeight: 400,
            color: COLORS.deepSaffron,
            textAlign: 'center',
            lineHeight: 1.3,
          }}>
            Ni har gått hela vägen.
          </h1>
        </div>

        {/* ── Screen 2: Journey Timeline ── */}
        <div style={{
          width: '100vw',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '48px 32px 16px',
            flexShrink: 0,
          }}>
            <h2 style={{
              fontFamily: '"DM Serif Display", serif',
              fontSize: '28px',
              fontWeight: 400,
              color: COLORS.lanternGlow,
              textAlign: 'center',
            }}>
              Er resa
            </h2>
          </div>

          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '0 32px 48px',
            WebkitOverflowScrolling: 'touch',
          }}>
            <div style={{ paddingLeft: '24px', position: 'relative' }}>
              {timelineNodes.map((node, i) => {
                const showLabel = shouldShowLayerLabel(node.layerName);
                const isLast = i === timelineNodes.length - 1;
                const nextNode = !isLast ? timelineNodes[i + 1] : null;

                return (
                  <div key={i} style={{ position: 'relative', paddingBottom: isLast ? 0 : '28px' }}>
                    {/* Vertical line to next node */}
                    {!isLast && (
                      <div style={{
                        position: 'absolute',
                        left: '7px',
                        top: '16px',
                        width: '2px',
                        height: 'calc(100% - 16px)',
                        backgroundColor: nextNode ? nextNode.layerColor : node.layerColor,
                        opacity: 0.4,
                      }} />
                    )}

                    {/* Node circle — 16px */}
                    <div style={{
                      position: 'absolute',
                      left: '0',
                      top: '0',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      backgroundColor: node.layerColor,
                    }} />

                    {/* Content */}
                    <div style={{ paddingLeft: '28px' }}>
                      {/* Layer label — first node of each layer */}
                      {showLabel && (
                        <div style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          color: node.layerColor,
                          marginBottom: '2px',
                        }}>
                          {node.layerName}
                        </div>
                      )}

                      {/* Week number */}
                      <div style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: COLORS.driftwood,
                        marginBottom: '2px',
                      }}>
                        Vecka {node.weekNumber}
                      </div>

                      {/* Card title */}
                      <div style={{
                        fontFamily: '"DM Serif Display", serif',
                        fontSize: '16px',
                        fontWeight: 400,
                        color: COLORS.lanternGlow,
                        lineHeight: 1.3,
                      }}>
                        {node.cardTitle}
                      </div>

                      {/* Takeaway preview */}
                      {node.takeawayPreview && (
                        <div style={{
                          fontSize: '13px',
                          fontStyle: 'italic',
                          color: COLORS.driftwoodBody,
                          marginTop: '4px',
                          lineHeight: 1.4,
                        }}>
                          {node.takeawayPreview.length > 30
                            ? node.takeawayPreview.slice(0, 30) + '…'
                            : node.takeawayPreview}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Screen 3: Data Mirror ── */}
        <div style={{
          width: '100vw',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          padding: '48px 32px',
        }}>
          {insightsLoading ? (
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <p style={{
                color: COLORS.driftwood,
                fontSize: '15px',
                fontStyle: 'italic',
              }}>
                Laddar…
              </p>
            </div>
          ) : insights?.has_sufficient_data ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {insights.max_delta_card && (
                <div style={{ textAlign: 'center' }}>
                  <p style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: COLORS.driftwood,
                    marginBottom: '4px',
                  }}>
                    Här var ni längst ifrån varandra
                  </p>
                  <p style={{
                    fontFamily: '"DM Serif Display", serif',
                    fontSize: '20px',
                    fontWeight: 400,
                    color: COLORS.lanternGlow,
                  }}>
                    {getCardTitleFromId(insights.max_delta_card.card_id)}
                  </p>
                </div>
              )}

              {insights.min_delta_card && (
                <div style={{ textAlign: 'center' }}>
                  <p style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: COLORS.driftwood,
                    marginBottom: '4px',
                  }}>
                    Här var ni närmast
                  </p>
                  <p style={{
                    fontFamily: '"DM Serif Display", serif',
                    fontSize: '20px',
                    fontWeight: 400,
                    color: COLORS.lanternGlow,
                  }}>
                    {getCardTitleFromId(insights.min_delta_card.card_id)}
                  </p>
                </div>
              )}

              <div style={{ textAlign: 'center' }}>
                <p style={{
                  fontSize: '15px',
                  color: COLORS.driftwoodBody,
                  lineHeight: 1.6,
                }}>
                  Ni skrev {insights.total_reflections} tankar under resan
                </p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <p style={{
                fontSize: '15px',
                color: COLORS.driftwoodBody,
                lineHeight: 1.6,
                textAlign: 'center',
              }}>
                Ni gick igenom programmet på ert eget sätt — några veckor
                hoppades över, några pausades. Det är okej. Det viktiga
                är att ni är här.
              </p>

              <p style={{
                fontSize: '15px',
                color: COLORS.driftwoodBody,
                textAlign: 'center',
              }}>
                Ni skrev {insights?.total_reflections ?? 0} tankar under resan
              </p>

              <p style={{
                fontSize: '13px',
                color: COLORS.driftwood,
                textAlign: 'center',
              }}>
                Vad minns ni mest?
              </p>

              <textarea
                value={screen3Reflection}
                onChange={(e) => setScreen3Reflection(e.target.value)}
                placeholder=""
                style={{
                  width: '100%',
                  minHeight: '120px',
                  background: COLORS.emberGlow,
                  color: COLORS.lanternGlow,
                  border: 'none',
                  borderRadius: '12px',
                  padding: '16px',
                  fontSize: '16px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  outline: 'none',
                }}
              />
            </div>
          )}
        </div>

        {/* ── Screen 4: Placeholder ── */}
        <div style={{
          width: '100vw',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <p style={{ color: COLORS.driftwood, fontSize: '15px' }}>
            Screen 4 — coming soon
          </p>
        </div>

        {/* ── Screen 5: Placeholder ── */}
        <div style={{
          width: '100vw',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <p style={{ color: COLORS.driftwood, fontSize: '15px' }}>
            Screen 5 — coming soon
          </p>
        </div>
      </div>
    </div>
  );
}
