import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import BonkiLoadingScreen from '@/components/BonkiLoadingScreen';
import KontoIcon from '@/components/KontoIcon';
import KontoSheet from '@/components/KontoSheet';
import { usePageBackground } from '@/hooks/usePageBackground';
import { motion, AnimatePresence } from 'framer-motion';
import { PREVIEW_QUESTIONS } from '@/lib/productPreviewQuestions';
import { CARD_SEQUENCE } from '@/data/stillUsSequence';
import { useCardImage } from '@/hooks/useCardImage';
import { useNavigate } from 'react-router-dom';
import { allProducts } from '@/data/products';
import { useAllProductAccess } from '@/hooks/useAllProductAccess';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import { supabase } from '@/integrations/supabase/client';
import { isDemoMode } from '@/lib/demoMode';
import { isProductHiddenOnPlatform } from '@/lib/platform';
import { MIDNIGHT_INK, productDarkText, TEXT_EYEBROW, CORNFLOWER, DUSTY_ROSE, STORM_GREY, WARM_GOLD } from '@/lib/palette';
import { getCalmInterior } from '@/lib/productTileVariants';
import KidsTileFrame from '@/components/KidsTileFrame';

import LibraryResumeCard from '@/components/LibraryResumeCard';
import BonkiLogoMark from '@/components/BonkiLogoMark';

import illustrationStillUs from '@/assets/illustration-still-us-tile.png';
import illustrationJagIMig from '@/assets/illustration-jag-i-mig.png';
import illustrationJagMedAndra from '@/assets/illustration-jag-med-andra.png';
import illustrationJagIVarlden from '@/assets/illustration-jag-i-varlden.png';
import illustrationSexualitet from '@/assets/illustration-sexualitet.png';
import illustrationSyskon from '@/assets/illustration-syskon.png';
import illustrationVardag from '@/assets/illustration-vardag.png';

const LANTERN_GLOW = '#FDF6E3';

const ILLUSTRATIONS: Record<string, string> = {
  jag_i_mig: illustrationJagIMig,
  jag_med_andra: illustrationJagMedAndra,
  jag_i_varlden: illustrationJagIVarlden,
  sexualitetskort: illustrationSexualitet,
  syskonkort: illustrationSyskon,
  vardagskort: illustrationVardag,
};

const TAGLINES: Record<string, string> = {
  still_us: 'Samtalen som dagen inte gav plats för',
  jag_i_mig: 'När känslor får ord',
  jag_med_andra: 'Att höra till',
  jag_i_varlden: 'Att hitta sin plats',
  vardagskort: 'Det vanliga, på djupet',
  syskonkort: 'När vi delar allt & inget',
  sexualitetskort: 'Kropp, gränser, identitet',
};

/** Per-product accent color. Mirrors manifest.tileLight. */
const TILE_COLORS: Record<string, { frame: string; interior: string; text: string }> = {
  jag_i_mig:       { frame: '#E89B6B', interior: '#F2BC97', text: '#5A3A1F' },
  jag_med_andra:   { frame: '#CB7AB2', interior: '#DCA1C8', text: '#FAEDF2' },
  jag_i_varlden:   { frame: '#C6D423', interior: '#D4DE48', text: '#2E2D08' },
  vardagskort:     { frame: '#8BDDB0', interior: '#C4F0DA', text: '#0E2E22' },
  syskonkort:      { frame: '#CF8BDD', interior: '#EAC8EE', text: '#2A1F40' },
  sexualitetskort: { frame: '#B87560', interior: '#CFA08D', text: '#FAEDE5' },
};

const PRODUCT_ACCENT: Record<string, string> = {
  still_us: '#6495ED',
  jag_i_mig: '#E89B6B',
  jag_med_andra: '#CB7AB2',
  jag_i_varlden: '#C6D423',
  vardagskort: '#8BDDB0',
  syskonkort: '#CF8BDD',
  sexualitetskort: '#B87560',
};

const VI_TAB_HERO_COLOR = STORM_GREY;
const PREVIEW_TILE_COLORS = [CORNFLOWER, DUSTY_ROSE, WARM_GOLD, STORM_GREY];

const tileVariants = {
  hidden: { opacity: 1, y: 0, scale: 1 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

/* ── Editorial library header ─────────────────────────────────────────── */
/* ── Tab bar ───────────────────────────────────────────────────────────── */
function TabBar({
  active,
  onChange,
}: {
  active: 'vi' | 'barnen';
  onChange: (t: 'vi' | 'barnen') => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Bibliotek"
      style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 32,
        marginBottom: 20,
      }}
    >
      {(['vi', 'barnen'] as const).map((tab) => {
        const isActive = active === tab;
        const label = tab === 'vi' ? 'Vi' : 'Barnen';
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab)}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 22,
              fontWeight: 500,
              color: LANTERN_GLOW,
              opacity: isActive ? 1 : 0.42,
              letterSpacing: '-0.005em',
              background: 'none',
              border: 'none',
              padding: '0 0 8px',
              cursor: 'pointer',
              position: 'relative',
              transition: 'opacity 200ms ease',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {label}
            {isActive && (
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: 2,
                  borderRadius: 1,
                  background: WARM_GOLD,
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ── Vårt Vi hero — Storm Grey surface for the Vi tab ─────────────────── */
function VartViHero({
  totalCards,
  completedCount,
  isPurchased,
  onClick,
}: {
  totalCards: number;
  completedCount: number;
  isPurchased: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 18px 22px',
        borderRadius: 16,
        background: VI_TAB_HERO_COLOR,
        border: 'none',
        boxShadow: '0 0 0 1px rgba(255,255,255,0.06)',
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
        textAlign: 'center',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 11,
          fontWeight: 500,
          color: LANTERN_GLOW,
          opacity: 0.55,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          marginBottom: 18,
          display: 'block',
        }}
      >
        För er som par
      </span>
      <img
        src={illustrationStillUs}
        alt=""
        draggable={false}
        style={{
          width: 'auto',
          height: 'auto',
          maxWidth: 150,
          maxHeight: 150,
          objectFit: 'contain',
          objectPosition: 'center',
          pointerEvents: 'none',
          filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.30))',
          marginBottom: 16,
          display: 'block',
        }}
      />
      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 30,
          fontWeight: 500,
          color: LANTERN_GLOW,
          lineHeight: 1,
          letterSpacing: '-0.01em',
          margin: '0 0 16px',
          fontVariationSettings: "'opsz' 30",
        }}
      >
        Vårt Vi
      </h3>
      {isPurchased && completedCount > 0 ? (
        <div style={{ width: '60%', maxWidth: 180 }}>
          <div
            style={{
              height: 2,
              background: 'rgba(245,232,204,0.22)',
              borderRadius: 1,
              overflow: 'hidden',
              marginBottom: 7,
            }}
          >
            <div
              style={{
                width: `${Math.min(100, (completedCount / totalCards) * 100)}%`,
                height: '100%',
                background: WARM_GOLD,
                borderRadius: 1,
              }}
            />
          </div>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 10,
              fontWeight: 500,
              color: LANTERN_GLOW,
              opacity: 0.65,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              textAlign: 'center',
              margin: 0,
            }}
          >
            {completedCount} av {totalCards}
          </p>
        </div>
      ) : (
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 10,
            fontWeight: 500,
            color: LANTERN_GLOW,
            opacity: 0.65,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            margin: 0,
          }}
        >
          {totalCards} samtal
        </p>
      )}
    </button>
  );
}

/* ── Vi tab preview strip — 4 expandable tiles ────────────────────────── */
function VartViPreviewStrip({
  isPurchased,
  completedCardIds,
  onUnpurchasedTileTap,
  onPurchasedTileTap,
}: {
  isPurchased: boolean;
  completedCardIds: Set<string>;
  onUnpurchasedTileTap: (index: number) => void;
  onPurchasedTileTap: (cardId: string) => void;
}) {
  if (!isPurchased) {
    const questions = (PREVIEW_QUESTIONS.still_us ?? []).slice(0, 4);
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
        }}
      >
        {questions.map((q, i) => (
          <motion.button
            key={i}
            type="button"
            layoutId={`preview-tile-${i}`}
            onClick={() => onUnpurchasedTileTap(i)}
            style={{
              background: PREVIEW_TILE_COLORS[i % PREVIEW_TILE_COLORS.length],
              borderRadius: 12,
              border: 'none',
              padding: '14px 12px',
              minHeight: 130,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
              boxShadow: '0 0 0 1px rgba(255,255,255,0.06)',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontSize: 14,
                lineHeight: 1.3,
                color: LANTERN_GLOW,
                textAlign: 'center',
              }}
            >
              {q}
            </span>
          </motion.button>
        ))}
      </div>
    );
  }

  // Always render 4 tiles: uncompleted first, then completed-as-revisit
  const uncompleted = CARD_SEQUENCE.filter(
    (seq) => !completedCardIds.has(`su-mock-${seq.index}`)
  );
  const completed = CARD_SEQUENCE.filter(
    (seq) => completedCardIds.has(`su-mock-${seq.index}`)
  ).reverse();

  const previewCards: Array<{ seq: typeof CARD_SEQUENCE[number]; isCompleted: boolean }> = [];
  for (const seq of uncompleted) {
    if (previewCards.length >= 4) break;
    previewCards.push({ seq, isCompleted: false });
  }
  for (const seq of completed) {
    if (previewCards.length >= 4) break;
    previewCards.push({ seq, isCompleted: true });
  }

  if (previewCards.length === 0) return null;

  const eyebrowLabel = uncompleted.length > 0 ? 'Nästa' : 'Era samtal';

  return (
    <div>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: LANTERN_GLOW,
          opacity: 0.55,
          margin: '0 0 12px',
        }}
      >
        {eyebrowLabel}
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
        }}
      >
        {previewCards.map(({ seq, isCompleted }, i) => (
          <PreviewCardPurchased
            key={seq.cardId}
            seqIndex={seq.index}
            title={seq.title}
            bgColor={PREVIEW_TILE_COLORS[i % PREVIEW_TILE_COLORS.length]}
            isCompleted={isCompleted}
            onClick={() => onPurchasedTileTap(`su-mock-${seq.index}`)}
          />
        ))}
      </div>
    </div>
  );
}

function PreviewCardPurchased({
  seqIndex,
  title,
  bgColor,
  isCompleted,
  onClick,
}: {
  seqIndex: number;
  title: string;
  bgColor: string;
  isCompleted: boolean;
  onClick: () => void;
}) {
  const muxId = `su-mock-${seqIndex}`;
  const image = useCardImage(muxId);
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        position: 'relative',
        background: bgColor,
        borderRadius: 12,
        border: 'none',
        padding: 10,
        minHeight: 130,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
        boxShadow: '0 0 0 1px rgba(255,255,255,0.06)',
        opacity: isCompleted ? 0.78 : 1,
      }}
    >
      {isCompleted && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 16,
            height: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
            <path
              d="M3.5 9.5 L7.5 13.5 L14.5 5.5"
              stroke="#E9B44C"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}

      {image ? (
        <img
          src={image}
          alt=""
          draggable={false}
          style={{
            maxWidth: 70,
            maxHeight: 70,
            objectFit: 'contain',
            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.25))',
            pointerEvents: 'none',
          }}
        />
      ) : (
        <div style={{ height: 70 }} />
      )}
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 13,
          fontWeight: 600,
          color: LANTERN_GLOW,
          textAlign: 'center',
          lineHeight: 1.2,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {title}
      </span>
    </button>
  );
}

/* ── Kids tile — title strip footer carries always-visible meta row ──── */
/* ── Library kids tile — delegates to KidsTileFrame primitive ─────────── */
function LibraryKidsTile({
  product,
  illustration,
  totalCards,
  completedCount,
  isPurchased,
  onClick,
}: {
  product: { id: string; name: string; ageLabel?: string };
  illustration?: string;
  totalCards: number;
  completedCount: number;
  isPurchased: boolean;
  onClick: () => void;
}) {
  const { frame, interior, text: darkText } = TILE_COLORS[product.id]
    ?? { frame: '#2A2D3A', interior: '#3A3D4A', text: '#5A3A1F' };
  const tasted = !isPurchased && completedCount > 0;

  // Defensive age parse — first integer from ageLabel, never "undefined+".
  const ageMatch = product.ageLabel?.match(/\d+/);
  const ageBadge = ageMatch ? `${ageMatch[0]}+` : null;

  // Progress fill — animated from 0 to target on mount.
  const progressPct = totalCards > 0 ? Math.min(100, (completedCount / totalCards) * 100) : 0;
  const progressFillRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!progressFillRef.current) return;
    const el = progressFillRef.current;
    el.style.width = '0%';
    const id = requestAnimationFrame(() => {
      el.style.width = `${progressPct}%`;
    });
    return () => cancelAnimationFrame(id);
  }, [progressPct]);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={product.name}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '3 / 4',
        borderRadius: 14,
        overflow: 'hidden',
        backgroundColor: frame,
        border: '1px solid rgba(255, 255, 255, 0.10)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)',
        padding: 0,
        cursor: 'pointer',
        display: 'block',
        textAlign: 'left',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {/* Inner zone — distinct rounded plate */}
      <div
        style={{
          position: 'absolute',
          top: 9,
          left: 9,
          right: 9,
          bottom: '26%',
          backgroundColor: interior,
          borderRadius: 12,
          border: `1px solid ${darkText}30`,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {illustration && (
          <img
            src={illustration}
            alt=""
            aria-hidden="true"
            draggable={false}
            style={{
              width: '92%',
              height: '92%',
              objectFit: 'contain',
              objectPosition: 'center',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Age badge — top-left of inner zone (only if ageLabel parses) */}
        {ageBadge && (
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: 8,
              left: 8,
              minWidth: 28,
              height: 22,
              padding: '0 6px',
              borderRadius: 6,
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.30)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-body)',
              fontSize: 11,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.85)',
              lineHeight: 1,
              pointerEvents: 'none',
            }}
          >
            {ageBadge}
          </div>
        )}

        {/* Progress bar — bottom of inner zone, animated fill */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 12,
            right: 12,
            bottom: 8,
            height: 2,
            borderRadius: 1,
            background: 'rgba(212,154,63,0.20)',
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        >
          <div
            ref={progressFillRef}
            style={{
              width: '0%',
              height: '100%',
              background: '#D49A3F',
              borderRadius: 1,
              transition: 'width 400ms ease-out',
            }}
          />
        </div>
      </div>

      {/* Hairline at inner-zone / title-strip seam */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: 9,
          right: 9,
          bottom: '24%',
          height: 1,
          backgroundColor: darkText,
          opacity: 0.25,
        }}
      />

      {/* Title strip — bottom 24%, sits on frame color */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '24%',
          padding: '6px 9px 8px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          gap: 4,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            width: '100%',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontVariationSettings: "'opsz' 24",
              fontSize: 16,
              fontWeight: 600,
              color: darkText,
              lineHeight: 1.1,
              textAlign: 'center',
            }}
          >
            {product.name}
          </span>
          {tasted && (
            <span style={{ display: 'inline-flex', color: darkText, opacity: 0.55, flexShrink: 0 }}>
              <BonkiLogoMark size={10} />
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

export default function ProductLibrary() {
  useLayoutEffect(() => {
    document.documentElement.classList.remove('theme-verdigris');
    document.body.classList.remove('verdigris-grain', 'verdigris-lightleak');
  }, []);
  usePageBackground(MIDNIGHT_INK);
  const navigate = useNavigate();
  const tracked = useRef(false);

  const { purchased, loading: accessLoading } = useAllProductAccess();
  useAuth();
  const [kontoOpen, setKontoOpen] = useState(false);
  const stillUsProduct = allProducts.find(p => p.id === 'still_us');
  const [activeTab, setActiveTab] = useState<'vi' | 'barnen'>('vi');
  const [expandedTileIndex, setExpandedTileIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!tracked.current) {
      tracked.current = true;
      import('@/lib/trackOnboarding').then(m => m.trackOnboardingEvent('lobby_view'));
    }
  }, []);

  // Fetch active sessions across all products for resume indicators
  const { space } = useCoupleSpaceContext();
  const [activeProductIds, setActiveProductIds] = useState<Set<string>>(new Set());
  const [completedCountMap, setCompletedCountMap] = useState<Record<string, number>>({});

  useEffect(() => {
    const syncLocalPreview = () => {
      if (!isDemoMode()) return;
      import('@/lib/demoSession').then(({ getAllDemoSessions }) => {
        setActiveProductIds(new Set(getAllDemoSessions().map(s => s.productId)));
      });
    };

    if (isDemoMode()) {
      syncLocalPreview();
      window.addEventListener('bonki:demo-session-changed', syncLocalPreview);
      window.addEventListener('storage', syncLocalPreview);
      return () => {
        window.removeEventListener('bonki:demo-session-changed', syncLocalPreview);
        window.removeEventListener('storage', syncLocalPreview);
      };
    }

    if (!space?.id) return;
    let cancelled = false;

    const fetchActive = supabase
      .from('couple_sessions')
      .select('product_id, last_activity_at')
      .eq('couple_space_id', space.id)
      .eq('status', 'active')
      .order('last_activity_at', { ascending: false });

    const fetchCompleted = supabase
      .from('couple_sessions')
      .select('product_id, card_id')
      .eq('couple_space_id', space.id)
      .eq('status', 'completed');

    Promise.all([fetchActive, fetchCompleted]).then(([activeRes, completedRes]) => {
      if (cancelled) return;

      if (activeRes.data) {
        setActiveProductIds(new Set(activeRes.data.map(s => s.product_id)));
      }

      if (completedRes.data) {
        const sets: Record<string, Set<string>> = {};
        const counts: Record<string, number> = {};
        for (const s of completedRes.data) {
          if (s.product_id && s.card_id) {
            if (!sets[s.product_id]) sets[s.product_id] = new Set();
            sets[s.product_id].add(s.card_id);
          }
        }
        for (const [productId, cardIds] of Object.entries(sets)) {
          const manifest = allProducts.find(p => p.id === productId);
          if (manifest) {
            counts[productId] = [...cardIds].filter(id => manifest.cards.some(c => c.id === id)).length;
          } else {
            counts[productId] = cardIds.size;
          }
        }
        setCompletedCountMap(counts);
      }
    });

    return () => { cancelled = true; };
  }, [space?.id]);

  // Locked pedagogical kids order
  const jagIMig = allProducts.find(p => p.id === 'jag_i_mig')!;
  const jagMedAndra = allProducts.find(p => p.id === 'jag_med_andra')!;
  const jagIVarlden = allProducts.find(p => p.id === 'jag_i_varlden')!;
  const sexualitet = allProducts.find(p => p.id === 'sexualitetskort')!;
  const vardag = allProducts.find(p => p.id === 'vardagskort')!;
  const syskon = allProducts.find(p => p.id === 'syskonkort')!;

  // COUNT-BASED APPROXIMATION — intentional. Do not replace with a Supabase
  // query. The proper fix is a dedicated hook returning per-card completion
  // IDs, which is a separate ticket. This approximation is correct for the
  // majority of users who progress sequentially.
  const stillUsCompletedIds = useMemo(() => {
    const count = completedCountMap['still_us'] || 0;
    return new Set(
      CARD_SEQUENCE.slice(0, count).map((s) => `su-mock-${s.index}`),
    );
  }, [completedCountMap]);

  const sortedKidsProducts = useMemo(
    () => [jagIMig, jagMedAndra, vardag, syskon, jagIVarlden, sexualitet]
      .filter(p => !isProductHiddenOnPlatform(p.id)),
    [jagIMig, jagMedAndra, vardag, syskon, jagIVarlden, sexualitet],
  );
  const defaultKidsOrder = sortedKidsProducts;

  const libraryBg = MIDNIGHT_INK;

  if (accessLoading) {
    return <BonkiLoadingScreen />;
  }

  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{
        background: libraryBg,
        ['--surface-base' as string]: libraryBg,
        fontFamily: 'var(--font-body)',
        transition: 'background 600ms ease',
      }}
    >
      {/* ── Atmospheric background layers ── */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)',
          width: '120vw', height: '340px',
          background: 'radial-gradient(ellipse 55% 60% at 50% 35%, hsla(100, 60%, 80%, 0.10) 0%, hsla(100, 60%, 80%, 0.04) 45%, transparent 100%)',
        }} />
        <div style={{
          position: 'absolute', top: '900px', left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(180deg, transparent 0%, rgba(28, 43, 26, 0.10) 25%, rgba(45, 69, 40, 0.08) 60%, rgba(28, 43, 26, 0.12) 100%)',
        }} />
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '220px',
          background: `linear-gradient(180deg,
            hsla(230, 25%, 10%, 0.0) 0%,
            hsla(230, 25%, 10%, 0.08) 30%,
            hsla(230, 25%, 10%, 0.18) 55%,
            ${libraryBg} 100%)`,
          zIndex: 1,
        }} />
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <KontoIcon onClick={() => setKontoOpen(true)} />
        <KontoSheet open={kontoOpen} onClose={() => setKontoOpen(false)} />

        {/* Tab bar */}
        <div className="px-5" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 56px)' }}>
          <TabBar active={activeTab} onChange={setActiveTab} />
        </div>

        {/* Resume card */}
        <div className="px-5" style={{ marginBottom: 24 }}>
          <LibraryResumeCard global />
        </div>

        {activeTab === 'vi' && (
          <div className="px-5">
            <VartViHero
              totalCards={stillUsProduct?.cards.length ?? 22}
              completedCount={completedCountMap['still_us'] || 0}
              isPurchased={purchased.has('still_us')}
              onClick={() => navigate('/product/still-us')}
            />
            <div style={{ marginTop: 20 }}>
              <VartViPreviewStrip
                isPurchased={purchased.has('still_us')}
                completedCardIds={stillUsCompletedIds}
                onUnpurchasedTileTap={(index) => setExpandedTileIndex(index)}
                onPurchasedTileTap={(cardId) => navigate(`/card/${cardId}`)}
              />
            </div>
          </div>
        )}

        {activeTab === 'barnen' && (
          <div className="px-5">
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 11,
              fontWeight: 400,
              color: 'rgba(255, 255, 255, 0.55)',
              lineHeight: 1.5,
              textAlign: 'left',
              padding: '0 4px',
              margin: '4px 0 14px',
            }}>
              Åldrarna är en vägledning. Ni känner ert barn bäst.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
            }}>
              {sortedKidsProducts.map((product) => (
                <LibraryKidsTile
                  key={product.id}
                  product={product}
                  illustration={ILLUSTRATIONS[product.id]}
                  totalCards={product.cards.length}
                  completedCount={completedCountMap[product.id] || 0}
                  isPurchased={purchased.has(product.id)}
                  onClick={() => navigate(`/product/${product.slug}`)}
                />
              ))}
            </div>
          </div>
        )}


        <AnimatePresence>
          {expandedTileIndex !== null && (() => {
            const questions = (PREVIEW_QUESTIONS.still_us ?? []).slice(0, 4);
            const q = questions[expandedTileIndex];
            const bgColor = PREVIEW_TILE_COLORS[expandedTileIndex % PREVIEW_TILE_COLORS.length];
            return (
              <motion.div
                key="preview-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setExpandedTileIndex(null)}
                style={{
                  position: 'fixed',
                  inset: 0,
                  background: 'rgba(26, 26, 46, 0.85)',
                  zIndex: 100,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 24,
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                }}
              >
                <motion.div
                  layoutId={`preview-tile-${expandedTileIndex}`}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    background: bgColor,
                    borderRadius: 20,
                    padding: '48px 28px',
                    width: '100%',
                    maxWidth: 360,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 320,
                    position: 'relative',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.40)',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setExpandedTileIndex(null)}
                    aria-label="Stäng"
                    style={{
                      position: 'absolute',
                      top: 14,
                      right: 14,
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      background: 'rgba(255,255,255,0.15)',
                      border: 'none',
                      color: LANTERN_GLOW,
                      fontSize: 18,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    ×
                  </button>
                  <p
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontStyle: 'italic',
                      fontSize: 22,
                      lineHeight: 1.35,
                      color: LANTERN_GLOW,
                      textAlign: 'center',
                      margin: 0,
                    }}
                  >
                    {q}
                  </p>
                </motion.div>
              </motion.div>
            );
          })()}
        </AnimatePresence>

        {/* Bottom safe-area spacing */}
        <div style={{ paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 0px))' }} />
      </div>
    </div>
  );
}
