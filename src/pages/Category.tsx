import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BEAT_1, EASE } from '@/lib/motion';
import { CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/contexts/AppContext';
import { useNormalizedSessionContext } from '@/contexts/NormalizedSessionContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import { useSpaceSnapshot } from '@/hooks/useSpaceSnapshot';
import {
  selectExploredCardIds,
  selectCardVisitDates,
  selectSuggestedNextCardId,
} from '@/selectors/spaceSnapshotSelectors';
import { categories as allCategories, cards as allCards } from '@/data/content';
import Header from '@/components/Header';

// UI guidance constants — no effect on rendering order or logic.
const RECOMMENDED_CATEGORY_ORDER = [
  "emotional-intimacy",
  "communication",
  "category-8",
  "category-7",
  "parenting-together",
  "individual-needs",
  "category-9",
  "category-6",
  "daily-life",
  "category-10",
];

// Maps category id → ordered card ids (first unexplored gets the marker).
const RECOMMENDED_TOPIC_ORDER: Record<string, string[]> = {
  "emotional-intimacy":  ["smallest-we", "identity-shift"],
  "communication":       ["listening-presence", "conflict-repair", "expressing-needs"],
  "category-8":          ["behind-the-scenes", "thoughtful-space"],
  "category-7":          ["facing-adversity", "self-esteem-wavering"],
  "parenting-together":  ["different-parenting-styles", "parenting-boundaries", "parenting-exhaustion"],
  "individual-needs":    ["family-voices", "our-traditions"],
  "category-9":          ["our-philosophy", "when-life-tilts"],
  "category-6":          ["worth-spending-on", "risk-under-responsibility"],
  "daily-life":          ["family-ab", "love-languages"],
  "category-10":         ["adrift", "choosing-to-stay"],
};

export default function Category() {
  const { t } = useTranslation();
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { getCategoryById, getCardsByCategory, getCardById } = useApp();
  const { user } = useAuth();
  const { space, memberCount } = useCoupleSpaceContext();
  const normalizedSession = useNormalizedSessionContext();
  const { snapshot } = useSpaceSnapshot(user?.id ?? null, space?.id ?? null);

  const exploredIds = selectExploredCardIds(snapshot);
  const cardVisitDates = selectCardVisitDates(snapshot);
  const isPaired = memberCount >= 2;

  const category = categoryId ? getCategoryById(categoryId) : undefined;
  const cards = categoryId ? getCardsByCategory(categoryId) : [];

  // Highlight the active card using normalized session — the single source of truth.
  const sessionCardIdForThisCategory =
    normalizedSession.sessionId && normalizedSession.cardId && cards.some(c => c.id === normalizedSession.cardId)
      ? normalizedSession.cardId
      : null;
  const suggestedId = selectSuggestedNextCardId(snapshot, allCategories, allCards);
  const suggestedCard = suggestedId ? getCardById(suggestedId) : null;
  const suggestedCardIdForThisCategory =
    suggestedCard && suggestedCard.categoryId === categoryId ? suggestedCard.id : null;
  const highlightedCardId = sessionCardIdForThisCategory || suggestedCardIdForThisCategory || null;

  // Recommendation: first category in RECOMMENDED_CATEGORY_ORDER with unexplored cards.
  const recommendedCategoryId = (() => {
    for (const catId of RECOMMENDED_CATEGORY_ORDER) {
      const orderedIds = RECOMMENDED_TOPIC_ORDER[catId] || [];
      const hasUnexplored = orderedIds.some((id) => !exploredIds.includes(id));
      if (hasUnexplored) return catId;
    }
    return RECOMMENDED_CATEGORY_ORDER[0];
  })();

  const isRecommendedCategory = categoryId === recommendedCategoryId;

  // First unexplored card in the recommended order for this category.
  const recommendedTopicId = isRecommendedCategory
    ? (RECOMMENDED_TOPIC_ORDER[categoryId!] || []).find((id) => !exploredIds.includes(id))
      ?? (RECOMMENDED_TOPIC_ORDER[categoryId!]?.[0] ?? null)
    : null;

  if (!category) {
    return (
      <div className="min-h-screen page-bg animate-fade-in">
        <div className="h-14 border-b border-border bg-card" />
        <div className="px-6 pt-12 space-y-4 max-w-md mx-auto text-center">
          <div className="h-6 w-40 rounded bg-muted/30 animate-pulse mx-auto" />
          <p className="text-sm text-muted-foreground">{t('category.not_found')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-bg">
      <Header showBack backTo="/" />

      <div className="px-6 pt-8 pb-10">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.4, 0.0, 0.2, 1] }}
          className="text-display text-foreground mb-1"
        >
          {category.title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: BEAT_1, duration: 0.2, ease: EASE }}
          className={`text-base text-muted-foreground mt-4 max-w-md leading-relaxed${isRecommendedCategory ? ' mb-8' : ''}`}
        >
          {category.entryLine ? `${category.entryLine} ${t('category_status.return_note')}` : t('category_status.return_note')}
        </motion.p>
      </div>

      <div className="px-6 pb-10">
      <div className="space-y-6">
          {cards.map((card, index) => {
            const isRecommended = card.id === recommendedTopicId;
            const nextCard = cards[index + 1];
            const nextIsNormal = isRecommended && nextCard;
            return (
              <div
                key={card.id}
                className={isRecommended ? 'mt-6' : undefined}
                style={nextIsNormal ? { marginBottom: '-8px' } : undefined}
              >
                <CardEntry
                  card={card}
                  index={index}
                  highlighted={card.id === highlightedCardId}
                  isRecommended={isRecommended}
                  isCompleted={(() => {
                    const inExplored = exploredIds.includes(card.id);
                    if (!isPaired) return index === 0 || inExplored;
                    // When paired, require both partners to have visited the card
                    const distinctVisitors = new Set(
                      snapshot?.visits.filter((v) => v.card_id === card.id).map((v) => v.user_id) ?? []
                    );
                    return inExplored && distinctVisitors.size >= 2;
                  })()}
                  lastVisitedAt={cardVisitDates[card.id] || null}
                  onNavigate={() => navigate(`/card/${card.id}`)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface CardEntryProps {
  card: {
    id: string;
    title: string;
    subtitle?: string;
    color?: string;
    textColor?: string;
    borderColor?: string;
  };
  index: number;
  highlighted?: boolean;
  isRecommended?: boolean;
  isCompleted?: boolean;
  lastVisitedAt?: string | null;
  onNavigate: () => void;
}

function getVisitMemoryLabel(lastVisitedAt: string | null | undefined): string | null {
  if (!lastVisitedAt) return null;
  const elapsed = Date.now() - new Date(lastVisitedAt).getTime();
  const days = elapsed / (1000 * 60 * 60 * 24);
  if (days < 7) return 'Ni var här nyligen.';
  if (days <= 30) return 'Ni var här för en tid sedan.';
  return 'Det var ett tag sedan ni var här.';
}

function CardEntry({ card, index, highlighted, isRecommended = false, isCompleted = false, lastVisitedAt, onNavigate }: CardEntryProps) {
  const visitLabel = getVisitMemoryLabel(lastVisitedAt);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(0.1 + index * 0.06, 0.28), duration: 0.2, ease: [0.4, 0.0, 0.2, 1] }}
      onClick={onNavigate}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onNavigate();
        }
      }}
      className={`relative w-full text-center card-sub group transition-all cursor-pointer overflow-hidden rounded-[20px] ${isRecommended ? 'shadow-[0_6px_24px_-4px_hsl(0_0%_0%/0.07),0_1px_4px_0_hsl(0_0%_0%/0.04)]' : 'shadow-[0_1px_4px_0_hsl(0_0%_0%/0.04)]'}${isCompleted ? '' : ' item-colors'}${highlighted ? ' ring-2 ring-primary/40' : ''}`}
      style={{
        borderWidth: '1px',
        borderStyle: 'solid',
      }}
    >
      <div className="flex flex-col items-center gap-1.5 px-7 py-8">
        {isCompleted && (
          <CheckCircle2 className="w-5 h-5 text-[#497575] mb-1" />
        )}
        <h3
          className={`w-full font-serif text-lg sm:text-xl text-center leading-snug ${isCompleted ? 'text-slate-400' : 'item-text'}`}
          style={isCompleted ? undefined : { '--item-text': card.textColor || undefined } as React.CSSProperties}
        >
          {card.title}
        </h3>
        {card.subtitle && (
          <p
            className={`w-full text-sm text-center italic mt-0.5 ${isCompleted ? 'text-slate-300' : 'item-text-gentle'}`}
            style={isCompleted ? undefined : { '--item-text': card.textColor || undefined } as React.CSSProperties}
          >
            {card.subtitle}
          </p>
        )}
        {visitLabel && (
          <p className="text-[11px] text-muted-foreground/40 text-center mt-1.5">{visitLabel}</p>
        )}
      </div>
    </motion.div>
  );
}
