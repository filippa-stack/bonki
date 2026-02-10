import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
        // User cancelled or share failed — copy instead
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-lg bg-card border border-border space-y-5"
    >
      <div className="flex items-center gap-3">
        <UserPlus className="w-5 h-5 text-primary" />
        <p className="text-sm font-medium text-foreground">
          {t('invite.title', 'Bjud in din partner')}
        </p>
      </div>

      <p className="text-xs text-gentle">
        {t('invite.description', 'Dela länken nedan. Din partner skapar ett konto och ni kopplas ihop automatiskt.')}
      </p>

      {/* Share button (primary) */}
      <Button onClick={handleShare} className="w-full gap-2">
        <Share2 className="w-4 h-4" />
        {t('invite.share_button', 'Dela inbjudan')}
      </Button>

      {/* Copy link (secondary) */}
      <Button variant="outline" onClick={handleCopy} className="w-full gap-2">
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        {copied ? t('invite.copied', 'Kopierad!') : t('invite.copy_link', 'Kopiera länk')}
      </Button>

      {/* Invite code */}
      <div className="text-center space-y-1">
        <p className="text-xs text-muted-foreground">{t('invite.or_code', 'Eller dela koden:')}</p>
        <p className="text-lg font-mono tracking-widest text-foreground">{inviteCode}</p>
      </div>

      {/* Set own name */}
      <div className="space-y-2 pt-2 border-t border-border">
        <Label className="text-xs text-muted-foreground">
          {t('invite.your_name_label', 'Ditt namn (visas för din partner)')}
        </Label>
        {editingName ? (
          <div className="flex gap-2">
            <Input
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              placeholder={t('invite.name_placeholder', 'Ditt namn...')}
              autoFocus
            />
            <Button size="sm" onClick={handleSaveName}>{t('home.save', 'Spara')}</Button>
          </div>
        ) : (
          <button
            onClick={() => setEditingName(true)}
            className="text-sm text-foreground hover:text-primary transition-colors"
          >
            {partnerName || t('invite.set_name', 'Ange ditt namn')}
          </button>
        )}
      </div>
    </motion.div>
  );
}
