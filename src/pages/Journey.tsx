/**
 * Journey — "ERA SAMTAL" tab content.
 * Zone 1: Horizontal curved timeline with 22 nodes.
 * Zones 2–3: Placeholders for card entries + insights (Prompts 5.8, 5.9).
 */

import { useRef } from 'react';
import { COLORS, getLayerForCard } from '@/lib/stillUsTokens';
import sliderPrompts from '@/data/sliderPrompts';

type NodeStatus = 'completed' | 'current' | 'future';

const timelineNodes = sliderPrompts.map((card, index) => {
  const layer = getLayerForCard(index);
  return {
    weekNumber: index + 1,
    cardTitle: card.cardTitle,
    layerName: layer.name,
    layerColor: layer.color,
    // Placeholder states — Prompt 5.8 wires real data
    status: (index < 10 ? 'completed'
      : index === 10 ? 'current'
      : 'future') as NodeStatus,
  };
});

export default function Journey() {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div style={{
      minHeight: '100dvh',
      backgroundColor: COLORS.emberNight,
    }}>
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
                      : 'transparent',
                    border: !isCompleted && !isCurrent
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
                      backgroundColor: isCompleted
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

      {/* ── Zone 2 + Zone 3: Placeholder ── */}
      <div style={{
        padding: '32px 24px',
        textAlign: 'center',
        color: COLORS.driftwood,
        fontSize: '14px',
        opacity: 0.5,
      }}>
        Zone 2 + Zone 3 — coming in Prompts 5.8 and 5.9
      </div>
    </div>
  );
}
