// SESSION MODEL LOCK:
// Do NOT use couple_progress.current_session.
// The JSON session model is deprecated.
// All session state must come from normalized tables.

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext as useCoupleSpace } from '@/contexts/CoupleSpaceContext';
import Header from '@/components/Header';

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
  const { space, userRole } = useCoupleSpace();
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  const myName = userRole === 'partner_a'
    ? (space?.partner_a_name || 'Du')
    : (space?.partner_b_name || 'Du');
  const partnerName = userRole === 'partner_a'
    ? (space?.partner_b_name || 'Din partner')
    : (space?.partner_a_name || 'Din partner');

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
        .single();

      if (cancelled || !sessionRow) { setLoading(false); return; }

      // step_reflections.session_id now references couple_sessions.id
      // couple_takeaways.session_id also references couple_sessions.id
      const [reflRes, takeawayRes] = await Promise.all([
        supabase
          .from('step_reflections')
          .select('step_index, user_id, text')
          .eq('session_id', sessionRow.id)
          .eq('state', 'locked'),
        supabase
          .from('couple_takeaways')
          .select('content')
          .eq('session_id', sessionRow.id)
          .limit(1)
          .single(),
      ]);

      if (cancelled) return;

      setSession({
        id: sessionRow.id,
        startedAt: sessionRow.started_at,
        reflections: (reflRes.data || []).map(r => ({
          stepIndex: r.step_index,
          userId: r.user_id,
          text: r.text,
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
        <div className="px-6 pt-20 pb-10">
          <div className="max-w-md mx-auto space-y-4">
            <div className="h-6 w-48 rounded bg-muted/30 animate-pulse mx-auto" />
            <div className="h-24 rounded-xl bg-muted/20 animate-pulse" />
            <div className="h-24 rounded-xl bg-muted/20 animate-pulse" />
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
        <div className="px-6 pt-20 pb-10 text-center max-w-md mx-auto space-y-6">
          <p className="text-sm text-muted-foreground">Ingen tidigare session hittades.</p>
          <Button onClick={onExploreAgain} size="lg" className="w-full h-14 rounded-2xl font-normal">
            Utforska igen
          </Button>
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

      <div className="px-6 pt-20 pb-10">
        {/* Session label */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
          className="text-center max-w-md mx-auto space-y-2"
        >
          <p className="text-[11px] text-muted-foreground/50 tracking-wide uppercase">
            Session från {formatSessionDate(session.startedAt)}
          </p>
          <h2 className="text-xl font-serif text-foreground">{cardTitle}</h2>
        </motion.div>

        {/* Locked reflections */}
        {stepGroups.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05, duration: 0.15 }}
            className="max-w-md mx-auto mt-12 space-y-8"
          >
            {stepGroups.map((group, idx) => (
              <div key={idx} className="space-y-4">
                <p className="text-xs text-muted-foreground/40 tracking-wide">{group.label}</p>

                {/* Partner first */}
                {group.partnerRef && group.partnerRef.text.trim() && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground/60 px-1">{partnerName}</p>
                    <div className="rounded-xl border border-border/30 bg-muted/10 overflow-hidden">
                      <p className="p-3 text-sm text-foreground whitespace-pre-wrap">{group.partnerRef.text}</p>
                    </div>
                  </div>
                )}

                {/* User second */}
                {group.myRef && group.myRef.text.trim() && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground/60 px-1">{myName}</p>
                    <div className="rounded-xl border border-border/30 bg-muted/10 overflow-hidden">
                      <p className="p-3 text-sm text-foreground whitespace-pre-wrap">{group.myRef.text}</p>
                    </div>
                  </div>
                )}

                {idx < stepGroups.length - 1 && <Separator className="opacity-20" />}
              </div>
            ))}
          </motion.div>
        )}

        {/* Locked takeaway */}
        {session.takeawayText && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.08, duration: 0.15 }}
            className="max-w-md mx-auto mt-10 space-y-2"
          >
            <p className="text-xs text-muted-foreground/40 tracking-wide">Det ni tog med er</p>
            <div className="rounded-xl border border-border/30 bg-muted/10 overflow-hidden">
              <p className="p-3 text-sm text-foreground whitespace-pre-wrap">{session.takeawayText}</p>
            </div>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.15 }}
          className="max-w-md mx-auto mt-12 space-y-4 text-center"
        >
          <Button
            onClick={onExploreAgain}
            size="lg"
            className="w-full h-14 rounded-2xl gap-2 font-normal"
          >
            Utforska igen
          </Button>
          <button
            onClick={() => navigate('/')}
            className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          >
            Till Hem
          </button>
        </motion.div>
      </div>
    </div>
  );
}
