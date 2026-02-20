// SESSION MODEL LOCK:
// Do NOT use couple_progress.current_session.
// The JSON session model is deprecated.
// All session state must come from normalized tables.

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext as useCoupleSpace } from '@/contexts/CoupleSpaceContext';
import Header from '@/components/Header';
import { BEAT_1, BEAT_2, BEAT_3, EASE } from '@/lib/motion';

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
      // All sessions are normalized — query couple_sessions exclusively.
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

      // step_reflections.session_id now references couple_sessions.id
      // couple_takeaways.session_id also references couple_sessions.id
      const [reflRes, takeawayRes] = await Promise.all([
        supabase
          .from('step_reflections')
          .select('step_index, user_id, text, speaker_label')
          .eq('session_id', sessionRow.id)
          .eq('state', 'locked'),
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
        <Header title={categoryTitle} showBack backTo="/" />
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
    // No completed session found — shouldn't happen, but gracefully CTA
    return (
      <div className="min-h-screen page-bg">
        <Header title={categoryTitle} showBack backTo="/" />
        <div className="px-6 pt-title-above pb-8 text-center max-w-md mx-auto space-y-8">
          <p className="text-sm text-muted-foreground">Ingen tidigare session hittades.</p>
          <button
            onClick={onExploreAgain}
            className="w-full h-[54px] rounded-card font-normal text-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'hsl(150 27% 18%)', color: '#fff' }}
          >
            Utforska igen
          </button>
        </div>
      </div>
    );
  }

  // Group reflections by step
  const stepGroups = STEP_LABELS.map((label, stepIdx) => {
    const stepReflections = session.reflections.filter(r => r.stepIndex === stepIdx);
    const partnerRef = stepReflections.find(r => r.userId !== user?.id);
    const myRef = stepReflections.find(r => r.userId === user?.id);
    return { label, partnerRef, myRef };
  }).filter(g => g.partnerRef || g.myRef);



  return (
    <div className="min-h-screen page-bg">
      <Header title={categoryTitle} showBack backTo="/" />

      <div className="px-6 pt-title-above pb-8">
        <div className="max-w-md mx-auto space-y-8 pb-8">

          {/* Completion header — heading first, quiet date below */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: BEAT_3, ease: EASE }}
            className="text-center space-y-3"
          >
            <h2
              className="text-foreground"
              style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 450, letterSpacing: '-0.02em', lineHeight: 1.2 }}
            >
              Samtalet är sparat.
            </h2>
            <p className="text-meta text-muted-foreground/60 mt-[8px]">Ni kan fortsätta när ni vill.</p>
            <p className="text-[11px] text-muted-foreground/35 tracking-wide">
              {formatSessionDate(session.startedAt)}
            </p>
          </motion.div>

          {/* Locked reflections — no step labels, memory not recap */}
          {stepGroups.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: BEAT_2, duration: BEAT_3, ease: EASE }}
              className="space-y-8"
            >
              {stepGroups.map((group, idx) => (
                <div key={idx} className="space-y-4">
                  {/* Partner first */}
                  {group.partnerRef && group.partnerRef.text.trim() && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground/60 px-1">
                        {group.partnerRef.speakerLabel && /^[AB]$/.test(group.partnerRef.speakerLabel)
                          ? group.partnerRef.speakerLabel
                          : partnerName}
                      </p>
                      <div className="rounded-card bg-muted/10 overflow-hidden">
                        <p className="p-6 text-sm text-foreground whitespace-pre-wrap">{group.partnerRef.text}</p>
                      </div>
                    </div>
                  )}

                  {/* User second */}
                  {group.myRef && group.myRef.text.trim() && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground/60 px-1">
                        {group.myRef.speakerLabel && /^[AB]$/.test(group.myRef.speakerLabel)
                          ? group.myRef.speakerLabel
                          : myName}
                      </p>
                      <div className="rounded-card bg-muted/10 overflow-hidden">
                        <p className="p-6 text-sm text-foreground whitespace-pre-wrap">{group.myRef.text}</p>
                      </div>
                    </div>
                  )}

                  {idx < stepGroups.length - 1 && <Separator className="opacity-20" />}
                </div>
              ))}
            </motion.div>
          )}

          {/* Takeaway block */}
          {session.takeawayText && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: BEAT_2, duration: BEAT_3, ease: EASE }}
              className="space-y-2"
            >
              <p className="text-xs text-muted-foreground/40 tracking-wide">Det ni tog med er</p>
              <div className="rounded-card bg-muted/10 overflow-hidden">
                <p className="p-6 text-sm text-foreground whitespace-pre-wrap">{session.takeawayText}</p>
              </div>
            </motion.div>
          )}

          {/* CTA — mt-16 breathing room before exit */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: BEAT_3, duration: BEAT_3, ease: EASE }}
            className="mt-16 space-y-4 text-center"
          >
            <p className="text-xs text-muted-foreground/40">Ni kan alltid komma tillbaka.</p>
          <button
              onClick={onExploreAgain}
              className="w-full h-[54px] rounded-card font-normal text-sm transition-opacity hover:opacity-90 active:scale-[0.98]"
              style={{ backgroundColor: 'hsl(150 27% 18%)', color: '#fff' }}
            >
              Tillbaka till översikten
            </button>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
