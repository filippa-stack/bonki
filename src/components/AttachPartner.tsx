import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Link2, KeyRound, Copy, Check, Loader2, ChevronDown, ChevronUp, Share2 } from 'lucide-react';

interface InviteInfo {
  invite_code: string;
  invite_token: string;
}

interface AttachPartnerProps {
  fetchInviteInfo: () => Promise<InviteInfo | null>;
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
  fetchInviteInfo,
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
  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);
  const [loadingInvite, setLoadingInvite] = useState(false);

  // Lazy-load invite info when expanded
  useEffect(() => {
    if (expanded && !inviteInfo && !loadingInvite) {
      setLoadingInvite(true);
      fetchInviteInfo().then((info) => {
        setInviteInfo(info);
        setLoadingInvite(false);
      });
    }
  }, [expanded, inviteInfo, loadingInvite, fetchInviteInfo]);

  const inviteLink = inviteInfo ? `${window.location.origin}/join?token=${inviteInfo.invite_token}` : '';

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

  const handleCopyLink = async () => {
    if (!inviteInfo) return;
    try {
      const textToCopy = inviteMessage.trim()
        ? `${inviteMessage.trim()}\n\n${inviteLink}`
        : inviteLink;
      await navigator.clipboard.writeText(textToCopy);
      toast.success(t('invite.copied', 'Länk kopierad'));
    } catch {
      toast.error(t('invite.copy_failed', 'Kunde inte kopiera'));
    }
  };

  const handleSendInvite = async () => {
    if (!inviteInfo) return;
    const textToShare = inviteMessage.trim()
      ? `${inviteMessage.trim()}\n\n${inviteLink}`
      : inviteLink;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Still Us',
          text: textToShare,
        });
        toast.success('Inbjudan delad!', { duration: 2500 });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          // Fallback to copy
          await navigator.clipboard.writeText(textToShare);
          toast.success('Länk kopierad');
        }
      }
    } else {
      await navigator.clipboard.writeText(textToShare);
      toast.success('Länk kopierad');
    }
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
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      if (!accessToken) throw new Error('No auth session');

      const trimmed = joinInput.trim();
      const body: Record<string, string> = {};

      const extractedToken = extractTokenFromLink(trimmed);
      if (extractedToken) {
        body.invite_token = extractedToken;
      } else if (trimmed.startsWith('http')) {
        // URL without token param — invalid
        setJoinState('error');
        setJoinError(t('attach.join_error_invalid', 'Ogiltigt format'));
        return;
      } else {
        // Treat as invite code
        body.invite_code = trimmed.toUpperCase();
      }

      const res = await supabase.functions.invoke('join-couple-space', {
        headers: { Authorization: `Bearer ${accessToken}` },
        body,
      });

      if (res.data?.success) {
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
              {loadingInvite ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              ) : inviteStep === 'message' ? (
                /* ─── Optional message before sending ─── */
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15 }}
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
                        if (navigator.share) {
                          try {
                            await navigator.share({ title: 'Still Us', text: inviteLink });
                          } catch (err) {
                            if ((err as Error).name !== 'AbortError') {
                              await navigator.clipboard.writeText(inviteLink);
                              toast.success('Länk kopierad');
                            }
                          }
                        } else {
                          await navigator.clipboard.writeText(inviteLink);
                          toast.success('Länk kopierad');
                        }
                        setInviteStep('default');
                        setExpanded(false);
                      }}
                    >
                      Dela utan meddelande
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
                    {inviteInfo?.invite_code ?? '...'}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={handleCopyCode}
                    disabled={!inviteInfo}
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={async () => {
                      if (!inviteInfo) return;
                      if (navigator.share) {
                        try {
                          await navigator.share({ title: 'Still Us', text: inviteLink, url: inviteLink });
                          return;
                        } catch (err) {
                          if ((err as Error).name === 'AbortError') return;
                        }
                      }
                      await navigator.clipboard.writeText(inviteLink);
                      toast.success('Länk kopierad');
                    }}
                    disabled={!inviteInfo}
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Dela länk
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={async () => {
                      if (!inviteInfo) return;
                      await navigator.clipboard.writeText(inviteLink);
                      toast.success('Länk kopierad');
                    }}
                    disabled={!inviteInfo}
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <button
                  className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
                  onClick={() => setInviteStep('message')}
                  disabled={!inviteInfo}
                >
                  Lägg till ett personligt meddelande
                </button>
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
