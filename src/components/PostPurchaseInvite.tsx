import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import InvitePartner from '@/components/InvitePartner';
import bonkiLogo from '@/assets/bonki-logo.png';

interface InviteInfo {
  invite_code: string;
  invite_token: string;
}

interface PostPurchaseInviteProps {
  fetchInviteInfo: () => Promise<InviteInfo | null>;
  partnerName: string | null;
  onUpdateName: (name: string) => void;
  onContinue: () => void;
}

export default function PostPurchaseInvite({
  fetchInviteInfo,
  partnerName,
  onUpdateName,
  onContinue,
}: PostPurchaseInviteProps) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen page-bg flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm space-y-8"
      >
        <div className="text-center space-y-3">
          <img src={bonkiLogo} alt="Still Us" className="h-10 w-auto mx-auto" />
          <h1 className="text-display text-foreground">
            {t('post_purchase.title', 'Ert utrymme är redo')}
          </h1>
          <p className="text-body text-muted-foreground leading-relaxed">
            {t('post_purchase.subtitle', 'Nu kan du bjuda in din partner. Ni väljer själva vad som delas.')}
          </p>
        </div>

        <InvitePartner
          fetchInviteInfo={fetchInviteInfo}
          partnerName={partnerName}
          onUpdateName={onUpdateName}
          onInviteSent={() => onContinue()}
        />

        <div className="text-center">
          <Button
            variant="ghost"
            onClick={onContinue}
            className="text-muted-foreground hover:text-foreground gap-2"
          >
            {t('post_purchase.skip_invite', 'Bjud in senare')}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
