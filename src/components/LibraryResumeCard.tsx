/**
 * LibraryResumeCard — Paused-session resume card for the product library screen.
 * Quiet sister-surface to the tiles: dark Deep Dusk surface, ghost-glow dot,
 * product name as headline, chevron affordance. Whole banner is the action.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import { getProductById } from '@/data/products';
import { KIDS_PRODUCT_IDS } from '@/hooks/useKidsProductProgress';

import { useDevState } from '@/contexts/DevStateContext';
import { isDemoMode } from '@/lib/demoMode';
import { DEMO_SESSION_EVENT, getMostRecentDemoSession } from '@/lib/demoSession';

const LANTERN_GLOW = '#FDF6E3';

interface ResumeData {
  productId: string;
  productSlug: string;
  categoryId: string;
  productName: string;
  cardTitle: string;
  cardId: string;
  stepLabel: string;
}

interface LibraryResumeCardProps {
  activeTab?: 'barn' | 'par';
  /** When true, shows resume for any product (no tab filter) with product-colored bg */
  global?: boolean;
  forceMock?: boolean;
}

export default function LibraryResumeCard({ activeTab, global, forceMock }: LibraryResumeCardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { space } = useCoupleSpaceContext();
  const [resume, setResume] = useState<ResumeData | null>(null);
  const devState = useDevState();

  // Dev mock
  const showMock = forceMock || devState === 'library' || devState === 'pairedActive';
  const devMock: ResumeData | null = showMock
    ? (global || activeTab === 'barn')
      ? { productId: 'jag_i_mig', productSlug: 'jag-i-mig', categoryId: 'jim-vem-ar-jag', productName: 'Jag i Mig', cardTitle: 'Glad', cardId: 'jim-glad', stepLabel: 'Pausad vid Fråga 2 av 5' }
      : { productId: 'still_us', productSlug: 'still-us', categoryId: 'su-mock-vardagen', productName: 'Vårt Vi', cardTitle: 'Att lyssna på riktigt', cardId: 'su-kommunikation-1', stepLabel: 'Pausad vid VÄND · Fråga 1 av 3' }
    : null;

  const fetchRef = useRef(0);

  const fetchFromDb = useCallback(async () => {
    if (!space?.id) return;

    const fetchId = ++fetchRef.current;

    const { data } = await supabase
      .from('couple_sessions')
      .select('id, card_id, category_id, product_id, last_activity_at')
      .eq('couple_space_id', space.id)
      .eq('status', 'active')
      .order('last_activity_at', { ascending: false });

    if (fetchId !== fetchRef.current || !data || data.length === 0) {
      if (fetchId === fetchRef.current) setResume(null);
      return;
    }

    let filtered = data;
    if (!global && activeTab) {
      const isKids = (pid: string) => KIDS_PRODUCT_IDS.includes(pid);
      filtered = data.filter(s =>
        activeTab === 'barn' ? isKids(s.product_id) : s.product_id === 'still_us'
      );
    }

    if (filtered.length === 0) {
      if (fetchId === fetchRef.current) setResume(null);
      return;
    }

    const session = filtered[0];
    const product = getProductById(session.product_id);
    if (!product || !session.card_id) {
      if (fetchId === fetchRef.current) setResume(null);
      return;
    }

    const card = product.cards.find(c => c.id === session.card_id);
    if (!card) {
      if (fetchId === fetchRef.current) setResume(null);
      return;
    }

    let stepLabel = '';
    const { data: reflections } = await supabase
      .from('step_reflections')
      .select('step_index')
      .eq('session_id', session.id)
      .order('step_index', { ascending: false })
      .limit(1);

    if (fetchId === fetchRef.current) {
      const totalPrompts = card.sections?.reduce(
        (sum, s) => sum + (s.prompts?.length ?? 0), 0
      ) ?? 0;
      if (reflections && reflections.length > 0) {
        const currentPrompt = (reflections[0].step_index % 100) + 1; // 1-indexed for display
        stepLabel = totalPrompts > 1
          ? `Fråga ${Math.min(currentPrompt, totalPrompts)} av ${totalPrompts}`
          : '';
      } else {
        stepLabel = totalPrompts > 1
          ? `Fråga 1 av ${totalPrompts}`
          : '';
      }
    }

    if (fetchId === fetchRef.current) {
      setResume({
        productId: session.product_id,
        productSlug: product.slug,
        categoryId: session.category_id ?? product.categories?.[0]?.id ?? '',
        productName: product.name,
        cardTitle: card.title,
        cardId: session.card_id,
        stepLabel: stepLabel ? `Pausad vid ${stepLabel}` : 'Pausad',
        
      });
    }
  }, [space?.id, activeTab, global]);

  useEffect(() => {
    if (devMock) return;

    const isLocalPreview =
      isDemoMode() || devState === 'library' || devState === 'pairedActive';
    const syncLocalPreview = () => {
      const demoSession = getMostRecentDemoSession();
      if (demoSession) {
        const product = getProductById(demoSession.productId);
        if (product) {
          const card = product.cards.find(c => c.id === demoSession.cardId);
          if (card) {
            const totalPrompts = card.sections?.reduce(
              (sum, s) => sum + (s.prompts?.length ?? 0), 0
            ) ?? 0;
            const stepLabel = totalPrompts > 1
              ? `Fråga ${demoSession.currentStepIndex + 1} av ${totalPrompts}`
              : 'Frågor';
            setResume({
              productId: product.id,
              productSlug: product.slug,
              categoryId: demoSession.categoryId,
              productName: product.name,
              cardTitle: card.title,
              cardId: demoSession.cardId,
              stepLabel: `Pausad vid ${stepLabel}`,
              
            });
            return;
          }
        }
      }
      setResume(null);
    };

    if (isLocalPreview) {
      syncLocalPreview();
      window.addEventListener(DEMO_SESSION_EVENT, syncLocalPreview);
      window.addEventListener('storage', syncLocalPreview);
      return () => {
        window.removeEventListener(DEMO_SESSION_EVENT, syncLocalPreview);
        window.removeEventListener('storage', syncLocalPreview);
      };
    }

    if (!space?.id) {
      setResume(null);
      return;
    }

    fetchFromDb();
  }, [space?.id, activeTab, global, location.key, devState, fetchFromDb]);

  // Realtime: re-fetch when session status changes in this space
  useEffect(() => {
    if (
      isDemoMode() ||
      devState === 'library' ||
      devState === 'pairedActive' ||
      !space?.id
    ) return;

    let debounceTimer: ReturnType<typeof setTimeout> | undefined;

    const channel = supabase
      .channel(`lib-resume-card-rt-${space.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'couple_sessions',
          filter: `couple_space_id=eq.${space.id}`,
        },
        () => {
          if (debounceTimer) clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => fetchFromDb(), 500);
        }
      )
      .subscribe();

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      supabase.removeChannel(channel);
    };
  }, [space?.id, devState, fetchFromDb]);

  const display = devMock || resume;
  if (!display) return null;

  return (
    <button
      onClick={() => navigate(`/card/${display.cardId}`)}
      style={{
        width: '100%',
        padding: '12px 16px',
        background: '#2A2D3A',
        border: '0.5px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '14px',
        cursor: 'pointer',
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {/* Ghost-glow dot — quiet active-session signal */}
      <span
        aria-hidden="true"
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: '#D4F5C0',
          boxShadow: '0 0 8px rgba(212, 245, 192, 0.5)',
          flexShrink: 0,
          display: 'inline-block',
        }}
      />

      {/* Text block */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontFamily: 'Fraunces, serif',
            fontSize: '14.5px',
            fontWeight: 500,
            color: '#FFFFFF',
            lineHeight: 1.15,
            margin: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {display.productName}
        </p>
        <p
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '11px',
            color: 'rgba(255, 255, 255, 0.55)',
            lineHeight: 1.3,
            margin: '2px 0 0',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {display.stepLabel} · {display.cardTitle}
        </p>
      </div>

      {/* Chevron affordance */}
      <ChevronRight
        size={16}
        style={{
          color: LANTERN_GLOW,
          opacity: 0.5,
          flexShrink: 0,
        }}
        aria-hidden="true"
      />
    </button>
  );
}

