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
import { getCalmInterior } from '@/lib/productTileVariants';
import { productDarkText } from '@/lib/palette';
import { useCardImage } from '@/hooks/useCardImage';

import { useDevState } from '@/contexts/DevStateContext';
import { isDemoMode } from '@/lib/demoMode';
import { DEMO_SESSION_EVENT, getMostRecentDemoSession } from '@/lib/demoSession';

import illustrationStillUs from '@/assets/illustration-still-us-tile.png';
import illustrationJagIMig from '@/assets/illustration-jag-i-mig.png';
import illustrationJagMedAndra from '@/assets/illustration-jag-med-andra.png';
import illustrationJagIVarlden from '@/assets/illustration-jag-i-varlden.png';
import illustrationSexualitet from '@/assets/illustration-sexualitet.png';
import illustrationSyskon from '@/assets/illustration-syskon.png';
import illustrationVardag from '@/assets/illustration-vardag.png';

const ILLUSTRATIONS: Record<string, string> = {
  still_us: illustrationStillUs,
  jag_i_mig: illustrationJagIMig,
  jag_med_andra: illustrationJagMedAndra,
  jag_i_varlden: illustrationJagIVarlden,
  sexualitetskort: illustrationSexualitet,
  syskonkort: illustrationSyskon,
  vardagskort: illustrationVardag,
};

const LANTERN_GLOW = '#FDF6E3';

const PRODUCT_ACCENT: Record<string, string> = {
  still_us: '#6495ED',
  jag_i_mig: '#E89B6B',
  jag_med_andra: '#CB7AB2',
  jag_i_varlden: '#C6D423',
  vardagskort: '#8BDDB0',
  syskonkort: '#CF8BDD',
  sexualitetskort: '#B87560',
};

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
  const cardIllustration = useCardImage(display?.cardId ?? null);
  if (!display) return null;

  const accent = PRODUCT_ACCENT[display.productId] ?? '#A8B5C9';
  const isStillUs = display.productId === 'still_us';
  const innerColor = isStillUs
    ? '#5A85D5'
    : getCalmInterior(display.productId, accent);
  const darkText = productDarkText[display.productId] ?? '#5A3A1F';
  const illustration = cardIllustration ?? ILLUSTRATIONS[display.productId];

  return (
    <button
      onClick={() => navigate(`/card/${display.cardId}`)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        width: '100%',
        padding: '11px 13px',
        borderRadius: '14px',
        background: `color-mix(in srgb, ${accent} 10%, transparent)`,
        border: `1px solid color-mix(in srgb, ${accent} 22%, transparent)`,
        cursor: 'pointer',
        textAlign: 'left',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {/* Ring + medallion */}
      <div
        aria-hidden="true"
        style={{
          position: 'relative',
          width: 46,
          height: 46,
          flexShrink: 0,
        }}
      >
        {(() => {
          const match = display.stepLabel.match(/(\d+)\s*av\s*(\d+)/);
          const current = match ? parseInt(match[1], 10) : 0;
          const total = match ? parseInt(match[2], 10) : 0;
          const pct = total > 0 ? (current - 1) / total : 0;
          const r = 21;
          const c = 2 * Math.PI * r;
          const offset = c * (1 - pct);
          return (
            <svg
              width="46"
              height="46"
              viewBox="0 0 46 46"
              style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}
            >
              <circle cx="23" cy="23" r={r} fill="none"
                stroke="rgba(245,232,204,0.15)" strokeWidth="2" />
              <circle cx="23" cy="23" r={r} fill="none"
                stroke="#E9B44C" strokeWidth="2"
                strokeDasharray={c}
                strokeDashoffset={offset}
                strokeLinecap="round" />
            </svg>
          );
        })()}

        <div
          style={{
            position: 'absolute',
            inset: 4,
            borderRadius: isStillUs ? '50%' : 8,
            background: accent,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isStillUs ? (
            <img
              src={ILLUSTRATIONS.still_us}
              alt=""
              style={{
                maxWidth: '88%',
                maxHeight: '88%',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
                objectPosition: 'center',
                pointerEvents: 'none',
                filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.25))',
              }}
            />
          ) : (
            <div
              style={{
                position: 'absolute',
                inset: 3,
                borderRadius: 5,
                background: innerColor,
                border: `1px solid ${darkText}30`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              {illustration && (
                <img
                  src={illustration}
                  alt=""
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    objectPosition: 'center',
                    padding: 3,
                    boxSizing: 'border-box',
                    pointerEvents: 'none',
                  }}
                />
              )}
            </div>
          )}
        </div>
      </div>

      <p
        style={{
          flex: 1,
          fontFamily: 'var(--font-display)',
          fontSize: 14,
          fontWeight: 500,
          color: 'rgba(255, 255, 255, 0.92)',
          lineHeight: 1.2,
          margin: 0,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {display.cardTitle}
      </p>

      <ChevronRight
        size={20}
        strokeWidth={1.5}
        color={accent}
        aria-hidden="true"
        style={{ flexShrink: 0 }}
      />
    </button>
  );
}


