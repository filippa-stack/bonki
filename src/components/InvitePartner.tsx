import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Share2, Copy, Check, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

interface InvitePartnerProps {
  inviteCode: string;
  inviteToken: string;
  partnerName: string | null;
  onUpdateName: (name: string) => void;
}

export default function InvitePartner({ inviteCode, inviteToken, partnerName, onUpdateName }: InvitePartnerProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(partnerName || '');

  const inviteLink = `${window.location.origin}/join?token=${inviteToken}`;
  const shareMessage = t(
    'invite.share_message',
    'Följ med mig i vårt gemensamma utrymme på Still Us. Tryck för att ansluta och starta vår resa: {{link}}',
    { link: inviteLink }
  );

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Still Us',
          text: shareMessage,
          url: inviteLink,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          handleCopy();
        }
      }
    } else {
      handleCopy();
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success(t('invite.copied', 'Länk kopierad'));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t('invite.copy_failed', 'Kunde inte kopiera länken'));
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode.toUpperCase());
      setCodeCopied(true);
      toast.success('Kod kopierad');
      setTimeout(() => setCodeCopied(false), 2000);
    } catch {
      toast.error('Kunde inte kopiera koden');
    }
  };

  const handleSaveName = () => {
    onUpdateName(nameValue);
    setEditingName(false);
  };

  // Collapsed: minimal prompt to invite
  if (!expanded) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full rounded-2xl bg-card/70 p-5 text-center"
      >
        <div className="flex flex-col items-center gap-3">
          <UserPlus className="w-5 h-5 text-[#d08f63] shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">
              {t('invite.title', 'Bjud in din partner')}
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed mt-3">
              {t('invite.collapsed_hint', 'När ni är två syns era delade reflektioner här. Du väljer alltid vad som delas.')}
            </p>
          </div>
        </div>
        <Button
          onClick={() => setExpanded(true)}
          size="sm"
          className="w-full gap-2 h-8 font-medium mt-5"
        >
          Skicka inbjudan
        </Button>
      </motion.div>
    );
  }

  // Expanded: full invite options
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="rounded-xl bg-card/70 overflow-hidden"
    >
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-muted-foreground/70" />
            <p className="text-sm text-foreground">
              {t('invite.title', 'Bjud in din partner')}
            </p>
          </div>
          <button
            onClick={() => setExpanded(false)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {t('invite.minimize', 'Minimera')}
          </button>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Dela länken. Din partner ansluter när det passar. Har din partner redan ett konto? Be dem öppna Still Us och koppla ihop med koden nedan.
        </p>

        {/* Actions row */}
        <div className="flex gap-2">
          <Button onClick={handleShare} size="sm" className="flex-1 gap-2">
            <Share2 className="w-3.5 h-3.5" />
            {t('invite.share_button', 'Dela inbjudan')}
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? t('invite.copied', 'Kopierad!') : t('invite.copy_link', 'Kopiera')}
          </Button>
        </div>

        {/* Invite code — smaller */}
        <div className="text-center pt-1">
          <p className="text-xs text-muted-foreground/60">{t('invite.or_code', 'Eller dela koden:')}</p>
          <button
            onClick={handleCopyCode}
            className="text-sm font-mono tracking-widest text-foreground/70 mt-0.5 cursor-pointer hover:text-foreground transition-colors"
          >
            {codeCopied ? '✓ Kopierad' : inviteCode}
          </button>
        </div>

        {/* Set own name — collapsible */}
        <div className="pt-2 border-t border-border/40">
          {editingName ? (
            <div className="flex gap-2">
              <Input
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                placeholder={t('invite.name_placeholder', 'Ditt namn...')}
                autoFocus
                className="h-8 text-sm"
              />
              <Button size="sm" onClick={handleSaveName} className="h-8 px-3 text-xs">
                {t('home.save', 'Spara')}
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setEditingName(true)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {partnerName || t('invite.set_name', 'Ange ditt namn (visas för din partner)')}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
