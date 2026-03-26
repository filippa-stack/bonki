// SESSION MODEL LOCK:
// Do NOT use couple_progress.current_session.
// The JSON session model is deprecated.
// All session state must come from normalized tables.

import { useState, useEffect, useMemo, useCallback } from 'react';
import { getCompletionMessages } from '@/lib/pronouns';
import { getProductForCard } from '@/data/products';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import FeedbackSheet from '@/components/FeedbackSheet';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext as useCoupleSpace } from '@/contexts/CoupleSpaceContext';
import Header from '@/components/Header';
import { useCardImage } from '@/hooks/useCardImage';
import { useProductAccess } from '@/hooks/useProductAccess';
import { BEAT_1, BEAT_2, BEAT_3, EASE, EMOTION } from '@/lib/motion';

const STEP_LABELS = ['Kom igång', 'Gå djupare', 'Föreställ er', 'I verkligheten'];

interface CompletedSessionViewProps {
  cardId: string;
  cardTitle: string;
  categoryId?: string;
  categoryTitle?: string;
  onExploreAgain: () => void;
}

interface LockedReflection {
  stepIndex: number;
  userId: string;
  text: string;
  speakerLabel: string | null;
}

interface SessionData {
  id: string;
  startedAt: string;
  reflections: LockedReflection[];
  takeawayText: string | null;
}

export default function CompletedSessionView({
  cardId,
  cardTitle,
  categoryId,
  categoryTitle,
  onExploreAgain,
}: CompletedSessionViewProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { space } = useCoupleSpace();
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedbackDismissed, setFeedbackDismissed] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const myName = 'Du';
  const partnerName = 'Din partner';

  const product = getProductForCard(cardId);
  const pronounMode = product?.pronounMode ?? 'ni';
  const ageLabel = product?.ageLabel;
  const completionMessages = useMemo(() => getCompletionMessages(pronounMode, ageLabel), [pronounMode, ageLabel]);
  const isChildProduct = product && product.id !== 'still_us';
  const cardIllustration = useCardImage(cardId);
  const { hasAccess: productIsPurchased } = useProductAccess(product?.id ?? '');
  const isFreeCard = product?.freeCardId === cardId;

  const headline = useMemo(() =>
    completionMessages[Math.floor(Math.random() * completionMessages.length)],
  [completionMessages]);

  // Compute next card for child products
  const [busyCardIds, setBusyCardIds] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (!space?.id || !isChildProduct) return;
    supabase
      .from('couple_sessions')
      .select('card_id')
      .eq('couple_space_id', space.id)
      .in('status', ['completed', 'active'])
      .then(({ data }) => {
        if (data) setBusyCardIds(new Set(data.map(s => s.card_id).filter(Boolean) as string[]));
      });
  }, [space?.id, isChildProduct]);

  const nextDest = useMemo(() => {
    if (!isChildProduct || !product) return null;
    const done = new Set(busyCardIds);
    done.add(cardId);

    // 1. Try next uncompleted card within the SAME category
    const sameCatCards = product.cards.filter(c => c.categoryId === categoryId);
    const currentCatIdx = sameCatCards.findIndex(c => c.id === cardId);
    for (let i = 1; i < sameCatCards.length; i++) {
      const next = sameCatCards[(currentCatIdx + i) % sameCatCards.length];
      if (!done.has(next.id) && next.categoryId) {
        return `/product/${product.slug}/portal/${next.categoryId}`;
      }
    }

    // 2. All cards in current category done — find next category in sequence
    const catOrder = product.categories.map(c => c.id);
    const currentCatSeqIdx = catOrder.indexOf(categoryId ?? '');
    for (let ci = 1; ci < catOrder.length; ci++) {
      const nextCatId = catOrder[(currentCatSeqIdx + ci) % catOrder.length];
      const catCards = product.cards.filter(c => c.categoryId === nextCatId);
      const nextCard = catCards.find(c => !done.has(c.id));
      if (nextCard) {
        return `/product/${product.slug}/portal/${nextCatId}`;
      }
    }

    return null;
  }, [isChildProduct, product, busyCardIds, cardId, categoryId]);

  // Show feedback sheet 2s after content renders
  useEffect(() => {
    if (loading || !session || feedbackDismissed) return;
    const timer = setTimeout(() => setShowFeedback(true), 2000);
    return () => clearTimeout(timer);
  }, [loading, session, feedbackDismissed]);

  const handleFeedbackDismiss = useCallback(() => {
    setShowFeedback(false);
    setFeedbackDismissed(true);
  }, []);

  useEffect(() => {
    if (!space || !cardId) { setLoading(false); return; }

    let cancelled = false;

    const fetchSession = async () => {
      const { data: sessionRow } = await supabase
        .from('couple_sessions')
        .select('id, started_at')
        .eq('couple_space_id', space.id)
        .eq('card_id', cardId)
        .eq('status', 'completed')
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cancelled || !sessionRow) { setLoading(false); return; }

      const [reflRes, takeawayRes] = await Promise.all([
        supabase
          .from('step_reflections')
          .select('step_index, user_id, text, speaker_label')
          .eq('session_id', sessionRow.id)
          .in('state', ['locked', 'revealed', 'ready']),
        supabase
          .from('couple_takeaways')
          .select('content')
          .eq('session_id', sessionRow.id)
          .limit(1)
          .maybeSingle(),
      ]);

      if (cancelled) return;

      setSession({
        id: sessionRow.id,
        startedAt: sessionRow.started_at,
        reflections: (reflRes.data || []).map(r => ({
          stepIndex: r.step_index,
          userId: r.user_id,
          text: r.text,
          speakerLabel: (r as any).speaker_label ?? null,
        })),
        takeawayText: (takeawayRes.data as any)?.content?.trim() || null,
      });
      setLoading(false);
    };

    fetchSession();
    return () => { cancelled = true; };
  }, [space, cardId]);

  const formatSessionDate = (iso: string) => {
    const d = new Date(iso);
    const month = d.toLocaleString('sv-SE', { month: 'long' });
    const year = d.getFullYear();
    return `${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;
  };

  const bgColor = product?.backgroundColor ?? 'var(--surface-base)';

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: bgColor }}>
        <Header title={cardTitle} showBack backTo={isChildProduct && product && categoryId ? `/product/${product.slug}/portal/${categoryId}` : categoryId ? `/category/${categoryId}` : '/'} />
        <div className="px-6 pt-title-above pb-8">
          <div className="max-w-md mx-auto space-y-4">
            <div className="h-6 w-48 rounded bg-muted/30 animate-pulse mx-auto" />
            <div className="h-24 rounded-card bg-muted/20 animate-pulse" />
            <div className="h-24 rounded-card bg-muted/20 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: bgColor }}>
        <Header title={cardTitle} showBack backTo={isChildProduct && product && categoryId ? `/product/${product.slug}/portal/${categoryId}` : categoryId ? `/category/${categoryId}` : '/'} />
        <div className="px-6 pt-title-above pb-8 text-center max-w-md mx-auto space-y-8">
          <p className="text-sm" style={{ color: '#FDF6E3', opacity: 0.6 }}>Ingen tidigare session hittades.</p>
          <button onClick={onExploreAgain} className="cta-primary">Utforska igen</button>
        </div>
      </div>
    );
  }

  // Group reflections by step
  const stepGroups = STEP_LABELS.map((label, stepIdx) => {
    const stepReflections = session.reflections.filter(r => Math.floor(r.stepIndex / 100) === stepIdx);
    const partnerRef = stepReflections.find(r => r.userId !== user?.id);
    const myRef = stepReflections.find(r => r.userId === user?.id);
    return { label, partnerRef, myRef };
  }).filter(g => g.partnerRef || g.myRef);

  return (
    <div className="min-h-screen" style={{ backgroundColor: bgColor, position: 'relative', overflow: 'hidden' }}>
      {/* Card illustration background */}
      {cardIllustration && (
        <img
          src={cardIllustration}
          alt=""
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '50%',
            objectFit: 'contain',
            objectPosition: '50% 30%',
            opacity: 0.3,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      )}
      <Header title={cardTitle} showBack backTo={isChildProduct && product && categoryId ? `/product/${product.slug}/portal/${categoryId}` : categoryId ? `/category/${categoryId}` : '/'} />

      <div className="px-6" style={{ paddingTop: '32px', paddingBottom: '100px', position: 'relative', zIndex: 1 }}>
        <div className="max-w-md mx-auto pb-8" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

          {/* Completion header */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-center"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
          >
            {/* Ceremonial saffron line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              style={{
                width: '32px',
                height: '2px',
                borderRadius: '1px',
                background: 'var(--accent-saffron)',
                opacity: 0.5,
                marginBottom: '8px',
                transformOrigin: 'center',
              }}
            />
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontVariationSettings: "'opsz' 26",
                fontSize: 'clamp(26px, 7vw, 34px)',
                fontWeight: 400,
                lineHeight: 1.2,
                color: 'hsl(41, 78%, 38%)',
              }}
            >
              {headline}
            </h2>
            <p className="font-serif italic" style={{ fontSize: '15px', color: '#FDF6E3', opacity: 0.55 }}>
              {formatSessionDate(session.startedAt)}
            </p>
          </motion.div>

          {/* Locked reflections */}
          {stepGroups.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: BEAT_2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-8"
            >
              {stepGroups.map((group, idx) => (
                <motion.div
                  key={idx}
                  className="space-y-4"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: BEAT_2 + idx * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  {/* Partner first */}
                  {group.partnerRef && group.partnerRef.text.trim() && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <p style={{ fontSize: '11px', letterSpacing: '0.04em', color: '#FDF6E3', opacity: 0.5, paddingLeft: '2px' }}>
                        {group.partnerRef.speakerLabel && /^[AB]$/.test(group.partnerRef.speakerLabel)
                          ? group.partnerRef.speakerLabel
                          : partnerName}
                      </p>
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.06)',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                      }}>
                        <p className="font-serif italic whitespace-pre-wrap" style={{ padding: '20px 24px', fontSize: '17px', lineHeight: 1.7, color: '#FDF6E3' }}>{group.partnerRef.text}</p>
                      </div>
                    </div>
                  )}

                  {/* User second */}
                  {group.myRef && group.myRef.text.trim() && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <p style={{ fontSize: '11px', letterSpacing: '0.04em', color: '#FDF6E3', opacity: 0.5, paddingLeft: '2px' }}>
                        {group.myRef.speakerLabel && /^[AB]$/.test(group.myRef.speakerLabel)
                          ? group.myRef.speakerLabel
                          : myName}
                      </p>
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.06)',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                      }}>
                        <p className="font-serif italic whitespace-pre-wrap" style={{ padding: '20px 24px', fontSize: '17px', lineHeight: 1.7, color: '#FDF6E3' }}>{group.myRef.text}</p>
                      </div>
                    </div>
                  )}

                  {idx < stepGroups.length - 1 && (
                    <div style={{ height: '1px', margin: '8px 32px', background: 'linear-gradient(90deg, transparent, var(--text-ghost), transparent)', opacity: 0.25 }} />
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Takeaway block */}
          {session.takeawayText && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: BEAT_3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              <p style={{ fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#FDF6E3', opacity: 0.45 }}>Det ni tog med er</p>
              <div style={{
                background: 'rgba(255, 255, 255, 0.06)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}>
                <p className="font-serif italic whitespace-pre-wrap" style={{ padding: '20px 24px', fontSize: '17px', lineHeight: 1.7, color: '#FDF6E3', opacity: 0.8 }}>{session.takeawayText}</p>
              </div>
            </motion.div>
          )}

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: BEAT_3 + 0.06, duration: EMOTION, ease: [...EASE] }}
            style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}
          >
            {/* Primary: Next card (child products) or Fortsätt utforska */}
            {isChildProduct && nextDest ? (
              <>
                <button
                  onClick={() => navigate(nextDest)}
                  className="cta-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  Nästa <ArrowRight size={16} style={{ opacity: 0.7 }} />
                </button>
                <button
                  onClick={() => navigate(`/product/${product!.slug}`)}
                  className="font-sans"
                  style={{ fontSize: '13px', color: '#FDF6E3', opacity: 0.45, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Tillbaka till {product!.name}
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate(
                  isChildProduct ? `/product/${product!.slug}` : '/'
                )}
                className="cta-primary"
              >
                {isChildProduct ? 'Tillbaka till ' + product!.name : 'Fortsätt utforska'}
              </button>
            )}
          </motion.div>

        </div>
      </div>

      {session && space && (
        <FeedbackSheet
          sessionId={session.id}
          coupleSpaceId={space.id}
          show={showFeedback}
          onDismiss={handleFeedbackDismiss}
        />
      )}
    </div>
  );
}
