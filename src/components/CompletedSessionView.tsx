// SESSION MODEL LOCK:
// Do NOT use couple_progress.current_session.
// The JSON session model is deprecated.
// All session state must come from normalized tables.

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext as useCoupleSpace } from '@/contexts/CoupleSpaceContext';
import Header from '@/components/Header';
import { BEAT_1, BEAT_2, BEAT_3, EASE, EMOTION } from '@/lib/motion';

const STEP_LABELS = ['Början', 'Fördjupning', 'I vardagen', 'Tillsammans'];

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

  const myName = 'Du';
  const partnerName = 'Din partner';

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

  if (loading) {
    return (
      <div className="min-h-screen page-bg">
        <Header title={cardTitle} showBack backTo={categoryId ? `/category/${categoryId}` : '/'} />
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
      <div className="min-h-screen page-bg">
        <Header title={cardTitle} showBack backTo={categoryId ? `/category/${categoryId}` : '/'} />
        <div className="px-6 pt-title-above pb-8 text-center max-w-md mx-auto space-y-8">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Ingen tidigare session hittades.</p>
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
    <div className="min-h-screen page-bg">
      <Header title={cardTitle} showBack backTo={categoryId ? `/category/${categoryId}` : '/'} />

      <div className="px-6 pb-8" style={{ paddingTop: '32px' }}>
        <div className="max-w-md mx-auto pb-8" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

          {/* Completion header */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-center space-y-3"
          >
            <h2
              className="type-h1"
              style={{ color: 'var(--accent-saffron)' }}
            >
              Samtalet är sparat.
            </h2>
            <p className="type-body mt-[8px]" style={{ color: 'var(--text-tertiary)' }}>Ni kan fortsätta när ni vill.</p>
            <p className="type-meta tracking-wide" style={{ color: 'var(--text-ghost)' }}>
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
                    <div className="space-y-1">
                      <p className="text-xs px-1" style={{ color: 'var(--text-tertiary)' }}>
                        {group.partnerRef.speakerLabel && /^[AB]$/.test(group.partnerRef.speakerLabel)
                          ? group.partnerRef.speakerLabel
                          : partnerName}
                      </p>
                      <div style={{
                        background: 'var(--surface-raised)',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        boxShadow: '0 1px 2px hsla(30, 15%, 25%, 0.04), 0 4px 16px -4px hsla(30, 18%, 28%, 0.06)',
                      }}>
                        <p className="p-6 text-sm whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>{group.partnerRef.text}</p>
                      </div>
                    </div>
                  )}

                  {/* User second */}
                  {group.myRef && group.myRef.text.trim() && (
                    <div className="space-y-1">
                      <p className="text-xs px-1" style={{ color: 'var(--text-tertiary)' }}>
                        {group.myRef.speakerLabel && /^[AB]$/.test(group.myRef.speakerLabel)
                          ? group.myRef.speakerLabel
                          : myName}
                      </p>
                      <div style={{
                        background: 'var(--surface-raised)',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        boxShadow: '0 1px 2px hsla(30, 15%, 25%, 0.04), 0 4px 16px -4px hsla(30, 18%, 28%, 0.06)',
                      }}>
                        <p className="p-6 text-sm whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>{group.myRef.text}</p>
                      </div>
                    </div>
                  )}

                  {idx < stepGroups.length - 1 && <Separator className="opacity-10" />}
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
              className="space-y-2"
            >
              <p className="type-meta tracking-wide" style={{ color: 'var(--text-tertiary)' }}>Det ni tog med er</p>
              <div style={{
                background: 'var(--surface-raised)',
                borderRadius: '10px',
                overflow: 'hidden',
                boxShadow: '0 1px 2px hsla(30, 15%, 25%, 0.04), 0 4px 16px -4px hsla(30, 18%, 28%, 0.06)',
              }}>
                <p className="p-6 text-sm whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>{session.takeawayText}</p>
              </div>
            </motion.div>
          )}

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: BEAT_3 + 0.06, duration: EMOTION, ease: [...EASE] }}
            className="text-center" style={{ marginTop: '16px' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
              <button
                onClick={() => navigate('/shared')}
                className="type-meta text-center block mx-auto underline hover:no-underline transition-opacity"
                style={{ color: 'var(--text-secondary)' }}
              >
                Se reflektionerna i Era samtal
              </button>
              <button
                onClick={() => navigate('/')}
                className="cta-primary"
              >
                Utforska fler ämnen
              </button>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
