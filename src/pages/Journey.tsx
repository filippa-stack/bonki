/**
 * Journey — "ERA SAMTAL" tab content.
 * Zone 1: Horizontal curved timeline with 22 nodes.
 * Zone 2: Layer-grouped card entries with expandable reflections.
 * Zone 3: Journey insights, Tillbaka section, ceremony reflection.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { COLORS, getLayerForCard } from '@/lib/stillUsTokens';
import sliderPrompts, { getSliderSet } from '@/data/sliderPrompts';
import layerIntros from '@/data/layerIntros';
import tillbakaCards from '@/data/tillbakaCards';
import { computeJourneyInsights } from '@/lib/stillUsRpc';
import { supabase } from '@/integrations/supabase/client';

type NodeStatus = 'completed' | 'skipped' | 'current' | 'future';

interface CardEntry {
  cardIndex: number;
  weekNumber: number;
  cardTitle: string;
  layerName: string;
  layerColor: string;
  isCompleted: boolean;
  isSkipped: boolean;
  isCurrent: boolean;
  completedAt: string | null;
  session1Takeaway: string | null;
  takeaway: string | null;
  checkinReflection: string | null;
  notes: Record<string, unknown> | null;
}

const LAYER_KEYS = ['Grunden', 'Normen', 'Konflikten', 'Längtan', 'Valet'];

export default function Journey() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [cardEntries, setCardEntries] = useState<CardEntry[]>([]);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [coupleState, setCoupleState] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [selectedCycle, setSelectedCycle] = useState<number | null>(null);
  const [maxCycle, setMaxCycle] = useState(1);
  const [tillbakaEntries, setTillbakaEntries] = useState<any[]>([]);
  const [ceremonyReflection, setCeremonyReflection] = useState<string | null>(null);

  // Initial load: get couple_state and set maxCycle
  useEffect(() => {
    const fetchCouple = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: couple } = await supabase
        .from('couple_state')
        .select('*')
        .or(`initiator_id.eq.${user.id},partner_id.eq.${user.id}`)
        .maybeSingle();

      if (!couple) return;
      setCoupleState(couple);
      setMaxCycle(couple.cycle_id);
      if (selectedCycle === null) setSelectedCycle(couple.cycle_id);
    };
    fetchCouple();
  }, []);

  // Re-fetch data whenever selectedCycle changes
  useEffect(() => {
    if (!coupleState || selectedCycle === null) return;

    const fetchCycleData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const cycleId = selectedCycle;

      const [{ data: cardStates }, { data: sessionStates }] = await Promise.all([
        supabase
          .from('user_card_state')
          .select('card_id, slider_responses, checkin_reflection, session_1_takeaway, takeaway, notes, slider_completed_at')
          .eq('user_id', user.id)
          .eq('couple_id', coupleState.couple_id)
          .eq('cycle_id', cycleId),
        supabase
          .from('session_state')
          .select('card_id, completed_at, skip_status, session_type')
          .eq('couple_id', coupleState.couple_id)
          .eq('cycle_id', cycleId),
      ]);

      const currentCardIndex = cycleId === coupleState.cycle_id ? coupleState.current_card_index : 22;

      const entries: CardEntry[] = sliderPrompts.map((card, index) => {
        const cardId = card.cardId;
        const userState = cardStates?.find(s => s.card_id === cardId);
        const sessState = sessionStates?.find(s => s.card_id === cardId);
        const layer = getLayerForCard(index);
        const isCompleted = !!sessState?.completed_at;
        const isSkipped = sessState?.skip_status === 'user_skipped' || sessState?.skip_status === 'auto_advanced';
        const isCurrent = index === currentCardIndex && !isCompleted && cycleId === coupleState.cycle_id;

        return {
          cardIndex: index,
          weekNumber: index + 1,
          cardTitle: card.cardTitle,
          layerName: layer.name,
          layerColor: layer.color,
          isCompleted,
          isSkipped,
          isCurrent,
          completedAt: sessState?.completed_at ?? null,
          session1Takeaway: userState?.session_1_takeaway ?? null,
          takeaway: userState?.takeaway ?? null,
          checkinReflection: userState?.checkin_reflection ?? null,
          notes: userState?.notes as Record<string, unknown> | null,
        };
      });

      setCardEntries(entries);
      setExpandedCards(new Set());

      // Journey insights
      try {
        const insightsResult = await computeJourneyInsights({
          couple_id: coupleState.couple_id,
          cycle_id: cycleId,
        });
        setInsights(insightsResult);
      } catch {
        setInsights(null);
      }

      // Tillbaka entries
      if (coupleState.phase === 'maintenance' || coupleState.phase === 'second_cycle') {
        const [{ data: tillbakaStates }, { data: tillbakaTakeaways }] = await Promise.all([
          supabase
            .from('session_state')
            .select('card_id, completed_at, session_type')
            .eq('couple_id', coupleState.couple_id)
            .eq('cycle_id', cycleId)
            .eq('session_type', 'tillbaka'),
          supabase
            .from('user_card_state')
            .select('card_id, takeaway')
            .eq('user_id', user.id)
            .eq('couple_id', coupleState.couple_id)
            .eq('cycle_id', cycleId),
        ]);

        const tbEntries = tillbakaCards.map((card, index) => {
          const cardId = `tillbaka_${index + 1}`;
          const sessState = tillbakaStates?.find(s => s.card_id === cardId);
          const userState = tillbakaTakeaways?.find(s => s.card_id === cardId);
          return {
            index,
            title: card.title,
            completedAt: sessState?.completed_at ?? null,
            takeaway: userState?.takeaway ?? null,
            isCompleted: !!sessState?.completed_at,
          };
        });
        setTillbakaEntries(tbEntries);
      } else {
        setTillbakaEntries([]);
      }

      // Ceremony reflection
      if (cycleId === coupleState.cycle_id && coupleState.ceremony_reflection) {
        setCeremonyReflection(coupleState.ceremony_reflection);
      } else {
        const { data: archive } = await supabase
          .from('ceremony_reflection_archive')
          .select('reflection')
          .eq('couple_id', coupleState.couple_id)
          .eq('cycle_id', cycleId)
          .maybeSingle();
        setCeremonyReflection(archive?.reflection ?? null);
      }
    };
    fetchCycleData();
  }, [coupleState, selectedCycle]);

  const toggleCard = useCallback((index: number) => {
    setExpandedCards(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, []);

  const getCardTitleFromId = (cardId: string): string => {
    const index = parseInt(cardId.replace('card_', ''), 10) - 1;
    const set = getSliderSet(index);
    return set?.cardTitle ?? `Vecka ${index + 1}`;
  };

  // Build timeline nodes from real data (falls back to static placeholders if no entries yet)
  const timelineNodes = sliderPrompts.map((card, index) => {
    const layer = getLayerForCard(index);
    const entry = cardEntries.find(e => e.cardIndex === index);
    return {
      weekNumber: index + 1,
      cardTitle: card.cardTitle,
      layerName: layer.name,
      layerColor: layer.color,
      status: (entry?.isCompleted ? 'completed'
        : entry?.isSkipped ? 'skipped'
        : entry?.isCurrent ? 'current'
        : cardEntries.length === 0 ? 'future'
        : 'future') as NodeStatus,
    };
  });

  return (
    <div style={{
      minHeight: '100dvh',
      backgroundColor: COLORS.emberNight,
      paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 0px))',
    }}>
      {/* ── Multi-cycle toggle ── */}
      {maxCycle > 1 && (
        <div style={{
          display: 'flex', gap: '8px', justifyContent: 'center',
          padding: '16px 24px 0',
        }}>
          {Array.from({ length: maxCycle }, (_, i) => i + 1).map(cycle => (
            <button
              key={cycle}
              onClick={() => setSelectedCycle(cycle)}
              style={{
                padding: '8px 20px', borderRadius: '20px', border: 'none',
                fontSize: '14px', fontFamily: "'DM Serif Display', serif",
                cursor: 'pointer',
                background: selectedCycle === cycle ? COLORS.deepSaffron : 'transparent',
                color: selectedCycle === cycle ? COLORS.emberNight : COLORS.driftwood,
              }}
            >
              Resa {cycle}
            </button>
          ))}
        </div>
      )}
      {/* ── Zone 1: Horizontal scrollable timeline ── */}
      <div
        ref={scrollRef}
        style={{
          height: '30vh',
          minHeight: '200px',
          overflowX: 'auto',
          overflowY: 'hidden',
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
        }}
      >
        <style>{`
          .journey-timeline-scroll::-webkit-scrollbar { display: none; }
        `}</style>
        <div
          className="journey-timeline-scroll"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0px',
            paddingRight: '24px',
          }}
        >
          {timelineNodes.map((node, i) => {
            const isLast = i === timelineNodes.length - 1;
            const isCurrent = node.status === 'current';
            const isCompleted = node.status === 'completed';
            const isSkipped = node.status === 'skipped';
            const nodeSize = isCurrent ? 20 : 14;

            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  position: 'relative',
                }}
              >
                {/* Week label */}
                <div style={{
                  fontSize: '10px',
                  color: isCurrent ? node.layerColor : COLORS.driftwood,
                  opacity: isCurrent ? 1 : 0.5,
                  marginBottom: '6px',
                  whiteSpace: 'nowrap',
                  fontWeight: isCurrent ? 600 : 400,
                }}>
                  v.{node.weekNumber}
                </div>

                {/* Row: node + connector */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {/* Node circle */}
                  <div style={{
                    width: nodeSize,
                    height: nodeSize,
                    borderRadius: '50%',
                    backgroundColor: isCompleted || isCurrent
                      ? node.layerColor
                      : isSkipped
                        ? `${node.layerColor}60`
                        : 'transparent',
                    border: !isCompleted && !isCurrent && !isSkipped
                      ? `1.5px solid ${COLORS.driftwood}40`
                      : 'none',
                    boxShadow: isCurrent
                      ? `0 0 12px ${node.layerColor}80`
                      : 'none',
                    flexShrink: 0,
                    transition: 'all 0.3s ease',
                  }} />

                  {/* Connector line */}
                  {!isLast && (
                    <div style={{
                      width: '24px',
                      height: '2px',
                      backgroundColor: isCompleted || isSkipped
                        ? node.layerColor
                        : `${COLORS.driftwood}30`,
                      flexShrink: 0,
                    }} />
                  )}
                </div>

                {/* Card title (shown for current only) */}
                {isCurrent && (
                  <div style={{
                    fontSize: '11px',
                    color: node.layerColor,
                    marginTop: '6px',
                    whiteSpace: 'nowrap',
                    fontWeight: 500,
                    maxWidth: '80px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {node.cardTitle}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Zone 2: Card entries grouped by layer ── */}
      <div style={{ padding: '0 24px 32px' }}>
        {LAYER_KEYS.map((layerName, layerIdx) => {
          const layerCards = cardEntries.filter(e => e.layerName === layerName);
          if (layerCards.length === 0) return null;
          const layerColor = layerCards[0].layerColor;
          const intro = layerIntros[layerIdx];

          return (
            <div key={layerName} style={{ marginBottom: '32px' }}>
              {/* Layer header */}
              <div style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: '22px',
                color: layerColor,
                marginBottom: '4px',
              }}>
                {layerName}
              </div>
              {intro && (
                <div style={{
                  fontSize: '14px',
                  color: COLORS.driftwoodBody,
                  fontStyle: 'italic',
                  marginBottom: '16px',
                }}>
                  {intro.intro}
                </div>
              )}

              {/* Card entries */}
              {layerCards.map(entry => {
                const isExpanded = expandedCards.has(entry.cardIndex);
                const hasTakeaways = entry.session1Takeaway || entry.takeaway || entry.checkinReflection;

                return (
                  <div
                    key={entry.cardIndex}
                    onClick={() => hasTakeaways && toggleCard(entry.cardIndex)}
                    style={{
                      padding: '12px 0',
                      borderBottom: `1px solid ${COLORS.emberMid}`,
                      opacity: entry.isSkipped ? 0.5 : 1,
                      cursor: hasTakeaways ? 'pointer' : 'default',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <div>
                        <span style={{
                          fontFamily: "'DM Serif Display', serif",
                          fontSize: '18px',
                          color: COLORS.lanternGlow,
                        }}>
                          Vecka {entry.weekNumber}
                        </span>
                        <span style={{
                          fontFamily: "'DM Serif Display', serif",
                          fontSize: '16px',
                          color: COLORS.lanternGlow,
                          marginLeft: '8px',
                          opacity: 0.8,
                        }}>
                          {entry.cardTitle}
                        </span>
                      </div>
                      {entry.completedAt && (
                        <span style={{ fontSize: '12px', color: COLORS.driftwood, flexShrink: 0, marginLeft: '8px' }}>
                          {new Date(entry.completedAt).toLocaleDateString('sv-SE')}
                        </span>
                      )}
                    </div>

                    {/* Expanded reflections */}
                    {isExpanded && (
                      <div style={{ marginTop: '12px', paddingLeft: '8px' }}>
                        {entry.session1Takeaway && (
                          <div style={{ marginBottom: '8px' }}>
                            <div style={{ fontSize: '12px', color: COLORS.driftwood, marginBottom: '4px' }}>
                              Efter samtal 1
                            </div>
                            <div style={{ fontSize: '14px', color: COLORS.driftwoodBody }}>
                              {entry.session1Takeaway}
                            </div>
                          </div>
                        )}
                        {entry.takeaway && (
                          <div style={{ marginBottom: '8px' }}>
                            <div style={{ fontSize: '12px', color: COLORS.driftwood, marginBottom: '4px' }}>
                              Efter samtal 2
                            </div>
                            <div style={{ fontSize: '14px', color: COLORS.driftwoodBody }}>
                              {entry.takeaway}
                            </div>
                          </div>
                        )}
                        {entry.checkinReflection && (
                          <div style={{ marginBottom: '8px' }}>
                            <div style={{ fontSize: '12px', color: COLORS.driftwood, marginBottom: '4px' }}>
                              Check-in
                            </div>
                            <div style={{ fontSize: '14px', color: COLORS.driftwoodBody, fontStyle: 'italic' }}>
                              {entry.checkinReflection}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* ── Zone 3: Journey Insights ── */}
      <div style={{ padding: '0 24px 32px' }}>
        {coupleState && coupleState.current_card_index < 21 && !insights?.has_sufficient_data ? (
          <div style={{
            fontSize: '15px', color: COLORS.driftwoodBody, fontStyle: 'italic',
            textAlign: 'center', padding: '24px 0',
          }}>
            Ni är på vecka {coupleState.current_card_index + 1}. Insikterna växer med er resa.
          </div>
        ) : insights?.has_sufficient_data ? (
          <div>
            {insights.max_delta_card && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', color: COLORS.driftwood, marginBottom: '4px' }}>
                  Här var ni längst ifrån varandra
                </div>
                <div style={{
                  fontFamily: "'DM Serif Display', serif", fontSize: '18px',
                  color: COLORS.lanternGlow,
                }}>
                  {getCardTitleFromId(insights.max_delta_card.card_id)}
                </div>
              </div>
            )}
            {insights.min_delta_card && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', color: COLORS.driftwood, marginBottom: '4px' }}>
                  Här var ni närmast
                </div>
                <div style={{
                  fontFamily: "'DM Serif Display', serif", fontSize: '18px',
                  color: COLORS.lanternGlow,
                }}>
                  {getCardTitleFromId(insights.min_delta_card.card_id)}
                </div>
              </div>
            )}
            <div style={{ fontSize: '14px', color: COLORS.driftwoodBody, marginTop: '8px' }}>
              Ni skrev {insights.total_reflections} tankar under resan
            </div>
          </div>
        ) : (
          <div style={{ fontSize: '14px', color: COLORS.driftwoodBody, textAlign: 'center', padding: '16px 0' }}>
            Ni skrev {insights?.total_reflections ?? 0} tankar under resan
          </div>
        )}
      </div>

      {/* ── Tillbaka section ── */}
      {tillbakaEntries.filter(e => e.isCompleted).length > 0 && (
        <div style={{ padding: '0 24px 32px' }}>
          <div style={{
            fontFamily: "'DM Serif Display', serif", fontSize: '22px',
            color: COLORS.deepSaffron, marginBottom: '16px',
          }}>
            Tillbaka
          </div>
          {tillbakaEntries.filter(e => e.isCompleted).map(entry => (
            <div key={entry.index} style={{
              padding: '12px 0',
              borderBottom: `1px solid ${COLORS.emberMid}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{
                  fontFamily: "'DM Serif Display', serif", fontSize: '16px',
                  color: COLORS.lanternGlow,
                }}>
                  {entry.title}
                </span>
                {entry.completedAt && (
                  <span style={{ fontSize: '12px', color: COLORS.driftwood, flexShrink: 0, marginLeft: '8px' }}>
                    {new Date(entry.completedAt).toLocaleDateString('sv-SE')}
                  </span>
                )}
              </div>
              {entry.takeaway && (
                <div style={{ marginTop: '8px', paddingLeft: '8px' }}>
                  <div style={{ fontSize: '12px', color: COLORS.driftwood, marginBottom: '4px' }}>
                    Efter samtalet
                  </div>
                  <div style={{ fontSize: '14px', color: COLORS.driftwoodBody }}>
                    {entry.takeaway}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Ceremony reflection ── */}
      {ceremonyReflection && (
        <div style={{ padding: '0 24px 48px' }}>
          <div style={{
            fontFamily: "'DM Serif Display', serif", fontSize: '20px',
            color: COLORS.deepSaffron, marginBottom: '12px',
          }}>
            Er ceremoni-reflektion
          </div>
          <div style={{
            fontSize: '15px', color: COLORS.driftwoodBody, lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
          }}>
            {ceremonyReflection}
          </div>
        </div>
      )}
    </div>
  );
}
