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
      toast.success(t('invite.copied', 'Länken kopierades'));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t('invite.copy_failed', 'Kunde inte kopiera'));
    }
  };

  const handleSaveName = () => {
    onUpdateName(nameValue);
    setEditingName(false);
  };

  // Collapsed: minimal prompt to invite
  if (!expanded) {
    return (
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => setExpanded(true)}
        className="w-full flex items-center gap-3 py-3 px-4 rounded-xl border border-dashed border-border/60 bg-transparent hover:bg-card/50 transition-colors text-left"
      >
        <UserPlus className="w-4 h-4 text-muted-foreground/60 shrink-0" />
        <p className="text-sm text-muted-foreground">
          {t('invite.collapsed_hint', 'Bjud in din partner att dela det här utrymmet')}
        </p>
      </motion.button>
    );
  }

  // Expanded: full invite options
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="rounded-xl border border-border/50 bg-card/50 overflow-hidden"
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
          {t('invite.description', 'Dela länken nedan. Din partner skapar ett konto och ni kopplas ihop automatiskt.')}
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
          <p className="text-sm font-mono tracking-widest text-foreground/70 mt-0.5">{inviteCode}</p>
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
