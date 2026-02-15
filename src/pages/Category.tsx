import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpace } from '@/hooks/useCoupleSpace';
import Header from '@/components/Header';

import { Check, Loader2, Lock } from 'lucide-react';

export default function Category() {
  const { t } = useTranslation();
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { getCategoryById, getCardsByCategory, updateCard, updateCardColor, updateCardTextColor, updateCardBorderColor, updateCardDescription, addCard, deleteCard, backgroundColor, getExploredCardsInCategory, getCategoryStatus, journeyState, proposeCard } = useApp();
  const { user } = useAuth();
  const { memberCount } = useCoupleSpace();
  
  const category = categoryId ? getCategoryById(categoryId) : undefined;
  const cards = categoryId ? getCardsByCategory(categoryId) : [];
  const exploredCount = categoryId ? getExploredCardsInCategory(categoryId) : 0;
  const status = categoryId ? getCategoryStatus(categoryId) : 'not_started';

  const [proposalSent, setProposalSent] = useState(false);
  const proposalTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isProposing, setIsProposing] = useState(false);

  const handlePropose = useCallback(async (catId: string, cardId: string) => {
    if (proposalSent || isProposing) return;
    setIsProposing(true);
    try {
      const result = await proposeCard(catId, cardId);
      if (result.ok) {
        setProposalSent(true);
        if (proposalTimer.current) clearTimeout(proposalTimer.current);
        proposalTimer.current = setTimeout(() => setProposalSent(false), 2000);
      } else if ('reason' in result && result.reason === 'not_logged_in') {
        toast.error('Du behöver vara inloggad för att skicka förslag.');
      } else {
        toast.error('Kunde inte skicka förslaget. Försök igen.');
      }
    } catch {
      toast.error('Kunde inte skicka förslaget. Försök igen.');
    } finally {
      setIsProposing(false);
    }
  }, [proposalSent, isProposing, proposeCard]);

  const handleAddCard = () => {
    if (!categoryId) return;
    const newCardId = addCard(categoryId);
    navigate(`/card/${newCardId}`);
  };

  const handleDeleteCard = (cardId: string, cardTitle: string) => {
    if (confirm(t('category.delete_confirm', { title: cardTitle }))) {
      deleteCard(cardId);
    }
  };

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

      {/* Category header */}
      <div className="px-6 pt-8 pb-6">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-display text-foreground mb-1"
        >
          {category.title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-base text-slate-600 mt-3 max-w-md leading-relaxed"
        >
          {category.entryLine ? `${category.entryLine} ${t('category_status.return_note')}` : t('category_status.return_note')}
        </motion.p>
      </div>

      {/* Cards */}
      <div className="px-6 pb-12">
        <div className="space-y-3">
          {cards.map((card, index) => {
            const isExplored = journeyState?.exploredCardIds?.includes(card.id) || false;

            // Unlock logic: card 0 always unlocked; others require previous card explored
            // or an active session on this card or any progress recorded
            const previousCard = index > 0 ? cards[index - 1] : null;
            const previousExplored = previousCard
              ? journeyState?.exploredCardIds?.includes(previousCard.id) || false
              : true;
            const hasProgress = !!(journeyState?.sessionProgress?.[card.id]);
            const isUnlocked = index === 0 || previousExplored || hasProgress || isExplored;

            return (
              <EditableCard
                key={card.id}
                card={card}
                index={index}
                explored={isExplored}
                locked={!isUnlocked}
                isPrimary={index === 0 && !isExplored}
                onNavigate={() => {
                  if (!isUnlocked) return;
                  if (memberCount >= 2 && categoryId && !isExplored) {
                    handlePropose(categoryId, card.id);
                  } else {
                    navigate(`/card/${card.id}`);
                  }
                }}
                onUpdate={updateCard}
                onColorChange={(color) => updateCardColor(card.id, color)}
                onTextColorChange={(textColor) => updateCardTextColor(card.id, textColor)}
                onBorderColorChange={(borderColor) => updateCardBorderColor(card.id, borderColor)}
                onDescriptionChange={(desc) => updateCardDescription(card.id, desc)}
                onDelete={() => handleDeleteCard(card.id, card.title)}
              />
            );
          })}

          {(isProposing || proposalSent) && (
            <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5 py-2">
              {isProposing ? (
                <><Loader2 className="w-3 h-3 animate-spin" /> Skickar…</>
              ) : (
                <><Check className="w-3.5 h-3.5" /> Förslag skickat</>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

interface EditableCardProps {
  card: {
    id: string;
    title: string;
    subtitle?: string;
    description?: string;
    sections: any[];
    color?: string;
    textColor?: string;
    borderColor?: string;
  };
  index: number;
  explored?: boolean;
  locked?: boolean;
  isPrimary?: boolean;
  onNavigate: () => void;
  onUpdate: (id: string, title: string, subtitle: string) => void;
  onColorChange: (color: string) => void;
  onTextColorChange: (textColor: string) => void;
  onBorderColorChange: (borderColor: string) => void;
  onDescriptionChange: (description: string) => void;
  onDelete: () => void;
}

function EditableCard({
  card,
  index,
  explored,
  locked,
  isPrimary,
  onNavigate,
}: EditableCardProps) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={locked ? undefined : onNavigate}
      role={locked ? undefined : 'button'}
      tabIndex={locked ? undefined : 0}
      onKeyDown={locked ? undefined : (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNavigate(); } }}
      className={`w-full text-center card-reflection group item-colors transition-all ${
        locked
          ? 'opacity-50 cursor-default'
          : isPrimary
            ? 'cursor-pointer ring-1 ring-primary/30 hover:ring-primary/50 hover:bg-card/90'
            : 'cursor-pointer hover:bg-card/90'
      }`}
      style={{ 
        '--item-bg': card.color || undefined,
        '--item-border': card.borderColor || undefined,
        borderWidth: card.borderColor ? '2px' : undefined,
      } as React.CSSProperties}
    >
      <div className="flex flex-col items-center gap-1 p-6">
        <h3
          className="w-full font-serif text-lg sm:text-xl text-center item-text"
          style={{ '--item-text': card.textColor || undefined } as React.CSSProperties}
        >
          {card.title}
        </h3>
        {card.subtitle && (
          <p
            className="w-full text-sm text-center italic item-text-gentle"
            style={{ '--item-text': card.textColor || undefined } as React.CSSProperties}
          >
            {card.subtitle}
          </p>
        )}
        {explored && (
          <p className="text-xs text-muted-foreground text-center mt-2 not-italic">
            {t('category_status.explored')}
          </p>
        )}
        {locked && (
          <p className="text-xs text-muted-foreground/60 text-center mt-2 not-italic flex items-center gap-1">
            <Lock className="w-3 h-3" />
            {t('category.locked_hint', 'Låses upp efter föregående')}
          </p>
        )}
      </div>
    </motion.div>
  );
}
