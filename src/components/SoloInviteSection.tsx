import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Share2, Loader2, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface InviteInfo {
  invite_code: string;
  invite_token: string;
}

interface SoloInviteSectionProps {
  fetchInviteInfo: () => Promise<InviteInfo | null>;
  onJoinedSpace?: () => void;
  hadPartnerBefore?: boolean;
}

export default function SoloInviteSection({ fetchInviteInfo, onJoinedSpace, hadPartnerBefore = false }: SoloInviteSectionProps) {
  const { user } = useAuth();
  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);
  const [loadingInvite, setLoadingInvite] = useState(true);
  const [copied, setCopied] = useState(false);
  const [fallbackOpen, setFallbackOpen] = useState(false);
  const [joinInput, setJoinInput] = useState('');
  const [joinState, setJoinState] = useState<'idle' | 'joining' | 'success' | 'error'>('idle');
  const [joinError, setJoinError] = useState('');
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    fetchInviteInfo().then((info) => {
      setInviteInfo(info);
      setLoadingInvite(false);
    });
  }, [fetchInviteInfo]);

  const inviteLink = inviteInfo ? `${window.location.origin}/join?token=${inviteInfo.invite_token}` : '';

  const handleShareLink = async () => {
    if (!inviteInfo) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Still Us', text: inviteLink });
        return;
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
      }
    }
    await navigator.clipboard.writeText(inviteLink);
    toast.success('Länk kopierad');
  };

  const handleCopyCode = async () => {
    if (!inviteInfo) return;
    try {
      await navigator.clipboard.writeText(inviteInfo.invite_code.toUpperCase());
      setCopied(true);
      toast.success('Kod kopierad');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Kunde inte kopiera');
    }
  };

  const handleJoin = useCallback(async () => {
    if (!user || !joinInput.trim()) return;
    if (attempts >= 5) {
      setJoinError('För många försök. Vänta en stund.');
      setJoinState('error');
      return;
    }
    setJoinState('joining');
    setJoinError('');
    setAttempts((a) => a + 1);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      if (!accessToken) throw new Error('No auth session');

      const trimmed = joinInput.trim();
      const body: Record<string, string> = {};
      try {
        const url = new URL(trimmed);
        const token = url.searchParams.get('token');
        if (token) { body.invite_token = token; }
        else { setJoinState('error'); setJoinError('Ogiltigt format'); return; }
      } catch {
        body.invite_code = trimmed.toUpperCase();
      }

      const res = await supabase.functions.invoke('join-couple-space', {
        headers: { Authorization: `Bearer ${accessToken}` },
        body,
      });

      if (res.data?.success) {
        setJoinState('success');
        toast.success('Ni är anslutna');
        onJoinedSpace?.();
      } else {
        setJoinState('error');
        setJoinError('Något gick fel. Försök igen.');
      }
    } catch {
      setJoinState('error');
      setJoinError('Något gick fel. Försök igen.');
    }
  }, [user, joinInput, attempts, onJoinedSpace]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      id="solo-invite"
      className="px-6 pt-8 mb-10"
    >
      {/* Hero text */}
      <div className="text-center mb-10">
        <h2 className="font-serif text-xl text-foreground mb-3">
          {hadPartnerBefore ? 'Du är ensam här just nu.' : 'Börja här.'}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {hadPartnerBefore
            ? 'Din partner är inte längre ansluten till ert rum.'
            : 'Bjud in din partner när du vill. Då skapar ni ert gemensamma rum och kan börja samtalen tillsammans.'}
        </p>
      </div>

      {/* Primary CTA: Dela länk */}
      <Button
        size="lg"
        onClick={handleShareLink}
        disabled={loadingInvite}
        className="w-full h-14 rounded-2xl gap-2 font-normal mb-8"
      >
        {loadingInvite ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <Share2 className="w-4 h-4" />
            Dela länk
          </>
        )}
      </Button>

      {/* Collapsible fallback — code + join */}
      <div className="text-center">
        <button
          onClick={() => setFallbackOpen(!fallbackOpen)}
          className="text-xs text-muted-foreground/70 hover:text-muted-foreground transition-colors"
        >
          Har din partner redan en kod?
        </button>
      </div>

      <AnimatePresence>
        {fallbackOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-5 space-y-5">
              {/* Join input */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    value={joinInput}
                    onChange={(e) => {
                      setJoinInput(e.target.value);
                      if (joinState === 'error') setJoinState('idle');
                    }}
                    placeholder="Kod eller länk"
                    className="text-sm"
                    disabled={joinState === 'joining' || joinState === 'success'}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleJoin}
                    disabled={!joinInput.trim() || joinState === 'joining' || joinState === 'success'}
                    className="shrink-0"
                  >
                    {joinState === 'joining' ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : joinState === 'success' ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <KeyRound className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </div>
                {joinState === 'error' && joinError && (
                  <p className="text-[11px] text-destructive">{joinError}</p>
                )}
              </div>

              {/* Own invite code */}
              {!loadingInvite && inviteInfo && (
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xs text-muted-foreground/60">Din kod:</span>
                  <span className="font-mono text-xs tracking-widest text-muted-foreground">
                    {inviteInfo.invite_code.toUpperCase()}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
