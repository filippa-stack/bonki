// SESSION MODEL LOCK:
// Do NOT use couple_progress.current_session.
// The JSON session model is deprecated.
// All session state must come from normalized tables.

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext as useCoupleSpace } from '@/contexts/CoupleSpaceContext';
import Header from '@/components/Header';
import { BEAT_1, BEAT_2, BEAT_3, EASE, EMOTION } from '@/lib/motion';

const STEP_LABELS = ['Kom igång', 'Gå djupare', 'Föreställ er', 'I verkligheten'];

const COMPLETION_HEADLINES = [
  'Ni tog er tid för varandra.',
  'Samtalet är sparat.',
  'Det här samtalet tillhör er.',
  'Tack för att ni stannade kvar.',
  'Det här var bara för er.',
  'Ni valde varandra igen.',
  'Varje samtal är ett val. Ni valde rätt.',
  'Det ni just gjorde betyder något.',
  'Ni gav varandra hela rummet.',
  'Det här är hur ni växer.',
];

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

  const headline = useMemo(() =>
    COMPLETION_HEADLINES[Math.floor(Math.random() * COMPLETION_HEADLINES.length)],
  []);

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
            className="text-center"
            style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
          >
            <h2
              className="font-serif"
              style={{
                fontSize: 'clamp(26px, 7vw, 34px)',
                fontWeight: 400,
                lineHeight: 1.2,
                color: 'var(--accent-saffron)',
              }}
            >
              {headline}
            </h2>
            <p className="font-serif italic" style={{ fontSize: '15px', color: 'var(--text-tertiary)', opacity: 0.7 }}>
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
                      <p style={{ fontSize: '11px', letterSpacing: '0.04em', color: 'var(--text-tertiary)', opacity: 0.6, paddingLeft: '2px' }}>
                        {group.partnerRef.speakerLabel && /^[AB]$/.test(group.partnerRef.speakerLabel)
                          ? group.partnerRef.speakerLabel
                          : partnerName}
                      </p>
                      <div style={{
                        background: 'var(--surface-raised)',
                        borderRadius: '12px',
                        boxShadow: '0 1px 3px hsla(30, 15%, 25%, 0.04), 0 4px 16px -4px hsla(30, 18%, 28%, 0.06)',
                      }}>
                        <p className="font-serif italic whitespace-pre-wrap" style={{ padding: '20px 24px', fontSize: '17px', lineHeight: 1.7, color: 'var(--text-primary)' }}>{group.partnerRef.text}</p>
                      </div>
                    </div>
                  )}

                  {/* User second */}
                  {group.myRef && group.myRef.text.trim() && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <p style={{ fontSize: '11px', letterSpacing: '0.04em', color: 'var(--text-tertiary)', opacity: 0.6, paddingLeft: '2px' }}>
                        {group.myRef.speakerLabel && /^[AB]$/.test(group.myRef.speakerLabel)
                          ? group.myRef.speakerLabel
                          : myName}
                      </p>
                      <div style={{
                        background: 'var(--surface-raised)',
                        borderRadius: '12px',
                        boxShadow: '0 1px 3px hsla(30, 15%, 25%, 0.04), 0 4px 16px -4px hsla(30, 18%, 28%, 0.06)',
                      }}>
                        <p className="font-serif italic whitespace-pre-wrap" style={{ padding: '20px 24px', fontSize: '17px', lineHeight: 1.7, color: 'var(--text-primary)' }}>{group.myRef.text}</p>
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
              <p style={{ fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-tertiary)', opacity: 0.55 }}>Det ni tog med er</p>
              <div style={{
                background: 'hsl(36 20% 97% / 0.70)',
                borderRadius: '12px',
                boxShadow: 'inset 0 1px 3px hsla(30, 12%, 25%, 0.04), 0 1px 2px hsla(30, 15%, 25%, 0.03)',
              }}>
                <p className="font-serif italic whitespace-pre-wrap" style={{ padding: '20px 24px', fontSize: '17px', lineHeight: 1.7, color: 'var(--text-secondary)' }}>{session.takeawayText}</p>
              </div>
            </motion.div>
          )}

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: BEAT_3 + 0.06, duration: EMOTION, ease: [...EASE] }}
            style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}
          >
            <button
              onClick={() => navigate('/shared')}
              className="font-sans"
              style={{ fontSize: '13px', color: 'var(--text-secondary)', opacity: 0.55, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px' }}
            >
              Se alla era anteckningar
            </button>
            <button
              onClick={() => navigate('/')}
              className="cta-primary"
            >
              Fortsätt utforska
            </button>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
