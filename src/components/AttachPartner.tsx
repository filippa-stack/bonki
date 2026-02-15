import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Link2, KeyRound, Copy, Check, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

interface AttachPartnerProps {
  /** Current user's space invite code (to share) */
  inviteCode: string;
  inviteToken: string;
  partnerName: string | null;
  onUpdateName: (name: string) => void;
  /** Called after successfully joining another space */
  onJoinedSpace?: () => void;
  /** Current member count — hide entirely if already paired */
  memberCount: number;
}

type AttachState = 'idle' | 'joining' | 'success' | 'error';
type InviteStep = 'default' | 'message';

function extractTokenFromLink(input: string): string | null {
  try {
    const url = new URL(input.trim());
    return url.searchParams.get('token');
  } catch {
    return null;
  }
}

export default function AttachPartner({
  inviteCode,
  inviteToken,
  partnerName,
  onUpdateName,
  onJoinedSpace,
  memberCount,
}: AttachPartnerProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [joinInput, setJoinInput] = useState('');
  const [joinState, setJoinState] = useState<AttachState>('idle');
  const [joinError, setJoinError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [inviteStep, setInviteStep] = useState<InviteStep>('default');
  const [inviteMessage, setInviteMessage] = useState('');

  const inviteLink = `${window.location.origin}/join?token=${inviteToken}`;

  const handleCopy = async () => {
    try {
      const textToCopy = inviteMessage.trim()
        ? `${inviteMessage.trim()}\n\n${inviteLink}`
        : inviteLink;
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast.success(t('invite.copied', 'Länk kopierad'));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t('invite.copy_failed', 'Kunde inte kopiera'));
    }
  };

  const handleSendInvite = async () => {
    await handleCopy();
    toast('Inbjudan skickad.', { duration: 2500 });
    setInviteStep('default');
    setInviteMessage('');
    setExpanded(false);
  };

  const handleJoin = useCallback(async () => {
    if (!user || !joinInput.trim()) return;

    // Soft rate limit: max 5 attempts per session
    if (attempts >= 5) {
      setJoinError('För många försök. Vänta en stund.');
      setJoinState('error');
      return;
    }

    setJoinState('joining');
    setJoinError('');
    setAttempts((a) => a + 1);

    try {
      const trimmed = joinInput.trim();
      const body: Record<string, string> = {};

      // Detect if input is a link (contains token=) or a short code
      const extractedToken = extractTokenFromLink(trimmed);
      if (extractedToken) {
        body.invite_token = extractedToken;
      } else if (trimmed.startsWith('http')) {
        // URL without token param — invalid
        setJoinState('error');
        setJoinError(t('join.error_invalid_invite', 'Inbjudningslänken är ogiltig.'));
        return;
      } else {
        // Treat as invite code
        body.invite_code = trimmed.toUpperCase();
      }

      const res = await supabase.functions.invoke('join-couple-space', { body });

      if (res.error) {
        const parsed = typeof res.error === 'string' ? { error: res.error } : res.error;
        setJoinState('error');
        setJoinError(
          (parsed as any)?.error === 'space_full'
            ? t('join.error_space_full', 'Det utrymmet har redan två medlemmar.')
            : (parsed as any)?.error === 'invalid_invite'
              ? t('join.error_invalid_invite', 'Ogiltig kod eller länk.')
              : t('join.error_network', 'Något gick fel. Försök igen.')
        );
        return;
      }

      const data = res.data as any;
      if (data?.success) {
        setJoinState('success');
        toast.success(t('join.success_title', 'Ni är anslutna'));
        onJoinedSpace?.();
      } else {
        setJoinState('error');
        setJoinError(t('join.error_network', 'Något gick fel. Försök igen.'));
      }
    } catch {
      setJoinState('error');
      setJoinError(t('join.error_network', 'Något gick fel. Försök igen.'));
    }
  }, [user, joinInput, attempts, t, onJoinedSpace]);

  // Don't render if already paired
  if (memberCount >= 2) return null;

  return (
    <div className="rounded-2xl border border-dashed border-primary/20 bg-card/50">
      {/* Collapsed summary */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-2.5">
          <Link2 className="w-4 h-4 text-primary/60" />
          <span className="text-xs text-muted-foreground">
            {t('attach.collapsed_hint', 'Koppla ihop er med din partner')}
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-5 space-y-5">
              {inviteStep === 'message' ? (
                /* ─── Optional message before sending ─── */
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <h3 className="font-serif text-base text-foreground text-center">
                    Vill du skriva något personligt?
                  </h3>
                  <Textarea
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    placeholder="Jag vill att vi…"
                    className="text-sm min-h-[80px] resize-none"
                  />
                  <div className="space-y-2">
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={handleSendInvite}
                    >
                      Skicka inbjudan
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-muted-foreground"
                      onClick={async () => {
                        setInviteMessage('');
                        await handleCopy();
                        toast('Inbjudan skickad.', { duration: 2500 });
                        setInviteStep('default');
                        setExpanded(false);
                      }}
                    >
                      Hoppa över
                    </Button>
                  </div>
                </motion.div>
              ) : (
                /* ─── Default: share / join ─── */
                <>
              {/* OPTION 1: Share your code */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-foreground/80">
                  {t('attach.share_title', 'Dela din kod')}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {t('attach.share_hint', 'Be din partner ladda ner appen och ange den här koden.')}
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-muted/30 rounded-lg px-3 py-2 text-center font-mono text-sm tracking-widest text-foreground">
                    {inviteCode}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={() => setInviteStep('message')}
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">eller</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* OPTION 2: Enter partner's code or paste link */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-foreground/80">
                  {t('attach.join_title', 'Har din partner en kod?')}
                </p>
                <div className="flex items-center gap-2">
                  <Input
                    value={joinInput}
                    onChange={(e) => {
                      setJoinInput(e.target.value);
                      if (joinState === 'error') setJoinState('idle');
                    }}
                    placeholder={t('attach.join_placeholder', 'Kod eller länk')}
                    className="text-sm"
                    disabled={joinState === 'joining' || joinState === 'success'}
                  />
                  <Button
                    size="sm"
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
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
