import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import bonkiLogo from '@/assets/bonki-logo.png';

interface WelcomePartnerProps {
  onDismiss: () => void;
}

export default function WelcomePartner({ onDismiss }: WelcomePartnerProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: [0.4, 0.0, 0.2, 1] }}
        className="flex flex-col items-center text-center max-w-sm gap-8"
      >
        <img src={bonkiLogo} alt="" className="w-16 h-16 rounded-xl" />

        <div className="space-y-3">
          <h1 className="text-2xl font-semibold text-foreground">
            {t('welcome_partner.title')}
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            {t('welcome_partner.description')}
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <Button
            size="lg"
            className="w-full"
            onClick={onDismiss}
          >
            {t('welcome_partner.start_first', 'Utforska tillsammans')}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
