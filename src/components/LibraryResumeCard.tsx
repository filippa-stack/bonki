/**
 * LibraryResumeCard — Paused-session resume card for the product library screen.
 * Shows the most recent paused session, filtered by the active tab (barn/par).
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import { getProductById } from '@/data/products';
import { KIDS_PRODUCT_IDS } from '@/hooks/useKidsProductProgress';
import { buildDynamicSteps } from '@/components/StepProgressIndicator';
import { useDevState } from '@/contexts/DevStateContext';

const DEEP_DUSK = '#2A2D3A';
const LANTERN_GLOW = '#FDF6E3';
const DRIFTWOOD = '#6B5E52';
const DEEP_SAFFRON = '#D4A03A';
const SAFFRON_FLAME = '#E9B44C';

interface ResumeData {
  productName: string;
  cardTitle: string;
  cardId: string;
  stepLabel: string;
  accentColor: string;
}

interface LibraryResumeCardProps {
  activeTab: 'barn' | 'par';
}

export default function LibraryResumeCard({ activeTab }: LibraryResumeCardProps) {
  const navigate = useNavigate();
  const { space } = useCoupleSpaceContext();
  const [resume, setResume] = useState<ResumeData | null>(null);
  const devState = useDevState();

  // Dev mock: show a fake resume card when devState is active
  const devMock: ResumeData | null = devState === 'library' || devState === 'pairedActive'
    ? activeTab === 'barn'
      ? { productName: 'Jag med Andra', cardTitle: 'Att vara duktig', cardId: 'jma-duktig', stepLabel: 'Pausad vid FRÅGA 2 AV 5', accentColor: SAFFRON_FLAME }
      : { productName: 'Still Us', cardTitle: 'Att lyssna på riktigt', cardId: 'su-kommunikation-1', stepLabel: 'Pausad vid VÄND · Fråga 1 av 3', accentColor: DEEP_SAFFRON }
    : null;

  useEffect(() => {
    if (devMock) return; // skip fetch when dev mock active
    if (!space?.id) {
      setResume(null);
      return;
    }

    let cancelled = false;

    (async () => {
      // Fetch all active sessions, most recent first
      const { data } = await supabase
        .from('couple_sessions')
        .select('id, card_id, category_id, product_id, last_activity_at')
        .eq('couple_space_id', space.id)
        .eq('status', 'active')
        .order('last_activity_at', { ascending: false });

      if (cancelled || !data || data.length === 0) {
        if (!cancelled) setResume(null);
        return;
      }

      // Filter by active tab
      const isKids = (pid: string) => KIDS_PRODUCT_IDS.includes(pid);
      const filtered = data.filter(s =>
        activeTab === 'barn' ? isKids(s.product_id) : s.product_id === 'still_us'
      );

      if (filtered.length === 0) {
        if (!cancelled) setResume(null);
        return;
      }

      const session = filtered[0];
      const product = getProductById(session.product_id);
      if (!product || !session.card_id) {
        if (!cancelled) setResume(null);
        return;
      }

      const card = product.cards.find(c => c.id === session.card_id);
      if (!card) {
        if (!cancelled) setResume(null);
        return;
      }

      // Determine step label
      let stepLabel = '';
      if (session.product_id === 'still_us') {
        // Fetch completions to determine current step
        const { data: completions } = await supabase
          .from('couple_session_completions')
          .select('step_index')
          .eq('session_id', session.id);

        if (!cancelled) {
          const completedSteps = new Set((completions || []).map(c => c.step_index));
          const effectiveSteps = card.sections?.map((s: { type: string }) => s.type) ?? [];
          const dynSteps = buildDynamicSteps(effectiveSteps, true);
          // Find first incomplete step
          let currentIdx = 0;
          for (let i = 0; i < dynSteps.length; i++) {
            if (!completedSteps.has(i)) { currentIdx = i; break; }
          }
          const step = dynSteps[currentIdx];
          if (step) {
            const section = card.sections?.[currentIdx];
            const promptCount = section?.prompts?.length ?? 0;
            stepLabel = promptCount > 1
              ? `${step.label.toUpperCase()} · Fråga 1 av ${promptCount}`
              : step.label.toUpperCase();
          }
        }
      } else {
        // Kids: fetch step completions
        const { data: completions } = await supabase
          .from('couple_session_completions')
          .select('step_index')
          .eq('session_id', session.id);

        if (!cancelled) {
          const completedCount = (completions || []).length;
          const totalPrompts = card.sections?.reduce(
            (sum, s) => sum + (s.prompts?.length ?? 0), 0
          ) ?? 0;
          stepLabel = totalPrompts > 1
            ? `Fråga ${completedCount + 1} av ${totalPrompts}`
            : 'Frågor';
        }
      }

      if (!cancelled) {
        setResume({
          productName: product.name,
          cardTitle: card.title,
          cardId: session.card_id,
          stepLabel: stepLabel ? `Pausad vid ${stepLabel}` : 'Pausad',
          accentColor: session.product_id === 'still_us' ? DEEP_SAFFRON : SAFFRON_FLAME,
        });
      }
    })();

    return () => { cancelled = true; };
  }, [space?.id, activeTab]);

  const display = devMock || resume;
  if (!display) return null;

  return (
    <button
      onClick={() => navigate(`/card/${display.cardId}`, { state: { resumed: true } })}
      style={{
        width: 'calc(100% - 32px)',
        margin: '16px 16px 0',
        padding: '16px',
        background: DEEP_DUSK,
        borderLeft: `3px solid ${display.accentColor}`,
        borderTop: 'none',
        borderRight: 'none',
        borderBottom: 'none',
        borderRadius: '16px',
        cursor: 'pointer',
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: "var(--font-display)",
          fontVariationSettings: "'opsz' 17",
          fontSize: '17px',
          fontWeight: 600,
          color: LANTERN_GLOW,
          lineHeight: 1.3,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          margin: 0,
        }}>
          {display.productName} · {display.cardTitle}
        </p>
        <p style={{
          fontFamily: "var(--font-body)",
          fontSize: '13px',
          fontWeight: 400,
          color: DRIFTWOOD,
          lineHeight: 1.3,
          marginTop: '4px',
          margin: '4px 0 0',
        }}>
          {display.stepLabel}
        </p>
      </div>
      <span style={{
        fontFamily: "var(--font-body)",
        fontSize: '15px',
        fontWeight: 600,
        color: DEEP_SAFFRON,
        flexShrink: 0,
        marginLeft: '12px',
      }}>
        Fortsätt
      </span>
    </button>
  );
}
